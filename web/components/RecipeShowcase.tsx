"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RECIPES, type Recipe } from "@/data/recipes";
import { lightSection } from "@/lib/headerTheme";
import { scrollToY } from "@/lib/smoothScroll";
import RecipeModal from "./RecipeModal";
import RecipeSlide from "./RecipeSlide";
import { Line } from "./ScrollCopy";

// Desktop choreography in % of the viewport height (PACE stretches it evenly).
const HOLD = 10; // the opening frame stays put for a moment
const GAL = 26; // first dish's name has arrived
const STEP = 30; // per dish: ~16 hold + 14 move
const MOVE = 14;
const LAST = GAL + (RECIPES.length - 1) * STEP; // 176
const FIN = LAST + 28; // 204
const END = FIN + 44; // 248
const PACE = 4;
// where the film comes to rest: the opening, each dish fully shown, the final frame
const REST = [0, ...RECIPES.map((_, i) => GAL + i * STEP + 10), END];
// every photo is a full-viewport cover image seen through this window
const FRAME = "inset(12% 37% 10% 4% round 10px)";
const FRAME_IN = "inset(12% 37% 10% 40% round 10px)";
const COLLAGE = [1, 3, 0, 4, 5];

export default function RecipeShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const jumpRef = useRef<(i: number) => void>(() => {});
  const [open, setOpen] = useState<Recipe | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(section);
    const at = (v: number) => v / END;
    const mm = gsap.matchMedia();
    const releases: (() => void)[] = [];
    const n = RECIPES.length;
    const setActive = (i: number) => q(".rs-dot").forEach((d, k) => d.classList.toggle("is-active", k === i));

    // the opening frame, played once on load
    const opening = (desktop: boolean) => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
      if (desktop) {
        tl.fromTo(q(".rs-slide-0 .rs-img"), { clipPath: "inset(50% 50% 50% 50% round 10px)" }, { clipPath: FRAME, duration: 1.5, ease: "expo.inOut" }, 0);
        tl.fromTo(q(".rs-slide-0 .rs-img img"), { scale: 1.25 }, { scale: 1.05, duration: 2.2, ease: "power2.out" }, 0);
        tl.fromTo(q(".rs-slide-0 .rs-pouch"), { yPercent: 40, opacity: 0, rotation: -9 }, { yPercent: 0, opacity: 1, rotation: -4, duration: 1.1 }, 1.1);
      }
      const d = desktop ? 0.7 : 0;
      tl.fromTo(q(".rs-eyebrow"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, d);
      tl.fromTo(q(".rs-q .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 1, stagger: 0.12 }, d + 0.1);
      tl.fromTo(q(".rs-q-sub .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 0.8, stagger: 0.08 }, d + 0.45);
      tl.fromTo(q(".rs-dot"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: "back.out(2)" }, d + 0.65);
      tl.fromTo(q(".rs-cue"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, d + 1.1);
      return tl;
    };

    // ---------------------------------------------------------------- desktop: one pinned film
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const tints = RECIPES.map((r) => r.tint);
      const bg = { v: 0 };
      const paintBg = () => {
        const x = Math.min(Math.max(bg.v, 0), n - 1), lo = Math.floor(x);
        section.style.setProperty("--rs-tint", gsap.utils.interpolate(tints[lo], tints[Math.min(lo + 1, n - 1)], x - lo));
      };
      paintBg();
      const intro = opening(true);

      let dir = 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, start: "top top", end: `+=${END * PACE}%`, pin: true, scrub: true, invalidateOnRefresh: true,
          onUpdate: (self) => {
            dir = self.direction;
            const u = self.progress * END; // the active dot changes halfway through each move
            setActive(Math.max(0, Math.min(n - 1, Math.floor((u - GAL + MOVE / 2 + 4) / STEP))));
          },
        },
      });
      const yAt = (u: number) => { const st = tl.scrollTrigger!; return st.start + (u / END) * (st.end - st.start); };
      // a dot jumps straight to that dish's resting point
      jumpRef.current = (i) => scrollToY(yAt(REST[i + 1]), 1.2);
      // stops: when the scroll settles between two rests, glide on to the next one in the
      // direction of travel, so every dish holds still long enough to be seen
      const settle = () => {
        const st = tl.scrollTrigger;
        if (!st || document.querySelector(".recipe-modal[open]")) return;
        const y = window.scrollY;
        if (y < st.start - 2 || y > st.end + 2) return;
        const u = ((y - st.start) / (st.end - st.start)) * END;
        const target = dir > 0 ? REST.find((r) => r >= u - 3) ?? END : [...REST].reverse().find((r) => r <= u + 3) ?? 0;
        if (Math.abs(yAt(target) - y) > 4) scrollToY(yAt(target), 1);
      };
      ScrollTrigger.addEventListener("scrollEnd", settle);
      const reveal = (sel: string, v: number, dur = 12, stagger = 3) =>
        tl.fromTo(q(`${sel} .line-inner`), { yPercent: 125 }, { yPercent: 0, duration: at(dur), stagger: at(stagger), ease: "power3.out" }, at(v));
      const fadeUp = (sel: string, v: number, dur = 7) =>
        tl.fromTo(q(sel), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: at(dur), ease: "power2.out" }, at(v));

      // 1 · the question lifts away, the first dish takes its column
      tl.to(q(".rs-intro"), { yPercent: -14, opacity: 0, duration: at(10), ease: "power2.in" }, at(HOLD));

      // 2 · the gallery: vertical scroll drives the track sideways, one dish at a time
      RECIPES.forEach((_, i) => {
        const arrive = GAL + i * STEP;
        const s = `.rs-slide-${i}`;
        if (i > 0) {
          const t = at(arrive - MOVE - 4);
          tl.to(q(".rs-track"), { xPercent: -(100 / n) * i, duration: at(MOVE), ease: "power2.inOut" }, t);
          tl.to(bg, { v: i, duration: at(MOVE), ease: "power1.inOut", onUpdate: paintBg }, t);
          tl.fromTo(q(`${s} .rs-img`), { clipPath: FRAME_IN }, { clipPath: FRAME, duration: at(MOVE), ease: "power2.out" }, t);
          tl.fromTo(q(`${s} .rs-img img`), { scale: 1.06, xPercent: 5 }, { scale: 1, xPercent: -2, duration: at(STEP + MOVE), ease: "none" }, t);
        } else {
          // (the opening animation owns this photo until the first scroll)
          tl.fromTo(q(`${s} .rs-img img`), { scale: 1.05, xPercent: 0 }, { scale: 1, xPercent: -2, duration: at(GAL + STEP - 4), ease: "none", immediateRender: false }, 0);
        }
        if (i > 0) tl.fromTo(q(`${s} .rs-pouch`), { yPercent: 40, opacity: 0, rotation: -9 }, { yPercent: 0, opacity: 1, rotation: -4, duration: at(10), ease: "power3.out" }, at(arrive - 8));
        reveal(`${s} .rs-made-t`, arrive - 6, 8, 2);
        reveal(`${s} .rs-name`, arrive - 4, 10, 3);
        fadeUp(`${s} .rs-count, ${s} .rs-view`, arrive, 6);
      });

      // 3 · final: several dishes together
      tl.to(q(".rs-track, .rs-index"), { yPercent: -6, opacity: 0, duration: at(10), ease: "power2.in" }, at(FIN - 8));
      const toCream = { p: 0 };
      tl.to(toCream, { p: 1, duration: at(10), onUpdate: () => section.style.setProperty("--rs-tint", gsap.utils.interpolate(tints[n - 1], "#f6e9d2", toCream.p)) }, at(FIN - 8));
      tl.fromTo(q(".rs-s-final"), { autoAlpha: 0 }, { autoAlpha: 1, duration: at(1) }, at(FIN - 1));
      tl.fromTo(q(".rs-col"), { clipPath: "inset(100% 0% 0% 0% round 10px)" }, { clipPath: "inset(0% 0% 0% 0% round 10px)", duration: at(14), stagger: at(2.5), ease: "power3.out" }, at(FIN));
      tl.fromTo(q(".rs-col img"), { scale: 1.14 }, { scale: 1, duration: at(34), stagger: at(2.5) }, at(FIN));
      reveal(".rs-final-h", FIN + 8, 14, 5);
      fadeUp(".rs-all", FIN + 22, 8);
      tl.set({}, {}, 1);

      const range = (section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section) as Element;
      releases.push(lightSection(range, "top top+=100", "bottom top+=40"));
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", settle);
        intro.kill();
        section.style.removeProperty("--rs-tint");
      };
    });

    // ---------------------------------------------------------------- phones & tablets: one dish at a time, vertically
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const intro = opening(false);
      const slideY = (el: Element) => el.getBoundingClientRect().top + window.scrollY - 64;
      jumpRef.current = (i) => {
        const el = q(`.rs-slide-${i}`)[0];
        if (el) scrollToY(slideY(el), 1.2);
      };
      // gentle stops: a dish that is nearly lined up settles into place
      const settle = () => {
        if (document.querySelector(".recipe-modal[open]")) return;
        const y = window.scrollY;
        const near = q(".rs-slide").map(slideY).sort((a, b) => Math.abs(a - y) - Math.abs(b - y))[0];
        if (near !== undefined && Math.abs(near - y) > 4 && Math.abs(near - y) < window.innerHeight * 0.22) scrollToY(near, 0.7);
      };
      ScrollTrigger.addEventListener("scrollEnd", settle);
      q(".rs-made-t, .rs-name, .rs-final-h").forEach((el) => gsap.fromTo((el as HTMLElement).querySelectorAll(".line-inner"), { yPercent: 125 }, {
        yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: el as HTMLElement, start: "top 88%", toggleActions: "play none none reverse" },
      }));
      q(".rs-img, .rs-col").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(10% 7% 10% 7% round 10px)" }, { clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "power2.out", scrollTrigger: { trigger: el as HTMLElement, start: "top 95%", end: "top 45%", scrub: true } });
        const img = (el as HTMLElement).querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el as HTMLElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      q(".rs-pouch").forEach((el) => gsap.fromTo(el, { yPercent: 30, rotation: -9 }, { yPercent: 0, rotation: -4, ease: "none", scrollTrigger: { trigger: el as HTMLElement, start: "top bottom", end: "top 55%", scrub: true } }));
      releases.push(lightSection(section, "top top+=100", "bottom top+=40"));
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", settle);
        intro.kill();
      };
    });

    // reduced motion: everything is static, the dots still jump
    mm.add("(prefers-reduced-motion: reduce)", () => {
      jumpRef.current = (i) => q(`.rs-slide-${i}`)[0]?.scrollIntoView({ block: "start" });
      releases.push(lightSection(section, "top top+=100", "bottom top+=40"));
    });

    return () => {
      releases.forEach((r) => r());
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="recipes" aria-labelledby="rs-heading" className="rs">
      <div className="rs-cream" aria-hidden="true" />

      <div className="rs-content">
        <div className="rs-intro">
          <p className="rs-eyebrow">Recipes</p>
          <h1 id="rs-heading" className="display rs-q">
            <Line>What will</Line>
            <Line>you make?</Line>
          </h1>
          <p className="rs-q-sub">
            <Line>One Micky&apos;s base.</Line>
            <Line>Plenty of ways to make it yours.</Line>
          </p>
          <p className="rs-cue" aria-hidden="true"><span className="rs-cue-line" />Scroll to explore</p>
        </div>

        <div className="rs-gallery">
          <div className="rs-track" style={{ ["--n" as string]: RECIPES.length }}>
            {RECIPES.map((r, i) => (
              <RecipeSlide key={r.slug} recipe={r} index={i} total={RECIPES.length} onView={setOpen} />
            ))}
          </div>
        </div>

        {/* every dish at a glance; on desktop it also marks the gallery's position */}
        <nav className="rs-index" aria-label="Jump to a recipe">
          {RECIPES.map((r, i) => (
            <button key={r.slug} type="button" className={`rs-dot${i === 0 ? " is-active" : ""}`} onClick={() => jumpRef.current(i)} aria-label={`Go to ${r.name}`} title={r.name}>
              <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </nav>

        <div className="rs-s-final">
          <div className="rs-cols" aria-hidden="true">
            {COLLAGE.map((k, i) => (
              <figure key={k} className={`rs-col rs-col-${i}`}>
                <Image src={RECIPES[k].image} alt="" fill sizes="(min-width: 1024px) 18vw, 50vw" className="object-cover" />
              </figure>
            ))}
          </div>
          <p className="display rs-final-h">
            <Line>Your base.</Line>
            <Line className="rs-accent">Your dish.</Line>
          </p>
          <Link href="/shop" className="rs-all">
            Shop the bases <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <RecipeModal recipe={open} onClose={() => setOpen(null)} />
    </section>
  );
}
