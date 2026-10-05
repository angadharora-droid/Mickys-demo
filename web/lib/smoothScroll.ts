import type Lenis from "lenis";

// The site-wide Lenis instance (set by SmoothScroll), for programmatic scrolling.
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

/** Smoothly scroll the page to a y position (no anchor jumps). */
export function scrollToY(y: number, duration = 1.4) {
  if (instance) instance.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** Pause smooth scrolling while a modal is open. */
export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
}
