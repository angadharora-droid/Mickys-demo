"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORKFLOW } from "@/data/b2b";
import { Line } from "../ScrollCopy";

/** Base → ingredients → season → serve. The line fills with scroll; steps light up as it reaches them. */
export default function Workflow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const steps = [...el.querySelectorAll<HTMLElement>(".b2b-flow-step")];
    const paint = (p: number) => {
      el.style.setProperty("--p", String(p));
      steps.forEach((s, i) => s.classList.toggle("is-on", p >= (i / (steps.length - 1)) * 0.96));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { paint(1); return; }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, start: "top 75%", end: "bottom 55%", scrub: true, onUpdate: (s) => paint(s.progress) });
    paint(st.progress);
    return () => st.kill();
  }, []);

  return (
    <section className="b2b-flow" aria-labelledby="b2b-flow-h">
      <div className="b2b-flow-head">
        <h2 id="b2b-flow-h" className="display b2b-h b2b-reveal">
          <Line>{WORKFLOW.headline[0]}</Line>
          <Line className="b2b-accent">{WORKFLOW.headline[1]}</Line>
        </h2>
        <p className="b2b-lede b2b-reveal">{WORKFLOW.note}</p>
      </div>
      <div ref={ref} className="b2b-flow-track" style={{ ["--n" as string]: WORKFLOW.steps.length }}>
      <span className="b2b-flow-line" aria-hidden="true"><span className="b2b-flow-fill" /></span>
      <ol className="b2b-flow-steps">
        {WORKFLOW.steps.map((s, i) => (
          <li key={s.title} className={`b2b-flow-step${i === 0 ? " is-base" : ""}`}>
            <span className="b2b-flow-dot" aria-hidden="true" />
            <span className="b2b-flow-who">{s.who}</span>
            <h3 className="display b2b-flow-t"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
            <p className="b2b-flow-x">{s.text}</p>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
