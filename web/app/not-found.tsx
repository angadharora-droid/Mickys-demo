import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import LightHeader from "@/components/shop/LightHeader";

export const metadata: Metadata = { title: "Page not found | Micky's" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <LightHeader />
        <section className="nf" aria-labelledby="nf-h">
          <p className="nf-code">404</p>
          <h1 id="nf-h" className="display nf-h">Page<br />not found.</h1>
          <p className="nf-x">This page has moved or never existed. The kitchen is still open.</p>
          <div className="nf-ctas">
            <Link href="/" className="b2b-btn nf-primary">Back home</Link>
            <Link href="/shop" className="b2b-btn nf-ghost">Shop Micky&apos;s</Link>
          </div>
        </section>
      </main>
    </>
  );
}
