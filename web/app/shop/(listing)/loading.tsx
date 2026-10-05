import Header from "@/components/Header";
import { ProductSkeleton } from "@/components/shop/ProductGrid";

// Shown while the catalogue loads (once it comes from WooCommerce).
export default function ShopLoading() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="shop">
          <div className="shop-list"><ProductSkeleton count={3} /></div>
        </div>
      </main>
    </>
  );
}
