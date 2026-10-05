"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Recipe } from "@/data/recipes";
import { productUrl } from "@/lib/products";
import { recipeMatches, recipeUrl, type RecipeFilter } from "@/lib/recipes";
import LightHeader from "../shop/LightHeader";
import { Line } from "../ScrollCopy";
import RecipeCard, { type CardSize } from "./RecipeCard";
import { useReveal } from "./useReveal";

type Props = { recipes: Recipe[]; filters: RecipeFilter[]; initialFilter: string; heroImage: { src: string; alt: string } };

/** Editorial rhythm: 7+5, then 4+4+4; an unfinished last row stretches to fill the width. */
function spans(n: number, lastIsBand = false) {
  const pattern = [7, 5, 4, 4, 4];
  const rows: number[][] = [];
  let row: number[] = [], fill = 0;
  for (let i = 0; i < n; i++) {
    const s = pattern[i % pattern.length];
    if (fill + s > 12) { rows.push(row); row = []; fill = 0; }
    row.push(s); fill += s;
    if (fill === 12) { rows.push(row); row = []; fill = 0; }
  }
  if (lastIsBand && row.length === 1) {
    rows.push([12]); // a photo-less recipe closes the grid as a slim band
  } else if (row.length === 1 && rows.length && rows[rows.length - 1].length === 3) {
    rows.splice(-1, 1, [6, 6], [6, 6]); // 3 + 1 -> 2 + 2: no lone card stretched across the page
  } else if (row.length === 1 && rows.length && rows[rows.length - 1].length === 2) {
    rows.splice(-1, 1, [4, 4, 4]); // 2 + 1 -> 3
  } else if (row.length) {
    rows.push(row.map(() => 12 / row.length));
  }
  return rows.flat();
}
const sizeOf = (span: number): CardSize => (span === 12 ? "full" : span >= 6 ? "wide" : span === 5 ? "narrow" : "third");

export default function RecipesIndex({ recipes, filters, initialFilter, heroImage }: Props) {
  const [filter, setFilter] = useState(initialFilter);
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, filter);

  const shown = useMemo(() => recipes.filter((r) => recipeMatches(r, filter)), [recipes, filter]);
  const featured = shown.find((r) => r.featured) ?? null;
  // dishes with real food photography take the larger slots; recipes still waiting for a photo go last
  const rest = shown.filter((r) => r !== featured).sort((a, b) => Number(!!a.photoMissing) - Number(!!b.photoMissing));
  const layout = spans(rest.length, !!rest[rest.length - 1]?.photoMissing);

  const choose = (id: string) => {
    setFilter(id);
    window.history.replaceState(null, "", id === "all" ? "/recipes" : `/recipes?product=${id}`);
  };

  // a small parallax on the hero photo (desktop, motion allowed)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(root.querySelector(".rcp-hero-img img"), { yPercent: 0, scale: 1.08 }, { yPercent: 6, scale: 1.08, ease: "none", scrollTrigger: { trigger: root.querySelector(".rcp-hero"), start: "top top", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="rcp-page">
      <LightHeader />
      <header className="rcp-hero">
        <div className="rcp-hero-copy">
          <h1 className="display rcp-hero-h"><Line>What will</Line><Line>you make?</Line></h1>
          <p className="rcp-hero-sub"><Line>One Micky&apos;s base.</Line><Line>Plenty of ways to make it yours.</Line></p>
        </div>
        <figure className="rcp-hero-img">
          <Image src={heroImage.src} alt={heroImage.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
        </figure>
      </header>

      {filters.length > 0 && <nav className="rcp-filters" aria-label="Filter recipes by Micky's product">
        <div className="rcp-filters-row">
          {filters.map((f) => (
            <a
              key={f.id}
              href={f.id === "all" ? "/recipes" : `/recipes?product=${f.id}`}
              aria-current={f.id === filter ? "true" : undefined}
              className={`rcp-filter${f.id === filter ? " is-on" : ""}`}
              onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); choose(f.id); }}
            >
              {f.label} <span className="rcp-filter-n">{String(f.count).padStart(2, "0")}</span>
            </a>
          ))}
        </div>
      </nav>}

      <section className="rcp-list" aria-label="Recipes" key={filter}>
        {featured && (
          <article className="rcp-feature rcp-reveal" style={{ "--tint": featured.tint } as CSSProperties}>
            <Link href={recipeUrl(featured)} className="rcp-feature-img" tabIndex={-1} aria-hidden="true">
              <Image src={featured.heroImage} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" priority className="object-cover" />
            </Link>
            <div className="rcp-feature-info">
              <p className="rcp-eyebrow">Featured recipe</p>
              <h2 className="display rcp-feature-name"><Link href={recipeUrl(featured)}>{featured.name}</Link></h2>
              <p className="rcp-made"><span>Made with</span>Micky&apos;s {featured.productName}</p>
              {featured.description && <p className="rcp-feature-desc">{featured.description}</p>}
              <div className="rcp-feature-actions">
                <Link href={recipeUrl(featured)} className="cart-checkout rcp-cta">View recipe</Link>
                <Link href={productUrl({ slug: featured.productSlug })} className="shop-view">Shop {featured.productName} <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </article>
        )}
        <div className="rcp-grid">
          {rest.map((r, i) => (
            <RecipeCard key={r.slug} recipe={r} size={sizeOf(layout[i])} style={{ "--span": layout[i] } as CSSProperties} priority={!featured && i < 2} />
          ))}
        </div>
      </section>
    </div>
  );
}
