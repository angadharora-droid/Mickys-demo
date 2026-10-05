"use client";

import Image from "next/image";
import type { Product } from "@/data/products";
import Price from "../shop/Price";
import SizeSelector from "../shop/SizeSelector";
import QuantityStepper from "./QuantityStepper";

type Props = {
  product: Product;
  visible: boolean;
  size: string;
  setSize: (s: string) => void;
  qty: number;
  setQty: (n: number) => void;
  onAdd: () => void;
};

/**
 * Compact purchase bar once the hero's Add to Cart has scrolled away: under the header on
 * desktop, at the bottom of the screen on phones. Shares size and quantity with the hero.
 */
export default function StickyBuyBar({ product: p, visible, size, setSize, qty, setQty, onAdd }: Props) {
  return (
    <aside className={`pdp-bar${visible ? " is-visible" : ""}`} aria-label={`Buy ${p.name}`} inert={!visible ? true : undefined}>
      <div className="pdp-bar-in">
        <span className="pdp-bar-thumb" aria-hidden="true">
          <Image src={p.image} alt="" width={p.imageWidth} height={p.imageHeight} sizes="40px" />
        </span>
        <p className="display pdp-bar-name">{p.name}</p>
        <SizeSelector productName={p.name} sizes={p.sizes} value={size} onChange={setSize} compact />
        <Price product={p} size={size} />
        <span className="pdp-bar-qty"><QuantityStepper value={qty} onChange={setQty} compact /></span>
        <button type="button" className="shop-add pdp-bar-add" onClick={onAdd} aria-label={`Add ${p.name}, ${size}, quantity ${qty}, to cart`}>
          Add to cart{qty > 1 && <span className="pdp-bar-x"> × {qty}</span>}
        </button>
      </div>
    </aside>
  );
}
