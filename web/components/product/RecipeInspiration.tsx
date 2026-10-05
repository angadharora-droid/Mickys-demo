"use client";

import Image from "next/image";
import type { Recipe } from "@/data/recipes";
import Link from "next/link";
import { recipeUrl } from "@/lib/recipes";
import { Line } from "../ScrollCopy";

type Props = { recipes: Recipe[]; moreDishes?: string[] };

/** 2–3 dishes made with this base; each links to its recipe page. */
export default function RecipeInspiration({ recipes, moreDishes }: Props) {
  return (
    <section className="pdp-recipes-sec" aria-labelledby="pdp-rec-title">
      <h2 id="pdp-rec-title" className="display pdp-sec-h pdp-big">
        <Line>Make it</Line>
        <Line className="pdp-accent">your way.</Line>
      </h2>
      <ul className="pdp-dishes" style={{ ["--n" as string]: recipes.length }}>
        {recipes.map((r) => (
          // photoPlaceholder: temporary stock image until the Micky's food shoot (internal marker)
          <li key={r.slug} className="pdp-dish" data-review={r.photoPlaceholder ? "placeholder photo" : undefined}>
            <span className="pdp-dish-img">
              <Image src={r.image} alt={r.imageAlt} fill sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover" />
            </span>
            <span className="pdp-dish-row">
              <span className="display pdp-dish-name">{r.name}</span>
              <Link href={recipeUrl(r)} className="shop-view" aria-label={`View recipe: ${r.name}`}>
                View recipe <span aria-hidden="true">→</span>
              </Link>
            </span>
          </li>
        ))}
      </ul>
      {moreDishes && moreDishes.length > 0 && (
        <p className="pdp-more"><span>Also made with this base</span>{moreDishes.join(" · ")}</p>
      )}
    </section>
  );
}
