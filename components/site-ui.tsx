import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { newsletterMessages } from "@/lib/site-content";

export function SiteShell({ children }: { children: ReactNode }) {
  return <>
    <Navbar />
    <main className="interior-main">{children}</main>
    <SiteFooter />
  </>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <header className="page-intro site-container">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    <div className="page-intro-copy">{children}</div>
  </header>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>
    {children && <div className="section-description">{children}</div>}
  </div>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="text-link" href={href}>{children}<span aria-hidden="true">↗</span></Link>;
}

export function NewsletterUnavailable() {
  return <div className="newsletter-panel">
    <form aria-describedby="newsletter-status">
      <label htmlFor="newsletter-email">Email address</label>
      <div className="newsletter-fields">
        <input id="newsletter-email" name="email" type="email" autoComplete="email" disabled />
        <button type="submit" disabled>Subscribe to research updates</button>
      </div>
    </form>
    <p id="newsletter-status" className="form-status">{newsletterMessages.unavailable}</p>
  </div>;
}
