"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { B2B_CONTACT, BENEFITS, CONSISTENCY, ENQUIRY, FINAL, HERO, OPERATIONS, PHOTOS, RANGE, USE_CASES } from "@/data/b2b";
import type { Enquiry } from "@/lib/b2b";
import { lightSection } from "@/lib/headerTheme";
import { scrollToY } from "@/lib/smoothScroll";
import { Line } from "../ScrollCopy";
import B2BPhoto from "./B2BPhoto";
import EnquiryForm, { type EnquiryPreset } from "./EnquiryForm";
import KitchenProblem from "./KitchenProblem";
import Workflow from "./Workflow";

type Props = { photos: Record<keyof typeof PHOTOS, boolean> };

const pouch = (slug: string) => `/products/pouches/${slug}-hero.webp`;
const pad = (n: number) => String(n + 1).padStart(2, "0");
const INTEREST: Record<string, string> = { gravies: "Gravies", pastes: "Pastes & Sauces", grains: "Grains & Pulses" };

export default function B2BPage({ photos }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<EnquiryPreset>({ n: 0 });

  // header colour: maroon over the cream sections
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const offs = [...(root.current?.querySelectorAll<HTMLElement>('[data-theme="light"]') ?? [])].map((s) => lightSection(s, "top top+=40", "bottom top+=40"));
    return () => offs.forEach((off) => off());
  }, []);

  // header backing: once scrolled, a strip in the colour of the section under the header, so content never runs beneath it
  const headBg = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const bg = headBg.current, header = document.getElementById("site-header");
      if (!bg || !header) return;
      const h = header.getBoundingClientRect().height;
      let under = [...(root.current?.children ?? [])].find((c) => { const r = c.getBoundingClientRect(); return r.top <= h && r.bottom > h; }) as HTMLElement | undefined;
      if (under?.classList.contains("pin-spacer")) under = under.firstElementChild as HTMLElement; // GSAP's wrapper around the pinned section
      const colour = under ? getComputedStyle(under).backgroundColor : "";
      bg.style.height = `${h}px`;
      bg.style.backgroundColor = colour && colour !== "rgba(0, 0, 0, 0)" ? colour : "var(--color-maroon)";
      bg.classList.toggle("is-on", window.scrollY > 8);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  // reveals (headline lines, product renders, masked photos) as they enter the viewport
  useEffect(() => {
    const items = [...(root.current?.querySelectorAll<HTMLElement>(".b2b-reveal") ?? [])];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const toForm = (intent?: Enquiry["intent"], interest?: string) => {
    setPreset((p) => ({ intent, interest, n: p.n + 1 }));
    const el = document.getElementById("enquiry");
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 70, 1.1);
  };
  const toContact = () => {
    const el = document.getElementById("contact");
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 70, 1.2);
  };

  return (
    <>
    <div ref={headBg} className="b2b-headbg" aria-hidden="true" />
    <div ref={root} className="b2b">
      {/* 1 — opening */}
      <section className="b2b-hero" aria-labelledby="b2b-hero-h">
        <div className="b2b-hero-copy">
          <p className="b2b-eyebrow">Micky&apos;s for professional kitchens</p>
          <h1 id="b2b-hero-h" className="display b2b-hero-h">
            <Line>{HERO.headline[0]}</Line>
            <Line>{HERO.headline[1]}</Line>
          </h1>
          <p className="display b2b-hero-sub">
            <Line className="b2b-accent">{HERO.secondary[0]}</Line>
            <Line className="b2b-accent">{HERO.secondary[1]}</Line>
          </p>
          <p className="b2b-hero-support">{HERO.support}</p>
          <div className="b2b-ctas">
            <button type="button" className="b2b-btn is-primary" onClick={() => toForm("sample")}>{HERO.primary}</button>
            <button type="button" className="b2b-btn is-ghost" onClick={toContact}>{HERO.secondary_cta}</button>
          </div>
        </div>
        <div className="b2b-hero-visual">
          <B2BPhoto photo={PHOTOS.hero} available={photos.hero} sizes="(min-width: 1024px) 42vw, 100vw" className="b2b-hero-photo" priority />
          <Image src={pouch("makhani-sauce")} alt="Micky's Makhani Sauce pouch" width={1000} height={1340} sizes="(min-width: 1024px) 16vw, 34vw" className="b2b-hero-pouch" priority />
        </div>
      </section>

      {/* 2 — the kitchen problem */}
      <KitchenProblem />

      {/* 3 — four benefits */}
      <section className="b2b-benefits" aria-labelledby="b2b-ben-h">
        <h2 id="b2b-ben-h" className="b2b-eyebrow b2b-reveal">{BENEFITS.eyebrow}</h2>
        <ol className="b2b-ben-list">
          {BENEFITS.items.map((b, i) => (
            <li key={b.title} className="b2b-ben b2b-reveal" style={{ ["--d" as string]: `${i * 70}ms` }}>
              <span className="b2b-num">{pad(i)}</span>
              <h3 className="display b2b-ben-t">{b.title}</h3>
              <p className="b2b-ben-x">{b.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 — workflow */}
      <Workflow />
      <div className="b2b-flow-photo-wrap">
        <B2BPhoto photo={PHOTOS.workflow} available={photos.workflow} sizes="100vw" className="b2b-flow-photo b2b-reveal b2b-mask" />
      </div>

      {/* 5 — product range */}
      <section className="b2b-range" data-theme="light" aria-labelledby="b2b-range-h">
        <div className="b2b-range-head">
          <h2 id="b2b-range-h" className="display b2b-h b2b-reveal">
            <Line>{RANGE.headline[0]}</Line>
            <Line>{RANGE.headline[1]}</Line>
          </h2>
          <p className="b2b-lede b2b-reveal">Available for professional kitchens. {RANGE.note}</p>
        </div>
        {RANGE.categories.map((c, ci) => (
          <article key={c.id} className={`b2b-cat${ci % 2 ? " is-flip" : ""}`} aria-labelledby={`b2b-cat-${c.id}`}>
            <div className="b2b-cat-packs b2b-reveal" aria-hidden="true">
              {c.featured.map((f, i) => (
                <Image key={f.slug} src={pouch(f.slug)} alt="" width={1000} height={1340} sizes="(min-width: 1024px) 20vw, 40vw" className={`b2b-cat-pack is-${i}`} />
              ))}
            </div>
            <div className="b2b-cat-copy">
              <p className="b2b-num b2b-reveal">{pad(ci)} / {pad(RANGE.categories.length - 1)}</p>
              <h3 id={`b2b-cat-${c.id}`} className="display b2b-cat-h b2b-reveal"><Line>{c.label}</Line></h3>
              <p className="b2b-cat-x b2b-reveal">{c.text}</p>
              <ul className="b2b-cat-list">
                {c.featured.map((f) => (
                  <li key={f.slug} className="b2b-reveal">
                    <span className="display b2b-cat-name">{f.name}</span>
                    <span className="b2b-cat-desc">{f.text}</span>
                  </li>
                ))}
              </ul>
              <p className="b2b-cat-also b2b-reveal"><span>Also in the range</span>{c.also.join(" · ")}</p>
              <p className="b2b-cat-note b2b-reveal">{RANGE.note}</p>
              <button type="button" className="b2b-btn is-dark b2b-reveal" onClick={() => toForm("details", INTEREST[c.id])}>Request product details</button>
            </div>
          </article>
        ))}
      </section>

      {/* 6 — consistency */}
      <section className="b2b-cons" aria-labelledby="b2b-cons-h">
        <h2 id="b2b-cons-h" className="display b2b-h b2b-cons-h b2b-reveal">
          <Line>{CONSISTENCY.headline[0]}</Line>
          <Line>{CONSISTENCY.headline[1]}</Line>
          <Line className="b2b-accent">{CONSISTENCY.headline[2]}</Line>
        </h2>
        <div className="b2b-cons-map b2b-reveal">
          <figure className="b2b-cons-base">
            <Image src={pouch(CONSISTENCY.base.slug)} alt={`Micky's ${CONSISTENCY.base.name} pouch`} width={1000} height={1340} sizes="(min-width: 1024px) 18vw, 40vw" />
            <figcaption><span className="b2b-accent-chip">{CONSISTENCY.base.label}</span>{CONSISTENCY.base.name}</figcaption>
          </figure>
          <svg className="b2b-cons-lines" viewBox="0 0 200 600" preserveAspectRatio="none" aria-hidden="true">
            {[100, 300, 500].map((y, i) => (
              <path key={y} d={`M0 300 C 110 300, 90 ${y}, 200 ${y}`} pathLength={1} style={{ ["--d" as string]: `${i * 140}ms` }} />
            ))}
          </svg>
          <ul className="b2b-cons-dishes">
            {CONSISTENCY.dishes.map((d, i) => (
              // photo: placeholder until the Micky's food shoot
              <li key={d.label} className="b2b-cons-dish" data-review="placeholder photo" style={{ ["--d" as string]: `${300 + i * 140}ms` }}>
                <span className="b2b-cons-img"><Image src={d.image} alt={d.alt} fill sizes="(min-width: 1024px) 16vw, 36vw" className="object-cover" /></span>
                <span className="display b2b-cons-label">{d.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="display b2b-cons-cap b2b-reveal">
          <Line>{CONSISTENCY.caption[0]}</Line>
          <Line className="b2b-accent">{CONSISTENCY.caption[1]}</Line>
        </p>
      </section>

      {/* 7 — operations */}
      <section className="b2b-ops" data-theme="light" aria-labelledby="b2b-ops-h">
        <h2 id="b2b-ops-h" className="display b2b-h b2b-reveal">
          <Line>{OPERATIONS.headline[0]}</Line>
          <Line>{OPERATIONS.headline[1]}</Line>
        </h2>
        <ul className="b2b-ops-list">
          {OPERATIONS.items.map((o, i) => (
            <li key={o.title} className="b2b-ops-item b2b-reveal" style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
              <span className="b2b-num">{pad(i)}</span>
              <h3 className="display b2b-ops-t">{o.title}</h3>
              <p className="b2b-ops-x">{o.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 8 — use cases */}
      <section className="b2b-uses" aria-labelledby="b2b-uses-h">
        <div className="b2b-uses-media">
          <B2BPhoto photo={PHOTOS.useCases} available={photos.useCases} sizes="(min-width: 1024px) 40vw, 100vw" className="b2b-uses-photo b2b-reveal b2b-mask" />
        </div>
        <div className="b2b-uses-copy">
          <h2 id="b2b-uses-h" className="display b2b-h b2b-reveal">
            <Line>{USE_CASES.headline[0]}</Line>
            <Line className="b2b-accent">{USE_CASES.headline[1]}</Line>
          </h2>
          <dl className="b2b-uses-list">
            {USE_CASES.items.map((u) => (
              <div key={u.title} className="b2b-use b2b-reveal">
                <dt className="display">{u.title}</dt>
                <dd>{u.text}</dd>
              </div>
            ))}
          </dl>
          <p className="b2b-uses-also b2b-reveal">{USE_CASES.also}</p>
        </div>
      </section>

      {/* 9 — enquiry form */}
      <section id="enquiry" className="b2b-enquiry" data-theme="light" aria-labelledby="b2b-enq-h">
        <div className="b2b-enquiry-head">
          <h2 id="b2b-enq-h" className="display b2b-h b2b-reveal"><Line>{ENQUIRY.headline[0]}</Line></h2>
          <p className="b2b-lede b2b-reveal">{ENQUIRY.support}</p>
        </div>
        <EnquiryForm preset={preset} />
      </section>

      {/* 10 — final CTA */}
      <section id="contact" className="b2b-final" aria-labelledby="b2b-final-h">
        <h2 id="b2b-final-h" className="display b2b-final-h b2b-reveal">
          <Line>{FINAL.headline[0]}</Line>
          <Line>{FINAL.headline[1]}</Line>
          <Line className="b2b-accent">{FINAL.headline[2]}</Line>
        </h2>
        <div className="b2b-final-row b2b-reveal">
          <div className="b2b-ctas">
            <button type="button" className="b2b-btn is-primary" onClick={() => toForm("sample")}>{FINAL.primary}</button>
            <a className="b2b-btn is-ghost" href={B2B_CONTACT.phoneHref}>{FINAL.secondary}</a>
          </div>
          <p className="b2b-final-contact">
            <a href={B2B_CONTACT.phoneHref}>{B2B_CONTACT.phone}</a>
            <a href={`mailto:${B2B_CONTACT.email}`}>{B2B_CONTACT.email}</a>
          </p>
        </div>
      </section>
    </div>
    </>
  );
}
