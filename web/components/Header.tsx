import Link from "next/link";
import CartButton from "./cart/CartButton";
import CartDrawer from "./cart/CartDrawer";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";


export default function Header() {
  return (
    <header id="site-header" className="site-header fixed inset-x-0 top-0 z-50 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 sm:px-8 lg:px-12">
      <nav
        aria-label="Main"
        className="grid grid-cols-[1fr_auto] items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.14em] lg:grid-cols-[1fr_auto_1fr]"
      >
        <Link href="/" className="display text-[28px] leading-none tracking-[0.02em] text-yellow">
          Micky&apos;s
        </Link>

        <NavLinks />

        <div className="flex items-center justify-end gap-6">
          <Link href="/b2b" className="hidden opacity-85 hover:text-yellow hover:opacity-100 lg:inline">
            B2B
          </Link>
          <MobileMenu />
          <CartButton />
        </div>
      </nav>
      <CartDrawer />
    </header>
  );
}
