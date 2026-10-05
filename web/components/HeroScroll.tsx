"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCanvas, { type ProductCanvasHandle } from "./ProductCanvas";
import ScrollCopy, { Line } from "./ScrollCopy";

// Scroll budget per module, in % of the viewport height.
// Module 1 keeps exactly its approved 350%; Module 2 (open + pour) and
// Module 3 (landing in the pan) follow it.
const M1_SCROLL = 350;
const M2_SCROLL = 250;
const M3_SCROLL = 280;
const DIVE_SCROLL = 100; // after the settled pool: push into the gravy, colour fills the screen
const PIN_LENGTH = `+=${M1_SCROLL + M2_SCROLL + M3_SCROLL + DIVE_SCROLL}%`;

// Scene timeline, in units of Module 1's scroll: 0–1 is Module 1 exactly as approved.
const M2_UNITS = M2_SCROLL / M1_SCROLL;
const M3_UNITS = M3_SCROLL / M1_SCROLL;
const M3_START = 1 + M2_UNITS;
const POUCH = { start: 0.1, end: 0.9 }; // Module 1: hold frame 1 before, frame 120 after
const POUR = { start: 1, end: 1 + M2_UNITS * 0.84 }; // Module 2: frames 1–100, then hold the pour
const LAND = { start: M3_START, end: M3_START + M3_UNITS * 0.86 }; // Module 3: frames 1–115, then hold the pool
const DIVE = { start: M3_START + M3_UNITS, end: M3_START + M3_UNITS + DIVE_SCROLL / M1_SCROLL }; // into Module 4

// Centre of the settled pool in Module 3's last frame (fractions of the frame), measured from the render.
const POOL = { x: 0.53, y: 0.536 };
const PHASES = {
  1: { out: 0.14 },
  2: { in: 0.22, out: 0.37 },
  3: { in: 0.45, out: 0.61 },
  4: { in: 0.79, out: 1 + M2_UNITS * 0.48 }, // stays through the opening and first swell
  5: { in: 1 + M2_UNITS * 0.63, out: M3_START + M3_UNITS * 0.02 }, // "From pack. To pan." leads into the landing, clears before the pan arrives
};
const ENTER = 0.05; // length of a line reveal
const EXIT = 0.045;
const STAGGER = 0.012;

// Shared size for the hero lines.
const heroSize =
  "[--hero:min(19vw,11.5vh)] sm:[--hero:min(14vw,15vh)] lg:[--hero:clamp(96px,min(13vw,17vh),240px)]";

export default function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<ProductCanvasHandle>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Reduced motion: no pin, no scrubbing; CSS shows frame 1 and all copy statically.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(section);
      const lines = (phase: number) => q(`[data-phase="${phase}"] .line-inner`);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: PIN_LENGTH,
          pin: true,
          anticipatePin: 1, // pin a frame early on fast flicks: no jump when the hero locks
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      // Pouch: Module 1 frames 1 → 120, Module 2 (open + pour) 1 → 100, Module 3 (pan) 1 → 115.
      // Each module's first frame is identical to the previous module's last, so handovers are invisible.
      const playhead = { m1: 0, m2: 0, m3: 0 };
      const draw = () => canvasRef.current?.setPlayhead([playhead.m1, playhead.m2, playhead.m3]);
      tl.to(playhead, { m1: 1, duration: POUCH.end - POUCH.start, onUpdate: draw }, POUCH.start);
      tl.to(playhead, { m2: 1, duration: POUR.end - POUR.start, onUpdate: draw }, POUR.start);
      tl.to(playhead, { m3: 1, duration: LAND.end - LAND.start, onUpdate: draw }, LAND.start);

      const reveal = (phase: number, at: number) =>
        tl.fromTo(
          lines(phase),
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: ENTER, stagger: STAGGER, ease: "power3.out" },
          at,
        );
      const leave = (phase: number, at: number) =>
        tl.to(
          lines(phase),
          { yPercent: -110, opacity: 0, duration: EXIT, stagger: STAGGER, ease: "power2.in" },
          at,
        );

      leave(1, PHASES[1].out);
      reveal(2, PHASES[2].in);
      leave(2, PHASES[2].out);
      reveal(3, PHASES[3].in);
      leave(3, PHASES[3].out);
      reveal(4, PHASES[4].in);
      leave(4, PHASES[4].out);
      reveal(5, PHASES[5].in);
      leave(5, PHASES[5].out);

      // Dive: push into the pool while a disc of gravy colour grows from its centre and fills the screen.
      const pool = () => canvasRef.current?.framePoint(POOL.x, POOL.y, 2, 1) ?? { x: 0, y: 0 };
      const cover = () => {
        const p = pool();
        return Math.ceil(Math.hypot(Math.max(p.x, section.clientWidth - p.x), Math.max(p.y, section.clientHeight - p.y))) + 2;
      };
      const dive = DIVE.end - DIVE.start;
      tl.fromTo(
        zoomRef.current,
        { scale: 1, transformOrigin: () => `${pool().x}px ${pool().y}px` },
        { scale: 3.4, duration: dive, ease: "power2.in", transformOrigin: () => `${pool().x}px ${pool().y}px` },
        DIVE.start,
      );
      // soft-edged disc (a feathered mask, not a hard clip) so it melts into the textured pool
      const wipe = wipeRef.current as HTMLDivElement;
      const disc = { r: 0 };
      const paintDisc = () => {
        const p = pool();
        const feather = disc.r * 0.35; // no disc at all before the dive starts
        wipe.style.visibility = disc.r > 0.5 ? "visible" : "hidden";
        wipe.style.setProperty("--wx", `${p.x}px`);
        wipe.style.setProperty("--wy", `${p.y}px`);
        wipe.style.setProperty("--wr", `${disc.r}px`);
        wipe.style.setProperty("--wf", `${disc.r + feather}px`);
      };
      tl.fromTo(disc, { r: 0 }, { r: () => cover() * 1.25, duration: dive * 0.75, ease: "power2.in", onUpdate: paintDisc, onStart: paintDisc }, DIVE.start + dive * 0.25);

      // Timeline length = total scroll, so the units above map straight to scroll distance.
      tl.set({}, {}, DIVE.end);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="India's first convenient cooking brand"
      className={`hero-scene relative h-svh min-h-[560px] overflow-hidden bg-maroon ${heroSize}`}
    >
      <div className="hero-stage relative h-full">
        {/* Phase 1: opening. Both lines sit behind the pouch where they overlap. */}
        <h1 data-phase="1" className="display pointer-events-none absolute inset-0 m-0">
          {/* sized in CSS (.hero-line-left) so both lines always end before the pouch */}
          <span className="hero-line-left absolute left-4 top-[max(84px,12vh)] z-10 block text-yellow sm:left-8 lg:left-12">
            <Line>India&apos;s First</Line>
            <Line className="pl-[0.9em] lg:pl-[0.45em]">Convenient</Line>
          </span>
          <span className="hero-line-right absolute z-10 block text-cream">
            <Line>Cooking</Line>
            <Line className="pl-[0.45em]">Brand.</Line>
          </span>
        </h1>

        <div ref={zoomRef} className="absolute inset-0 z-20 will-change-transform">
          <ProductCanvas
            ref={canvasRef}
            onResize={({ width }) => sectionRef.current?.style.setProperty("--canvas-w", `${width}px`)}
            className="absolute inset-x-0 bottom-[2vh] top-[max(64px,8vh)]"
          />
        </div>
      </div>

      <ScrollCopy />

      {/* Gravy colour that fills the screen and hands over to Module 4 (same colour at its start) */}
      <div
        ref={wipeRef}
        aria-hidden="true"
        className="gravy-wipe pointer-events-none absolute inset-0 z-40 bg-gravy"
      />
    </section>
  );
}
