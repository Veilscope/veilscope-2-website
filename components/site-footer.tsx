import Link from "next/link";
import { siteConfig } from "@/lib/site-content";

const footerLinks = [
  { label: "Research", href: "/research" },
  { label: "Our Approach", href: "/approach" },
  { label: "Tools", href: "/tools" },
  { label: "About", href: "/about" },
] as const;

export function SiteFooter() {
  const legalLinks = [
    siteConfig.contactEmail && { label: "Contact", href: `mailto:${siteConfig.contactEmail}` },
    siteConfig.legal.disclosuresHref && { label: "Research disclosures", href: siteConfig.legal.disclosuresHref },
    siteConfig.legal.privacyHref && { label: "Privacy Policy", href: siteConfig.legal.privacyHref },
    siteConfig.legal.termsHref && { label: "Terms of Use", href: siteConfig.legal.termsHref },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return <footer className="site-footer">
    <div className="site-container footer-grid">
      <div className="footer-intro">
        <Link className="footer-brand" href="/">Veilscope</Link>
        <p>Research into U.S.-listed companies, supported by the tools we’re building.</p>
      </div>
      <nav className="footer-nav" aria-label="Footer navigation">
        {footerLinks.map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      {legalLinks.length > 0 && <nav className="footer-legal" aria-label="Legal and contact links">
        {legalLinks.map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>}
    </div>
    <div className="site-container footer-disclosure">
      <p>Veilscope publishes general investment research and opinion for informational purposes. Content is not personalized financial advice. We may hold positions in securities discussed; consult the relevant report disclosures. Investing involves risk, including loss of capital. Information and AI-assisted analysis may contain errors or omissions. Historical results and observed patterns do not guarantee future performance.</p>
      <p>© {new Date().getFullYear()} {siteConfig.ownerName}</p>
    </div>
  </footer>;
}
