import type { Product } from "@/data/products";
import { formatPrice, priceFor } from "@/lib/products";

/** MRP for the chosen size. Renders nothing while a price is unknown (never guessed). */
export default function Price({ product, size }: { product: Product; size?: string | null }) {
  const price = formatPrice(priceFor(product, size));
  if (!price) return null;
  return (
    <p className="shop-price">
      {price} <span className="shop-price-note">MRP incl. of all taxes</span>
    </p>
  );
}
