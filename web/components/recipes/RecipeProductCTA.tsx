"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { canQuickAdd, defaultSize, productUrl } from "@/lib/products";
import Price from "../shop/Price";
import SizeSelector from "../shop/SizeSelector";

/** "Made with Micky's …": the pack, confirmed sizes, price when known, Add to Cart (shared cart). */
export default function RecipeProductCTA({ product: p, alsoUses }: { product: Product; alsoUses: Product[] }) {
  const [size, setSize] = useState(defaultSize(p) ?? "");
  const quick = canQuickAdd(p);
  return (
    <section className="rcp-product rcp-reveal" aria-labelledby="rcp-product-h" style={{ "--tint": p.tint } as CSSProperties}>
      <div className="rcp-product-stage">
        <Image src={p.image} alt={`${p.name} pack`} width={p.imageWidth} height={p.imageHeight} sizes="(min-width: 1024px) 22vw, 50vw" className="rcp-product-pack" />
      </div>
      <div className="rcp-product-info">
        <p className="rcp-eyebrow">Made with</p>
        <h2 id="rcp-product-h" className="display rcp-product-name">Micky&apos;s {p.name}</h2>
        <p className="rcp-product-desc">{p.descriptor}</p>
        {quick && <SizeSelector productName={p.name} sizes={p.sizes} value={size} onChange={setSize} />}
        <Price product={p} size={size} />
        <div className="rcp-product-actions">
          {quick && <button type="button" className="shop-add" onClick={() => addToCart(p.slug, size)} aria-label={`Add ${p.name}, ${size}, to cart`}>Add to cart</button>}
          <Link href={productUrl(p)} className={quick ? "shop-view" : "shop-view is-solo"}>View product <span aria-hidden="true">→</span></Link>
        </div>
        {alsoUses.length > 0 && (
          <p className="rcp-product-also">
            Also uses{" "}
            {alsoUses.map((o, i) => (
              <span key={o.slug}>{i > 0 && ", "}<Link href={productUrl(o)}>Micky&apos;s {o.name}</Link></span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
