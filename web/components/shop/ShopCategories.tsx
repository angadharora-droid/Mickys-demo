"use client";

import { forwardRef, useEffect, useRef, type MouseEvent } from "react";
import type { Category, CategoryId } from "@/data/products";

type Props = {
  categories: Category[];
  counts: Record<CategoryId, number>;
  active: CategoryId;
  onSelect: (id: CategoryId, from: "large" | "compact") => void;
  variant: "large" | "compact";
  /** compact bar only: shown once the large controls have scrolled away */
  visible?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The three categories. Real links (/shop?category=…) so they work without JS and can be
 * opened in a new tab; a plain click switches in place without reloading.
 */
const ShopCategories = forwardRef<HTMLElement, Props>(function ShopCategories({ categories, counts, active, onSelect, variant, visible = true }, ref) {
  const rowRef = useRef<HTMLDivElement>(null);
  const compact = variant === "compact";

  // keep the active category in view when the row is swiped (phones)
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !el || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  const click = (e: MouseEvent, id: CategoryId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onSelect(id, variant);
  };

  return (
    <nav
      ref={ref}
      aria-label={compact ? "Shop categories (compact)" : "Shop categories"}
      className={compact ? `shop-bar${visible ? " is-visible" : ""}` : "shop-cats"}
      inert={compact && !visible ? true : undefined}
    >
      <div ref={rowRef} className={compact ? "shop-bar-row" : "shop-cats-row"}>
        {categories.map((c) => {
          const on = c.id === active;
          return (
            <a
              key={c.id}
              href={`/shop?category=${c.id}`}
              aria-current={on ? "true" : undefined}
              className={`${compact ? "shop-bar-link" : "shop-cat display"}${on ? " is-on" : ""}`}
              onClick={(e) => click(e, c.id)}
            >
              <span className="shop-cat-t">{c.label}</span>
              <span className="shop-cat-n" aria-label={`${counts[c.id]} products`}>{pad(counts[c.id])}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
});

export default ShopCategories;
