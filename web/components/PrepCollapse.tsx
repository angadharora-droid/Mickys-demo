import { Line } from "./ScrollCopy";

// Chapter 3: the long traditional prep sequence that collapses into three steps.
export const PREP_STEPS = ["Chop", "Soak", "Boil", "Grind", "Cook", "Reduce", "Prep"];

export default function PrepCollapse() {
  return (
    <div className="why-prep">
      <ol className="why-prep-row" aria-label="Traditional preparation">
        {PREP_STEPS.map((w, i) => (
          <li key={w} className="why-prep-word">
            <span className="why-prep-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="display">{w}</span>
          </li>
        ))}
      </ol>
      <span className="why-prep-rule" aria-hidden="true" />
      <p className="why-prep-result display" aria-label="Open. Heat. Finish.">
        <Line className="text-cream">Open.</Line>
        <Line className="text-cream">Heat.</Line>
        <Line className="text-yellow">Finish.</Line>
      </p>
    </div>
  );
}
