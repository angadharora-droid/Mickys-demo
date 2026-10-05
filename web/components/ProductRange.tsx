"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES, productsIn, type CategoryId } from "@/data/products";
import { lightSection } from "@/lib/headerTheme";
import { scrollToY } from "@/lib/smoothScroll";
import CategorySelector from "./CategorySelector";
import ProductInfo from "./ProductInfo";
import ProductStage, { LINEUP_SPAN, poseFor, type Layout } from "./ProductStage";
import { Line } from "./ScrollCopy";

const CREAM = "#f6e9d2";

// Stable module-level data: the scroll setup must not re-run on every render.
// only categories that currently have products (the range can shrink without breaking the film)
const CATS = CATEGORIES.filter((c) => c.available && productsIn(c.id).length > 0).map((c) => ({ ...c, products: productsIn(c.id) }));
const ALL = CATS.flatMap((c, ci) => c.products.map((p, i) => ({ product: p, cat: ci, index: i })));
const FIRST = CATS.map((_, ci) => ALL.findIndex((e) => e.cat === ci)); // global index of each category's first pack

// Desktop timeline, in % of the viewport height (one product = 64vh: 32vh hold + 32vh slide).
// Gravies keeps exactly its approved timing; each later category repeats the same rhythm.
const HOLD = 40; // hold on a category's first product before the first slide
const SLIDE = 32;
const STEP = 64;
const LINEUP = 40;
const GAP = 16; // after a lineup, before the next category starts

type CatTiming = { packsIn: [number, number]; moves: [number, number][]; lineup: [number, number]; settle: number };

function buildTimeline() {
  const cats: CatTiming[] = [];
  const transitions: { start: number }[] = [];
  let t = 52; // gravies: packs start entering at 52 (approved)
  CATS.forEach((c, ci) => {
    const inDur = ci === 0 ? 52 : 48;
    const packsIn: [number, number] = [t, t + inDur];
    const firstMove = packsIn[1] + HOLD;
    const moves = c.products.slice(1).map((_, k) => [firstMove + k * STEP, firstMove + k * STEP + SLIDE] as [number, number]);
    const lastEnd = moves.length ? moves[moves.length - 1][1] : packsIn[1];
    const lineup: [number, number] = [lastEnd + HOLD, lastEnd + HOLD + LINEUP];
    cats.push({ packsIn, moves, lineup, settle: packsIn[1] + HOLD / 2 });
    if (ci < CATS.length - 1) {
      const start = lineup[1] + GAP;
      transitions.push({ start });
      t = start + 16; // next category's packs begin entering while the old lineup leaves
    } else {
      t = lineup[1] + GAP;
    }
  });
  return { cats, transitions, end: t };
}
const TL = buildTimeline(); // gravies: packsIn 52–104, moves 144/208, lineup 280–320 (as approved)
const PIN_LENGTH = `+=${TL.end}%`;
const at = (v: number) => v / TL.end; // → timeline fraction

type Mode = "scroll" | "swipe";
type Sel = { cat: number; idx: number };

export default function ProductRange() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel>({ cat: 0, idx: 0 });
  const [mode, setMode] = useState<Mode>("scroll");
  const goRef = useRef<(to: number) => void>(() => {});
  const selectRef = useRef<(cat: number) => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(section);
    const packs = q(".range-pack") as HTMLElement[];
    const N = ALL.length;
    const C = CATS.length;
    const tints = ALL.map((e) => e.product.tint);
    const firstTint = (c: number) => CATS[c].products[0].tint;
    const lastTint = (c: number) => CATS[c].products[CATS[c].products.length - 1].tint;

    // Desktop state (per category) and swipe state (one continuous line).
    const fresh = () => CATS.map(() => ({ active: -3, lineup: 0, exit: 0 }));
    const d = { cats: fresh(), cat: 0 };
    const s = { g: 0 };
    let current: Mode = "scroll";
    let layout: Layout = "desktop";
    let shown = "0:0";

    const within = (c: number, a: number) => {
      const t = CATS[c].products.map((p) => p.tint);
      if (c === 0 && a < 0) return a <= -1 ? CREAM : gsap.utils.interpolate(CREAM, t[0], a + 1);
      const x = Math.min(Math.max(a, 0), t.length - 1);
      const lo = Math.floor(x);
      return gsap.utils.interpolate(t[lo], t[Math.min(lo + 1, t.length - 1)], x - lo);
    };
    const publish = (cat: number, idx: number) => {
      const key = `${cat}:${idx}`;
      if (key !== shown) { shown = key; setSel({ cat, idx }); }
    };

    // Lineup size per category: as large as approved (0.66) but never overlapping or off-screen.
    const lineupScale = (c: number, w: number) => {
      const idx = ALL.map((e, gi) => (e.cat === c ? gi : -1)).filter((gi) => gi >= 0);
      const widest = Math.max(...idx.map((gi) => packs[gi].offsetWidth));
      const n = idx.length;
      const spacing = n > 1 ? ((LINEUP_SPAN[1] - LINEUP_SPAN[0]) * w) / (n - 1) : w;
      const edge = (1 - LINEUP_SPAN[1]) * w - 16; // room right of the last pack's centre
      return Math.min(0.66, (0.92 * spacing) / widest, (2 * edge) / widest);
    };

    const renderScroll = () => {
      const w = stage.clientWidth;
      const cur = Math.min(Math.round(d.cat), C - 1);
      ALL.forEach((e, gi) => {
        const el = packs[gi];
        const c = e.cat;
        const k = d.cats[c];
        const p = poseFor(e.index, k.active, k.lineup, layout, CATS[c].products.length, lineupScale(c, w));
        const ex = k.exit;
        gsap.set(el, {
          x: (p.x - 0.5 * ex) * w, y: p.y * el.offsetHeight, xPercent: -50, yPercent: -50,
          scale: p.s * (1 - 0.12 * ex), rotation: p.r - 4 * ex, opacity: p.o * (1 - ex),
          zIndex: (c === cur ? 20 : 0) + 10 - Math.round(Math.abs(e.index - k.active)),
        });
      });
      const c0 = Math.min(Math.floor(d.cat), C - 1);
      const t = d.cat - c0;
      const bg = t > 0.001 && c0 < C - 1
        ? gsap.utils.interpolate(lastTint(c0), firstTint(c0 + 1), t)
        : within(c0, d.cats[c0].active);
      section.style.setProperty("--range-bg", bg);
      const n = CATS[cur].products.length;
      publish(cur, Math.min(Math.max(Math.round(d.cats[cur].active), 0), n - 1));
    };

    const renderSwipe = () => {
      const w = stage.clientWidth;
      ALL.forEach((e, gi) => {
        const el = packs[gi];
        const p = poseFor(gi, s.g, 0, layout, N);
        gsap.set(el, {
          x: p.x * w, y: p.y * el.offsetHeight, xPercent: -50, yPercent: -50,
          scale: p.s, rotation: p.r, opacity: p.o, zIndex: 10 - Math.round(Math.abs(gi - s.g)),
        });
      });
      const x = Math.min(Math.max(s.g, 0), N - 1);
      const lo = Math.floor(x);
      section.style.setProperty("--range-bg", gsap.utils.interpolate(tints[lo], tints[Math.min(lo + 1, N - 1)], x - lo));
      const e = ALL[Math.min(Math.max(Math.round(s.g), 0), N - 1)];
      publish(e.cat, e.index);
    };
    const render = () => (current === "scroll" ? renderScroll() : renderSwipe());
    const ro = new ResizeObserver(render);
    ro.observe(stage);

    // Long category names are sized to fit beside the packs: measure each label's width in em.
    const measure = () => {
      q(".range-cat").forEach((b: Element) => {
        const el = b as HTMLElement;
        const inner = el.querySelector(".line-inner") as HTMLElement | null;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (inner && fs) el.style.setProperty("--cat-em", String(inner.offsetWidth / fs));
      });
    };
    document.fonts?.ready.then(measure);
    measure();

    const mm = gsap.matchMedia();

    // Desktop: vertical scroll moves sideways through the range, category by category.
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      setMode("scroll");
      current = "scroll";
      layout = "desktop";
      d.cats = fresh(); d.cat = 0;
      render();
      // Headline rises while the section scrolls in over the end of Module 4.
      gsap.fromTo(q(".range-headline .line-inner"), { yPercent: 125 }, {
        yPercent: 0, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: 0.5 },
      });
      gsap.fromTo(q(".range-lede .line-inner"), { yPercent: 125 }, {
        yPercent: 0, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 45%", end: "top 5%", scrub: 0.5 },
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: render,
        scrollTrigger: { trigger: section, start: "top top", end: PIN_LENGTH, pin: true, scrub: 0.5, invalidateOnRefresh: true },
      });
      // Exit animates the container (not the lines), so it never fights the scroll-in reveal above.
      tl.fromTo(q(".range-head"), { clipPath: "inset(0% 0% -20% 0%)", y: 0 }, { clipPath: "inset(0% 0% 120% 0%)", y: -48, duration: at(24), ease: "power2.in" }, at(40));
      tl.fromTo(q(".range-categories .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: at(28), stagger: at(8), ease: "power3.out" }, at(52));
      tl.fromTo(q(".range-info-wrap"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: at(20), ease: "power2.out" }, at(88));

      TL.cats.forEach((ct, ci) => {
        tl.to(d.cats[ci], { active: 0, duration: at(ct.packsIn[1] - ct.packsIn[0]), ease: "power2.out" }, at(ct.packsIn[0]));
        ct.moves.forEach(([a, b], k) => tl.to(d.cats[ci], { active: k + 1, duration: at(b - a), ease: "power2.inOut" }, at(a)));
        tl.to(d.cats[ci], { lineup: 1, duration: at(ct.lineup[1] - ct.lineup[0]), ease: "power2.inOut" }, at(ct.lineup[0]));
      });
      TL.transitions.forEach(({ start }, ci) => {
        // old lineup slides away, title + background move to the next category, details step aside
        tl.to(d.cats[ci], { exit: 1, duration: at(40), ease: "power2.in" }, at(start));
        tl.to(d, { cat: ci + 1, duration: at(32), ease: "power1.inOut" }, at(start + 8));
        tl.to(q(".range-info-wrap"), { autoAlpha: 0, y: -16, duration: at(16), ease: "power2.in" }, at(start));
        tl.fromTo(q(".range-info-wrap"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: at(20), ease: "power2.out", immediateRender: false }, at(start + 44));
      });
      tl.set({}, {}, 1);

      // Category names: move the page to that category's first product.
      selectRef.current = (cat: number) => {
        const st = tl.scrollTrigger;
        if (!st) return;
        const v = TL.cats[cat].settle;
        scrollToY(st.start + (st.end - st.start) * at(v), 1.6);
      };
    });

    // Phones / tablets (and reduced motion everywhere): one swipe line across all categories.
    mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
      setMode("swipe");
      current = "swipe";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      layout = window.innerWidth >= 1024 ? "desktop" : "mobile";
      s.g = 0;
      render();
      let tween: gsap.core.Tween | null = null;
      const go = (to: number) => {
        const target = Math.min(Math.max(Math.round(to), 0), N - 1);
        const far = Math.abs(target - s.g) > 1.5;
        tween?.kill();
        tween = gsap.to(s, { g: target, duration: reduce ? 0 : far ? 0.9 : 0.6, ease: "power3.out", onUpdate: render });
      };
      goRef.current = go;
      selectRef.current = (cat: number) => go(FIRST[cat]);

      // Horizontal drag follows the finger, then settles on the nearest pack.
      let startX = 0, startY = 0, startG = 0, dragging = false, decided = false;
      const onDown = (e: PointerEvent) => { startX = e.clientX; startY = e.clientY; startG = s.g; dragging = true; decided = false; tween?.kill(); };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (!decided) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          decided = true;
          if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // vertical: let the page scroll
        }
        s.g = Math.min(Math.max(startG - dx / (stage.clientWidth * 0.75), -0.35), N - 0.65);
        render();
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        const dx = e.clientX - startX;
        go(Math.abs(dx) > 40 ? startG + (dx < 0 ? 1 : -1) : Math.round(s.g));
      };
      stage.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      const reveals = !reduce
        ? [".range-headline", ".range-lede", ".range-categories"].map((sel) =>
            gsap.fromTo(q(`${sel} .line-inner`), { yPercent: 125 }, {
              yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
              scrollTrigger: { trigger: q(sel)[0], start: "top 88%", toggleActions: "play none none reverse" },
            }))
        : [];
      return () => {
        tween?.kill();
        reveals.forEach((r) => r.kill());
        stage.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    });

    const range = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
    const releaseHeader = lightSection(range, "top top+=40", "bottom top+=40");

    return () => {
      releaseHeader();
      ro.disconnect();
      mm.revert();
    };
  }, []);

  const cat = CATS[sel.cat];
  const product = cat.products[sel.idx];
  const g = FIRST[sel.cat] + sel.idx;

  return (
    <section
      ref={sectionRef}
      id="shop"
      aria-labelledby="range-heading"
      className="range relative overflow-hidden text-maroon lg:h-svh"
      style={{ background: "var(--range-bg, #f6e9d2)" }}
    >
      {/* Opening line: arrives over the end of Module 4, leaves before the packs come in */}
      <div className="range-head px-4 pt-[max(96px,14vh)] sm:px-8 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-[18vh] lg:px-12 lg:pt-0">
        <h2 id="range-heading" className="range-headline display m-0 text-[length:min(15vw,8.5vh)] lg:text-[length:min(10.5vw,17vh)]">
          <Line>One kitchen.</Line>
          <Line>A lot less work.</Line>
        </h2>
        <p className="range-lede m-0 mt-5 text-[17px] text-maroon/80 lg:mt-8 lg:text-[19px]">
          <Line>Explore the Micky&apos;s range.</Line>
        </p>
      </div>

      {/* Category names (top left). Long names shrink to fit the space beside the packs. */}
      <div className="range-cats-wrap px-4 pt-14 [--cat-budget:calc(100vw-32px)] [--cat-lg:min(19vw,9vh)] [--cat-sm:min(7vw,3.6vh)] sm:px-8 lg:absolute lg:left-12 lg:top-[max(92px,13vh)] lg:z-20 lg:px-0 lg:pt-0 lg:[--cat-budget:44vw] lg:[--cat-lg:min(8.5vw,12vh)] lg:[--cat-sm:min(2.6vw,4.2vh)]">
        <CategorySelector
          categories={CATS}
          active={cat.id as CategoryId}
          onSelect={(id) => selectRef.current(CATS.findIndex((c) => c.id === id))}
        />
      </div>

      {/* Packs */}
      <div
        ref={stageRef}
        className={`range-stage-wrap relative mt-4 h-[56svh] touch-pan-y select-none [--pack-h:min(44svh,92vw)] [--pack-top:50%] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto lg:[--pack-h:min(64vh,40vw)] lg:[--pack-top:53%] ${mode === "swipe" ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <ProductStage products={ALL.map((e) => e.product)} />
      </div>

      {/* Swipe controls (phones, or reduced motion): arrows carry on across categories */}
      {mode === "swipe" && (
        <div className="flex items-center justify-between px-4 sm:px-8 lg:absolute lg:bottom-[7vh] lg:right-12 lg:z-20 lg:gap-6 lg:px-0">
          <button type="button" onClick={() => goRef.current(g - 1)} disabled={g === 0}
            className="cursor-pointer rounded-full border border-maroon/30 px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] disabled:opacity-30" aria-label="Previous product">
            ←
          </button>
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] tabular-nums text-maroon/70">
            {String(sel.idx + 1).padStart(2, "0")} / {String(cat.products.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => goRef.current(g + 1)} disabled={g === ALL.length - 1}
            className="cursor-pointer rounded-full border border-maroon/30 px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] disabled:opacity-30" aria-label="Next product">
            →
          </button>
        </div>
      )}

      {/* Active product (bottom left on desktop) */}
      <div className="range-info-wrap px-4 pb-24 pt-8 sm:px-8 lg:absolute lg:bottom-[7vh] lg:left-12 lg:z-20 lg:max-w-[40vw] lg:px-0 lg:pb-0 lg:pt-0">
        <ProductInfo product={product} index={sel.idx} total={cat.products.length} />
      </div>
    </section>
  );
}
