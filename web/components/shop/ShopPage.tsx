"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, CategoryId, Product } from "@/data/products";
import { categoryLabel } from "@/lib/products";
import { scrollToY } from "@/lib/smoothScroll";
import LightHeader from "./LightHeader";
import ProductGrid from "./ProductGrid";
import ShopCategories from "./ShopCategories";

type Props = { categories: Category[]; products: Product[]; initialCategory: CategoryId };

export default function ShopPage({ categories, products, initialCategory }: Props) {
  const [active, setActive] = useState<CategoryId>(initialCategory);
  const [barVisible, setBarVisible] = useState(false);
  const largeRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const c = { gravies: 0, pastes: 0, grains: 0 } as Record<CategoryId, number>;
    products.forEach((p) => { c[p.category] += 1; });
    return c;
  }, [products]);
  const inCategory = useMemo(() => products.filter((p) => p.category === active), [products, active]);

  // the compact bar takes over as soon as the large controls start to go under the header
  useEffect(() => {
    const el = largeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(e.intersectionRatio < 1 && e.boundingClientRect.top < 58), { rootMargin: "-58px 0px 0px 0px", threshold: [0, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (id: CategoryId, from: "large" | "compact") => {
    if (id !== active) {
      setActive(id);
      window.history.replaceState(null, "", `/shop?category=${id}`);
    }
    // from the compact bar, bring the start of the new list into view
    const grid = gridRef.current;
    if (from === "compact" && grid) {
      const bar = document.querySelector<HTMLElement>(".shop-bar")?.offsetHeight ?? 110;
      scrollToY(grid.getBoundingClientRect().top + window.scrollY - bar - 24, 0.9);
    }
  };

  return (
    <div className="shop">
      <LightHeader />
      <h1 className="sr-only">Shop Micky&apos;s</h1>
      <ShopCategories ref={largeRef} categories={categories} counts={counts} active={active} onSelect={select} variant="large" />
      <ShopCategories categories={categories} counts={counts} active={active} onSelect={select} variant="compact" visible={barVisible} />

      <section ref={gridRef} className="shop-list" aria-labelledby="shop-list-title">
        <h2 id="shop-list-title" className="sr-only">{categoryLabel(active)}</h2>
        <ProductGrid products={inCategory} categoryKey={active} labelledBy="shop-list-title" />
      </section>

    </div>
  );
}
