"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROBLEM } from "@/data/b2b";
import { Line } from "../ScrollCopy";

/**
 * "Too much happens before service": the prep words fill the screen, then collapse into
 * MICKY'S BASE + FINAL INGREDIENTS + CHEF. Desktop with motion: pinned + scrubbed.
 * Phones / reduced motion: a static list that strikes through as the result comes into view.
 */
export default function KitchenProblem() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-anim");
      const stage = el.querySelector<HTMLElement>(".b2b-prob-stage")!;
      const words = gsap.utils.toArray<HTMLElement>(".b2b-prob-word", el);
      const result = gsap.utils.toArray<HTMLElement>(".b2b-prob-result > *", el);
      // each word travels to the centre of the stage
      const toCentre = (axis: "x" | "y") => (_: number, w: HTMLElement) => {
        const s = stage.getBoundingClientRect(), r = w.getBoundingClientRect();
        return axis === "x" ? s.left + s.width / 2 - (r.left + r.width / 2) : s.top + s.height * 0.55 - (r.top + r.height / 2);
      };
      gsap.set(words, { xPercent: -50, yPercent: -50 });
      gsap.set(result, { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=170%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.from(words, { autoAlpha: 0, y: 30, stagger: 0.04, duration: 0.25, ease: "power2.out" }, 0)
        .to(words, { x: toCentre("x"), y: toCentre("y"), scale: 0.25, autoAlpha: 0, duration: 0.45, stagger: 0.025, ease: "power2.in" }, 0.45)
        .to(result, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: "power3.out" }, 0.9)
        .to({}, { duration: 0.25 });
      return () => el.classList.remove("is-anim");
    });

    // phones / reduced motion: strike the list through once the result is on screen
    mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
      const target = el.querySelector(".b2b-prob-result");
      if (!target) return;
      const io = new IntersectionObserver(([e]) => el.classList.toggle("is-done", e.isIntersecting || e.boundingClientRect.top < 0), { rootMargin: "0px 0px -20% 0px" });
      io.observe(target);
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="b2b-prob" data-theme="light" aria-labelledby="b2b-prob-h">
      <h2 id="b2b-prob-h" className="display b2b-prob-h b2b-reveal">
        {PROBLEM.headline.map((l) => <Line key={l}>{l}</Line>)}
      </h2>
      <div className="b2b-prob-stage">
        <ul className="b2b-prob-words" aria-label="Before service">
          {PROBLEM.words.map((w, i) => (
            <li key={w.w} className="display b2b-prob-word" style={{ ["--x" as string]: `${w.x}%`, ["--y" as string]: `${w.y}%`, ["--s" as string]: w.s, ["--i" as string]: i }}>
              {w.w}
            </li>
          ))}
        </ul>
        <p className="display b2b-prob-result" aria-label={PROBLEM.result.join(" plus ")}>
          <span className="b2b-accent-chip">{PROBLEM.result[0]}</span>
          <span className="b2b-plus" aria-hidden="true">+</span>
          <span>{PROBLEM.result[1]}</span>
          <span className="b2b-plus" aria-hidden="true">+</span>
          <span>{PROBLEM.result[2]}</span>
        </p>
      </div>
    </section>
  );
}
