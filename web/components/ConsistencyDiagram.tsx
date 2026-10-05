import Image from "next/image";

// Chapter 2: one base line that branches into several finished dishes.
// Dish names come from existing Micky's product copy (what each gravy is the base for).
export const OUTCOMES = ["Butter Chicken", "Paneer Makhani", "Shahi Korma", "Malabar Curry"];

// Branch geometry in a 1000 x 400 box: the base runs left to right, then fans out.
const FORK = { x: 300, y: 200 };
const ENDS = [60, 150, 250, 340];
export const BRANCHES = ENDS.map((y) => `M ${FORK.x} ${FORK.y} C ${FORK.x + 170} ${FORK.y}, ${FORK.x + 150} ${y}, 600 ${y}`);

export default function ConsistencyDiagram() {
  return (
    <div className="why-diagram" aria-label="One reliable base leads to many final dishes">
      <div className="why-diagram-lines">
      <svg className="why-diagram-svg" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
        <path className="why-base-line" pathLength={1} d={`M 0 ${FORK.y} L ${FORK.x} ${FORK.y}`} />
        {BRANCHES.map((d, i) => (
          <path key={i} className="why-branch" pathLength={1} d={d} />
        ))}
      </svg>
      <span className="why-base-label"><span className="line-mask"><span className="line-inner">One reliable base</span></span></span>
      <ul className="why-outcomes">
        {OUTCOMES.map((o, i) => (
          <li key={o} className="why-outcome" style={{ top: `${(ENDS[i] / 400) * 100}%` }}>
            <span className="why-branch-dot" aria-hidden="true" />
            <span className="line-mask"><span className="line-inner">{o}</span></span>
          </li>
        ))}
      </ul>
      </div>
      <figure className="why-dish">
        <div className="why-dish-inner">
          <Image src="/images/module6/dish-consistent.webp" alt="Paneer makhani finished with cream and coriander" fill sizes="(min-width: 1024px) 18vw, 60vw" priority className="object-cover" />
        </div>
      </figure>
    </div>
  );
}
