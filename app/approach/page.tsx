import { ApproachPath } from "@/components/approach-path";
import { SiteShell, TextLink } from "@/components/site-ui";

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
    <div className="approach-page">
      <div className="approach-journey">
        <ApproachPath />

        <header className="approach-intro" data-approach-stage="introduction">
          <div className="site-container approach-intro-inner">
            <p className="eyebrow">Our approach</p>
            <h1>How we build an investment thesis.</h1>
            <div className="approach-intro-copy">
              <p>We combine financial analysis, unusual trading activity, company disclosures, and the wider business context to identify questions worth pursuing.</p>
              <p>No individual metric or pattern determines the outcome.</p>
            </div>
            <div className="approach-origin">
              <span className="approach-anchor" data-approach-anchor="origin" />
              <span>A company warrants investigation.</span>
            </div>
          </div>
        </header>

        <section className="approach-stage approach-financial" data-approach-stage="financial">
          <div className="site-container">
            <div className="approach-stage-heading">
              <p className="eyebrow">01 / Financial record</p>
              <h2>Start with the financial record.</h2>
              <p>We examine several signals across comparable periods, then investigate the quality, sustainability, and context behind the pattern.</p>
            </div>
            <div className="approach-branch-field" aria-hidden="true">
              <span className="approach-anchor" data-approach-anchor="financial-split" />
            </div>
            <dl className="approach-metrics">
              {metrics.map(([term, description], index) => {
                const name = index === 0 ? "metric-eps" : index === 1 ? "metric-revenue" : "metric-cash";
                return <div className="approach-metric" key={term}>
                  <span className="approach-anchor approach-anchor-in" data-approach-anchor={`${name}-in`} />
                  <span className="approach-anchor approach-anchor-out" data-approach-anchor={`${name}-out`} />
                  <dt><span>0{index + 1}</span>{term}</dt>
                  <dd>{description}</dd>
                </div>;
              })}
            </dl>
            <p className="approach-note">Together, these measures can reveal a question worth tracing further. None is decisive on its own.</p>
          </div>
        </section>

        <section className="approach-stage approach-disclosures" data-approach-stage="disclosures">
          <div className="site-container">
            <div className="approach-merge-field" aria-hidden="true">
              <span className="approach-anchor" data-approach-anchor="filing-merge" />
            </div>
            <div className="approach-stage-heading">
              <p className="eyebrow">02 / Underlying disclosures</p>
              <h2>Read the underlying disclosures.</h2>
              <p>Multiple financial observations are traced to their supporting public records and interpreted in context.</p>
            </div>
            <dl className="approach-filings">
              {filings.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
            </dl>
            <p className="approach-note">A 13F is a delayed holdings snapshot. It does not identify the participants behind a recent volume increase.</p>
            <span className="approach-anchor approach-side-anchor" data-approach-anchor="filing-spine" aria-hidden="true" />
          </div>
        </section>

        <section className="approach-stage approach-pattern" data-approach-stage="pattern">
          <div className="site-container">
            <div className="approach-stage-heading approach-stage-heading-centered">
              <p className="eyebrow">03 / Test the pattern</p>
              <h2>Run parallel investigations.</h2>
              <p>Market behavior and business context can raise different questions. We investigate both without treating either as proof.</p>
            </div>
            <div className="approach-branch-field approach-parallel-field" aria-hidden="true">
              <span className="approach-anchor" data-approach-anchor="test-split" />
            </div>
            <div className="approach-investigations">
              <article className="approach-investigation">
                <span className="approach-anchor approach-anchor-in" data-approach-anchor="trading-in" aria-hidden="true" />
                <span className="approach-anchor approach-anchor-out" data-approach-anchor="trading-out" aria-hidden="true" />
                <p className="eyebrow">A / Market activity</p>
                <h3>Investigate unusual trading activity.</h3>
                <p>We compare volume with a defined historical baseline. Unusual activity is a reason to investigate—not evidence of who traded or where the price will go.</p>
              </article>
              <article className="approach-investigation">
                <span className="approach-anchor approach-anchor-in" data-approach-anchor="context-in" aria-hidden="true" />
                <span className="approach-anchor approach-anchor-out" data-approach-anchor="context-out" aria-hidden="true" />
                <p className="eyebrow">B / Business context</p>
                <h3>Examine what surrounds the business.</h3>
                <p>We may examine customers, suppliers, competitors, commodity exposure, financing conditions, regulation, and industry events.</p>
                <p>AI-assisted research helps us explore relationships and develop questions. A plausible connection remains a hypothesis until the evidence is examined.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="approach-stage approach-thesis" data-approach-stage="thesis">
          <div className="site-container">
            <div className="approach-merge-field approach-thesis-merge-field" aria-hidden="true">
              <span className="approach-anchor" data-approach-anchor="thesis-merge" />
            </div>
            <div className="approach-thesis-layout">
              <div className="approach-stage-heading">
                <p className="eyebrow">04 / Interpretation</p>
                <h2>Form a view. Keep testing it.</h2>
                <p>The evidence informs an interpretation, while competing explanations remain important. A pattern is a starting point, not a prediction.</p>
                <p>Accounting choices, one-time events, seasonality, share-count changes, market-data limitations, and incomplete AI findings can all affect the analysis. New evidence can change the thesis.</p>
              </div>
              <div className="approach-ring-space" data-approach-ring>
                <span className="approach-anchor approach-ring-center" data-approach-anchor="ring-center" />
                <span className="approach-monitor"><span className="approach-anchor" data-approach-anchor="monitor" />Monitor new evidence</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section className="site-section closing-section">
      <div className="site-container closing-inner">
        <div><p className="eyebrow">See the process applied</p><h2>Read our company research to follow the observations, evidence, and questions behind an investment thesis.</h2></div>
        <TextLink href="/research">Explore the research</TextLink>
      </div>
    </section>
  </SiteShell>;
}
