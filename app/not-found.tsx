import Link from "next/link";
import { SiteShell } from "@/components/site-ui";

export default function NotFound() {
  return <SiteShell>
    <section className="not-found-page site-container">
      <p className="eyebrow">404</p>
      <h1>That page is outside the scope.</h1>
      <p>The page may have moved, or the research report is not publicly available.</p>
      <Link className="site-button site-button-primary" href="/">Return home</Link>
    </section>
  </SiteShell>;
}
