import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sections register the scroll range where they sit under the header.
// The header is maroon when a light (cream) section is under it. When ranges overlap
// (a module lying over the end of the previous one for a seamless hand-off), the range
// that starts latest wins, so the incoming module always decides the header colour.
const light = new Set<ScrollTrigger>();
const dark = new Set<ScrollTrigger>();

function sync() {
  const header = document.getElementById("site-header");
  const latest = (set: Set<ScrollTrigger>) => Math.max(-Infinity, ...[...set].filter((t) => t.isActive).map((t) => t.start));
  const l = latest(light), d = latest(dark);
  const onLight = l > -Infinity && l > d;
  header?.classList.toggle("on-light", onLight);
}

function register(set: Set<ScrollTrigger>, trigger: Element, start: string, end: string) {
  const st = ScrollTrigger.create({
    trigger,
    start,
    end,
    onToggle: (self) => {
      if (self.isActive) set.add(self);
      else set.delete(self);
      sync();
    },
  });
  return () => {
    set.delete(st);
    st.kill();
    sync();
  };
}

export const lightSection = (trigger: Element, start: string, end: string) => register(light, trigger, start, end);
export const darkSection = (trigger: Element, start: string, end: string) => register(dark, trigger, start, end);
