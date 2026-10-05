"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_FINAL, ABOUT_HERO, ABOUT_PHOTOS, CONVENIENCE, EXISTS, FOOD_FIRST, IDEA, PRINCIPLES, RANGE_CTA, VALUES } from "@/data/about";
import { lightSection } from "@/lib/headerTheme";
import { Line } from "../ScrollCopy";
import B2BPhoto from "../b2b/B2BPhoto";

type Props = { photos: { ingredients: boolean; chef: boolean } };

const pouch = (slug: string) => `/products/pouches/${slug}-hero.webp`;
const pad = (n: number) => String(n + 1).padStart(2, "0");

export default function AboutPage({ photos }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const headBg = useRef<HTMLDivElement>(null);

  // header: maroon over cream/yellow sections, plus a backing strip in the colour of the section beneath it
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const offs = [...(root.current?.querySelectorAll<HTMLElement>('[data-theme="light"]') ?? [])].map((s) => lightSection(s, "top top+=40", "bottom top+=40"));
    let raf = 0;
    const paint = () => {
      raf = 0;
      const bg = headBg.current, header = document.getElementById("site-header");
      if (!bg || !header) return;
      const h = header.getBoundingClientRect().height;
      const under = [...(root.current?.children ?? [])].find((c) => { const r = c.getBoundingClientRect(); return r.top <= h && r.bottom > h; }) as HTMLElement | undefined;
      const colour = under ? getComputedStyle(under).backgroundColor : "";
      bg.style.height = `${h}px`;
      bg.style.backgroundColor = colour && colour !== "rgba(0, 0, 0, 0)" ? colour : "var(--color-maroon)";
      bg.classList.toggle("is-on", window.scrollY > 8);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { offs.forEach((off) => off()); cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  // masked text reveals + blocks rising in
  useEffect(() => {
    const items = [...(root.current?.querySelectorAll<HTMLElement>(".ab-reveal") ?? [])];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  // restrained motion: subtle image parallax, slow scaling, one colour transition
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]", el).forEach((frame) => {
        const img = frame.querySelector("img, .b2b-photo-ph");
        if (!img) return;
        const amt = Number(frame.dataset.parallax) || 8;
        gsap.fromTo(img, { yPercent: -amt, scale: 1.14 }, { yPercent: amt, scale: 1.04, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
      });
      // Food First (deep maroon) hands over to Convenience (cream)
      const conv = el.querySelector<HTMLElement>(".ab-conv");
      if (conv) {
        gsap.fromTo(conv, { backgroundColor: "#4a080c", color: "#f6e9d2" }, { backgroundColor: "#f6e9d2", color: "#6f0e13", ease: "none", scrollTrigger: { trigger: conv, start: "top 85%", end: "top 25%", scrub: true } });
      }
      // the line between pouch and dish draws with scroll
      const path = el.querySelector<SVGPathElement>(".ab-idea-line path");
      if (path) gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".ab-idea", start: "top 70%", end: "center 45%", scrub: true } });
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <div ref={headBg} className="ab-headbg" aria-hidden="true" />
      <div ref={root} className="ab">
        {/* 1 — opening */}
        <section className="ab-hero" aria-labelledby="ab-hero-h">
          <h1 id="ab-hero-h" className="display ab-hero-h">
            {ABOUT_HERO.headline.map((l, i) => <Line key={l} className={i === 3 ? "ab-accent" : ""}>{l}</Line>)}
          </h1>
          <div className="ab-hero-foot">
            <p className="ab-hero-support">{ABOUT_HERO.support.map((l) => <span key={l}>{l} </span>)}</p>
            <div className="ab-hero-img" data-parallax="6" data-review="placeholder photo">
              <Image src={ABOUT_PHOTOS.hero.src} alt={ABOUT_PHOTOS.hero.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 2 — why Micky's exists */}
        <section className="ab-exists" data-theme="light" aria-labelledby="ab-exists-h">
          <h2 id="ab-exists-h" className="display ab-h ab-reveal">
            {EXISTS.headline.map((l, i) => <Line key={l} className={i === 2 ? "ab-accent" : ""}>{l}</Line>)}
          </h2>
          <div className="ab-exists-row">
            <div className="ab-exists-story">
              {EXISTS.story.map((p, i) => <p key={p} className="ab-reveal" style={{ ["--d" as string]: `${i * 120}ms` }}>{p}</p>)}
            </div>
            <div className="ab-exists-img" data-parallax="7">
              <B2BPhoto photo={ABOUT_PHOTOS.ingredients} available={photos.ingredients} sizes="(min-width: 1024px) 44vw, 100vw" className="ab-photo" />
            </div>
          </div>
        </section>

        {/* 3 — our approach */}
        <section className="ab-principles" aria-label="Our approach">
          <p className="ab-eyebrow ab-reveal">Our approach</p>
          <ol className="ab-prin-list">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title[0]} className="ab-prin">
                <span className="ab-num ab-reveal">{pad(i)}</span>
                <h3 className="display ab-prin-t ab-reveal">
                  <Line>{p.title[0]}</Line>
                  <Line className="ab-accent">{p.title[1]}</Line>
                </h3>
                <p className="ab-prin-x ab-reveal">{p.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 4 — the Micky's idea */}
        <section className="ab-idea" data-theme="light" aria-label="We make the base. You make the dish.">
          <div className="ab-idea-side is-base">
            <div className="ab-idea-visual ab-reveal">
              <Image src={pouch(IDEA.pouch.slug)} alt={`Micky's ${IDEA.pouch.name} pouch`} width={1000} height={1340} sizes="(min-width: 1024px) 24vw, 56vw" className="ab-idea-pouch" />
            </div>
            <h2 className="display ab-idea-h ab-reveal"><Line>{IDEA.base[0]}</Line><Line>{IDEA.base[1]}</Line></h2>
          </div>
          <svg className="ab-idea-line" viewBox="0 0 400 300" aria-hidden="true">
            <path d="M8 150 C 120 20, 280 280, 384 150" pathLength={1} />
            <circle cx="390" cy="150" r="7" />
          </svg>
          <div className="ab-idea-side is-dish">
            <div className="ab-idea-visual ab-reveal" style={{ ["--d" as string]: "160ms" }}>
              <span className="ab-idea-dish" data-review="placeholder photo">
                <Image src={IDEA.dishImage.src} alt={IDEA.dishImage.alt} fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-cover" />
              </span>
            </div>
            <p className="display ab-idea-h ab-reveal" aria-hidden="false"><Line>{IDEA.dish[0]}</Line><Line className="ab-idea-you">{IDEA.dish[1]}</Line></p>
          </div>
        </section>

        {/* 5 — food first */}
        <section className="ab-food" aria-labelledby="ab-food-h">
          <div className="ab-food-head">
            <h2 id="ab-food-h" className="display ab-h ab-reveal">
              <Line>{FOOD_FIRST.headline[0]}</Line>
              <Line className="ab-accent">{FOOD_FIRST.headline[1]}</Line>
            </h2>
            <p className="ab-lede ab-reveal">{FOOD_FIRST.support}</p>
          </div>
          <div className="ab-food-grid">
            {ABOUT_PHOTOS.food.map((f, i) => (
              <figure key={f.src} className={`ab-food-img is-${i}`} data-parallax={i % 2 ? 5 : 8} data-review="placeholder photo">
                <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
              </figure>
            ))}
            <div className="ab-food-img is-chef" data-parallax="6">
              <B2BPhoto photo={ABOUT_PHOTOS.chef} available={photos.chef} sizes="(min-width: 1024px) 30vw, 100vw" className="ab-photo" />
            </div>
          </div>
        </section>

        {/* 6 — convenience */}
        <section className="ab-conv" data-theme="light" aria-labelledby="ab-conv-h">
          <h2 id="ab-conv-h" className="display ab-conv-h ab-reveal">
            {CONVENIENCE.headline.map((l, i) => <Line key={l} className={i === 3 ? "ab-accent" : ""}>{l}</Line>)}
          </h2>
          <p className="ab-conv-x ab-reveal">{CONVENIENCE.support.map((l) => <span key={l}>{l} </span>)}</p>
        </section>

        {/* 7 — values */}
        <section className="ab-values" aria-label="What we value">
          <p className="ab-eyebrow ab-reveal">What we value</p>
          <dl className="ab-val-list">
            {VALUES.map((v) => (
              <div key={v.title} className="ab-val">
                <dt className="display ab-reveal"><Line>{v.title}</Line></dt>
                <dd className="ab-reveal">{v.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 8 — into the range */}
        <section className="ab-range" data-theme="light" aria-labelledby="ab-range-h">
          <h2 id="ab-range-h" className="display ab-h ab-reveal">
            {RANGE_CTA.headline.map((l, i) => <Line key={l} className={i === 2 ? "ab-accent" : ""}>{l}</Line>)}
          </h2>
          <ul className="ab-range-list">
            {RANGE_CTA.categories.map((c, i) => (
              <li key={c.id} className="ab-reveal" style={{ ["--d" as string]: `${i * 110}ms` }}>
                <Link href={`/shop?category=${c.id}`} className="ab-cat">
                  <span className="ab-cat-img"><Image src={pouch(c.slug)} alt="" width={1000} height={1340} sizes="(min-width: 1024px) 14vw, 30vw" /></span>
                  <span className="display ab-cat-h">{c.label}</span>
                  <span className="ab-cat-x">{c.text}</span>
                  <span className="ab-cat-go" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="ab-btn is-dark ab-reveal">{RANGE_CTA.cta}</Link>
        </section>

        {/* 9 — final message */}
        <section className="ab-final" aria-labelledby="ab-final-h">
          <h2 id="ab-final-h" className="display ab-final-h ab-reveal">
            <Line>{ABOUT_FINAL.headline[0]}</Line>
            <Line className="ab-accent">{ABOUT_FINAL.headline[1]}</Line>
          </h2>
          <div className="ab-ctas ab-reveal">
            <Link href="/shop" className="ab-btn is-primary">{ABOUT_FINAL.primary}</Link>
            <Link href="/why-mickys" className="ab-btn is-ghost">{ABOUT_FINAL.secondary}</Link>
          </div>
        </section>
      </div>
    </>
  );
}
