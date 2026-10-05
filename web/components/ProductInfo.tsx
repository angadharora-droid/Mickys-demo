"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Product } from "@/data/products";
import { addToCart, viewProduct } from "@/lib/cart";
import { Line } from "./ScrollCopy";

type Props = { product: Product; index: number; total: number };

/** Active product details. Secondary to the pack; swaps with a fast mask transition. */
export default function ProductInfo({ product, index, total }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState<string | null>(null);
  // Selected size per product (frontend state only until WooCommerce variations are connected).
  const [sizeBySlug, setSizeBySlug] = useState<Record<string, string>>({});
  const size = sizeBySlug[product.slug] ?? product.sizes[0]?.label ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tw = gsap.fromTo(
      el.querySelectorAll(".line-inner"),
      { yPercent: 125 },
      { yPercent: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" },
    );
    return () => { tw.kill(); };
  }, [product.slug]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(null), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const n = (v: number) => String(v).padStart(2, "0");

  return (
    <div ref={ref} className="range-info" aria-live="polite">
      <p className="m-0 hidden text-[12px] font-semibold uppercase tracking-[0.16em] text-maroon/60 tabular-nums lg:block">
        <Line>{n(index + 1)} / {n(total)}</Line>
      </p>
      <h4 className="display m-0 mt-2 text-[length:min(12vw,6.5vh)] text-maroon lg:text-[length:min(4.4vw,7vh)]">
        <Line>{product.name}</Line>
      </h4>
      <p className="m-0 mt-3 max-w-[34ch] text-[16px] leading-[1.45] text-maroon/80 lg:max-w-[min(34ch,30vw)] lg:text-[17px]">
        <Line>{product.descriptor}</Line>
      </p>
      {product.sizes.length > 0 && (
        <div className="mt-5 flex items-center gap-4">
          <span id={`size-label-${product.slug}`} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon/60">
            Size
          </span>
          <div role="radiogroup" aria-labelledby={`size-label-${product.slug}`} className="flex gap-2">
            {product.sizes.map((s) => {
              const on = s.label === size;
              return (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${product.name}, ${s.label}`}
                  onClick={() => setSizeBySlug((m) => ({ ...m, [product.slug]: s.label }))}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-[13px] font-semibold tracking-[0.06em] tabular-nums transition-colors ${
                    on ? "border-maroon bg-maroon text-cream" : "border-maroon/35 text-maroon hover:border-maroon"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {product.price !== null && <span className="text-[13px] font-semibold text-maroon/80">₹{product.price}</span>}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {product.sizes.length > 0 && (
        <button
          type="button"
          onClick={() => { addToCart(product.slug, size); setAdded(product.slug); }}
          aria-label={`Add ${product.name}, ${size}, to cart`}
          className="cursor-pointer rounded-full bg-maroon px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-brown"
        >
          {added === product.slug ? "Added to cart" : "Add to cart"}
        </button>
        )}
        <button
          type="button"
          onClick={() => viewProduct(product.slug)}
          aria-label={`View ${product.name}`}
          className="cursor-pointer border-b border-maroon/40 pb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-maroon transition-colors hover:border-maroon"
        >
          View product
        </button>
      </div>
    </div>
  );
}
