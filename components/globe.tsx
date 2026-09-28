"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import type { Dot } from "@/lib/coastline";
import { smooth, createFlightLayout, sampleFlight, advanceProgress, isFlightRevealReady, mapScrollProgress } from "@/lib/globe-flight";
import { globeConfig as config } from "@/lib/visual-config";
import { CompanyNetwork } from "@/components/company-network";

const vertexShader = `
attribute vec3 basePosition;
attribute float phase;
attribute float amplitude;
attribute float frequency;
attribute float visibility;
attribute float isPrimary;
uniform float elapsed;
uniform float envelope;
uniform float radius;
uniform vec2 focus;
uniform vec2 anchor;
uniform float zoom;
uniform float spriteSize;
uniform float primaryHover;
varying float alpha;
varying vec2 spriteUv;
void main() {
  vec2 delta = isPrimary > 0.5 ? vec2(0.0) : basePosition.xy - focus;
  vec3 base = vec3(delta * radius * zoom + anchor, basePosition.z * radius);
  base.y += isPrimary > 0.5 ? primaryHover : sin(elapsed * frequency + phase) * amplitude * envelope;
  base.xy += position.xy * spriteSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(base, 1.0);
  spriteUv = uv;
  alpha = visibility;
}`;
const fragmentShader = `
uniform float spriteSize;
uniform float haloScale;
uniform float haloOpacity;
uniform float coreOpacity;
uniform vec3 haloTint;
varying float alpha;
varying vec2 spriteUv;
void main() {
  float r = length(spriteUv - vec2(0.5)) * 2.0;
  float coreRadius = 1.0 / haloScale;
  float edgeWidth = min(coreRadius * 0.15, 2.0 / spriteSize);
  float core = 1.0 - smoothstep(coreRadius - edgeWidth, coreRadius, r);
  float halo = exp(-3.2 * r * r) * (1.0 - smoothstep(0.65, 0.98, r)) * haloOpacity;
  float opacity = (core * coreOpacity + halo * (1.0 - core)) * alpha;
  if (opacity < 0.001) discard;
  gl_FragColor = vec4(mix(haloTint, vec3(0.953, 0.961, 0.969), core), opacity);
}`;

export function Globe({ dots }: { dots: Dot[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !dots.length) return;
    const landing = stage.closest<HTMLElement>(".landing");
    const sequence = stage.closest<HTMLElement>(".animation-sequence");
    const header = landing?.querySelector<HTMLElement>(".site-header");
    const hero = landing?.querySelector<HTMLElement>(".hero-copy");
    const continuation = stage.querySelector<HTMLAnchorElement>(".continuation-cue");
    if (!landing || !dots.some(dot => dot.isPrimary)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer | undefined;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch (error) {
      console.warn("Globe WebGL unavailable; using static coastline crossfade.", error);
    }
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
    camera.position.z = 5000;
    const geometry = new THREE.InstancedBufferGeometry();
    const quad = new THREE.PlaneGeometry(1, 1);
    geometry.setIndex(quad.getIndex());
    geometry.setAttribute("position", quad.getAttribute("position"));
    geometry.setAttribute("uv", quad.getAttribute("uv"));
    geometry.instanceCount = dots.length;
    geometry.setAttribute("basePosition", new THREE.InstancedBufferAttribute(new Float32Array(dots.flatMap(dot => [dot.x, dot.y, dot.z])), 3));
    geometry.setAttribute("visibility", new THREE.InstancedBufferAttribute(new Float32Array(dots.map(dot => dot.visibility)), 1));
    geometry.setAttribute("isPrimary", new THREE.InstancedBufferAttribute(new Float32Array(dots.map(dot => Number(dot.isPrimary))), 1));
    let seed = 19473;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    geometry.setAttribute("phase", new THREE.InstancedBufferAttribute(new Float32Array(dots.map(() => random() * Math.PI * 2)), 1));
    geometry.setAttribute("amplitude", new THREE.InstancedBufferAttribute(new Float32Array(dots.map(() => random())), 1));
    geometry.setAttribute("frequency", new THREE.InstancedBufferAttribute(new Float32Array(dots.map(() => 2 * Math.PI / (config.periodSeconds[0] + random() * (config.periodSeconds[1] - config.periodSeconds[0])))), 1));
    const amplitudeSeeds = Array.from(geometry.getAttribute("amplitude").array);
    const primaryIndex = dots.findIndex(dot => dot.isPrimary);
    const uniforms = {
      elapsed: { value: 0 }, primaryHover: { value: 0 }, envelope: { value: 0 }, radius: { value: 1 },
      focus: { value: new THREE.Vector2() }, anchor: { value: new THREE.Vector2() }, zoom: { value: 1 },
      spriteSize: { value: 1 }, haloScale: { value: Number(config.haloScale) }, haloOpacity: { value: config.haloOpacity },
      coreOpacity: { value: config.coreOpacity }, haloTint: { value: new THREE.Color(config.haloTint) },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false });
    const points = new THREE.Mesh(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    let frame = 0;
    let lost = false;
    let disposed = false;
    let progress = 0;
    let targetProgress = 0;
    let lastInput = -Infinity;
    let lastFrame = 0;
    let hasLayout = false;
    let capturedPrimaryHover: number | null = null;
    let primaryResumeFrom = 0;
    let primaryResumeStart = -Infinity;
    let sceneTop = 0;
    let scrollRange = 1;
    let lastScrollY = window.scrollY;
    let holdArmed = true;
    let holdingScroll = false;
    let holdTimer: number | undefined;
    let previousRootOverflow = "";
    let previousBodyTouchAction = "";
    let previousBodyOverscroll = "";
    let layout: ReturnType<typeof createFlightLayout> | undefined;
    const start = performance.now();

    function holdKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        endScrollHold();
        return;
      }
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) event.preventDefault();
    }

    function endScrollHold() {
      if (!holdingScroll) return;
      holdingScroll = false;
      if (holdTimer !== undefined) window.clearTimeout(holdTimer);
      holdTimer = undefined;
      document.documentElement.style.overflow = previousRootOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.removeEventListener("keydown", holdKeydown);
      delete stage!.dataset.scrollHold;
    }

    function startScrollHold(anchor: number) {
      if (holdingScroll || reduced.matches || !holdArmed) return;
      holdingScroll = true;
      holdArmed = false;
      previousRootOverflow = document.documentElement.style.overflow;
      previousBodyTouchAction = document.body.style.touchAction;
      previousBodyOverscroll = document.body.style.overscrollBehavior;
      window.scrollTo({ top: anchor, behavior: "auto" });
      lastScrollY = anchor;
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.overscrollBehavior = "none";
      document.addEventListener("keydown", holdKeydown);
      stage!.dataset.scrollHold = "true";
      holdTimer = window.setTimeout(endScrollHold, config.flight.minimumHoldMs);
    }

    function continueExploring(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const nextSection = document.getElementById("next-section");
      if (!nextSection) return;
      event.preventDefault();
      endScrollHold();
      holdArmed = false;
      history.pushState(null, "", "#next-section");
      nextSection.scrollIntoView({ behavior: reduced.matches ? "instant" : "smooth", block: "start" });
    }

    function updateNetworkState() {
      const complete = isFlightRevealReady(progress, targetProgress);
      stage!.dataset.networkVisible = complete ? "true" : "false";
    }

    function draw(now: number) {
      if (disposed || document.hidden || !layout) return;
      const flight = sampleFlight(layout, progress);
      stage!.style.setProperty("--fallback-globe-alpha", String(1 - flight.crossfade));
      stage!.style.setProperty("--fallback-focus-alpha", String(flight.crossfade));
      updateNetworkState();
      const fallback = reduced.matches || lost || !renderer;
      if (fallback) { delete stage!.dataset.ready; return; }
      const elapsed = (now - start) / 1000;
      const ambient = smooth(elapsed / 0.5) * (config.loop ? 1 : smooth(config.durationSeconds - elapsed));
      uniforms.elapsed.value = elapsed;
      uniforms.envelope.value = ambient * flight.hover;
      uniforms.anchor.value.set(flight.anchorX, flight.anchorY);
      const ambientPrimary = Math.sin(elapsed * geometry.getAttribute("frequency").getX(primaryIndex) + geometry.getAttribute("phase").getX(primaryIndex)) * geometry.getAttribute("amplitude").getX(primaryIndex) * ambient;
      const resumeBlend = smooth((now - primaryResumeStart) / 350);
      uniforms.primaryHover.value = capturedPrimaryHover === null
        ? primaryResumeFrom + (ambientPrimary - primaryResumeFrom) * resumeBlend
        : capturedPrimaryHover * flight.pathRemaining;
      uniforms.zoom.value = flight.zoom;
      uniforms.spriteSize.value = flight.spriteSize;
      uniforms.haloScale.value = flight.haloScale;
      renderer!.render(scene, camera);
      stage!.dataset.ready = "true";
    }
    function tick(now: number) {
      frame = 0;
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.064) : 1 / 60;
      lastFrame = now;
      const fallback = reduced.matches || lost || !renderer;
      progress = fallback ? targetProgress : advanceProgress(progress, targetProgress, dt, (now - lastInput) / 1000);
      if (progress === 0 && targetProgress === 0 && capturedPrimaryHover !== null) {
        primaryResumeFrom = capturedPrimaryHover;
        primaryResumeStart = now;
        capturedPrimaryHover = null;
      }
      draw(now);
      const ambientActive = config.loop || (now - start) / 1000 < config.durationSeconds;
      if ((progress !== targetProgress || (ambientActive && progress < config.flight.hoverFadeEnd)) && !fallback && !document.hidden && !disposed) requestDraw();
    }
    function requestDraw() {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function onScroll() {
      let scrollY = window.scrollY;
      let rawProgress = (scrollY - sceneTop) / scrollRange;
      const movingDown = scrollY > lastScrollY;
      if (!holdingScroll && rawProgress < config.flight.completionZone.start) holdArmed = true;
      if (hasLayout && movingDown && rawProgress >= config.flight.completionZone.end && holdArmed && !reduced.matches) {
        const holdAnchor = sceneTop + config.flight.completionZone.end * scrollRange;
        startScrollHold(holdAnchor);
        scrollY = holdAnchor;
        rawProgress = config.flight.completionZone.end;
      }
      lastScrollY = scrollY;
      const next = mapScrollProgress(rawProgress);
      landing!.dataset.flightStarted = next > 0.002 ? "true" : "false";
      if (next !== targetProgress) {
        lastInput = performance.now();
        if (next > 0 && capturedPrimaryHover === null) capturedPrimaryHover = uniforms.primaryHover.value;
      }
      targetProgress = next;
      if (!frame) lastFrame = 0;
      requestDraw();
    }
    function resize() {
      const { width, height } = stage!.getBoundingClientRect();
      if (!width || !height || disposed) return;
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      layout = createFlightLayout(dots, width, height, headerHeight);
      sceneTop = (sequence ?? landing!).getBoundingClientRect().top + window.scrollY;
      // Reserve space after the flight without stretching the animation itself.
      scrollRange = Math.max(1, height * config.flight.scrollViewports);
      camera.left = -width / 2; camera.right = width / 2;
      camera.top = height / 2; camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      uniforms.radius.value = layout.radius;
      uniforms.focus.value.set(layout.primary.x, layout.primary.y);
      const range = layout.placement.hoverAmplitude;
      const attribute = geometry.getAttribute("amplitude");
      amplitudeSeeds.forEach((value, i) => attribute.setX(i, range[0] + value * (range[1] - range[0])));
      attribute.needsUpdate = true;
      // Instanced quads retain full resolution even for the large final circle.
      if (renderer && !lost) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dprCap));
        renderer.setSize(width, height, false);
      }
      for (const prefix of ["--globe", "--globe-mobile"]) {
        stage!.style.setProperty(`${prefix}-size`, `${layout.radius * 2}px`);
        stage!.style.setProperty(`${prefix}-inset`, `${layout.inset}px`);
      }
      const screenCenterY = height / 2 - layout.centerY;
      stage!.style.setProperty("--globe-y", `${screenCenterY}px`);
      stage!.style.setProperty("--globe-mobile-y", `${screenCenterY - layout.radius}px`);
      stage!.style.setProperty("--final-dot-size", `${layout.finalSpriteSize}px`);
      stage!.style.setProperty("--final-focus-y", `${height / 2 - layout.finalAnchorY}px`);
      onScroll();
      if (!hasLayout) {
        progress = targetProgress;
        if (progress > 0) capturedPrimaryHover = 0;
        hasLayout = true;
      }
    }
    function visibilityChange() {
      if (document.hidden) { endScrollHold(); cancelAnimationFrame(frame); frame = 0; }
      else { onScroll(); lastFrame = 0; }
    }
    function reducedMotionChange() {
      if (reduced.matches) endScrollHold();
      requestDraw();
    }
    function contextLost(event: Event) {
      event.preventDefault(); lost = true; delete stage!.dataset.ready; requestDraw();
    }
    function contextRestored() { lost = false; resize(); }
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    observer.observe(landing);
    if (header) observer.observe(header);
    if (hero) observer.observe(hero);
    continuation?.addEventListener("click", continueExploring);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", visibilityChange);
    reduced.addEventListener("change", reducedMotionChange);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);
    resize();
    return () => {
      disposed = true;
      endScrollHold();
      cancelAnimationFrame(frame);
      observer.disconnect();
      continuation?.removeEventListener("click", continueExploring);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
      reduced.removeEventListener("change", reducedMotionChange);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      delete stage.dataset.ready;
      delete stage.dataset.networkVisible;
      delete stage.dataset.scrollHold;
      delete landing.dataset.flightStarted;
      geometry.dispose(); quad.dispose(); material.dispose(); renderer?.dispose();
    };
  }, [dots]);

  const style = {
    "--globe-size": `min(${config.diameterViewportHeight * 100}svh, calc(100vw - ${2 * (config.sidePadding + config.coreSize * config.haloScale / 2)}px))`,
    "--globe-inset": `${config.sidePadding + config.coreSize * config.haloScale / 2}px`,
    "--globe-y": `calc(var(--header-height) + (100% - var(--header-height)) * ${config.centerY})`,
    "--globe-mobile-size": `min(${config.mobile.diameterViewportHeight * 100}svh, calc(100vw - ${2 * (config.mobile.sidePadding + config.mobile.coreSize * config.haloScale / 2)}px))`,
    "--globe-mobile-inset": `${config.mobile.sidePadding + config.mobile.coreSize * config.haloScale / 2}px`,
    "--globe-mobile-y": `calc(var(--header-height) + ${config.mobile.heroGap}px)`,
    "--final-dot-size": `${config.flight.finalCoreSize * config.flight.finalHaloScale}px`,
    "--final-focus-y": `calc(50% - ${config.network.desktopLiftViewportHeight * 100}svh)`,
  } as CSSProperties;
  return <div className="globe-stage" ref={stageRef} style={style}>
    <div className="globe-fallback-layer" aria-hidden="true">
    <svg className="globe-fallback" viewBox="-1 -1 2 2" focusable="false">
      <defs>
        <radialGradient id="globe-dot-glow">
          <stop offset="0%" stopColor="#F3F5F7" stopOpacity={config.coreOpacity} />
          <stop offset="28%" stopColor="#F3F5F7" stopOpacity={config.coreOpacity} />
          <stop offset="36%" stopColor={config.haloTint} stopOpacity={config.haloOpacity} />
          <stop offset="100%" stopColor={config.haloTint} stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.filter(dot => dot.visibility > 0).map((dot, i) => <circle key={i} cx={dot.x} cy={-dot.y} r={0.0048 * config.coreSize * config.haloScale / 5} fill="url(#globe-dot-glow)" opacity={dot.visibility} />)}
    </svg>
    <svg className="globe-fallback-focus" viewBox="-1 -1 2 2" focusable="false">
      <defs>
        <radialGradient id="globe-focus-glow">
          <stop offset={`${100 / config.flight.finalHaloScale - 0.5}%`} stopColor="#F3F5F7" stopOpacity={config.coreOpacity} />
          <stop offset={`${100 / config.flight.finalHaloScale}%`} stopColor={config.haloTint} stopOpacity={config.haloOpacity} />
          <stop offset="100%" stopColor={config.haloTint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="1" fill="url(#globe-focus-glow)" />
    </svg>
    </div>
    <canvas ref={canvasRef} aria-hidden="true" />
    <CompanyNetwork />
    <a className="continuation-cue" href="#next-section">
      <span>Continue exploring</span>
      <svg className="continuation-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </a>
  </div>;
}
