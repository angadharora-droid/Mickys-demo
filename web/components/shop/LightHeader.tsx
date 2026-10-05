"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lightSection } from "@/lib/headerTheme";

/** Cream pages: the header stays maroon, on a cream backing so content never runs under it. */
export default function LightHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return lightSection(document.body, "top top+=100", "bottom top");
  }, []);
  // the backing only appears once something can scroll under the header (keeps hero tints seamless)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div className={`shop-headbg${scrolled ? " is-on" : ""}`} aria-hidden="true" />;
}
