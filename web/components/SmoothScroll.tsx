"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/smoothScroll";

// One smooth-scroll instance for the whole site, driven by GSAP's ticker
// so Lenis and ScrollTrigger share a single requestAnimationFrame loop.
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile address-bar show/hide should not re-measure every trigger.
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    setLenis(lenis);

    const tick = (time: number) => lenis.raf(time * 1000); // GSAP time is in seconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
