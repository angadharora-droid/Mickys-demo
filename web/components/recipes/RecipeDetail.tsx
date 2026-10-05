"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { findProduct, productUrl } from "@/lib/products";
import LightHeader from "../shop/LightHeader";
import { Line } from "../ScrollCopy";
import RecipeCard from "./RecipeCard";
import RecipeProductCTA from "./RecipeProductCTA";
import { useReveal } from "./useReveal";

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** One recipe: photo + name, ingredients, method, tips, the product, related dishes. */
export default function RecipeDetail({ recipe: r, related }: { recipe: Recipe; related: Recipe[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, r.slug);
  const product = findProduct(r.productSlug);
  const also = (r.alsoUses ?? []).map(findProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const meta = [["Prep", r.prepTime], ["Cook", r.cookTime], ["Serves", r.servings]].filter(([, v]) => v) as [string, string][];
  const hasRecipe = !!(r.ingredients?.length || r.steps?.length);

  return (
    <div ref={rootRef} className="rcp-page rcp-detail" style={{ "--tint": r.tint } as CSSProperties}>
      <LightHeader />
      <header className="rcp-dhero">
        <figure className={`rcp-dhero-img${r.photoMissing ? " is-pack" : ""}`}>
          {r.photoMissing ? (
            <Image src={r.pouch} alt={r.imageAlt} width={400} height={560} priority sizes="40vw" className="rcp-card-pouch" />
          ) : (
            <Image src={r.heroImage} alt={r.imageAlt} fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />
          )}
        </figure>
        <div className="rcp-dhero-info">
          <nav className="pdp-crumbs" aria-label="Breadcrumb"><Link href="/recipes">Recipes</Link> <span aria-hidden="true">/</span> {r.productName}</nav>
          <h1 className="display rcp-dname"><Line>{r.name}</Line></h1>
          <p className="rcp-made"><span>Made with</span><Link href={productUrl({ slug: r.productSlug })}>Micky&apos;s {r.productName}</Link></p>
          {r.description && <p className="rcp-ddesc">{r.description}</p>}
          {meta.length > 0 && (
            <dl className="rcp-meta">{meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          )}
          <div className="rcp-dhero-actions">
            {hasRecipe && <a href="#recipe" className="cart-checkout rcp-cta">Go to recipe</a>}
            <Link href={productUrl({ slug: r.productSlug })} className="shop-view">View product <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </header>

      {hasRecipe ? (
        <div id="recipe" className="rcp-body">
          {r.ingredients && r.ingredients.length > 0 && (
            <section className="rcp-ingredients" aria-labelledby="rcp-ing">
              <h2 id="rcp-ing" className="rcp-sec-h">Ingredients</h2>
              <ul>{r.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
            </section>
          )}
          <div className="rcp-method-col">
            {r.steps && r.steps.length > 0 && (
              <section className="rcp-method" aria-labelledby="rcp-met">
                <h2 id="rcp-met" className="rcp-sec-h">Method</h2>
                <ol>
                  {r.steps.map((s, i) => (
                    <li key={i} className="rcp-step rcp-reveal">
                      <span className="display rcp-step-n" aria-hidden="true">{pad(i)}</span>
                      <div>
                        <h3 className="display rcp-step-t"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
                        <p>{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                {r.methodNote && <p className="rcp-note">{r.methodNote}</p>}
              </section>
            )}
            {r.tips && r.tips.length > 0 && (
              <section className="rcp-tips" aria-labelledby="rcp-tip">
                <h2 id="rcp-tip" className="rcp-sec-h">Tips</h2>
                <ul>{r.tips.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
            )}
          </div>
        </div>
      ) : (
        <section id="recipe" className="rcp-soon">
          <p className="display">The full recipe<br /><span>is coming soon.</span></p>
          <p className="rcp-note">Our chefs are writing this one up. Until then, it starts with the base below.</p>
        </section>
      )}

      {product && <RecipeProductCTA product={product} alsoUses={also} />}

      {related.length > 0 && (
        <section className="rcp-related" aria-labelledby="rcp-rel">
          <h2 id="rcp-rel" className="display rcp-related-h"><Line>More ways</Line><Line className="pdp-accent">to make it yours.</Line></h2>
          <div className="rcp-related-grid">
            {related.map((o) => <RecipeCard key={o.slug} recipe={o} size="third" />)}
          </div>
        </section>
      )}
    </div>
  );
}
