"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { MAX_QTY, changeSize, lineTotal, removeLine, setQuantity, type CartLine } from "@/lib/cart";
import { formatPrice, productUrl } from "@/lib/products";
import QuantityStepper from "../product/QuantityStepper";
import SizeSelector from "../shop/SizeSelector";
import StockNote from "./StockNote";

type Props = { line: CartLine; variant: "drawer" | "page"; highlight?: boolean; onNavigate?: () => void };

/** One cart line: pack, name, size, quantity, price when known, remove. */
export default function CartItem({ line: l, variant, highlight, onNavigate }: Props) {
  const [leaving, setLeaving] = useState(false);
  const unit = formatPrice(l.price);
  const total = formatPrice(lineTotal(l));
  const href = productUrl(l);

  const remove = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return removeLine(l.key);
    setLeaving(true);
    window.setTimeout(() => removeLine(l.key), 220);
  };

  return (
    <li className={`cart-item is-${variant}${highlight ? " is-new" : ""}${leaving ? " is-leaving" : ""}`} style={{ "--tint": l.tint } as CSSProperties}>
      <Link href={href} className="cart-item-img" tabIndex={-1} aria-hidden="true" onClick={onNavigate}>
        <Image src={l.image} alt="" width={l.imageWidth} height={l.imageHeight} sizes="96px" />
      </Link>
      <div className="cart-item-info">
        <h3 className="display cart-item-name"><Link href={href} onClick={onNavigate}>{l.name}</Link></h3>
        {l.sizes.length > 1 ? (
          <SizeSelector compact productName={l.name} sizes={l.sizes.map((label) => ({ label, variationId: null }))} value={l.size ?? ""} onChange={(s) => changeSize(l.key, s)} />
        ) : (
          l.size && <p className="cart-item-size">{l.size}</p>
        )}
        <StockNote stock={l.stock} />
        {variant === "page" && unit && <p className="cart-item-unit">{unit} each</p>}
      </div>
      <div className="cart-item-qty">
        <QuantityStepper value={l.quantity} onChange={(n) => setQuantity(l.key, n)} max={MAX_QTY} compact />
      </div>
      {total && <p className="cart-item-total">{total}</p>}
      <button type="button" className="cart-item-remove" onClick={remove} aria-label={`Remove ${l.name}${l.size ? `, ${l.size}` : ""}, from cart`}>
        Remove
      </button>
    </li>
  );
}
