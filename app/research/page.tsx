import Link from "next/link";
import { ResearchBrowser } from "@/components/research-browser";
import { PageIntro, SectionHeading, SiteShell } from "@/components/site-ui";
import { researchCategories } from "@/lib/site-content";
import { getReports } from "@/sanity/lib/data";

export const metadata = { title: "Research", description: "Company research, position notes, thesis updates, and methodology from Veilscope." };

export default async function ResearchPage() {
  const reports = await getReports();
  const hasArticles = reports.length > 0;
  return <SiteShell>
    <PageIntro eyebrow="Research" title="Research, with the reasoning attached.">
      <p>Explore the companies we’re studying, the investment decisions we discuss, and the evidence behind our views.</p>
      <p>Our research brings together financial performance, trading activity, company disclosures, and broader business context.</p>
    </PageIntro>

    {!hasArticles && <section className="site-section section-ruled">
      <div className="site-container empty-publication">
        <div>
          <p className="eyebrow">Latest research</p>
          <h2>Our first research reports are in progress.</h2>
        </div>
        <div>
          <p>We’re preparing company analyses that explain what caught our attention, what we found, and where uncertainty remains.</p>
          <Link className="site-button site-button-primary" href="/updates">Get research updates</Link>
        </div>
      </div>
    </section>}

    {hasArticles && <ResearchBrowser reports={reports} categories={researchCategories.map(category => category.name)} />}

    <section className="site-section research-categories-section">
      <div className="site-container">
        <SectionHeading eyebrow="Publication index" title="What we publish." />
        <dl className="category-index">
          {researchCategories.map(category => <div key={category.name}>
            <dt>{category.name}</dt>
            <dd>{category.description}</dd>
          </div>)}
        </dl>
      </div>
    </section>

    <section className="site-section section-ruled context-section">
      <div className="site-container reading-column">
        <SectionHeading eyebrow="Context" title="Read each report in context." />
        <p>Research reflects information and views as of its stated date. A company appearing here does not necessarily mean we hold a position in it.</p>
        <p>Historical case studies are retrospective. They should not be interpreted as investment calls published before the events described.</p>
      </div>
    </section>
  </SiteShell>;
}
