"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { darkSection } from "@/lib/headerTheme";
import { Line } from "./ScrollCopy";

// The three retort conditions, placed on a triangle around the pouch (desktop).
// No values anywhere: these are names, not numbers.
const CONDITIONS = [
  { w: "Heat", cls: "q8-c-heat" },
  { w: "Time", cls: "q8-c-time" },
  { w: "Pressure", cls: "q8-c-pressure" },
];
const MICRO = ["Cooked", "Sealed", "Processed", "Ready"];
const PRINCIPLES = [
  { w: "Consistent.", s: "Consistent colour, texture and taste across every service." },
  { w: "Sealed.", s: "Prepared food is sealed in the pouch before retort processing." },
  { w: "Convenient.", s: "Ready to use, for faster final execution in the kitchen." },
];

// Desktop choreography in % of the viewport height; PACE stretches it evenly.
const HEAD = 20, POUCH = 44, COND = 72, LOCK = 122, PR = 170, READY = 300, END = 350;
const PACE = 1.1; // ≈176vh for the retort moment, ≈385vh in total

export default function QualitySeal() {
  const sectionRef = useRef<HTMLElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const hand = handRef.current;
    if (!section || !hand) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(section);
    const at = (v: number) => v / END;
    section.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      if (img.complete) img.decode().catch(() => {});
      else img.addEventListener("load", () => img.decode().catch(() => {}), { once: true });
    });
    const mm = gsap.matchMedia();
    const releases: (() => void)[] = [];

    // ---------------------------------------------------------------- desktop: one pinned film
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("q8-pre");

      // Hand-off: when Module 7's pin ends, copy its last frame, then let the cream fade into maroon.
      const fill = () => {
        hand.innerHTML = "";
        section.classList.remove("q8-pre");
        const ptp = document.querySelector("section.ptp") as HTMLElement | null;
        const content = ptp?.querySelector(":scope > .ptp-content");
        if (!content) return;
        const copy = document.createElement("div");
        copy.className = "ptp q8-hand-ptp";
        copy.appendChild(content.cloneNode(true));
        copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        copy.setAttribute("inert", "");
        hand.appendChild(copy);
      };
      const clear = () => { section.classList.add("q8-pre"); hand.innerHTML = ""; };
      const gate = ScrollTrigger.create({ trigger: section, start: "top top", onEnter: fill, onLeaveBack: clear });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: `+=${END * PACE}%`, pin: true, scrub: true, invalidateOnRefresh: true },
      });
      const reveal = (sel: string, v: number, dur = 12, stagger = 3) =>
        tl.fromTo(q(`${sel} .line-inner`), { yPercent: 125 }, { yPercent: 0, duration: at(dur), stagger: at(stagger), ease: "power3.out" }, at(v));
      const wipeOut = (sel: string, v: number, dur = 10) =>
        tl.fromTo(q(sel), { clipPath: "inset(-20% -5% -20% -5%)", y: 0 }, { clipPath: "inset(-20% -5% 125% -5%)", y: -40, duration: at(dur), ease: "power2.in", immediateRender: false }, at(v));

      // each scene exists only during its own stretch (opacity keeps them painted, so reveals are free)
      gsap.set(q(".q8-scene"), { opacity: 0 });
      const live = (sel: string, from: number, to?: number) => {
        tl.set(q(sel), { opacity: 1 }, at(from));
        if (to !== undefined) tl.set(q(sel), { opacity: 0 }, at(to));
      };
      live(".q8-s-retort", 0, PR);
      live(".q8-s-lock", LOCK, PR + 1);
      PRINCIPLES.forEach((_, i) => live(`.q8-pr-${i}`, PR + i * 42 - 1, PR + i * 42 + 41));
      live(".q8-s-ready", READY - 1);

      // 0–26: Module 7's words leave, then the cream fades into deep maroon
      tl.fromTo(hand, { opacity: 1 }, { opacity: 0, duration: at(10), ease: "power1.in" }, at(1));
      tl.fromTo(q(".q8-cream"), { opacity: 1 }, { opacity: 0, duration: at(12), ease: "power2.in" }, at(6)); // brief: the in-between colour never lingers
      tl.fromTo(q(".q8-atmos"), { opacity: 0 }, { opacity: 1, duration: at(12) }, at(8));
      gsap.set(q(".q8-arrows"), { opacity: 0 });

      // SEALED FOR QUALITY., then it steps back to the corner as the pouch arrives
      reveal(".q8-head", HEAD, 14, 5);
      reveal(".q8-sub", HEAD + 12, 10, 3);
      tl.to(q(".q8-head"), { scale: 0.34, duration: at(18), ease: "power3.inOut" }, at(POUCH));
      tl.to(q(".q8-sub"), { opacity: 0, y: -16, duration: at(8), ease: "power2.in" }, at(POUCH));

      // The pouch enters and settles in the centre
      tl.fromTo(q(".q8-pouch"), { yPercent: 60, scale: 0.78, rotation: -8, opacity: 0 }, { yPercent: 0, scale: 1, rotation: -2, opacity: 1, duration: at(26), ease: "power3.out" }, at(POUCH + 2));
      tl.fromTo(q(".q8-pouch-img"), { yPercent: 2 }, { yPercent: -2, duration: at(130) }, at(POUCH)); // slow drift

      // HEAT / PRESSURE / TIME around the pouch, lines drawn in, one ring for the cycle
      tl.fromTo(q(".q8-arrows"), { opacity: 0 }, { opacity: 1, duration: at(4) }, at(COND));
      tl.fromTo(q(".q8-cond"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: at(8), stagger: at(4), ease: "power2.out" }, at(COND));
      tl.fromTo(q(".q8-arrow"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(12), stagger: at(4), ease: "power2.inOut" }, at(COND + 4));
      tl.fromTo(q(".q8-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(28), ease: "power1.inOut" }, at(COND + 10));
      tl.fromTo(q(".q8-stage"), { "--warm": 0 }, { "--warm": 1, duration: at(28), ease: "power1.inOut" }, at(COND + 10));
      MICRO.forEach((_, i) => {
        const t0 = COND + 12 + i * 7;
        tl.fromTo(q(`.q8-micro-${i}`), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: at(3), ease: "power2.out" }, at(t0));
        if (i < MICRO.length - 1) tl.to(q(`.q8-micro-${i}`), { opacity: 0, y: -8, duration: at(3), ease: "power2.in" }, at(t0 + 5));
      });
      tl.fromTo(q(".q8-sheen"), { backgroundPosition: "160% 0" }, { backgroundPosition: "-60% 0", duration: at(12), ease: "power2.inOut" }, at(COND + 30));
      tl.fromTo(q(".q8-down"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(8), ease: "power2.out" }, at(COND + 36));
      reveal(".q8-sealed", COND + 40, 8);

      // QUALITY, LOCKED IN.
      tl.to(q(".q8-cond, .q8-arrows, .q8-micro, .q8-sealed, .q8-down-svg"), { opacity: 0, duration: at(8) }, at(LOCK));
      tl.to(q(".q8-stage"), { xPercent: 22, scale: 0.86, duration: at(18), ease: "power3.inOut" }, at(LOCK));
      tl.to(q(".q8-head"), { opacity: 0, duration: at(8) }, at(LOCK));
      reveal(".q8-lock", LOCK + 10, 14, 5);
      reveal(".q8-lock-sub", LOCK + 20, 10, 3);
      wipeOut(".q8-s-lock", PR - 10);
      tl.to(q(".q8-stage"), { opacity: 0, scale: 0.8, duration: at(10), ease: "power2.in" }, at(PR - 10));

      // CONSISTENT. SEALED. CONVENIENT.
      PRINCIPLES.forEach((_, i) => {
        const t0 = PR + i * 42;
        reveal(`.q8-pr-${i} .q8-pr-w`, t0, 12, 3);
        tl.fromTo(q(`.q8-pr-${i} .q8-pr-rule`), { scaleX: 0 }, { scaleX: 1, duration: at(10), ease: "power2.out" }, at(t0 + 6));
        reveal(`.q8-pr-${i} .q8-pr-s`, t0 + 10, 8);
        tl.fromTo(q(`.q8-pr-${i} .q8-pr-n`), { opacity: 0 }, { opacity: 1, duration: at(8) }, at(t0 + 4));
        wipeOut(`.q8-pr-${i}`, t0 + 32, 8);
      });

      // READY WHEN YOU ARE.
      reveal(".q8-ready", READY, 14, 5);
      tl.fromTo(q(".q8-ready-rule"), { scaleX: 0 }, { scaleX: 1, duration: at(12), ease: "power2.out" }, at(READY + 14));
      tl.set({}, {}, 1);

      const range = (section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section) as Element;
      releases.push(darkSection(range, `top top-=${Math.round(18 * PACE)}%`, "bottom top+=40"));
      return () => {
        gate.kill();
        clear();
        section.classList.remove("q8-pre");
        gsap.set(q(".q8-scene, .q8-stage"), { clearProps: "opacity,clipPath,transform" });
      };
    });

    // ---------------------------------------------------------------- phones & tablets: stacked, readable
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const lines = (scope: string, start = "top 82%") => q(scope).length && gsap.fromTo(q(`${scope} .line-inner`), { yPercent: 125 }, {
        yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: q(scope)[0], start, toggleActions: "play none none reverse" },
      });
      [".q8-head", ".q8-sub", ".q8-sealed", ".q8-lock", ".q8-lock-sub", ".q8-ready"].forEach((s) => lines(s));
      PRINCIPLES.forEach((_, i) => { lines(`.q8-pr-${i} .q8-pr-w`); lines(`.q8-pr-${i} .q8-pr-s`); });
      const scrub = (trigger: string, start: string, end: string) => ({ trigger: q(trigger)[0], start, end, scrub: true });
      gsap.fromTo(q(".q8-pouch"), { yPercent: 25, scale: 0.85, rotation: -6, opacity: 0 }, { yPercent: 0, scale: 1, rotation: -2, opacity: 1, scrollTrigger: scrub(".q8-stage", "top 95%", "top 40%") });
      gsap.fromTo(q(".q8-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, scrollTrigger: scrub(".q8-stage", "top 50%", "bottom 60%") });
      gsap.fromTo(q(".q8-cond"), { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.25, scrollTrigger: scrub(".q8-conds-m", "top 85%", "bottom 70%") });
      gsap.fromTo(q(".q8-conds-fill"), { scaleY: 0 }, { scaleY: 1, scrollTrigger: scrub(".q8-conds-m", "top 80%", "bottom 55%") });
      gsap.fromTo(q(".q8-sheen"), { backgroundPosition: "160% 0" }, { backgroundPosition: "-60% 0", scrollTrigger: scrub(".q8-stage", "center 70%", "center 30%") });
      releases.push(darkSection(section, "top top+=40", "bottom top+=40"));
    });

    return () => {
      releases.forEach((r) => r());
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="sealed-for-quality" aria-labelledby="q8-heading" className="q8 text-cream">
      <div ref={handRef} className="q8-hand" aria-hidden="true" />
      <div className="q8-cream" aria-hidden="true" />
      <div className="q8-atmos" aria-hidden="true" />

      <div className="q8-content">
        {/* Headline + the retort moment */}
        <div className="q8-scene q8-s-retort">
          <h2 id="q8-heading" className="display q8-head">
            <Line>Sealed</Line>
            <Line className="text-yellow">for quality.</Line>
          </h2>
          <p className="q8-sub" data-review="technical wording to confirm">
            <Line>Advanced retort technology helps preserve</Line>
            <Line>quality inside every pouch.</Line>
          </p>

          <div className="q8-stage">
            <svg className="q8-arrows" viewBox="0 0 1000 1000" aria-hidden="true">
              <defs>
                <marker id="q8-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </marker>
              </defs>
              <circle className="q8-ring-track" cx="500" cy="520" r="330" />
              <circle className="q8-ring" cx="500" cy="520" r="330" pathLength={1} transform="rotate(-90 500 520)" />
              {/* from each condition towards the pouch */}
              <path className="q8-arrow" pathLength={1} markerEnd="url(#q8-tip)" d="M 500 95 C 500 140, 500 150, 500 178" />
              <path className="q8-arrow" pathLength={1} markerEnd="url(#q8-tip)" d="M 70 690 C 120 650, 150 620, 196 598" />
              <path className="q8-arrow" pathLength={1} markerEnd="url(#q8-tip)" d="M 930 690 C 880 650, 850 620, 804 598" />
            </svg>
            <figure className="q8-pouch">
              <div className="q8-pouch-img">
                <Image src="/images/module8/pouch.webp" alt="Micky's Makhani Sauce pouch" fill sizes="(min-width: 1024px) 26vw, 60vw" priority className="object-contain" />
                <span className="q8-sheen" aria-hidden="true" />
              </div>
            </figure>
            <ul className="q8-conds" aria-label="Retort conditions">
              {CONDITIONS.map((c) => (
                <li key={c.w} className={`q8-cond display ${c.cls}`}>{c.w}</li>
              ))}
            </ul>
            <ul className="q8-micros" aria-hidden="true">
              {MICRO.map((m, i) => (
                <li key={m} className={`q8-micro q8-micro-${i}`}>{m}</li>
              ))}
            </ul>
            <svg className="q8-down-svg" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true">
              <line className="q8-down" x1="5" y1="0" x2="5" y2="100" pathLength={1} />
            </svg>
            <p className="q8-sealed display"><span className="line-mask"><span className="line-inner">Sealed quality</span></span></p>
          </div>

          {/* phones: the conditions stacked beneath the pouch */}
          <ol className="q8-conds-m" aria-hidden="true">
            <span className="q8-conds-track" />
            <span className="q8-conds-fill" />
            {CONDITIONS.map((c) => (
              <li key={c.w} className="q8-cond display">{c.w}</li>
            ))}
          </ol>
        </div>

        {/* QUALITY, LOCKED IN. */}
        <div className="q8-scene q8-s-lock">
          <p className="display q8-lock">
            <Line>Quality,</Line>
            <Line className="text-yellow">locked in.</Line>
          </p>
          <p className="q8-lock-sub" data-review="technical wording to confirm">
            <Line>Micky&apos;s uses retort processing</Line>
            <Line>to create a convenient, sealed</Line>
            <Line>cooking base for faster</Line>
            <Line>kitchen execution.</Line>
          </p>
        </div>

        {/* CONSISTENT. SEALED. CONVENIENT. */}
        {PRINCIPLES.map((p, i) => (
          <div key={p.w} className={`q8-scene q8-pr q8-pr-${i}`}>
            <span className="q8-pr-n">{String(i + 1).padStart(2, "0")} / 03</span>
            <p className="display q8-pr-w"><Line className={i === 1 ? "text-yellow" : ""}>{p.w}</Line></p>
            <span className="q8-pr-rule" aria-hidden="true" />
            <p className="q8-pr-s"><Line>{p.s}</Line></p>
          </div>
        ))}

        {/* READY WHEN YOU ARE. */}
        <div className="q8-scene q8-s-ready">
          <p className="display q8-ready">
            <Line>Ready</Line>
            <Line className="text-yellow">when you are.</Line>
          </p>
          <span className="q8-ready-rule" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
