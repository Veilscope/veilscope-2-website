import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Navbar } from "@/components/navbar";
import { Globe } from "@/components/globe";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading, TextLink } from "@/components/site-ui";
import { buildDots, type Coastline } from "@/lib/coastline";
import { globeConfig } from "@/lib/visual-config";

const processSteps = [
  { number: "01", title: "Examine the financials", body: "We look at trends in earnings per share, revenue, and operating cash flow to identify companies that warrant closer research." },
  { number: "02", title: "Investigate the activity", body: "We examine changes in trading volume alongside company disclosures and other developments, looking for context behind unusual activity." },
  { number: "03", title: "Explore the connections", body: "We use AI-assisted research to investigate related companies, industry conditions, and external events that could affect the business." },
  { number: "04", title: "Form a view", body: "We bring the findings together into an investment thesis, including the assumptions, risks, and unanswered questions." },
] as const;

const faqs = [
  { question: "What is Veilscope?", answer: "Veilscope is a research project focused on U.S.-listed companies. We use company filings, financial metrics, trading activity, and AI-assisted contextual research to develop our own investment theses." },
  { question: "Can I use the tools?", answer: "Not yet. Both tools are in development and are not currently available for public access or purchase. The website demonstrates what we’re building and shares our research." },
  { question: "What do you look for in a company?", answer: "Our current process pays particular attention to earnings per share, revenue, operating cash flow, and unusual trading volume. These observations guide further investigation; they do not establish that a stock will perform well." },
  { question: "Do you invest in companies you cover?", answer: "Our research informs our own investing, so we may hold positions in companies discussed on this website. Consult the position disclosure accompanying each report." },
  { question: "How do you use AI?", answer: "We use AI-assisted research to explore company relationships, industry conditions, and external developments. AI-generated findings may be incomplete or incorrect and require checking against their sources." },
  { question: "Does your research tell me what to buy?", answer: "We publish our own research and investment views. They do not account for your financial circumstances, objectives, or tolerance for risk." },
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
          <Link className="site-button site-button-secondary" href="/tools">Explore the tools</Link>
        </div>
        <p className="hero-disclaimer">U.S. listed companies only. Not personalized financial advice.</p>
      </section>
      <div id="demonstration" className="animation-sequence" style={animationStyle}>
        <div className="graphic"><Globe dots={dots} /></div>
      </div>
    </div>

    <main>
      <section id="next-section" className="site-section demo-intro-section">
        <div className="site-container split-intro">
          <SectionHeading eyebrow="Research workspace" title="A closer look at how we research.">
            <p>We’re building tools to explore financial patterns and investigate company relationships. This preview introduces the workspace behind our research.</p>
          </SectionHeading>
          <div className="status-note">
            <p className="eyebrow">In development</p>
            <p>Research tools in development. Not currently available to the public.</p>
          </div>
        </div>
      </section>

      <section className="site-section section-ruled">
        <div className="site-container">
          <SectionHeading eyebrow="Our process" title="From an initial pattern to an investment thesis.">
            <p>A change in financial performance or trading activity gives us a reason to investigate. We examine the filings, explore the broader business context, and develop a view of what the evidence supports.</p>
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

      <section className="site-section research-empty-section">
        <div className="site-container editorial-offset">
          <SectionHeading eyebrow="Inside our research" title="Our first research reports are in progress.">
            <p>We’re preparing company analyses that explain what caught our attention, what we found, and where uncertainty remains.</p>
          </SectionHeading>
          <TextLink href="/updates">Get research updates</TextLink>
        </div>
      </section>

      <section className="site-section section-ruled">
        <div className="site-container">
          <SectionHeading eyebrow="Tools" title="Built around our research process.">
            <p>We’re developing two tools to support different stages of an investment investigation.</p>
          </SectionHeading>
          <div className="tool-comparison">
            <article>
              <p className="status-label">In development</p>
              <h3>Financial pattern mapping</h3>
              <p>A visual workspace for exploring financial metrics and trading activity against defined research criteria. Our current focus includes earnings per share, revenue, operating cash flow, and unusual volume.</p>
            </article>
            <article>
              <p className="status-label">In development</p>
              <h3>Company context research</h3>
              <p>AI-assisted research into the companies, industry conditions, and external events that could affect a business. We use it to examine the broader context surrounding a financial pattern.</p>
            </article>
          </div>
          <div className="section-action-row">
            <p>Neither tool is currently available for public access or purchase.</p>
            <TextLink href="/tools">Explore the tools</TextLink>
          </div>
        </div>
      </section>

      <section className="site-section principles-section">
        <div className="site-container">
          <SectionHeading eyebrow="Research principles" title="The reasoning matters.">
            <p>A useful investment thesis should make its evidence and uncertainty visible.</p>
          </SectionHeading>
          <div className="principles-grid">
            <div><span>01</span><h3>Evidence</h3><p>The filings, financial data, and other sources behind the analysis.</p></div>
            <div><span>02</span><h3>Interpretation</h3><p>Our explanation of what the findings could mean.</p></div>
            <div><span>03</span><h3>Uncertainty</h3><p>The assumptions, competing explanations, and developments that could change our view.</p></div>
          </div>
          <TextLink href="/approach">Explore our approach</TextLink>
        </div>
      </section>

      <section className="site-section section-ruled faq-section">
        <div className="site-container faq-layout">
          <SectionHeading eyebrow="FAQ" title="Questions about Veilscope." />
          <div className="faq-list">
            {faqs.map((item, index) => <details key={item.question} open={index === 0}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>)}
          </div>
        </div>
      </section>

      <section className="site-section closing-section">
        <div className="site-container closing-inner">
          <div>
            <p className="eyebrow">Follow the work</p>
            <h2>Follow the research as it develops.</h2>
            <p>Receive new company analyses, thesis updates, and occasional news about the tools we’re building.</p>
          </div>
          <Link className="site-button site-button-primary" href="/updates">Get research updates</Link>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
