"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ConsistencyDiagram from "./ConsistencyDiagram";
import PrepCollapse from "./PrepCollapse";
import { Line } from "./ScrollCopy";

// Chapter 1: what the chef still decides. Positions are % of the orbit box (pouch at its centre).
const ORBIT = [
  { w: "Season", x: 16, y: 16 },
  { w: "Finish", x: 84, y: 14 },
  { w: "Garnish", x: 94, y: 54 },
  { w: "Portion", x: 82, y: 90 },
  { w: "Plate", x: 18, y: 88 },
];
const POUCH_AT = { x: 50, y: 52 };

// Chapter 4: back-of-house complexity. left/top in %, size in vw (desktop).
const FIELD = [
  { w: "Ingredients", x: 42, y: 15, s: 4.2 }, { w: "Prep bowls", x: 67, y: 11, s: 3.2 }, { w: "Storage", x: 79, y: 27, s: 4.6 },
  { w: "Equipment", x: 38, y: 36, s: 3.6 }, { w: "Multiple processes", x: 44, y: 54, s: 3.8 }, { w: "Procurement", x: 6, y: 68, s: 4.4 },
  { w: "Suppliers", x: 74, y: 69, s: 2.8 }, { w: "Prep lists", x: 34, y: 85, s: 2.6 }, { w: "Chopping", x: 87, y: 47, s: 2.4 },
  { w: "Soaking", x: 57, y: 27, s: 2.2 }, { w: "Grinding", x: 63, y: 40, s: 2.4 }, { w: "Cold storage", x: 10, y: 57, s: 2.6 },
  { w: "Stock", x: 28, y: 63, s: 2.2 }, { w: "Wastage", x: 60, y: 86, s: 3 },
];

// Chapter 5: benefits already stated in existing Micky's content (qualitative only).
const BENEFITS = ["Less prep", "Consistent base", "Faster execution", "Simpler procurement", "Lower wastage", "Reduced storage complexity"];

// Desktop timeline in % of the viewport height (the pinned scroll).
const C1 = 62, C2 = C1 + 56, C3 = C2 + 58, C4 = C3 + 72, C5 = C4 + 68, END = C5 + 48;
// Scroll pace: how much scrolling the whole film takes, as a multiple of the choreography above.
// 1 = 364vh (each chapter about half a screen). 1.75 = about one screen of scrolling per chapter.
const PACE = 4;

export default function WhyMickys() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(section);
    const at = (v: number) => v / END;
    // decode photos and the pouch before they are needed, not on the frame they first appear
    section.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      if (img.complete) img.decode().catch(() => {});
      else img.addEventListener("load", () => img.decode().catch(() => {}), { once: true });
    });
    const mm = gsap.matchMedia();

    // ---------------------------------------------------------------- desktop: one pinned film
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: `+=${END * PACE}%`, pin: true, scrub: true, invalidateOnRefresh: true }, // Lenis already smooths: no second lag
      });
      const reveal = (sel: string, v: number, dur = 12, stagger = 3) =>
        tl.fromTo(q(`${sel} .line-inner`), { yPercent: 125 }, { yPercent: 0, duration: at(dur), stagger: at(stagger), ease: "power3.out" }, at(v));
      const wipeOut = (sel: string, v: number, dur = 10) =>
        tl.fromTo(q(sel), { clipPath: "inset(-20% -5% -20% -5%)", y: 0 }, { clipPath: "inset(-20% -5% 125% -5%)", y: -40, duration: at(dur), ease: "power2.in", immediateRender: false }, at(v));
      // each scene exists only during its own stretch of the film (kickers, lines and all)
      // opacity (not visibility) so every scene stays painted: revealing one costs nothing mid-scroll
      gsap.set(q(".why-scene"), { opacity: 0 });
      const live = (sel: string, from: number, to?: number) => {
        tl.set(q(sel), { opacity: 1 }, at(from));
        if (to !== undefined) tl.set(q(sel), { opacity: 0 }, at(to));
      };
      live(".why-s-open", 0, 26);
      live(".why-s-statement", 18, 61);
      live(".why-s-charge", C1 - 1, C1 + 57);
      live(".why-s-consistent", C2 - 1, C2 + 59);
      live(".why-s-prep", C3 - 1, C3 + 73);
      live(".why-s-scenes", C4 - 1, C4 + 71);
      live(".why-s-smart", C5 - 1);

      // WHY MICKY'S? is on screen when the page opens, then gives way to LESS PREP. MORE CONTROL.
      const intro = gsap.fromTo(q(".why-s-open .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power3.out", delay: 0.15 });
      wipeOut(".why-s-open", 14);
      reveal(".why-statement", 20, 14, 5);
      reveal(".why-core", 30, 10, 3);
      wipeOut(".why-s-statement", 50, 10);

      // Chapter 1: YOU'RE IN CHARGE. Words move outward from the pouch.
      reveal(".why-s-charge .why-h", C1, 12, 4);
      tl.fromTo(q(".why-pouch"), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: at(18), ease: "power3.out" }, at(C1 + 2));
      tl.fromTo(q(".why-pouch img"), { yPercent: 4 }, { yPercent: -4, duration: at(50) }, at(C1 + 2));
      tl.fromTo(q(".why-orbit-word"), {
        x: (_: number, el: HTMLElement) => +(el.dataset.dx ?? 0) * (el.parentElement?.clientWidth ?? 0) / 100,
        y: (_: number, el: HTMLElement) => +(el.dataset.dy ?? 0) * (el.parentElement?.clientHeight ?? 0) / 100,
        scale: 0.4, opacity: 0,
      }, { x: 0, y: 0, scale: 1, opacity: 1, duration: at(20), stagger: at(3), ease: "power3.out" }, at(C1 + 14));
      tl.fromTo(q(".why-orbit-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(16), stagger: at(3), ease: "power2.out" }, at(C1 + 16));
      reveal(".why-s-charge .why-support", C1 + 20, 10, 3);
      tl.fromTo(q(".why-chef"), { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: at(16), ease: "power3.out" }, at(C1 + 8));
      tl.fromTo(q(".why-chef img"), { scale: 1.12 }, { scale: 1, duration: at(46) }, at(C1 + 8));
      wipeOut(".why-s-charge", C1 + 46);

      // Chapter 2: START CONSISTENT. FINISH YOUR WAY.
      reveal(".why-s-consistent .why-h-a", C2, 12, 4);
      tl.fromTo(q(".why-base-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(14), ease: "power2.inOut" }, at(C2 + 6));
      reveal(".why-base-label", C2 + 8, 8);
      tl.fromTo(q(".why-branch"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(16), stagger: at(3), ease: "power2.out" }, at(C2 + 18));
      tl.fromTo(q(".why-branch-dot"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: at(6), stagger: at(3), ease: "power2.out" }, at(C2 + 30));
      reveal(".why-outcomes", C2 + 28, 10, 3);
      tl.fromTo(q(".why-dish"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: at(16), ease: "power3.out" }, at(C2 + 14));
      tl.fromTo(q(".why-dish-inner"), { yPercent: 6, scale: 1.08 }, { yPercent: -4, scale: 1, duration: at(44) }, at(C2 + 14));
      reveal(".why-s-consistent .why-h-b", C2 + 34, 12, 4);
      wipeOut(".why-s-consistent", C2 + 48);

      // Chapter 3: SKIP THE LONG PREP. Seven steps compress into three.
      reveal(".why-s-prep .why-h", C3, 12, 4);
      tl.fromTo(q(".why-prep-row"), { x: () => window.innerWidth * 0.3, opacity: 0 }, { x: 0, opacity: 1, duration: at(16), ease: "power3.out" }, at(C3 + 4));
      tl.fromTo(q(".why-prep-rule"), { scaleX: 0 }, { scaleX: 1, duration: at(14), ease: "power2.out" }, at(C3 + 6));
      tl.to(q(".why-prep-word"), {
        x: (_: number, el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          const row = (el.parentElement as HTMLElement).getBoundingClientRect();
          return row.left + row.width / 2 - (r.left + r.width / 2);
        },
        scaleX: 0.15, opacity: 0, duration: at(20), ease: "power3.in", stagger: { each: at(1.2), from: "edges" },
      }, at(C3 + 28));
      tl.to(q(".why-prep-rule"), { scaleX: 0.03, duration: at(18), ease: "power3.in" }, at(C3 + 30));
      reveal(".why-prep-result", C3 + 46, 12, 4);
      tl.to(q(".why-prep-rule"), { opacity: 0, duration: at(6) }, at(C3 + 48));
      reveal(".why-s-prep .why-support", C3 + 54, 10, 3);
      wipeOut(".why-s-prep", C3 + 62);

      // Chapter 4: LESS BEHIND THE SCENES. The field organises, collapses, and simplifies.
      reveal(".why-s-scenes .why-h", C4, 12, 4);
      tl.fromTo(q(".why-field-word"), { opacity: 0, scale: 0.92 }, { opacity: (_: number, el: HTMLElement) => +(el.dataset.o ?? 0.5), scale: 1, duration: at(12), stagger: at(0.8) }, at(C4 + 2));
      // organise into a column, then collapse: transforms only, measured from the field box
      const field = q(".why-field")[0] as HTMLElement;
      const dx = (el: HTMLElement) => (0.74 - parseFloat(el.style.left) / 100) * field.clientWidth;
      const dy = (el: HTMLElement, topPct: number) => (topPct / 100 - parseFloat(el.style.top) / 100) * field.clientHeight;
      tl.to(q(".why-field-word"), {
        x: (_: number, el: HTMLElement) => dx(el), y: (i: number, el: HTMLElement) => dy(el, 16 + i * 4.9),
        scale: (_: number, el: HTMLElement) => 1.15 / +(el.dataset.s ?? 2), opacity: 0.8,
        duration: at(14), stagger: at(0.6), ease: "power3.inOut",
      }, at(C4 + 20));
      tl.to(q(".why-field-word"), { y: (_: number, el: HTMLElement) => dy(el, 50), scale: 0.05, opacity: 0, duration: at(10), stagger: { each: at(0.4), from: "edges" }, ease: "power3.in" }, at(C4 + 36));
      reveal(".why-equation", C4 + 44, 8, 1.5);
      wipeOut(".why-s-scenes", C4 + 60);

      // Chapter 5: A SMARTER WAY TO PREP.
      reveal(".why-s-smart .why-h", C5, 14, 5);
      tl.fromTo(q(".why-benefit"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: at(8), stagger: at(4), ease: "power2.out" }, at(C5 + 10));
      tl.fromTo(q(".why-benefit-rule"), { scaleX: 0 }, { scaleX: 1, duration: at(8), stagger: at(4), ease: "power2.out" }, at(C5 + 12));
      tl.set({}, {}, 1);

      return () => {
        intro.kill();
        gsap.set(q(".why-scene"), { clearProps: "opacity,clipPath,transform" });
      };
    });

    // ---------------------------------------------------------------- phones & tablets: the same story, vertically
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const onEnter = (sel: string, trigger: string, from: gsap.TweenVars, to: gsap.TweenVars) =>
        q(sel).length && gsap.fromTo(q(sel), from, { ...to, scrollTrigger: { trigger: q(trigger)[0], start: "top 82%", toggleActions: "play none none reverse" } });
      const lines = (scope: string) => onEnter(`${scope} .line-inner`, scope, { yPercent: 125 }, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });
      gsap.fromTo(q(".why-s-open .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power3.out", delay: 0.15 });
      [".why-statement", ".why-core", ".why-s-charge .why-h", ".why-s-charge .why-support", ".why-s-consistent .why-h-a",
        ".why-s-consistent .why-h-b", ".why-outcomes", ".why-base-label", ".why-s-prep .why-h", ".why-s-prep .why-support",
        ".why-s-scenes .why-h", ".why-equation", ".why-s-smart .why-h"].forEach(lines);
      const scrub = (trigger: string, start = "top 75%", end = "bottom 60%") => ({ trigger: q(trigger)[0], start, end, scrub: true });
      gsap.fromTo(q(".why-orbit-word"), {
        x: (_: number, el: HTMLElement) => +(el.dataset.dx ?? 0) * (el.parentElement?.clientWidth ?? 0) / 100,
        y: (_: number, el: HTMLElement) => +(el.dataset.dy ?? 0) * (el.parentElement?.clientHeight ?? 0) / 100,
        scale: 0.4, opacity: 0,
      }, { x: 0, y: 0, scale: 1, opacity: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: scrub(".why-orbit", "top 80%", "center 55%") });
      gsap.fromTo(q(".why-orbit-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.1, scrollTrigger: scrub(".why-orbit", "top 75%", "center 55%") });
      gsap.fromTo(q(".why-base-line, .why-branch"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.12, scrollTrigger: scrub(".why-diagram", "top 80%", "center 50%") });
      gsap.fromTo(q(".why-prep-word"), { x: 0, scaleX: 1, opacity: 1 }, {
        x: (_: number, el: HTMLElement) => {
          const r = el.getBoundingClientRect(); const row = (el.parentElement as HTMLElement).getBoundingClientRect();
          return row.left + row.width / 2 - (r.left + r.width / 2);
        },
        scaleX: 0.15, opacity: 0, stagger: { each: 0.05, from: "edges" }, ease: "power2.in", scrollTrigger: scrub(".why-prep", "top 55%", "center 35%"),
      });
      gsap.fromTo(q(".why-field-word"), { opacity: (_: number, el: HTMLElement) => +(el.dataset.o ?? 0.5), scale: 1 }, {
        x: (_: number, el: HTMLElement) => (0.5 - parseFloat(el.style.left) / 100) * (el.parentElement?.clientWidth ?? 0),
        y: (_: number, el: HTMLElement) => (0.5 - parseFloat(el.style.top) / 100) * (el.parentElement?.clientHeight ?? 0),
        scale: 0.05, opacity: 0, stagger: { each: 0.03, from: "edges" }, ease: "power2.in", scrollTrigger: scrub(".why-field", "top 45%", "bottom 45%"),
      });
      // OPEN. HEAT. FINISH. only once the seven steps have collapsed
      gsap.fromTo(q(".why-prep-result .line-inner"), { yPercent: 125 }, {
        yPercent: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: q(".why-prep")[0], start: "center 34%", toggleActions: "play none none reverse" },
      });
      gsap.fromTo(q(".why-prep-rule"), { scaleX: 1 }, { scaleX: 0.03, ease: "power2.in", scrollTrigger: scrub(".why-prep", "top 55%", "center 35%") });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="why-mickys" aria-labelledby="why-heading" className="why text-cream">
      <div className="why-atmos" aria-hidden="true" />

      <div className="why-content">
        {/* Opening */}
        <div className="why-scene why-s-open">
          <h1 id="why-heading" className="display why-open-h">
            <Line>Why</Line>
            <Line className="text-yellow">Micky&apos;s?</Line>
          </h1>
        </div>
        <div className="why-scene why-s-statement">
          <p className="display why-statement">
            <Line>Less prep.</Line>
            <Line className="text-yellow">More control.</Line>
          </p>
          <p className="why-core">
            <Line>Micky&apos;s removes the repetitive prep.</Line>
            <Line>The chef keeps the control.</Line>
          </p>
        </div>

        {/* 1 · YOU'RE IN CHARGE */}
        <div className="why-scene why-s-charge">
          <p className="why-kicker">01 · Control</p>
          <h3 className="display why-h why-h-lg">
            <Line>You&apos;re</Line>
            <Line className="text-yellow">in charge.</Line>
          </h3>
          <p className="why-support">
            <Line>Micky&apos;s handles the preparation.</Line>
            <Line>You decide how the final dish tastes, looks and finishes.</Line>
          </p>
          <figure className="why-chef">
            <Image src="/images/module6/chef-kitchen.webp" alt="" fill sizes="16vw" priority className="object-cover" />
          </figure>
          <div className="why-orbit">
            <svg className="why-orbit-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {ORBIT.map((o) => (
                <line key={o.w} className="why-orbit-line" pathLength={1} x1={POUCH_AT.x} y1={POUCH_AT.y} x2={o.x} y2={o.y} />
              ))}
            </svg>
            <figure className="why-pouch">
              <Image src="/images/module6/pouch.webp" alt="Micky's Makhani Sauce pouch" fill sizes="(min-width: 1024px) 22vw, 50vw" priority className="object-contain" />
            </figure>
            <ul className="why-orbit-words" aria-label="What the chef decides">
              {ORBIT.map((o) => (
                <li key={o.w} className="why-orbit-word display" style={{ left: `${o.x}%`, top: `${o.y}%` }} data-dx={POUCH_AT.x - o.x} data-dy={POUCH_AT.y - o.y}>
                  {o.w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2 · CONSISTENT BASE */}
        <div className="why-scene why-s-consistent">
          <p className="why-kicker">02 · Consistency</p>
          <h3 className="display why-h why-h-a">
            <Line>Start</Line>
            <Line>consistent.</Line>
          </h3>
          <h3 className="display why-h why-h-b">
            <Line className="text-yellow">Finish</Line>
            <Line className="text-yellow">your way.</Line>
          </h3>
          <ConsistencyDiagram />
        </div>

        {/* 3 · FASTER EXECUTION */}
        <div className="why-scene why-s-prep">
          <p className="why-kicker">03 · Speed</p>
          <h3 className="display why-h why-h-md">
            <Line>Skip</Line>
            <Line>the long</Line>
            <Line className="text-yellow">prep.</Line>
          </h3>
          <PrepCollapse />
          <p className="why-support">
            <Line>Micky&apos;s takes care of the repetitive base preparation</Line>
            <Line>so the kitchen can move faster.</Line>
          </p>
        </div>

        {/* 4 · LESS BACK-OF-HOUSE COMPLEXITY */}
        <div className="why-scene why-s-scenes">
          <p className="why-kicker">04 · Simplicity</p>
          <h3 className="display why-h why-h-md">
            <Line>Less</Line>
            <Line>behind</Line>
            <Line className="text-yellow">the scenes.</Line>
          </h3>
          <div className="why-field" aria-hidden="true">
            {FIELD.map((f, i) => (
              <span key={f.w} className="why-field-word display" data-s={f.s} data-o={(0.28 + (i % 4) * 0.1).toFixed(2)} style={{ left: `${f.x}%`, top: `${f.y}%`, ["--fs" as string]: `${f.s}` }}>
                {f.w}
              </span>
            ))}
          </div>
          <p className="why-equation display" aria-label="Micky's plus final ingredients plus chef">
            <Line className="text-yellow">Micky&apos;s</Line>
            <Line className="why-plus">+</Line>
            <Line>Final ingredients</Line>
            <Line className="why-plus">+</Line>
            <Line>Chef</Line>
          </p>
        </div>

        {/* 5 · SMARTER KITCHEN */}
        <div className="why-scene why-s-smart">
          <p className="why-kicker">05 · The kitchen</p>
          <h3 className="display why-h why-h-xl">
            <Line>A smarter</Line>
            <Line>way to</Line>
            <Line className="text-yellow">prep.</Line>
          </h3>
          <ul className="why-benefits">
            {BENEFITS.map((b) => (
              <li key={b} className="why-benefit display">
                <span className="why-benefit-rule" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
