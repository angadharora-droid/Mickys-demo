"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import type { ProductSize } from "@/data/products";

type Props = { productName: string; sizes: ProductSize[]; value: string; onChange: (label: string) => void; compact?: boolean };

/** Pack sizes as a radio group: one tab stop, arrow keys move the selection. */
export default function SizeSelector({ productName, sizes, value, onChange, compact }: Props) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (sizes.length === 0) return null;
  const current = Math.max(0, sizes.findIndex((s) => s.label === value));

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (current + step + sizes.length) % sizes.length;
    onChange(sizes[next].label);
    refs.current[next]?.focus();
  };

  return (
    <div className={`shop-size${compact ? " is-compact" : ""}`}>
      <span id={id} className="shop-size-label">Size</span>
      <div role="radiogroup" aria-labelledby={id} className="shop-size-opts" onKeyDown={onKey}>
        {sizes.map((s, i) => {
          const on = i === current;
          return (
            <button
              key={s.label}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${s.label}, ${productName}`}
              tabIndex={on ? 0 : -1}
              className={`shop-size-opt${on ? " is-on" : ""}`}
              onClick={() => onChange(s.label)}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
