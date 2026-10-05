"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import type { Product } from "@/data/products";
import { canQuickAdd, categoryLabel } from "@/lib/products";
import Price from "../shop/Price";
import SizeSelector from "../shop/SizeSelector";
import QuantityStepper from "./QuantityStepper";

type Props = {
  product: Product;
  hero: { src: string; width: number; height: number };
  /** optional back-of-pack view (label) */
  back?: { src: string; width: number; height: number };
  size: string;
  setSize: (s: string) => void;
  qty: number;
  setQty: (n: number) => void;
  onAdd: () => void;
};

/** Large pack on the left, everything needed to buy on the right (stacked on phones). */
const ProductHero = forwardRef<HTMLDivElement, Props>(function ProductHero({ product: p, hero, back, size, setSize, qty, setQty, onAdd }, buyRef) {
  const [side, setSide] = useState<"front" | "back">("front");
  const view = side === "back" && back ? back : hero;
  const stageRef = useRef<HTMLDivElement>(null);
  const packRef = useRef<HTMLDivElement>(null);
  const buyable = canQuickAdd(p);

  // a tiny parallax + tilt that follows the pointer (mouse only, motion allowed)
  useEffect(() => {
    const stage = stageRef.current, pack = packRef.current;
    if (!stage || !pack || !window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    gsap.set(pack, { transformPerspective: 1100 });
    const opts = { duration: 0.9, ease: "power3.out" };
    const x = gsap.quickTo(pack, "x", opts), y = gsap.quickTo(pack, "y", opts);
    const ry = gsap.quickTo(pack, "rotationY", opts), rx = gsap.quickTo(pack, "rotationX", opts);
    const move = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      x(nx * 18); y(ny * 12); ry(nx * 7); rx(-ny * 4);
    };
    const leave = () => { x(0); y(0); ry(0); rx(0); };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    return () => { stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); gsap.killTweensOf(pack); };
  }, []);

  return (
    <section className="pdp-hero" aria-labelledby="pdp-title">
      <div ref={stageRef} className="pdp-hero-stage">
        <span className="pdp-hero-glow" aria-hidden="true" />
        <div ref={packRef} className="pdp-hero-pack">
          <div className="pdp-hero-pack-in">
            <Image key={view.src} src={view.src} alt={side === "back" ? `${p.name} pouch, back label` : `${p.name} pouch`} width={view.width} height={view.height} sizes="(min-width: 1024px) 40vw, 78vw" priority className="pdp-hero-img" />
          </div>
        </div>
        {back && (
          <div className="pdp-sides" role="group" aria-label="Pack view">
            {(["front", "back"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={side === s} className={side === s ? "is-on" : ""} onClick={() => setSide(s)}>
                {s === "front" ? "Front" : "Back of pack"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp-hero-info">
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link> <span aria-hidden="true">/</span> <Link href={`/shop?category=${p.category}`}>{categoryLabel(p.category)}</Link>
        </nav>
        <h1 id="pdp-title" className="display pdp-name">{p.name}</h1>
        <p className="pdp-desc">{p.descriptor}</p>

        {buyable ? (
          <div ref={buyRef} className="pdp-buy">
            <SizeSelector productName={p.name} sizes={p.sizes} value={size} onChange={setSize} />
            <Price product={p} size={size} />
            <div className="pdp-buy-qty">
              <span className="shop-size-label" id="pdp-qty-label">Quantity</span>
              <QuantityStepper value={qty} onChange={setQty} />
            </div>
            <button type="button" className="shop-add pdp-add" onClick={onAdd} aria-label={`Add ${p.name}, ${size}, quantity ${qty}, to cart`}>
              Add to cart
            </button>
          </div>
        ) : (
          <p ref={buyRef} className="shop-pending">Not available to order yet.</p>
        )}
      </div>
    </section>
  );
});

export default ProductHero;
