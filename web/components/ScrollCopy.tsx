import type { ReactNode } from "react";

/** One headline line inside a mask. GSAP animates `.line-inner`. */
export function Line({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`line-mask ${className}`}>
      <span className="line-inner">{children}</span>
    </span>
  );
}

// Safe side margins: never closer than 16px on phones, 32–72px on desktop.
const gutter = "left-4 sm:left-8 lg:left-[clamp(32px,4vw,72px)]";
const gutterRight = "right-4 sm:right-8 lg:right-[clamp(32px,4vw,72px)]";

/**
 * Story phases 2–4. Each sits in the empty space around the pouch at that
 * point of the rotation. Phones and tablets use the bands above and below
 * the pouch; desktop uses the sides.
 */
export default function ScrollCopy() {
  return (
    <div className="story pointer-events-none absolute inset-0 z-10">
      {/* Phase 2: lower left, two ideas stepped apart; pouch upright to 25° */}
      <h2
        data-phase="2"
        className={`story-phase display absolute bottom-[max(24px,5vh)] m-0 text-[length:min(var(--hero),6.9vh)] lg:bottom-[7vh] phase-2-size ${gutter}`}
      >
        <span className="block">
          <Line className="text-yellow">The hard</Line>
          <Line className="text-yellow">part.</Line>
        </span>
        <span className="mt-[0.35em] block pl-[0.6em]">
          <Line className="text-cream">Already</Line>
          <Line className="text-cream">done.</Line>
        </span>
      </h2>

      {/* Phase 3: split upper left / lower right, pouch turning into the diagonal */}
      <h2 data-phase="3" className="story-phase display phase-3-size absolute inset-0 m-0">
        <span className={`absolute top-[max(84px,12vh)] block ${gutter}`}>
          <Line className="text-yellow">We do</Line>
          <Line className="text-yellow">the prep.</Line>
        </span>
        <span className={`absolute bottom-[max(24px,5vh)] block text-right lg:bottom-[7vh] ${gutterRight}`}>
          <Line className="text-cream">You make</Line>
          <Line className="text-cream">it yours.</Line>
        </span>
      </h2>

      {/* Phase 4: left column clear of the horizontal pouch; the top seal (right) stays free for Module 2 */}
      <h2
        data-phase="4"
        className={`story-phase display absolute bottom-[max(24px,5vh)] m-0 phase-4-size lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 ${gutter}`}
      >
        <Line className="text-cream">Open.</Line>
        <Line className="text-cream">Heat.</Line>
        <Line className="text-yellow">Finish.</Line>
      </h2>

      {/* Phase 5 (Module 2 pour): above and below the pouch on the left; the gravy keeps the right side */}
      <h2 data-phase="5" className="story-phase display phase-5-size absolute inset-0 m-0">
        <span className={`absolute top-[max(84px,12vh)] block ${gutter}`}>
          <Line className="text-yellow">From pack.</Line>
        </span>
        <span className={`absolute bottom-[max(24px,5vh)] block lg:bottom-[7vh] ${gutter}`}>
          <Line className="text-cream">To pan.</Line>
        </span>
      </h2>
    </div>
  );
}
