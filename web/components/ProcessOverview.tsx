// The one place all three steps sit together, joined by a single line.
export const STAGES = [
  { n: "01", t: ["Chef-crafted", "base"] },
  { n: "02", t: ["Retort-sealed", "quality"] },
  { n: "03", t: ["Fast final", "execution"] },
];

export default function ProcessOverview() {
  return (
    <div className="ptp-overview">
      <svg className="ptp-ov-svg" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
        <line className="ptp-ov-line" x1="0" y1="10" x2="1000" y2="10" pathLength={1} />
      </svg>
      <span className="ptp-ov-vline" aria-hidden="true" />
      <ol className="ptp-ov-list">
        {STAGES.map((s) => (
          <li key={s.n} className="ptp-ov-item">
            <span className="ptp-ov-dot" aria-hidden="true" />
            <span className="ptp-ov-num display">{s.n}</span>
            <span className="ptp-ov-title display">
              {s.t.map((w) => (
                <span key={w} className="line-mask"><span className="line-inner">{w}</span></span>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
