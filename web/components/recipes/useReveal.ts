"use client";

import { useEffect, type RefObject } from "react";

/** Adds .is-in to .rcp-reveal elements as they enter the viewport (image reveal handled in CSS). */
export function useReveal(root: RefObject<HTMLElement | null>, key?: unknown) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = [...el.querySelectorAll<HTMLElement>(".rcp-reveal:not(.is-in)")];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [root, key]);
}
