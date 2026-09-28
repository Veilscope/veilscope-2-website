import { NewsletterUnavailable, PageIntro, SiteShell } from "@/components/site-ui";

export const metadata = { title: "Research Updates", description: "Follow new Veilscope research, thesis updates, and tool development." };

export default function UpdatesPage() {
  return <SiteShell>
    <PageIntro eyebrow="Updates" title="Keep up with Veilscope.">
      <p>Receive new research, updates to published theses, and occasional news about our tools.</p>
    </PageIntro>
    <section className="site-section section-ruled updates-section">
      <div className="site-container updates-layout">
        <div>
          <p className="eyebrow">Research email</p>
          <h2>Follow the work as it develops.</h2>
        </div>
        <NewsletterUnavailable />
      </div>
    </section>
  </SiteShell>;
}
