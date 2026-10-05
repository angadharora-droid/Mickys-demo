import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { productUrl } from "@/lib/products";

const FEATURED = PRODUCTS.filter((p) => p.category === "gravies").slice(0, 3);

/** Empty cart: a friendly line, one clear way back, three gravies to start with. */
export default function CartEmpty({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="cart-empty">
      <p className="display cart-empty-h">Your cart<br /><span>is empty.</span></p>
      <p className="cart-empty-t">Looks like your kitchen needs something.</p>
      <Link href="/shop" className="cart-checkout cart-empty-cta" onClick={onNavigate}>Shop Micky&apos;s</Link>
      <ul className="cart-empty-list" aria-label="Start with a gravy">
        {FEATURED.map((p) => (
          <li key={p.slug}>
            <Link href={productUrl(p)} className="cart-empty-item" onClick={onNavigate} style={{ ["--tint" as string]: p.tint }}>
              <span className="cart-empty-img"><Image src={p.image} alt="" width={p.imageWidth} height={p.imageHeight} sizes="90px" /></span>
              <span className="display">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
