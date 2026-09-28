import Link from "next/link";
import { PageIntro, SectionHeading, SiteShell, TextLink } from "@/components/site-ui";

export const metadata = { title: "Tools", description: "The financial pattern mapping and company context research tools Veilscope is developing." };

export default function ToolsPage() {
  return <SiteShell>
    <PageIntro eyebrow="Tools" title="The tools behind our research.">
      <p>We’re developing a financial pattern-mapping workspace and an AI-assisted company research tool. We use them together to investigate potential investments.</p>
      <p className="development-notice"><span>In development</span> Neither tool is currently available for public access or purchase.</p>
    </PageIntro>

    <section className="site-section section-ruled tool-detail-section">
      <div className="site-container tool-detail-grid">
        <div><p className="eyebrow">01 / Pattern mapping</p><h2>Financial pattern mapping.</h2></div>
        <div className="reading-copy">
          <h3>Explore how financial metrics and trading activity relate to a research question.</h3>
          <p>Our current work focuses on patterns involving earnings per share, revenue, operating cash flow, and unusual volume. We’re developing a visual workspace for defining research criteria and mapping relationships between supported data.</p>
          <p>The longer-term aim is to let users investigate their own criteria using the metrics the platform supports.</p>
          <Link className="site-button site-button-secondary" href="/#demonstration">View the demonstration</Link>
          <p className="small-note">Demonstration of work in progress. Features and availability may change.</p>
        </div>
      </div>
    </section>

    <section className="site-section alternate-section tool-detail-section">
      <div className="site-container tool-detail-grid reverse-emphasis">
        <div><p className="eyebrow">02 / Company context</p><h2>Company context research.</h2></div>
        <div className="reading-copy">
          <h3>Investigate the wider network around a company.</h3>
          <p>Our AI-assisted tool explores related businesses, external factors, and events that could affect a company. It supports the contextual stage of our research by organizing findings and their sources for further investigation.</p>
          <p>We use this work alongside financial and trading analysis when developing an investment thesis.</p>
        </div>
      </div>
    </section>

    <section className="site-section section-ruled">
      <div className="site-container">
        <SectionHeading eyebrow="Combined workflow" title="Two tools. One investigation." />
        <div className="sequence-statement">
          <p><span>Financial pattern mapping</span> helps us identify what deserves a closer look.</p>
          <p><span>Company context research</span> helps us investigate what may sit behind—and beyond—the initial pattern.</p>
          <p>Together, they support the research we publish and the investment decisions we make.</p>
        </div>
      </div>
    </section>

    <section className="site-section closing-section">
      <div className="site-container closing-inner">
        <div><p className="eyebrow">Follow what we’re building</p><h2>Receive research and occasional development updates as Veilscope evolves.</h2><p>Subscribing provides email updates, not access to the tools.</p></div>
        <TextLink href="/updates">Get research updates</TextLink>
      </div>
    </section>
  </SiteShell>;
}
