"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { canQuickAdd, defaultSize, productUrl } from "@/lib/products";
import Price from "./Price";
import SizeSelector from "./SizeSelector";

type Props = { product: Product; priority?: boolean };

/** One product: the pack is the focus; quick add where the sizes are confirmed. */
export default function ShopProduct({ product: p, priority }: Props) {
  const [size, setSize] = useState(defaultSize(p) ?? "");
  const quick = canQuickAdd(p);
  const href = productUrl(p);

  return (
    <article className="shop-product" style={{ "--tint": p.tint } as CSSProperties} aria-labelledby={`sp-${p.slug}`}>
      <Link href={href} className="shop-stage" tabIndex={-1} aria-hidden="true">
        <span className="shop-pack">
          <Image
            src={p.image}
            alt=""
            width={p.imageWidth}
            height={p.imageHeight}
            sizes="(min-width: 1200px) 22vw, (min-width: 640px) 30vw, 44vw"
            priority={priority}
            className="shop-pack-img"
          />
        </span>
      </Link>

      <div className="shop-body">
        <h3 id={`sp-${p.slug}`} className="display shop-name">
          <Link href={href}>{p.name}</Link>
        </h3>
        <p className="shop-desc">{p.descriptor}</p>

        {quick && <SizeSelector productName={p.name} sizes={p.sizes} value={size} onChange={setSize} />}
        <Price product={p} size={size} />

        <div className="shop-actions">
          {quick && (
            <button type="button" className="shop-add" onClick={() => addToCart(p.slug, size)} aria-label={`Add ${p.name}, ${size}, to cart`}>
              Add to cart
            </button>
          )}
          <Link href={href} className={quick ? "shop-view" : "shop-view is-solo"} aria-label={`View ${p.name}`}>
            View product <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
