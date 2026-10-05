"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Recipe } from "@/data/recipes";
import Link from "next/link";
import { addToCart } from "@/lib/cart";
import { canQuickAdd, findProduct, productUrl } from "@/lib/products";
import { lockScroll } from "@/lib/smoothScroll";

type Props = { recipe: Recipe | null; onClose: () => void };

/** Simple recipe preview. The full /recipes/[slug] page comes later from the same data. */
export default function RecipeModal({ recipe, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (recipe && !d.open) d.showModal();
    if (!recipe && d.open) d.close();
    lockScroll(!!recipe);
    return () => lockScroll(false);
  }, [recipe]);

  return (
    <dialog
      ref={ref}
      className="recipe-modal"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-labelledby="recipe-modal-title"
    >
      {recipe && (
        <div className="recipe-modal-card">
          <figure className="recipe-modal-img">
            <Image src={recipe.image} alt={recipe.imageAlt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </figure>
          <div className="recipe-modal-body">
            <p className="recipe-modal-made">Made with Micky&apos;s {recipe.productName}</p>
            <h3 id="recipe-modal-title" className="display">{recipe.name}</h3>
            <p className="recipe-modal-note" data-review="replace with ingredients, steps, prep/cook time and servings once real recipes are supplied">
              The full recipe (ingredients, steps, prep and cook time) is coming soon.
            </p>
            <div className="recipe-modal-actions">
              {(() => {
                const product = findProduct(recipe.productSlug);
                if (product && canQuickAdd(product)) {
                  // default approved size; the cart drawer opens with it
                  return (
                    <button type="button" className="recipe-modal-cta" onClick={() => { onClose(); addToCart(recipe.productSlug, null); }}>
                      Add {recipe.productName} to cart
                    </button>
                  );
                }
                return <Link href={productUrl({ slug: recipe.productSlug })} className="recipe-modal-cta">View {recipe.productName}</Link>;
              })()}
              <button type="button" className="recipe-modal-close" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
