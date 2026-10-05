import type { Recipe } from "@/data/recipes";
import { Line } from "./ScrollCopy";

type Props = { recipe: Recipe; index: number; total: number; onView: (r: Recipe) => void };

const pad = (n: number) => String(n).padStart(2, "0");

export default function RecipeInfo({ recipe: r, index, total, onView }: Props) {
  return (
    <div className="rs-info">
      <p className="rs-count">{pad(index + 1)} <span>/ {pad(total)}</span></p>
      <p className="rs-made-t">
        <Line>Made with</Line>
        <Line className="rs-made-p">Micky&apos;s {r.productName}</Line>
      </p>
      <h3 className="display rs-name">
        {r.name.split(" ").map((w) => <Line key={w}>{w}</Line>)}
      </h3>
      <button type="button" className="rs-view" onClick={() => onView(r)} aria-haspopup="dialog">
        View recipe <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
