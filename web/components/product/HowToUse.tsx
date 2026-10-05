import type { ProductContent } from "@/data/productContent";

type Props = { howTo: NonNullable<ProductContent["howToUse"]> };

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Large numbers and one word per step, across the page (revealed by ProductPage). */
export default function HowToUse({ howTo }: Props) {
  return (
    <section className="pdp-how" aria-labelledby="pdp-how-title" data-source={howTo.source} data-status={howTo.status}>
      <h2 id="pdp-how-title" className="pdp-eyebrow">How to use</h2>
      <span className="pdp-how-rule" aria-hidden="true" />
      <ol className="pdp-how-steps" style={{ ["--n" as string]: howTo.steps.length }}>
        {howTo.steps.map((s, i) => (
          <li key={s.word} className="pdp-how-step">
            <span className="display pdp-how-n" aria-hidden="true">{pad(i)}</span>
            <span className="line-mask"><span className="line-inner display pdp-how-w">{s.word}</span></span>
            <p className="pdp-how-t"><span className="sr-only">Step {i + 1}: </span>{s.text}</p>
          </li>
        ))}
      </ol>
      {howTo.tip && <p className="pdp-how-tip"><span>Pro tip</span>{howTo.tip}</p>}
      {howTo.status === "pending" && <p className="pdp-pending-note">Pending: replace with the confirmed pack instructions before launch.</p>}
    </section>
  );
}
