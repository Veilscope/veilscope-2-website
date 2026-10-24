import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Navbar } from "@/components/navbar";
import { Globe } from "@/components/globe";
import { SiteFooter } from "@/components/site-footer";
import { ResearchJourney } from "@/components/research-journey";
import { buildDots, type Coastline } from "@/lib/coastline";
import { globeConfig } from "@/lib/visual-config";

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

    <ResearchJourney />
    <SiteFooter />
  </>;
}
