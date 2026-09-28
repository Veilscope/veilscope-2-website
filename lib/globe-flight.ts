import type { Dot } from "./coastline";
import { createNetworkViewportLayout } from "./company-network";
import { globeConfig as config } from "./visual-config";

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/**
 * Preserve normal tracking through 48%, then finish the flight by 56%.
 * Cubic Hermite interpolation matches the incoming slope and eases to a
 * stationary final state. The same pure mapping makes reverse scroll exact.
 */
export function mapScrollProgress(rawProgress: number) {
  const raw = clamp(rawProgress);
  const { start, end } = config.flight.completionZone;
  if (raw <= start) return raw;
  if (raw >= end) return 1;
  const t = (raw - start) / (end - start);
  const incomingSlope = (end - start) / (1 - start);
  const tangent = t * t * t - 2 * t * t + t;
  const endpoint = -2 * t * t * t + 3 * t * t;
  return start + (1 - start) * (endpoint + tangent * incomingSlope);
}

/** Frame-rate independent follow: fast pickup, softer settling, no overshoot. */
export function advanceProgress(current: number, target: number, deltaSeconds: number, inputAgeSeconds: number) {
  const settings = config.flight.smoothing;
  const blend = smooth(inputAgeSeconds / settings.inputBlendSeconds);
  const response = settings.responseSeconds + (settings.settleSeconds - settings.responseSeconds) * blend;
  const next = current + (target - current) * (1 - Math.exp(-Math.max(0, deltaSeconds) / response));
  return Math.abs(target - next) <= settings.epsilon ? target : clamp(next);
}

/** Reveal the final composition once the eased flight is visually complete. */
export function isFlightRevealReady(progress: number, targetProgress: number) {
  const threshold = config.flight.revealProgress;
  return progress >= threshold && targetProgress >= threshold;
}

export function createFlightLayout(dots: Dot[], width: number, height: number, headerHeight: number, heroBottom?: number) {
  const mobile = width <= config.mobile.breakpoint;
  const placement = mobile ? config.mobile : config;
  const initialSpriteSize = placement.coreSize * config.haloScale;
  const inset = placement.sidePadding + initialSpriteSize / 2;
  const radius = Math.max(1, Math.min(height * placement.diameterViewportHeight, width - inset * 2)) / 2;
  const primary = dots.find(dot => dot.isPrimary)!;
  const centerX = width / 2 - inset - radius;
  const mobileGlobeTop = Math.max(
    headerHeight + config.mobile.heroGap,
    heroBottom === undefined ? 0 : heroBottom + config.mobile.heroGap,
  );
  const screenCenterY = mobile
    ? mobileGlobeTop + radius
    : headerHeight + (height - headerHeight) * placement.centerY;
  const centerY = height / 2 - screenCenterY;
  const anchorX = centerX + primary.x * radius;
  const anchorY = centerY + primary.y * radius;
  const networkViewport = createNetworkViewportLayout(width, height, headerHeight);
  const finalCoreSize = Math.min(networkViewport.primaryDiameter, (Math.min(width, height) - 32) / config.flight.finalHaloScale);
  const finalSpriteSize = finalCoreSize * config.flight.finalHaloScale;
  const finalScreenY = networkViewport.focusY;
  const finalAnchorY = height / 2 - finalScreenY;
  const margin = finalSpriteSize / 2 + config.flight.exitMargin;
  let finalZoom = 1;
  for (const dot of dots) {
    if (dot.isPrimary || dot.visibility <= 0) continue;
    const dx = Math.abs(dot.x - primary.x) * radius;
    const dy = Math.abs(dot.y - primary.y) * radius;
    // Exiting either axis is sufficient. Include the entire final halo and a margin.
    const exitX = dx > 1e-8 ? (width / 2 + margin) / dx : Infinity;
    const exitY = dy > 1e-8
      ? (height / 2 + margin - Math.sign(dot.y - primary.y) * finalAnchorY) / dy
      : Infinity;
    finalZoom = Math.max(finalZoom, Math.min(exitX, exitY));
  }
  return { radius, primary, anchorX, anchorY, finalAnchorY, centerY, inset, initialSpriteSize, finalCoreSize, finalSpriteSize, finalZoom: finalZoom * 1.01, placement };
}

export function sampleFlight(layout: ReturnType<typeof createFlightLayout>, progress: number) {
  const p = clamp(progress);
  // A single affine transition: NYC and every coastline dot follow straight paths
  // while the sphere expands. The camera remains completely stationary.
  const approach = smooth(p);
  const coreSize = layout.placement.coreSize + (layout.finalCoreSize - layout.placement.coreSize) * approach;
  const haloScale = config.haloScale + (config.flight.finalHaloScale - config.haloScale) * approach;
  return {
    zoom: 1 + (layout.finalZoom - 1) * approach,
    anchorX: layout.anchorX * (1 - approach),
    anchorY: layout.anchorY * (1 - approach) + layout.finalAnchorY * approach,
    pathRemaining: 1 - approach,
    haloScale,
    spriteSize: coreSize * haloScale,
    hover: 1 - smooth(p / config.flight.hoverFadeEnd),
    crossfade: smooth((p - config.flight.crossfadeStart) / (config.flight.crossfadeEnd - config.flight.crossfadeStart)),
  };
}
