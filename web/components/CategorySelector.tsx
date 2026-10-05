import type { Category, CategoryId } from "@/data/products";
import { Line } from "./ScrollCopy";

type Props = {
  categories: Category[];
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
};

/**
 * The category names are the design: the active one is large, the rest stay quiet.
 * Every item keeps the same element structure; only its size and colour change,
 * so the switch from one category to the next reads as one continuous move.
 */
export default function CategorySelector({ categories, active, onSelect }: Props) {
  return (
    <nav aria-label="Product categories" className="range-categories">
      <ul className="m-0 flex list-none flex-col items-start gap-[0.15em] p-0">
        {categories.map((c) => {
          const isActive = c.id === active;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                disabled={!c.available}
                aria-current={isActive ? "true" : undefined}
                className={`range-cat display block cursor-pointer text-left transition-[font-size,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-default ${
                  isActive
                    ? "text-[length:min(var(--cat-lg),calc(var(--cat-budget)/var(--cat-em,1)))] text-maroon"
                    : "text-[length:var(--cat-sm)] text-maroon/30 hover:text-maroon/60"
                }`}
              >
                <Line>{c.label}</Line>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
