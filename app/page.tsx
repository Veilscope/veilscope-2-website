import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Navbar } from "@/components/navbar";
import { Globe } from "@/components/globe";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/site-ui";
import { buildDots, type Coastline } from "@/lib/coastline";
import { globeConfig } from "@/lib/visual-config";

const processSteps = [
  { number: "01", title: "Find the pattern", body: "We examine earnings per share, revenue, operating cash flow, and unusual trading volume to identify companies worth a closer look." },
  { number: "02", title: "Investigate the business", body: "We review disclosures and explore company relationships, industry conditions, and external events that could affect the business." },
  { number: "03", title: "Form a view", body: "We bring the findings together into a thesis, including the risks, competing explanations, and evidence that could change our thinking." },
] as const;

const researchSources = [
  { number: "01", title: "Company filings", body: "Annual and quarterly reports, significant company disclosures, and institutional holdings reports help us understand the financial record and developments around a business." },
  { number: "02", title: "Financial and market data", body: "We compare performance across reporting periods and examine trading activity against its historical baseline." },
  { number: "03", title: "AI-assisted research", body: "We use AI to explore business relationships and external developments, then check relevant findings against their sources." },
] as const;

export default async function Home() {
  let dots: ReturnType<typeof buildDots> = [];
  try {
    const data = await readFile(path.join(process.cwd(), "public/assets/geography/ne_110m_coastline.geojson"), "utf8");
    dots = buildDots(JSON.parse(data) as Coastline);
  } catch (error) {
    console.error("Could not load local coastline geometry", error);
  }
  const flightEndViewports = globeConfig.flight.scrollViewports * globeConfig.flight.completionZone.end;
  const landingViewports = 1 + flightEndViewports + globeConfig.flight.postFlightViewports;
  const animationStyle = { "--animation-height": `${landingViewports * 100}svh` } as CSSProperties;

  return <>
    <div className="landing">
      <Navbar />
      <section className="hero-copy" aria-labelledby="hero-title">
        <h1 id="hero-title">Discover the relationships between stocks.</h1>
        <p className="hero-description">We research U.S. listed companies through public financial data, market activity, and the factors affecting their businesses. Follow our investment theses, view the evidence, and explore the tools we’re building.</p>
        <div className="hero-actions">
          <Link className="site-button site-button-primary" href="/research">Read our research</Link>
          <Link className="site-button site-button-secondary" href="#research-sources">Explore the tools</Link>
        </div>
        <p className="hero-disclaimer">U.S. listed companies only. Not personalized financial advice.</p>
      </section>
      <div id="demonstration" className="animation-sequence" style={animationStyle}>
        <div className="graphic"><Globe dots={dots} /></div>
      </div>
    </div>

    <main>
      <section id="next-section" className="site-section demo-intro-section">
        <div className="site-container">
          <SectionHeading eyebrow="How we research" title="From a financial pattern to an investment thesis.">
            <p>We look for changes in financial performance and trading activity, then investigate what might explain them.</p>
          </SectionHeading>
          <ol className="process-list">
            {processSteps.map(step => <li key={step.number}>
              <span className="step-number">{step.number} /</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="research-sources" className="site-section section-ruled">
        <div className="site-container">
          <SectionHeading eyebrow="What we research with" title="Public records. Financial data. Business context." />
          <ul className="process-list">
            {researchSources.map(source => <li key={source.number}>
              <span className="step-number">{source.number} /</span>
              <h3>{source.title}</h3>
              <p>{source.body}</p>
            </li>)}
          </ul>
        </div>
      </section>

      <section className="site-section research-empty-section">
        <div className="site-container">
          <SectionHeading eyebrow="About Veilscope" title="Built around our own investment questions." />
          <div className="reading-copy home-about-copy">
            <p>Veilscope began as a way to investigate companies we might invest in. We’re developing tools to support that work and preparing research that explains what caught our attention, what we found, and where we remain uncertain.</p>
            <p>Our tools are still in development and are not available for public access or purchase. Our first research reports are in progress.</p>
            <p>We may hold positions in companies we cover. Published reports will include relevant position disclosures.</p>
          </div>
        </div>
      </section>

      <section className="site-section closing-section">
        <div className="site-container closing-inner">
          <div>
            <h2>Follow the research as it develops.</h2>
            <p>Receive new company analyses, thesis updates, and occasional news about the tools we’re building.</p>
          </div>
          <Link className="site-button site-button-primary" href="/updates">Get research updates <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
