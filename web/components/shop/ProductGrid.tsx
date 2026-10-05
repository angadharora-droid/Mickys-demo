"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import type { Product } from "@/data/products";
import ShopProduct from "./ShopProduct";

type Props = { products: Product[]; categoryKey: string; labelledBy?: string };

// the column count that fills rows evenly (or leaves the fullest last row): 5 -> 3 + 2, 6 -> 3 + 3, 7 -> 4 + 3
const fit = (n: number, options: number[]) => options.find((c) => n % c === 0) ?? options.reduce((a, c) => (n % c > n % a ? c : a));
// desktop: up to four in one row, larger categories in even rows; tablets: 3 or 2 across
const cols = (n: number) => ({ "--n": n <= 4 ? Math.max(1, n) : fit(n, [4, 3]), "--md": n <= 2 ? Math.max(1, n) : fit(n, [3, 2]) }) as CSSProperties;

/** The products of one category. Swaps with a short fade when the category changes. */
export default function ProductGrid({ products, categoryKey, labelledBy }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState({ key: categoryKey, products });
  const [firstKey] = useState(categoryKey); // only the category the page opens on is preloaded
  const entering = useRef(false);

  useEffect(() => {
    if (categoryKey === shown.key) return;
    const el = ref.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || still) { setShown({ key: categoryKey, products }); return; }
    const tw = gsap.to(el.children, {
      opacity: 0, y: -10, duration: 0.18, stagger: 0.02, ease: "power2.in",
      onComplete: () => { entering.current = true; setShown({ key: categoryKey, products }); },
    });
    return () => { tw.kill(); };
  }, [categoryKey, products, shown.key]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !entering.current) return;
    entering.current = false;
    gsap.fromTo(el.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" });
  }, [shown]);

  if (shown.products.length === 0) {
    return (
      <div className="shop-empty" role="status">
        <p className="display">More from Micky&apos;s<br /><span>coming soon.</span></p>
      </div>
    );
  }

  return (
    <div ref={ref} className={`shop-grid${shown.products.length === 1 ? " is-single" : shown.products.length === 2 ? " is-pair" : ""}`} style={cols(shown.products.length)} role="list" aria-labelledby={labelledBy}>
      {shown.products.map((p, i) => (
        <div key={p.slug} role="listitem" className="shop-cell">
          <ShopProduct product={p} priority={shown.key === firstKey && i < 4} />
        </div>
      ))}
    </div>
  );
}

/** Loading placeholder with the same rhythm as the real grid. */
export function ProductSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="shop-grid" style={cols(count)} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="shop-cell shop-skel">
          <span className="shop-skel-stage" />
          <span className="shop-skel-line" />
          <span className="shop-skel-line is-short" />
        </div>
      ))}
    </div>
  );
}
