import Image from "next/image";

// Step 02: an abstract retort chamber. No machine, no numbers: a rounded chamber,
// the pouch entering, a seal line, and one progress ring for the controlled cycle.
export const RETORT_STEPS = ["Prepared food", "Into the pouch", "Sealed", "Retort processed"];

export default function RetortProcess() {
  return (
    <div className="ptp-retort">
      <ol className="ptp-steps" aria-label="How it is sealed">
        <span className="ptp-steps-track" aria-hidden="true" />
        <span className="ptp-steps-fill" aria-hidden="true" />
        {RETORT_STEPS.map((s, i) => (
          <li key={s} className="ptp-step" data-step={i}>
            <span className="ptp-step-dot" aria-hidden="true" />
            <span className="ptp-step-label">{s}</span>
          </li>
        ))}
      </ol>

      <div className="ptp-chamber" aria-hidden="true">
        <svg className="ptp-chamber-svg" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid meet">
          <rect className="ptp-chamber-shell" x="8" y="8" width="384" height="504" rx="190" pathLength={1} />
          <circle className="ptp-ring-track" cx="200" cy="270" r="150" />
          <circle className="ptp-ring" cx="200" cy="270" r="150" pathLength={1} transform="rotate(-90 200 270)" />
        </svg>
        <div className="ptp-pouch">
          <Image src="/images/module7/pouch.webp" alt="" fill sizes="(min-width: 1024px) 14vw, 40vw" priority className="object-contain" />
          <span className="ptp-seal" />
        </div>
        <span className="ptp-cond ptp-cond-heat">Heat</span>
        <span className="ptp-cond ptp-cond-time">Time</span>
        <span className="ptp-cond ptp-cond-pressure">Pressure</span>
      </div>
      <p className="ptp-sealed display"><span className="line-mask"><span className="line-inner">Sealed for quality</span></span></p>
    </div>
  );
}
