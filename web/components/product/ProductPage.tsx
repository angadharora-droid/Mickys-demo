"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { addToCart } from "@/lib/cart";
import { defaultSize, type ProductPageData } from "@/lib/products";
import LightHeader from "../shop/LightHeader";
import ShopProduct from "../shop/ShopProduct";
import { Line } from "../ScrollCopy";
import HowToUse from "./HowToUse";
import ProductDetails from "./ProductDetails";
import ProductHero from "./ProductHero";
import RecipeInspiration from "./RecipeInspiration";
import StickyBuyBar from "./StickyBuyBar";

/** The product page. One template for every product; sections appear only when their data exists. */
export default function ProductPage({ data }: { data: ProductPageData }) {
  const { product: p, content, hero, details, recipes, related } = data;
  // size + quantity are shared by the hero and the sticky bar (variation id / price follow the size once WooCommerce is live)
  const [size, setSize] = useState(defaultSize(p) ?? "");
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const add = () => addToCart(p.slug, size, qty);
  const buyable = p.sizes.length > 0;

  // the compact bar appears once the hero's Add to Cart has gone off the top of the screen
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !buyable) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-60px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [buyable]);

  // subtle reveals as sections arrive
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const once = (trigger: Element, start = "top 82%") => ({ trigger, start, once: true });
      q(".pdp-statement, .pdp-recipes-sec, .pdp-related").forEach((sec) => {
        gsap.fromTo(sec.querySelectorAll(".line-inner"), { yPercent: 120 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: once(sec) });
      });
      q(".pdp-summary, .pdp-point, .pdp-dish, .pdp-related .shop-cell, .pdp-row").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: once(el, "top 90%") });
      });
      const how = q(".pdp-how")[0];
      if (how) {
        const tl = gsap.timeline({ scrollTrigger: once(how, "top 75%") });
        tl.fromTo(how.querySelector(".pdp-how-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0);
        tl.fromTo(how.querySelectorAll(".pdp-how-n"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.15);
        tl.fromTo(how.querySelectorAll(".pdp-how-w"), { yPercent: 120 }, { yPercent: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.3);
        tl.fromTo(how.querySelectorAll(".pdp-how-t"), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.12 }, 0.55);
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className={`pdp-page${buyable ? " has-bar" : ""}`} style={{ "--tint": p.tint, "--hero-tint": content?.heroTint ?? p.tint } as CSSProperties}>
      <LightHeader />
      <ProductHero ref={buyRef} product={p} hero={hero} back={content?.backImage} size={size} setSize={setSize} qty={qty} setQty={setQty} onAdd={add} />

      {content && (
        <section className="pdp-statement" aria-label="About this product">
          <p className="display pdp-big">
            <Line>{content.statement[0]}</Line>
            <Line className="pdp-accent">{content.statement[1]}</Line>
          </p>
          <p className="pdp-summary">{content.summary}</p>
          {content.points.length > 0 && (
            <ul className="pdp-points">
              {content.points.slice(0, 3).map((pt) => (
                <li key={pt.title} className="pdp-point">
                  <h2 className="display">{pt.title}</h2>
                  <p>{pt.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {content?.howToUse && <HowToUse howTo={content.howToUse} />}
      {details.length > 0 && <ProductDetails rows={details} />}
      {recipes.length > 0 && <RecipeInspiration recipes={recipes} moreDishes={content?.moreDishes} />}

      {related.length > 0 && (
        <section className="pdp-related" aria-labelledby="pdp-rel-title">
          <h2 id="pdp-rel-title" className="display pdp-sec-h pdp-big">
            <Line>You may</Line>
            <Line className="pdp-accent">also like.</Line>
          </h2>
          <div className={`shop-grid${related.length === 1 ? " is-single" : related.length === 2 ? " is-pair" : ""}`} style={{ "--n": related.length, "--md": related.length } as CSSProperties}>
            {related.map((o) => <div key={o.slug} className="shop-cell"><ShopProduct product={o} /></div>)}
          </div>
        </section>
      )}

      {buyable && <StickyBuyBar product={p} visible={barVisible} size={size} setSize={setSize} qty={qty} setQty={setQty} onAdd={add} />}
    </div>
  );
}
