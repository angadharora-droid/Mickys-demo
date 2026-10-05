import Image from "next/image";
import type { Product } from "@/data/products";

export type Layout = "desktop" | "mobile";

type Pose = { x: number; y: number; s: number; o: number; r: number };

// Pose by position relative to the active pack (r = index - active).
// x: centre as a share of stage width, y: offset as a share of pack height.
const DESKTOP: Record<number, Pose> = {
  [-2]: { x: 0.34, y: 0.06, s: 0.42, o: 0, r: -8 },
  [-1]: { x: 0.47, y: 0.05, s: 0.58, o: 0.4, r: -5 },
  0: { x: 0.665, y: 0, s: 1, o: 1, r: 0 },
  1: { x: 0.86, y: 0.05, s: 0.6, o: 0.6, r: 4 },
  2: { x: 0.98, y: 0.07, s: 0.47, o: 0.32, r: 7 },
  3: { x: 1.1, y: 0.08, s: 0.4, o: 0, r: 9 },
};
const MOBILE: Record<number, Pose> = {
  [-2]: { x: -0.25, y: 0.05, s: 0.5, o: 0, r: -6 },
  [-1]: { x: 0.04, y: 0.05, s: 0.6, o: 0.35, r: -4 },
  0: { x: 0.5, y: 0, s: 1, o: 1, r: 0 },
  1: { x: 0.96, y: 0.05, s: 0.6, o: 0.35, r: 4 },
  2: { x: 1.25, y: 0.05, s: 0.5, o: 0, r: 6 },
  3: { x: 1.4, y: 0.05, s: 0.45, o: 0, r: 7 },
};
// Lineup at the end of a category: every pack at equal size in a row (right of the copy).
export const LINEUP_SPAN = [0.47, 0.89];
const LINEUP_R = [-3, 2, -2, 3, -1, 2];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function mix(a: Pose, b: Pose, t: number): Pose {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), o: lerp(a.o, b.o, t), r: lerp(a.r, b.r, t) };
}

export function poseFor(index: number, active: number, lineup: number, layout: Layout, count: number, lineupScale = 0.66): Pose {
  const table = layout === "desktop" ? DESKTOP : MOBILE;
  const rel = Math.min(Math.max(index - active, -2), 3);
  const lo = Math.floor(rel);
  const base = mix(table[lo], table[Math.min(lo + 1, 3)], rel - lo);
  if (lineup <= 0 || layout === "mobile") return base;
  const [a, b] = LINEUP_SPAN;
  const x = count > 1 ? a + ((b - a) * index) / (count - 1) : (a + b) / 2;
  const line: Pose = { x, y: 0.02, s: lineupScale, o: 1, r: LINEUP_R[index] ?? 0 };
  return mix(base, line, lineup);
}

type Props = { products: Product[] };

/** Transparent pack renders; their transforms are driven by ProductRange. */
export default function ProductStage({ products }: Props) {
  return (
    <div className="range-stage pointer-events-none absolute inset-0" aria-hidden="true">
      {products.map((p, i) => (
        <div
          key={p.slug}
          data-pack={i}
          className="range-pack absolute left-0 top-[var(--pack-top)] h-[var(--pack-h)] will-change-transform"
          style={{ aspectRatio: `${p.imageWidth} / ${p.imageHeight}`, opacity: 0 }}
        >
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 70vw"
            className="object-contain drop-shadow-[0_24px_30px_rgba(60,12,10,0.22)]"
          />
        </div>
      ))}
    </div>
  );
}
