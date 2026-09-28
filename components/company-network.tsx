"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { companyNetwork, createNetworkViewportLayout, getNetworkNodeLayout, placeTooltip, trimConnection } from "@/lib/company-network";

type Size = { width: number; height: number; headerHeight: number };
type NodeStyle = CSSProperties & Record<"--node-x" | "--node-y" | "--node-size" | "--node-glow" | "--node-delay" | "--badge-delay" | "--badge-size" | "--float-delay" | "--float-duration" | "--ticker-size", string>;
type EdgeStyle = CSSProperties & Record<"--edge-delay", string>;
type TooltipStyle = CSSProperties & Record<"--tooltip-x" | "--tooltip-y" | "--tooltip-width", string>;
type TooltipState = { nodeId: string; x: number; y: number; width: number };

export function CompanyNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0, headerHeight: 0 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      const headerHeight = container.closest(".landing")?.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().height ?? 0;
      setSize(current => current.width === rect.width && current.height === rect.height && current.headerHeight === headerHeight
        ? current
        : { width: rect.width, height: rect.height, headerHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, []);

  const viewport = createNetworkViewportLayout(size.width, size.height, size.headerHeight);
  const mobile = viewport.mobile;
  const nodeById = useMemo(() => new Map(companyNetwork.nodes.map(node => [node.id, node])), []);
  const tooltipNode = tooltip ? nodeById.get(tooltip.nodeId) : undefined;
  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) : undefined;

  useEffect(() => {
    const container = containerRef.current;
    const stage = container?.closest<HTMLElement>(".globe-stage");
    if (!stage) return;
    if (mobile && selectedNodeId) stage.dataset.networkDetailOpen = "true";
    else delete stage.dataset.networkDetailOpen;
    return () => { delete stage.dataset.networkDetailOpen; };
  }, [mobile, selectedNodeId]);

  useEffect(() => {
    const stage = containerRef.current?.closest<HTMLElement>(".globe-stage");
    if (!stage) return;
    const observer = new MutationObserver(() => {
      if (stage.dataset.networkVisible !== "true") {
        setSelectedNodeId(null);
        setTooltip(null);
      }
    });
    observer.observe(stage, { attributes: true, attributeFilter: ["data-network-visible"] });
    return () => observer.disconnect();
  }, []);

  function closeMobileDetail(returnFocus = true) {
    const nodeId = selectedNodeId;
    setSelectedNodeId(null);
    if (returnFocus && nodeId) {
      requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`)?.focus());
    }
  }

  useEffect(() => {
    if (!mobile || !selectedNodeId) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileDetail();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  });

  function showTooltip(nodeId: string, clientX: number, clientY: number) {
    setTooltip({ nodeId, ...placeTooltip(clientX, clientY, window.innerWidth, window.innerHeight) });
  }
  const edges = companyNetwork.connections.map(connection => {
    const source = nodeById.get(connection.source)!;
    const target = nodeById.get(connection.target)!;
    const sourceLayout = getNetworkNodeLayout(source, size.width, size.height, viewport);
    const targetLayout = getNetworkNodeLayout(target, size.width, size.height, viewport);
    return {
      ...connection,
      ...trimConnection(
        { x: sourceLayout.x, y: sourceLayout.y, radius: sourceLayout.diameter / 2 },
        { x: targetLayout.x, y: targetLayout.y, radius: targetLayout.diameter / 2 },
        companyNetwork.lineGap,
      ),
    };
  });

  return <div className="company-network" ref={containerRef}>
    <svg className="network-connections" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} preserveAspectRatio="none" focusable="false">
      {edges.map((edge, index) => <line
        key={edge.id}
        className="network-connection"
        data-connection-id={edge.id}
        x1={edge.x1}
        y1={edge.y1}
        x2={edge.x2}
        y2={edge.y2}
        pathLength="1"
        style={{ "--edge-delay": `${140 + index * 70}ms` } as EdgeStyle}
      />)}
    </svg>
    {companyNetwork.nodes.map((node, index) => {
      const layout = getNetworkNodeLayout(node, size.width, size.height, viewport);
      const diameter = layout.diameter;
      const primary = node.id === companyNetwork.primaryNodeId;
      const nodeDelay = primary ? 0 : 180 + index * 70;
      const style = {
        "--node-x": `${layout.x}px`,
        "--node-y": `${layout.y}px`,
        "--node-size": `${diameter}px`,
        "--node-glow": `${Math.round(diameter * (primary ? 0.22 : 0.17))}px`,
        "--node-delay": `${nodeDelay}ms`,
        "--badge-delay": `${nodeDelay + 260}ms`,
        "--badge-size": `${Math.max(22, Math.min(38, Math.round(diameter * 0.2)))}px`,
        "--float-delay": `${index * -0.63}s`,
        "--float-duration": `${4.2 + (index % 3) * 0.45}s`,
        "--ticker-size": `${Math.max(13, Math.min(23, Math.round(diameter * 0.13)))}px`,
      } as NodeStyle;
      return <button
        type="button"
        className={`network-node${primary ? " network-node-primary" : ""}`}
        data-node-id={node.id}
        key={node.id}
        style={style}
        aria-label={`${node.name}, ${node.ticker}`}
        aria-describedby={mobile && selectedNode?.id === node.id ? "company-network-mobile-detail" : tooltipNode?.id === node.id ? "company-network-tooltip" : undefined}
        aria-expanded={mobile ? selectedNode?.id === node.id : undefined}
        aria-controls={mobile ? "company-network-mobile-detail" : undefined}
        onClick={() => {
          if (mobile) setSelectedNodeId(current => current === node.id ? null : node.id);
        }}
        onPointerEnter={event => { if (!mobile) showTooltip(node.id, event.clientX, event.clientY); }}
        onPointerMove={event => { if (!mobile) showTooltip(node.id, event.clientX, event.clientY); }}
        onPointerLeave={() => { if (!mobile) setTooltip(null); }}
        onFocus={event => {
          if (mobile) return;
          const rect = event.currentTarget.getBoundingClientRect();
          showTooltip(node.id, rect.right, rect.top + rect.height / 2);
        }}
        onBlur={() => { if (!mobile) setTooltip(null); }}
      >
        <Image className="network-node-icon" src={node.icon} alt="" width={64} height={64} />
        <span className="network-node-ticker">{node.ticker}</span>
        <span className="network-node-affordance" aria-hidden="true">
          <Image src={companyNetwork.interactionIcon} alt="" width={32} height={32} />
        </span>
      </button>;
    })}
    {tooltip && tooltipNode && <div
      id="company-network-tooltip"
      className="network-tooltip"
      role="tooltip"
      style={{
        "--tooltip-x": `${tooltip.x}px`,
        "--tooltip-y": `${tooltip.y}px`,
        "--tooltip-width": `${tooltip.width}px`,
      } as TooltipStyle}
    >
      <div className="network-tooltip-heading">
        <strong>{tooltipNode.ticker}</strong>
        <span>{tooltipNode.name}</span>
      </div>
      <p>{tooltipNode.description}</p>
    </div>}
    {mobile && selectedNode && <aside id="company-network-mobile-detail" className="network-mobile-card" aria-live="polite">
      <button className="network-mobile-card-close" type="button" aria-label="Close company details" onClick={() => closeMobileDetail()}>&times;</button>
      <div className="network-tooltip-heading">
        <strong>{selectedNode.ticker}</strong>
        <span>{selectedNode.name}</span>
      </div>
      <p>{selectedNode.description}</p>
    </aside>}
  </div>;
}
