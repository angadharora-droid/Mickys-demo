import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { recipeUrl } from "@/lib/recipes";

export type CardSize = "full" | "wide" | "narrow" | "third";

const SIZES: Record<CardSize, string> = {
  full: "(min-width: 1024px) 92vw, 100vw",
  wide: "(min-width: 1024px) 56vw, 100vw",
  narrow: "(min-width: 1024px) 40vw, 100vw",
  third: "(min-width: 1024px) 31vw, 100vw",
};

/** One dish: the photo leads; product used, name and a single action follow. */
export default function RecipeCard({ recipe: r, size, priority, style }: { recipe: Recipe; size: CardSize; priority?: boolean; style?: CSSProperties }) {
  const times = [r.prepTime && `Prep ${r.prepTime}`, r.cookTime && `Cook ${r.cookTime}`].filter(Boolean).join(" · ");
  return (
    <article className={`rcp-card is-${size}${size === "full" && r.photoMissing ? " is-band" : ""} rcp-reveal`} style={{ ...style, "--tint": r.tint } as CSSProperties}>
      <Link href={recipeUrl(r)} className="rcp-card-link">
        <span className={`rcp-card-img${r.photoMissing ? " is-pack" : ""}`}>
          {r.photoMissing ? (
            <Image src={r.pouch} alt="" width={400} height={560} sizes="30vw" className="rcp-card-pouch" />
          ) : (
            <Image src={r.thumbnail} alt={r.imageAlt} fill sizes={SIZES[size]} priority={priority} className="object-cover" />
          )}
        </span>
        <span className="display rcp-card-name">{r.name}</span>
        <span className="rcp-card-made">Made with Micky&apos;s {r.productName}</span>
        {times && <span className="rcp-card-meta">{times}</span>}
        <span className="rcp-card-cta">View recipe <span aria-hidden="true">→</span></span>
      </Link>
    </article>
  );
}
