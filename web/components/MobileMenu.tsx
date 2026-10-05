"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartCount, openCart, useCart } from "@/lib/cart";
import { lockScroll } from "@/lib/smoothScroll";
import { B2B_LINK, NAV } from "@/data/nav";

const LINKS = [...NAV, B2B_LINK];

/**
 * Phones and tablets (below 1024 px): full-screen menu in a native modal <dialog>, which gives
 * the focus trap, Escape to close and an inert page behind it. Page scroll is locked while open.
 */
export default function MobileMenu() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const n = cartCount(useCart());

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lockScroll(true);
      document.documentElement.classList.add("menu-open");
    }
    if (!open && d.open) d.close();
  }, [open]);

  // however it closes (button, Escape, link, cart), unlock the page
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      lockScroll(false);
      document.documentElement.classList.remove("menu-open");
      setOpen(false);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  // a new page closes the menu
  useEffect(() => { ref.current?.close(); }, [path]);

  // never left open when the window grows into the desktop layout
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => { if (mq.matches) ref.current?.close(); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const toCart = () => {
    ref.current?.close();
    openCart();
  };

  return (
    <>
      <button type="button" className="cursor-pointer uppercase lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Menu
      </button>

      <dialog ref={ref} id="mobile-menu" className="mmenu" aria-label="Menu" data-lenis-prevent>
        <div className="mmenu-in" tabIndex={-1} autoFocus>
          <div className="mmenu-top">
            <Link href="/" className="display mmenu-logo" onClick={() => ref.current?.close()}>Micky&apos;s</Link>
            <button type="button" className="mmenu-close" onClick={() => ref.current?.close()} aria-label="Close menu">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav aria-label="Main" className="mmenu-nav">
            <ul>
              {LINKS.map((item, i) => {
                const active = item.href === path || path.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} style={{ ["--i" as string]: i }}>
                    <Link href={item.href} className={`display mmenu-link${active ? " is-on" : ""}`} aria-current={active ? "page" : undefined} onClick={() => ref.current?.close()}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li style={{ ["--i" as string]: LINKS.length }}>
                <button type="button" className="display mmenu-link mmenu-cart" onClick={toCart} aria-label={`Cart, ${n} ${n === 1 ? "item" : "items"}`}>
                  Cart <span className="mmenu-count tabular-nums">{n}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
