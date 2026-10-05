import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import LightHeader from "@/components/shop/LightHeader";
import { orderStore } from "@/lib/server/orders";

export const metadata: Metadata = { title: "Order confirmation | Micky's", robots: { index: false } };

// Reads the order status from OUR server record (set only after verified signature/webhook),
// never from anything the browser says.
export default async function CheckoutSuccess({ searchParams }: PageProps<"/checkout/success">) {
  const { ref } = await searchParams;
  const id = typeof ref === "string" && /^MK-[A-Z0-9-]{6,30}$/.test(ref) ? ref : null;
  const order = id ? await orderStore()?.get(id) : null;
  const paid = order?.status === "paid";

  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <div className="chk chk-success">
          <LightHeader />
          {paid ? (
            <>
              <h1 className="display chk-title">Thank you.<br /><span className="pdp-accent">Payment received.</span></h1>
              <p className="chk-note">Your payment has been confirmed. Please keep your order reference for any questions.</p>
              {order.mode === "test" && <p className="chk-banner is-test" role="note"><b>Test mode.</b> This was a test payment. No real money was charged.</p>}
            </>
          ) : order ? (
            <>
              <h1 className="display chk-title">We&apos;re confirming<br />your payment.</h1>
              <p className="chk-note">This can take a moment. Please don&apos;t pay again: if your payment went through, it will be confirmed automatically.</p>
            </>
          ) : (
            <h1 className="display chk-title">Order not found.</h1>
          )}
          {id && order && <p className="chk-ref">Order reference: {id}</p>}
          <p><Link href="/shop" className="cart-checkout">Continue shopping</Link></p>
        </div>
      </main>
    </>
  );
}
