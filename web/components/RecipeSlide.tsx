import Image from "next/image";
import type { Recipe } from "@/data/recipes";
import RecipeInfo from "./RecipeInfo";

type Props = { recipe: Recipe; index: number; total: number; onView: (r: Recipe) => void };

// One dish: a large photo, the pouch it was made with, and its name.
export default function RecipeSlide({ recipe: r, index, total, onView }: Props) {
  return (
    <article className={`rs-slide rs-slide-${index}`} aria-label={`${r.name}, made with Micky's ${r.productName}`}>
      <figure className="rs-img">
        {/* only the first dish is preloaded; it is also the section's opening image */}
        <Image src={r.image} alt={r.imageAlt} fill sizes="100vw" priority={index === 0} className="object-cover" />
      </figure>
      <span className="rs-pouch" aria-hidden="true">
        <Image src={r.pouch} alt="" fill sizes="(min-width: 1024px) 10vw, 28vw" className="object-contain" />
      </span>
      <RecipeInfo recipe={r} index={index} total={total} onView={onView} />
    </article>
  );
}
