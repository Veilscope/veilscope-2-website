import Image from "next/image";
import Link from "next/link";
import { siteNavigation } from "@/lib/site-content";

export function Navbar() {
  const pageLinks = siteNavigation.filter(link => !("featured" in link));
  const updatesLink = siteNavigation.find(link => "featured" in link);

  return <header className="site-header">
    <nav aria-label="Main navigation" className="navbar">
      <Link className="brand" href="/" aria-label="Veilscope home">
        <span className="brand-crop"><Image src="/assets/logos/Veilscope%20Logo%20Dark.svg" alt="VEILSCOPE" width={400} height={100} preload /></span>
      </Link>
      <div className="nav-pages">{pageLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
      {updatesLink && <div className="nav-updates"><Link className="nav-featured" href={updatesLink.href}>{updatesLink.label}</Link></div>}
    </nav>
  </header>;
}
