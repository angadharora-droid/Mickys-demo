import Link from "next/link";
import { COMPANY } from "@/data/company";
import { POLICIES } from "@/data/legal";
import { B2B_LINK, NAV } from "@/data/nav";

const PRIMARY = [...NAV.filter((n) => n.href !== "/contact"), B2B_LINK, NAV.find((n) => n.href === "/contact")!];
const tel = (v: string) => `tel:${v.replace(/\s/g, "")}`;

/** Global footer: site links, policies and verified company details only. */
export default function Footer() {
  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">Site footer</h2>
      <div className="sf-top">
        <div className="sf-brand">
          <Link href="/" className="display sf-logo">Micky&apos;s</Link>
          <p className="sf-line">Rasoi ki taiyaari, Micky&apos;s ki zimmedari.</p>
        </div>
        <nav className="sf-col" aria-label="Footer">
          <p className="sf-h">Explore</p>
          <ul>{PRIMARY.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav className="sf-col" aria-label="Policies">
          <p className="sf-h">Policies</p>
          <ul>{POLICIES.map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.title}</Link></li>)}</ul>
        </nav>
        <div className="sf-col">
          <p className="sf-h">Contact</p>
          <ul>
            {COMPANY.email && <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>}
            {COMPANY.phone && <li><a href={tel(COMPANY.phone)}>{COMPANY.phone}</a></li>}
            {COMPANY.socials.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
          </ul>
        </div>
      </div>
      <div className="sf-base">
        <p>
          © {new Date().getFullYear()} {COMPANY.legalName}
          {COMPANY.address && <><span aria-hidden="true"> · </span>{COMPANY.address}</>}
        </p>
        <p>FSSAI Lic. No. {COMPANY.fssai}</p>
      </div>
    </footer>
  );
}
