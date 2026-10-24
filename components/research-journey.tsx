"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./research-journey.css";

const chapters = [
  { label: "01 / Find the pattern", title: "A change worth a closer look.", body: "We examine earnings per share, revenue, operating cash flow, and unusual trading volume to identify companies worth investigating.", note: "The data mapper · Financial and market data" },
  { label: "02 / Investigate the business", title: "Numbers lead to questions. Questions lead to context.", body: "We review disclosures and explore company relationships, industry conditions, and external events that could affect the business.", note: "Semantic analysis · AI-assisted exploration" },
  { label: "03 / Check the evidence", title: "Every useful connection needs a source.", body: "Annual and quarterly reports, significant company disclosures, and institutional holdings reports help us understand the financial record and developments around a business. We check relevant AI-assisted findings against their sources.", note: "Public records · Source checking" },
  { label: "04 / Form a view", title: "A thesis, with room to change our minds.", body: "We bring the findings together into a thesis, including the risks, competing explanations, and evidence that could change our thinking.", note: "Observation → Interpretation → Uncertainty" },
  { label: "05 / About Veilscope", title: "Built around our own investment questions.", body: "Veilscope began as a way to investigate companies we might invest in. We’re developing tools to support that work and preparing research that explains what caught our attention, what we found, and where we remain uncertain.", note: "Our tools are still in development and are not available for public access or purchase. Our first research reports are in progress." },
];

function Mapper() {
  return <div className="journey-mapper">
    <div className="journey-periods"><span>Reporting periods</span><span>01 — 06</span></div>
    {["Earnings per share", "Revenue", "Operating cash flow", "Trading volume"].map((label, i) => <div className="journey-track" key={label}>
      <span>{label}</span>
      <svg viewBox="0 0 400 68" aria-hidden="true">
        {[20, 90, 160, 230, 300, 370].map(x => <path key={x} d={`M${x} 0V68`} className="journey-gridline" />)}
        <path className="journey-chart" pathLength="1" d={[
          "M20 52L90 45L160 49L230 31L300 35L370 12",
          "M20 51L90 48L160 39L230 43L300 24L370 18",
          "M20 44L90 28L160 48L230 37L300 16L370 25",
          "M20 53L90 50L160 54L230 49L300 8L370 45",
        ][i]} />
        <circle className="journey-observation" cx={i === 3 ? 300 : 370} cy={[12, 18, 25, 8][i]} r="9" />
      </svg>
    </div>)}
    <p className="journey-small">A pattern is a starting point. What might explain it?</p>
  </div>;
}

function Context({ sources = false }: { sources?: boolean }) {
  return <div className={`journey-context ${sources ? "with-sources" : ""}`}>
    <svg viewBox="0 0 480 330" aria-hidden="true">
      <path className="journey-connection" pathLength="1" d="M240 165L90 65M240 165L390 65M240 165L90 265" />
      <path className="journey-tentative" d="M240 165L390 265" />
      {[[90,65],[390,65],[90,265],[390,265]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="26" />)}
      <circle className="journey-company" cx="240" cy="165" r="44" />
      <text x="240" y="170" textAnchor="middle">AAPL</text>
      <text x="90" y="20" textAnchor="middle">Suppliers</text>
      <text x="390" y="20" textAnchor="middle">Industry</text>
      <text x="90" y="320" textAnchor="middle">Disclosures</text>
      <text x="390" y="320" textAnchor="middle">External events?</text>
    </svg>
    {sources ? <div className="journey-documents">
      <div><span>01 / Company filing</span><strong>Financial record</strong><div className="journey-excerpt" /><div className="journey-document-line" /><small>Source attached to observation</small></div>
      <div><span>02 / Disclosure</span><strong>Business context</strong><div className="journey-document-line" /><div className="journey-excerpt" /><small>Connection checked against source</small></div>
    </div> : <p className="journey-small">A map of questions to explore.<br /><span className="journey-dashed-key" /> Dashed connections remain open questions.</p>}
  </div>;
}

function Brief({ personal = false }: { personal?: boolean }) {
  return <div className={`journey-brief ${personal ? "journey-personal" : ""}`}>
    <div className="journey-brief-top"><span>RESEARCH NOTE / AAPL</span><span>IN PROGRESS</span></div>
    <h3>{personal ? "Our questions. Our investigation." : "From observation to a working view."}</h3>
    <div><span>01 / Observation</span><p>What changed in the financial record?</p></div>
    <div><span>02 / Interpretation</span><p>Which business developments could explain it?</p></div>
    <div className="journey-open-question"><span>03 / Uncertainty</span><p>What else could explain the pattern?<br />What evidence would change our view?</p></div>
    <p className="journey-small">{personal ? "The questions keep evolving. So does the research." : "A framework for investigation. No investment conclusion is shown."}</p>
  </div>;
}

function Scene({ index }: { index: number }) {
  return <div className={`journey-scene-content${index === 0 ? " journey-mapper-panel" : ""}`}><div className="journey-panel-header"><span>{["DATA MAPPER", "SEMANTIC ANALYSIS", "SOURCE CHECK", "WORKING THESIS", "WHY WE BUILD"][index]}</span><span> AAPL / APPLE</span></div>
    {index === 0 ? <Mapper /> : index < 3 ? <Context sources={index === 2} /> : <Brief personal={index === 4} />}
    <p className="journey-example">Illustrative walkthrough · Charts and connections are conceptual, not live AAPL data.</p>
  </div>;
}

export function ResearchJourney() {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-chapter]"));
    const ending = root.querySelector<HTMLElement>(".journey-ending")!;
    const cta = root.querySelector<HTMLElement>(".journey-updates-cta")!;
    const circle = root.querySelector<SVGCircleElement>(".journey-ending-circle")!;
    const endingSvg = root.querySelector<SVGSVGElement>(".journey-ending-wiring")!;
    let finish = 0;
    let finishTarget = 0;
    let handoffHead: number | null = null;
    let lastTime = 0;
    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const segment = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
    const draw = (now: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16;
      lastTime = now;
      const viewport = window.innerHeight;
      let active = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (viewport * .85 - rect.top) / (viewport * .65)));
        section.style.setProperty("--scene-progress", String(reduced.matches ? 1 : progress));
        if (rect.top <= viewport * .5) active = index;
      });
      root.dataset.active = String(active);
      const rect = root.getBoundingClientRect();
      const endRect = ending.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const circleY = ctaRect.top + ctaRect.height / 2 - endRect.top;
      const buttonX = ctaRect.left - endRect.left;
      const outline = cta.querySelector<SVGPathElement>("path")!;
      outline.setAttribute("d", `M.5 ${ctaRect.height / 2}V.5H${ctaRect.width - .5}V${ctaRect.height - .5}H.5Z`);
      // One continuous spine reaches the circle; its unfinished portion stays gray.
      const endingTop = endRect.top - rect.top;
      const spineHeight = endingTop + Math.max(0, circleY - 8);
      root.style.setProperty("--spine-height", `${spineHeight}px`);
      const scrollHead = Math.max(0, Math.min(viewport * .4 - rect.top, endingTop - viewport * .14));
      const threshold = finishTarget ? .99 : .94;
      const nextTarget = endRect.top <= viewport * .65 && ctaRect.top + ctaRect.height / 2 <= viewport * threshold ? 1 : 0;
      if (nextTarget === 1 && finish === 0) handoffHead = scrollHead;
      finishTarget = nextTarget;
      finish = reduced.matches ? finishTarget : finish + Math.sign(finishTarget - finish) * Math.min(Math.abs(finishTarget - finish), dt / 1500);
      const vertical = segment(finish, 0, .6);
      const startHead = handoffHead ?? scrollHead;
      const head = finish === 0 ? scrollHead : startHead + (spineHeight - startHead) * vertical * vertical;
      root.style.setProperty("--journey-progress", String(clamp(head / Math.max(1, spineHeight))));
      if (finish === 0) handoffHead = null;
      ending.style.setProperty("--ending-circle-fill", String(segment(finish, .6, .68)));
      ending.style.setProperty("--ending-horizontal", String(segment(finish, .68, .82)));
      ending.style.setProperty("--ending-outline", String(segment(finish, .82, 1)));
      endingSvg.setAttribute("viewBox", `0 0 ${endRect.width} ${endRect.height}`);
      circle.setAttribute("cy", String(circleY));
      const horizontalPath = root.querySelector<SVGPathElement>(".journey-ending-horizontal")!;
      horizontalPath.setAttribute("d", `M8 ${circleY}H${buttonX}`);
      root.querySelector(".journey-ending-horizontal-track")!.setAttribute("d", `M8 ${circleY}H${buttonX}`);
      // Pixel lengths avoid normalized dash rendering differences across browsers.
      const horizontalLength = Math.max(0, buttonX - 8);
      horizontalPath.style.strokeDasharray = String(horizontalLength);
      horizontalPath.style.strokeDashoffset = String(horizontalLength * (1 - segment(finish, .68, .82)));
      root.querySelectorAll<HTMLElement>(".journey-desktop-scene").forEach((scene, index) => {
        scene.inert = index !== active;
        scene.setAttribute("aria-hidden", String(index !== active));
        scene.style.setProperty("--scene-progress", sections[index].style.getPropertyValue("--scene-progress"));
      });
      if (finish !== finishTarget) requestDraw();
    };
    const requestDraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const observer = new ResizeObserver(requestDraw);
    observer.observe(root);
    observer.observe(ending);
    observer.observe(cta);
    window.addEventListener("scroll", requestDraw, { passive: true });
    window.addEventListener("resize", requestDraw);
    reduced.addEventListener("change", requestDraw);
    draw(performance.now());
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", requestDraw); window.removeEventListener("resize", requestDraw); reduced.removeEventListener("change", requestDraw); };
  }, []);

  return <main ref={rootRef} className="research-journey" data-active="0">
    <div className="journey-spine" aria-hidden="true"><div /></div>
    <section id="next-section" className="journey-opening site-container">
      <div className="journey-company-token"><span aria-hidden="true">●</span> AAPL <span>One company. Many questions.</span></div>
      <p className="eyebrow">How we research</p>
      <h2>From a financial pattern<br />to an investment thesis.</h2>
      <p>We look for changes in financial performance and trading activity, then investigate what might explain them.</p>
      <span className="journey-scroll-note">FOLLOW THE INVESTIGATION <span aria-hidden="true">↓</span></span>
    </section>
    <div className="journey-body site-container">
      <div className="journey-chapters">
        {chapters.map((chapter, index) => <section key={chapter.label} id={index === 2 ? "research-sources" : undefined} className="journey-chapter" data-journey-chapter={index}>
          <div className="journey-chapter-copy"><p className="eyebrow">{chapter.label}</p><h2>{chapter.title}</h2><p>{chapter.body}</p><p className="journey-chapter-note">{chapter.note}</p>
            {index === 4 && <p className="journey-disclosure">We may hold positions in companies we cover. Published reports will include relevant position disclosures.</p>}
          </div>
          <div className="journey-mobile-scene"><Scene index={index} /></div>
        </section>)}
      </div>
      <div className="journey-visual-column"><div className="journey-sticky-visual">
        {chapters.map((chapter, index) => <div key={chapter.label} className="journey-desktop-scene" data-scene={index}><Scene index={index} /></div>)}
        <div className="journey-stage-index" aria-hidden="true">{chapters.map((chapter, index) => <span key={chapter.label} data-index={index}>0{index + 1}</span>)}</div>
      </div></div>
    </div>
    <section className="journey-ending site-container">
      <svg className="journey-ending-wiring" aria-hidden="true" preserveAspectRatio="none">
        <circle className="journey-ending-circle" cx="0" r="8" />
        <path className="journey-ending-horizontal-track" />
        <path className="journey-ending-horizontal" />
      </svg>
      <p className="eyebrow">The investigation continues</p>
      <h2>Follow the research<br />as it develops.</h2>
      <p>Receive new company analyses, thesis updates, and occasional news about the tools we’re building.</p>
      <div className="journey-ending-actions">
      <Link className="site-button site-button-primary journey-updates-cta" href="/updates">
        <svg className="journey-cta-outline" aria-hidden="true"><path pathLength="1" /></svg>
        Get email updates <span aria-hidden="true">→</span>
      </Link>
      <Link className="site-button site-button-secondary" href="/research">Read research papers <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  </main>;
}
