"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type PathSegment = {
  d: string;
  end: number;
  id: string;
  stage: string;
  start: number;
};
type PathNode = { id: string; point: Point; stage: string; threshold: number };
type StageRange = { end: number; start: number };
type Geometry = {
  height: number;
  nodes: PathNode[];
  segments: PathSegment[];
  stages: Record<string, StageRange>;
  width: number;
};

const anchorNames = [
  "origin",
  "financial-split",
  "metric-eps-in",
  "metric-eps-out",
  "metric-revenue-in",
  "metric-revenue-out",
  "metric-cash-in",
  "metric-cash-out",
  "filing-merge",
  "filing-spine",
  "test-split",
  "trading-in",
  "trading-out",
  "context-in",
  "context-out",
  "thesis-merge",
  "ring-center",
  "monitor",
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function curve(from: Point, to: Point) {
  const travel = Math.max(28, Math.abs(to.y - from.y) * 0.46);
  const direction = to.y >= from.y ? 1 : -1;
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + travel * direction}, ${to.x} ${to.y - travel * direction}, ${to.x} ${to.y}`;
}

function polar(center: Point, radius: number, degrees: number): Point {
  const angle = degrees * Math.PI / 180;
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
}

function arc(center: Point, radius: number, startDegrees: number, endDegrees: number) {
  const start = polar(center, radius, startDegrees);
  const end = polar(center, radius, endDegrees);
  const sweep = endDegrees - startDegrees;
  return {
    d: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`,
    end,
    start,
  };
}

function createGeometry(journey: HTMLElement): Geometry | null {
  const journeyRect = journey.getBoundingClientRect();
  const points = new Map<string, Point>();

  for (const name of anchorNames) {
    const anchor = journey.querySelector<HTMLElement>(`[data-approach-anchor="${name}"]`);
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();
    points.set(name, {
      x: rect.left - journeyRect.left + rect.width / 2,
      y: rect.top - journeyRect.top + rect.height / 2,
    });
  }

  const point = (name: typeof anchorNames[number]) => points.get(name)!;
  const ringSpace = journey.querySelector<HTMLElement>("[data-approach-ring]");
  const ringRect = ringSpace?.getBoundingClientRect();
  const radius = clamp(Math.min(ringRect?.width ?? 300, ringRect?.height ?? 300) * 0.31, 76, 142);
  const ring = arc(point("ring-center"), radius, -90, 210);

  const segments: PathSegment[] = [
    { id: "origin-to-split", d: curve(point("origin"), point("financial-split")), stage: "financial", start: 0, end: 0.25 },
    { id: "split-to-eps", d: curve(point("financial-split"), point("metric-eps-in")), stage: "financial", start: 0.2, end: 0.62 },
    { id: "split-to-revenue", d: curve(point("financial-split"), point("metric-revenue-in")), stage: "financial", start: 0.2, end: 0.62 },
    { id: "split-to-cash", d: curve(point("financial-split"), point("metric-cash-in")), stage: "financial", start: 0.2, end: 0.62 },
    { id: "eps-through", d: curve(point("metric-eps-in"), point("metric-eps-out")), stage: "financial", start: 0.56, end: 1 },
    { id: "revenue-through", d: curve(point("metric-revenue-in"), point("metric-revenue-out")), stage: "financial", start: 0.56, end: 1 },
    { id: "cash-through", d: curve(point("metric-cash-in"), point("metric-cash-out")), stage: "financial", start: 0.56, end: 1 },
    { id: "eps-to-filing", d: curve(point("metric-eps-out"), point("filing-merge")), stage: "disclosures", start: 0, end: 0.34 },
    { id: "revenue-to-filing", d: curve(point("metric-revenue-out"), point("filing-merge")), stage: "disclosures", start: 0, end: 0.34 },
    { id: "cash-to-filing", d: curve(point("metric-cash-out"), point("filing-merge")), stage: "disclosures", start: 0, end: 0.34 },
    { id: "filing-to-spine", d: curve(point("filing-merge"), point("filing-spine")), stage: "disclosures", start: 0.3, end: 0.52 },
    { id: "spine-to-test", d: curve(point("filing-spine"), point("test-split")), stage: "disclosures", start: 0.48, end: 1 },
    { id: "test-to-trading", d: curve(point("test-split"), point("trading-in")), stage: "pattern", start: 0, end: 0.35 },
    { id: "test-to-context", d: curve(point("test-split"), point("context-in")), stage: "pattern", start: 0, end: 0.35 },
    { id: "trading-through", d: curve(point("trading-in"), point("trading-out")), stage: "pattern", start: 0.3, end: 1 },
    { id: "context-through", d: curve(point("context-in"), point("context-out")), stage: "pattern", start: 0.3, end: 1 },
    { id: "trading-to-thesis", d: curve(point("trading-out"), point("thesis-merge")), stage: "thesis", start: 0, end: 0.28 },
    { id: "context-to-thesis", d: curve(point("context-out"), point("thesis-merge")), stage: "thesis", start: 0, end: 0.28 },
    { id: "thesis-to-ring", d: curve(point("thesis-merge"), ring.start), stage: "thesis", start: 0.24, end: 0.48 },
    { id: "thesis-ring", d: ring.d, stage: "thesis", start: 0.44, end: 0.86 },
    { id: "ring-to-monitor", d: curve(ring.end, point("monitor")), stage: "thesis", start: 0.82, end: 1 },
  ];

  const nodes: PathNode[] = [
    { id: "origin", point: point("origin"), stage: "financial", threshold: 0 },
    { id: "financial-split", point: point("financial-split"), stage: "financial", threshold: 0.22 },
    { id: "metric-eps", point: point("metric-eps-in"), stage: "financial", threshold: 0.58 },
    { id: "metric-revenue", point: point("metric-revenue-in"), stage: "financial", threshold: 0.58 },
    { id: "metric-cash", point: point("metric-cash-in"), stage: "financial", threshold: 0.58 },
    { id: "filing-merge", point: point("filing-merge"), stage: "disclosures", threshold: 0.32 },
    { id: "test-split", point: point("test-split"), stage: "disclosures", threshold: 0.96 },
    { id: "trading", point: point("trading-in"), stage: "pattern", threshold: 0.32 },
    { id: "context", point: point("context-in"), stage: "pattern", threshold: 0.32 },
    { id: "thesis-merge", point: point("thesis-merge"), stage: "thesis", threshold: 0.26 },
    { id: "monitor", point: point("monitor"), stage: "thesis", threshold: 0.98 },
  ];

  const stages: Record<string, StageRange> = {};
  for (const stage of journey.querySelectorAll<HTMLElement>("[data-approach-stage]")) {
    const name = stage.dataset.approachStage;
    if (!name || name === "introduction") continue;
    const rect = stage.getBoundingClientRect();
    const documentTop = window.scrollY + rect.top;
    const start = documentTop - window.innerHeight * 0.78;
    const end = documentTop + rect.height - window.innerHeight * 0.3;
    stages[name] = { start, end: Math.max(start + 1, end) };
  }

  return {
    width: journey.clientWidth,
    height: journey.scrollHeight,
    segments,
    nodes,
    stages,
  };
}

export function ApproachPath() {
  const layerRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<Geometry | null>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const journey = layer?.parentElement;
    if (!layer || !journey) return;

    let frame = 0;
    let measureFrame = 0;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      frame = 0;
      const current = geometryRef.current;
      if (!current) return;

      const progressByStage: Record<string, number> = {};
      for (const [stage, range] of Object.entries(current.stages)) {
        progressByStage[stage] = reducedMotion ? 1 : clamp((window.scrollY - range.start) / (range.end - range.start));
      }

      for (const path of layer.querySelectorAll<SVGPathElement>("[data-active-path]")) {
        const stageProgress = progressByStage[path.dataset.stage ?? ""] ?? 0;
        const start = Number(path.dataset.start ?? 0);
        const end = Number(path.dataset.end ?? 1);
        const progress = reducedMotion ? 1 : clamp((stageProgress - start) / Math.max(0.001, end - start));
        path.style.strokeDashoffset = String(1 - progress);
      }

      for (const node of layer.querySelectorAll<SVGCircleElement>("[data-active-node]")) {
        const stageProgress = progressByStage[node.dataset.stage ?? ""] ?? 0;
        const threshold = Number(node.dataset.threshold ?? 0);
        node.style.opacity = reducedMotion || stageProgress >= threshold ? "1" : "0";
      }
    };

    const requestDraw = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const measure = () => {
      measureFrame = 0;
      const next = createGeometry(journey);
      geometryRef.current = next;
      setGeometry(next);
      window.requestAnimationFrame(draw);
    };

    const requestMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      requestDraw();
    };
    const resizeObserver = new ResizeObserver(requestMeasure);
    resizeObserver.observe(journey);
    for (const stage of journey.querySelectorAll<HTMLElement>("[data-approach-stage]")) resizeObserver.observe(stage);

    window.addEventListener("scroll", requestDraw, { passive: true });
    window.addEventListener("resize", requestMeasure);
    motionQuery.addEventListener("change", handleMotionChange);
    document.fonts?.ready.then(requestMeasure).catch(() => undefined);
    requestMeasure();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestDraw);
      window.removeEventListener("resize", requestMeasure);
      motionQuery.removeEventListener("change", handleMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
    };
  }, []);

  return <div ref={layerRef} className="approach-path-layer" aria-hidden="true">
    {geometry && <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none">
      <g className="approach-path-base">
        {geometry.segments.map(segment => <path key={segment.id} d={segment.d} />)}
      </g>
      <g className="approach-node-base">
        {geometry.nodes.map(node => <circle key={node.id} cx={node.point.x} cy={node.point.y} r="4" />)}
      </g>
      <g className="approach-path-active">
        {geometry.segments.map(segment => <path
          key={segment.id}
          d={segment.d}
          pathLength="1"
          data-active-path
          data-stage={segment.stage}
          data-start={segment.start}
          data-end={segment.end}
        />)}
      </g>
      <g className="approach-node-active">
        {geometry.nodes.map(node => <circle
          key={node.id}
          cx={node.point.x}
          cy={node.point.y}
          r="3"
          data-active-node
          data-stage={node.stage}
          data-threshold={node.threshold}
        />)}
      </g>
    </svg>}
  </div>;
}
