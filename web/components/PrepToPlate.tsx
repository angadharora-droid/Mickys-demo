"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lightSection } from "@/lib/headerTheme";
import ProcessOverview from "./ProcessOverview";
import RetortProcess from "./RetortProcess";
import { Line } from "./ScrollCopy";

const YELLOW = "#fcd34f";
const MAROON = "#6f0e13";

// Step 01: preparation words around the base. Positions are % of the photo stage.
const PREP_WORDS = [
  { w: "Chop", x: 8, y: 16 }, { w: "Blend", x: 92, y: 12 }, { w: "Cook", x: 100, y: 50 },
  { w: "Balance", x: 90, y: 88 }, { w: "Season", x: 6, y: 86 }, { w: "Reduce", x: -4, y: 50 },
];

// Desktop choreography in % of the viewport height; PACE stretches it all evenly.
const S1 = 66, S2 = 136, S3 = 236, OV = 320, FIN = 368, END = 400;
const PACE = 1.5; // 600vh of scrolling: about one screen per stage, like the Why Micky's film

export default function PrepToPlate() {
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
      section.classList.add("ptp-pre");
      const target = q(".ptp-prep-word")[0] as HTMLElement;
      const dot = q(".ptp-prep-dot")[0] as HTMLElement;
      const flip = { t: 0, dx: 0, dy: 0, s: 1, ready: false };
      const paintFlip = () => {
        if (!flip.ready) return;
        const e = flip.t;
        gsap.set(target, {
          x: flip.dx * (1 - e), y: flip.dy * (1 - e), scale: flip.s + (1 - flip.s) * e,
          color: gsap.utils.interpolate(YELLOW, MAROON, Math.min(1, e * 1.4)),
        });
        gsap.set(dot, { opacity: Math.max(0, 1 - e * 4) }); // "prep." loses its full stop as it moves
      };

      // Hand-off: when Module 6's pin ends, copy its last frame and keep PREP. in exactly the same place.
      const fill = () => {
        hand.innerHTML = "";
        const why = document.querySelector("section.why") as HTMLElement | null;
        section.classList.remove("ptp-pre");
        if (!why) { flip.ready = false; return; }
        const copy = document.createElement("div");
        copy.className = "why ptp-hand-why text-cream";
        why.querySelectorAll(":scope > .why-atmos, :scope > .why-content").forEach((n) => copy.appendChild(n.cloneNode(true)));
        copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        copy.setAttribute("inert", "");
        hand.appendChild(copy);
        const src = copy.querySelector(".why-s-smart .why-h-xl .line-mask:last-child .line-inner") as HTMLElement | null;
        const dst = target.querySelector(".ptp-prep-text") as HTMLElement;
        // measure the letters themselves (Module 6's line box is full-width with the word centred in it)
        const glyphs = (el: HTMLElement) => {
          const node = [...el.childNodes].find((n) => n.nodeType === 3 && (n.textContent ?? "").trim()) as Text;
          const r = document.createRange();
          const start = (node.textContent ?? "").search(/\S/);
          r.setStart(node, start); r.setEnd(node, start + 4);
          return r.getBoundingClientRect();
        };
        if (src) {
          (src.closest(".line-mask") as HTMLElement).style.visibility = "hidden";
          gsap.set(target, { clearProps: "transform" });
          const a = glyphs(src), b = glyphs(dst);
          flip.dx = a.left - b.left; flip.dy = a.top - b.top; flip.s = a.height / b.height;
          flip.ready = true;
        }
        paintFlip();
      };
      const clear = () => { section.classList.add("ptp-pre"); hand.innerHTML = ""; flip.ready = false; };
      const gate = ScrollTrigger.create({ trigger: section, start: "top top", onEnter: fill, onLeaveBack: clear });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: `+=${END * PACE}%`, pin: true, scrub: true, invalidateOnRefresh: true },
      });
      const reveal = (sel: string, v: number, dur = 12, stagger = 3) =>
        tl.fromTo(q(`${sel} .line-inner`), { yPercent: 125 }, { yPercent: 0, duration: at(dur), stagger: at(stagger), ease: "power3.out" }, at(v));
      const wipeOut = (sel: string, v: number, dur = 10) =>
        tl.fromTo(q(sel), { clipPath: "inset(-20% -5% -20% -5%)", y: 0 }, { clipPath: "inset(-20% -5% 125% -5%)", y: -40, duration: at(dur), ease: "power2.in", immediateRender: false }, at(v));
      gsap.set(q(".ptp-scene"), { opacity: 0 });
      const live = (sel: string, from: number, to?: number) => {
        tl.set(q(sel), { opacity: 1 }, at(from));
        if (to !== undefined) tl.set(q(sel), { opacity: 0 }, at(to));
      };
      live(".ptp-s-intro", 0, 67);
      live(".ptp-s-base", S1 - 1, S1 + 71);
      live(".ptp-s-retort", S2 - 1, S2 + 101);
      live(".ptp-s-finish", S3 - 1, S3 + 85);
      live(".ptp-s-overview", OV - 1, OV + 49);
      live(".ptp-s-final", FIN - 1);

      // 0–40: everything around PREP leaves, the dark gives way to cream, PREP moves into place.
      tl.fromTo(hand, { opacity: 1 }, { opacity: 0, duration: at(14), ease: "power1.in" }, at(2));
      tl.fromTo(q(".ptp-cream"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: at(24), ease: "power2.inOut" }, at(4));
      tl.to(flip, { t: 1, duration: at(28), ease: "power3.inOut", onUpdate: paintFlip }, at(6));
      tl.fromTo(q(".ptp-prep-band"), { scaleX: 0 }, { scaleX: 1, duration: at(8), ease: "power2.out" }, at(32));
      reveal(".ptp-from", 24, 12);
      reveal(".ptp-plate", 30, 12);
      reveal(".ptp-s-intro .ptp-support", 38, 10, 3);
      wipeOut(".ptp-s-intro", 56);

      // Step 01 · the preparation consolidates into one base
      reveal(".ptp-s-base .ptp-h", S1, 12, 4);
      tl.fromTo(q(".ptp-s-base .ptp-num"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: at(14), ease: "power3.out" }, at(S1));
      tl.fromTo(q(".ptp-base-photo"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: at(18), ease: "power3.out" }, at(S1 + 4));
      tl.fromTo(q(".ptp-base-photo img"), { scale: 1.15 }, { scale: 1, duration: at(50) }, at(S1 + 4));
      tl.fromTo(q(".ptp-prep-w"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: at(10), stagger: at(2), ease: "power2.out" }, at(S1 + 8));
      tl.to(q(".ptp-prep-w"), {
        x: (_: number, el: HTMLElement) => +(el.dataset.dx ?? 0) * (el.parentElement?.clientWidth ?? 0) / 100,
        y: (_: number, el: HTMLElement) => +(el.dataset.dy ?? 0) * (el.parentElement?.clientHeight ?? 0) / 100,
        scale: 0.2, opacity: 0, duration: at(14), stagger: at(1.5), ease: "power3.in",
      }, at(S1 + 34));
      reveal(".ptp-base-label", S1 + 48, 8);
      reveal(".ptp-s-base .ptp-support", S1 + 24, 10, 3);
      wipeOut(".ptp-s-base", S1 + 60);

      // Step 02 · retort-sealed quality
      reveal(".ptp-s-retort .ptp-h", S2, 12, 4);
      tl.fromTo(q(".ptp-s-retort .ptp-num"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: at(14), ease: "power3.out" }, at(S2));
      tl.fromTo(q(".ptp-chamber-shell"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(16), ease: "power2.inOut" }, at(S2 + 6));
      tl.fromTo(q(".ptp-step"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: at(6), stagger: at(3), ease: "power2.out" }, at(S2 + 8));
      tl.fromTo(q(".ptp-steps-fill"), { scaleY: 0 }, { scaleY: 1, duration: at(64), ease: "none" }, at(S2 + 12));
      tl.fromTo(q(".ptp-pouch"), { xPercent: -50, yPercent: -200, opacity: 0 }, { xPercent: -50, yPercent: -50, opacity: 1, duration: at(18), ease: "power3.out" }, at(S2 + 14));
      tl.fromTo(q(".ptp-seal"), { scaleX: 0 }, { scaleX: 1, duration: at(6), ease: "power2.out" }, at(S2 + 32));
      tl.fromTo(q(".ptp-cond"), { opacity: 0 }, { opacity: 1, duration: at(6), stagger: at(3) }, at(S2 + 38));
      tl.fromTo(q(".ptp-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(30), ease: "power1.inOut" }, at(S2 + 44));
      tl.fromTo(q(".ptp-chamber"), { "--glow": 0 }, { "--glow": 1, duration: at(30), ease: "power1.inOut" }, at(S2 + 44));
      tl.to(q(".ptp-cond"), { opacity: 0.35, duration: at(6) }, at(S2 + 74));
      reveal(".ptp-sealed", S2 + 76, 10);
      reveal(".ptp-s-retort .ptp-support", S2 + 58, 10, 3);
      wipeOut(".ptp-s-retort", S2 + 90);

      // Step 03 · fast final execution: the three verbs make way for the dish
      tl.fromTo(q(".ptp-s-finish .ptp-num"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: at(14), ease: "power3.out" }, at(S3));
      reveal(".ptp-s-finish .ptp-kicker-h", S3, 10, 3);
      reveal(".ptp-verbs", S3 + 4, 14, 4);
      tl.to(q(".ptp-verbs"), {
        x: () => -(q(".ptp-verbs")[0] as HTMLElement).getBoundingClientRect().left + window.innerWidth * 0.04,
        y: () => window.innerHeight * 0.26, scale: 0.24, transformOrigin: "0% 50%", duration: at(16), ease: "power3.inOut",
      }, at(S3 + 30));
      tl.fromTo(q(".ptp-dish"), { clipPath: "inset(50% 50% 50% 50% round 999px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 6px 6px)", duration: at(22), ease: "power3.out" }, at(S3 + 34));
      tl.fromTo(q(".ptp-dish img"), { scale: 1.18 }, { scale: 1, duration: at(50) }, at(S3 + 34));
      reveal(".ptp-your", S3 + 48, 12, 4);
      reveal(".ptp-s-finish .ptp-support", S3 + 56, 10, 3);
      wipeOut(".ptp-s-finish", S3 + 76);

      // All three steps, one line
      tl.fromTo(q(".ptp-ov-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(26), ease: "power2.inOut" }, at(OV + 4));
      tl.fromTo(q(".ptp-ov-dot"), { scale: 0 }, { scale: 1, duration: at(4), stagger: at(9), ease: "back.out(2)" }, at(OV + 4));
      tl.fromTo(q(".ptp-ov-num"), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: at(8), stagger: at(9), ease: "power3.out" }, at(OV + 6));
      reveal(".ptp-ov-item", OV + 8, 10, 3);
      reveal(".ptp-s-overview .ptp-ov-h", OV, 10, 3);
      wipeOut(".ptp-s-overview", OV + 40);

      // PREP, SIMPLIFIED. COOKING, STILL YOURS.
      reveal(".ptp-final-a", FIN, 14, 5);
      reveal(".ptp-final-b", FIN + 12, 14, 5);
      tl.fromTo(q(".ptp-final-band"), { scaleX: 0 }, { scaleX: 1, duration: at(8), ease: "power2.out" }, at(FIN + 24));
      tl.set({}, {}, 1);

      const range = (section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section) as Element;
      releases.push(lightSection(range, `top top-=${Math.round(22 * PACE)}%`, "bottom top+=40")); // once the cream has arrived
      return () => {
        gate.kill();
        clear();
        section.classList.remove("ptp-pre");
        gsap.set(q(".ptp-scene"), { clearProps: "opacity,clipPath,transform" });
      };
    });

    // ---------------------------------------------------------------- phones & tablets: one step per screen
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const lines = (scope: string, start = "top 82%") => q(scope).length && gsap.fromTo(q(`${scope} .line-inner`), { yPercent: 125 }, {
        yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: q(scope)[0], start, toggleActions: "play none none reverse" },
      });
      [".ptp-from", ".ptp-plate", ".ptp-s-intro .ptp-support", ".ptp-s-base .ptp-h", ".ptp-s-base .ptp-support", ".ptp-s-retort .ptp-h",
        ".ptp-s-retort .ptp-support", ".ptp-s-finish .ptp-kicker-h", ".ptp-verbs", ".ptp-your", ".ptp-s-finish .ptp-support",
        ".ptp-s-overview .ptp-ov-h", ".ptp-ov-item", ".ptp-final-a", ".ptp-final-b"].forEach((s) => lines(s));
      gsap.fromTo(q(".ptp-prep-word .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: q(".ptp-s-intro")[0], start: "top 70%", toggleActions: "play none none reverse" } });
      const scrub = (trigger: string, start: string, end: string) => ({ trigger: q(trigger)[0], start, end, scrub: true });
      gsap.fromTo(q(".ptp-prep-w"), { x: 0, y: 0, scale: 1, opacity: 1 }, {
        x: (_: number, el: HTMLElement) => +(el.dataset.dx ?? 0) * (el.parentElement?.clientWidth ?? 0) / 100,
        y: (_: number, el: HTMLElement) => +(el.dataset.dy ?? 0) * (el.parentElement?.clientHeight ?? 0) / 100,
        scale: 0.2, opacity: 0, stagger: 0.06, ease: "power2.in", scrollTrigger: scrub(".ptp-base-stage", "top 40%", "bottom 55%"),
      });
      lines(".ptp-base-label", "center 45%");
      gsap.fromTo(q(".ptp-pouch"), { xPercent: -50, yPercent: -110, opacity: 0 }, { xPercent: -50, yPercent: -50, opacity: 1, scrollTrigger: scrub(".ptp-chamber", "top 85%", "top 45%") });
      gsap.fromTo(q(".ptp-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, scrollTrigger: scrub(".ptp-chamber", "top 45%", "bottom 55%") });
      gsap.fromTo(q(".ptp-steps-fill"), { scaleY: 0 }, { scaleY: 1, scrollTrigger: scrub(".ptp-steps", "top 70%", "bottom 45%") });
      lines(".ptp-sealed", "top 70%");
      gsap.fromTo(q(".ptp-dish"), { clipPath: "inset(50% 50% 50% 50% round 999px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 6px 6px)", scrollTrigger: scrub(".ptp-dish", "top 90%", "center 60%") });
      gsap.fromTo(q(".ptp-ov-vline"), { scaleY: 0 }, { scaleY: 1, scrollTrigger: scrub(".ptp-overview", "top 80%", "bottom 55%") });
      releases.push(lightSection(section, "top top+=40", "bottom top+=40"));
    });

    return () => {
      releases.forEach((r) => r());
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="prep-to-plate" aria-labelledby="ptp-heading" className="ptp">
      <div ref={handRef} className="ptp-hand" aria-hidden="true" />
      <div className="ptp-cream" aria-hidden="true" />

      <div className="ptp-content">
        {/* Intro: PREP carries over from "A smarter way to prep." */}
        <div className="ptp-scene ptp-s-intro">
          <h2 id="ptp-heading" className="display ptp-intro-h" aria-label="From prep to plate.">
            <Line className="ptp-from">From</Line>
            <span className="ptp-prep-word">
              <span aria-hidden="true" className="ptp-prep-band" />
              <span className="line-mask">
                <span className="line-inner">
                  <span className="ptp-prep-text">Prep</span>
                  <span className="ptp-prep-dot" aria-hidden="true">.</span>
                </span>
              </span>
            </span>
            <Line className="ptp-plate">To plate.</Line>
          </h2>
          <p className="ptp-support">
            <Line>Three steps.</Line>
            <Line>A lot less kitchen work.</Line>
          </p>
        </div>

        {/* 01 · Chef-crafted base */}
        <div className="ptp-scene ptp-s-base">
          <span className="ptp-num display" aria-hidden="true">01</span>
          <h3 className="display ptp-h">
            <Line>Chef-</Line>
            <Line>crafted</Line>
            <Line className="ptp-accent">base.</Line>
          </h3>
          <p className="ptp-support">
            <Line>Micky&apos;s takes care of the time-consuming</Line>
            <Line>foundation of the dish.</Line>
          </p>
          <div className="ptp-base-stage">
            <figure className="ptp-base-photo">
              <Image src="/images/module7/ingredients.webp" alt="A slow-cooked onion and tomato base" fill sizes="(min-width: 1024px) 34vw, 70vw" priority className="object-cover" />
            </figure>
            <ul className="ptp-prep-words" aria-label="What goes into the base">
              {PREP_WORDS.map((p) => (
                <li key={p.w} className="ptp-prep-w display" style={{ left: `${p.x}%`, top: `${p.y}%` }} data-dx={50 - p.x} data-dy={50 - p.y}>
                  {p.w}
                </li>
              ))}
            </ul>
            <p className="ptp-base-label display"><span className="line-mask"><span className="line-inner">Chef-crafted base</span></span></p>
          </div>
        </div>

        {/* 02 · Retort-sealed quality */}
        <div className="ptp-scene ptp-s-retort">
          <span className="ptp-num display" aria-hidden="true">02</span>
          <h3 className="display ptp-h">
            <Line>Retort-</Line>
            <Line>sealed</Line>
            <Line className="ptp-accent">quality.</Line>
          </h3>
          <RetortProcess />
          <p className="ptp-support" data-review="technical wording to confirm">
            <Line>Prepared food is sealed in the pouch and processed</Line>
            <Line>using retort technology for dependable quality</Line>
            <Line>and convenient storage.</Line>
          </p>
        </div>

        {/* 03 · Fast final execution */}
        <div className="ptp-scene ptp-s-finish">
          <span className="ptp-num display" aria-hidden="true">03</span>
          <h3 className="display ptp-kicker-h">
            <Line>Fast final execution.</Line>
          </h3>
          <p className="display ptp-verbs" aria-label="Open. Heat. Finish.">
            <Line>Open.</Line>
            <Line>Heat.</Line>
            <Line className="ptp-accent">Finish.</Line>
          </p>
          <figure className="ptp-dish">
            <Image src="/images/module7/dish-finish.webp" alt="Paneer makhani, finished with cream and coriander" fill sizes="(min-width: 1024px) 34vw, 80vw" priority className="object-cover" />
          </figure>
          <p className="display ptp-your">
            <Line>Your</Line>
            <Line className="ptp-accent">finish.</Line>
          </p>
          <p className="ptp-support">
            <Line>Micky&apos;s does the foundation.</Line>
            <Line>You control the final dish.</Line>
          </p>
        </div>

        {/* All three together */}
        <div className="ptp-scene ptp-s-overview">
          <p className="display ptp-ov-h"><Line>Three steps.</Line></p>
          <ProcessOverview />
        </div>

        {/* Final statement */}
        <div className="ptp-scene ptp-s-final">
          <p className="display ptp-final-a">
            <Line>Prep,</Line>
            <Line>simplified.</Line>
          </p>
          <p className="display ptp-final-b">
            <Line>Cooking,</Line>
            <span className="line-mask">
              <span className="line-inner">
                <span className="ptp-final-yours">
                  <span aria-hidden="true" className="ptp-final-band" />
                  <span className="relative">still yours.</span>
                </span>
              </span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
