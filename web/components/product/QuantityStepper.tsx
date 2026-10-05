"use client";

type Props = { value: number; onChange: (n: number) => void; max?: number; compact?: boolean };

/** −  1  +  (no native number field). Minimum 1. */
export default function QuantityStepper({ value, onChange, max = 20, compact }: Props) {
  return (
    <div className={`pdp-qty${compact ? " is-compact" : ""}`} role="group" aria-label="Quantity">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity" disabled={value <= 1}>−</button>
      <output key={value} aria-live="polite" aria-label={`Quantity ${value}`}>{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase quantity" disabled={value >= max}>+</button>
    </div>
  );
}
