import { PageIntro, SectionHeading, SiteShell, TextLink } from "@/components/site-ui";

export const metadata = { title: "Our Approach", description: "How Veilscope investigates financial patterns, trading activity, filings, and company context." };

const metrics = [
  ["Earnings per share", "How reported earnings attributable to each share change across comparable periods."],
  ["Revenue", "How the company’s reported sales develop over time."],
  ["Operating cash flow", "How much cash the business generates or uses through its operating activities."],
] as const;

const filings = [
  ["10-K", "Annual reporting on a company’s business, financial performance, and risks."],
  ["10-Q", "Quarterly reporting that helps us examine developments between annual reports."],
  ["8-K", "Reporting of specified significant events and other company disclosures."],
  ["13F", "Quarterly disclosures of certain securities holdings by qualifying institutional investment managers."],
] as const;

export default function ApproachPage() {
  return <SiteShell>
    <PageIntro eyebrow="Our approach" title="How we build an investment thesis.">
      <p>Our process combines financial analysis, unusual trading activity, and research into the wider business environment.</p>
      <p>We use these inputs to identify questions worth pursuing and develop our own investment views. No individual metric or pattern determines the outcome.</p>
    </PageIntro>

    <section className="site-section section-ruled">
      <div className="site-container approach-layout">
        <SectionHeading eyebrow="01 / Financial record" title="Start with the financial record.">
          <p>We examine company filings to understand how the business is performing over time. Three metrics are central to our current research:</p>
        </SectionHeading>
        <dl className="definition-list">
          {metrics.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
        </dl>
        <p className="wide-note">We look for patterns across these measures and investigate the factors behind them. Rising figures prompt further research into their quality, sustainability, and business context.</p>
      </div>
    </section>

    <section className="site-section alternate-section">
      <div className="site-container approach-layout">
        <SectionHeading eyebrow="02 / Disclosures" title="Read the underlying disclosures.">
          <p>Our research draws on public filings where relevant to the question being investigated.</p>
        </SectionHeading>
        <dl className="filing-list">
          {filings.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
        </dl>
        <p className="wide-note">These filings provide different perspectives. In particular, 13F reports are delayed holdings snapshots; they do not identify the participants behind a recent volume spike.</p>
      </div>
    </section>

    <section className="site-section section-ruled">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="03 / Trading activity" title="Investigate unusual trading activity." />
        <div className="reading-copy">
          <p>We look for substantial increases in trading volume relative to a defined historical baseline.</p>
          <p>In our current research, volume at least twice the selected average can flag a company for closer investigation. The observation period and comparison window matter and should be read alongside any reported result.</p>
          <p className="callout-rule">Elevated volume does not, by itself, identify who traded, explain their motivation, or establish the direction of future prices.</p>
        </div>
      </div>
    </section>

    <section className="site-section alternate-section">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="04 / Business context" title="Examine what surrounds the business." />
        <div className="reading-copy">
          <p>Financial statements describe important parts of a company. Our contextual research investigates the relationships and developments beyond those statements.</p>
          <p>Depending on the business, this may include customers, suppliers, commodity exposure, competitors, financing conditions, regulation, and industry events.</p>
          <p>We use AI-assisted analysis to explore these connections and develop questions for further investigation. A plausible connection remains a hypothesis until the supporting evidence is examined.</p>
        </div>
      </div>
    </section>

    <section className="site-section section-ruled">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="05 / Interpretation" title="A pattern is a starting point." />
        <div className="reading-copy">
          <p>Similar financial patterns can lead to different outcomes. Historical examples can help frame an investigation, but resemblance to a successful company does not establish future returns.</p>
          <p>Reported figures may be affected by accounting choices, one-time events, seasonality, or changes in share count. Market data and AI-generated analysis also have limitations.</p>
          <p>Our investment views remain subject to uncertainty, and new evidence can change the thesis.</p>
        </div>
      </div>
    </section>

    <section className="site-section closing-section">
      <div className="site-container closing-inner">
        <div><p className="eyebrow">See the process applied</p><h2>Follow the observations, evidence, and questions behind an investment thesis.</h2></div>
        <TextLink href="/research">Explore the research</TextLink>
      </div>
    </section>
  </SiteShell>;
}
