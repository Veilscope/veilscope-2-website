import { PageIntro, SectionHeading, SiteShell } from "@/components/site-ui";

export const metadata = { title: "About", description: "Why Veilscope builds research tools and publishes its investment thinking." };

export default function AboutPage() {
  return <SiteShell>
    <PageIntro eyebrow="About" title="Built from our own investment questions.">
      <p>Veilscope began with a practical goal: develop a more structured way to investigate the companies we might invest in.</p>
      <p>We wanted to bring together financial performance, trading activity, company disclosures, and the broader forces affecting a business. We’re building tools around that process and sharing the research it produces.</p>
    </PageIntro>

    <section className="site-section section-ruled">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="01" title="Why we publish" />
        <div className="reading-copy">
          <p>We want readers to be able to examine our thinking: what caught our attention, which evidence informed our view, and where uncertainty remains.</p>
          <p>Our articles cover companies we’re investigating and investment decisions we choose to discuss. The research also provides a practical view of how we use the tools under development.</p>
        </div>
      </div>
    </section>

    <section className="site-section alternate-section">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="02" title="Where we are today" />
        <div className="reading-copy"><p>Our focus is publishing research and developing our tools. Neither tool is currently available for public access or purchase.</p></div>
      </div>
    </section>

    <section className="site-section section-ruled">
      <div className="site-container narrative-grid">
        <SectionHeading eyebrow="03" title="Our investment interests" />
        <div className="reading-copy"><p>We use this research in our own investing and may hold positions in companies we discuss. A published thesis should be considered alongside its date, evidence, risks, and position disclosure.</p></div>
      </div>
    </section>
  </SiteShell>;
}
