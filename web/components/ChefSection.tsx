"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ChefStatement from "./ChefStatement";
import { Line } from "./ScrollCopy";
import { lightSection } from "@/lib/headerTheme";

// Placeholder photography: replace these files with the final shoot (4:5 crops work best).
const DISHES = [
  { src: "/images/module4/dish-01.webp", alt: "Paneer makhani finished with fresh coriander" },
  { src: "/images/module4/dish-02.webp", alt: "Kadhai paneer in a steel kadhai" },
  { src: "/images/module4/dish-03.webp", alt: "Aloo gobi matar on a red platter" },
];

const STATEMENTS = [
  { first: "Less prep.", second: "More control." },
  { first: "Consistent base.", second: "Your finish." },
  { first: "Faster execution.", second: "Same creative freedom." },
];

// Desktop: one pinned spread. Timeline positions are fractions of the pinned scroll.
const PIN_LENGTH = "+=200%"; // 300vh in total
const T = {
  wipe: [0, 0.2], // gravy colour drains away
  headline: 0.2, // YOU'RE / STILL / THE CHEF. reveal
  mark: 0.36, // yellow band behind CHEF.
  photo: 0.46, // first dish + supporting copy
  support: 0.54,
  headlineOut: 0.66,
  statements: [0.7, 0.8, 0.9], // one after another; the photo changes with each
};

export default function ChefSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(section);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: PIN_LENGTH, pin: true, scrub: 0.4, invalidateOnRefresh: true },
      });
      // Gravy drains upward with a soft liquid edge.
      tl.fromTo(q(".chef-wipe"), { clipPath: "ellipse(160% 140% at 50% 0%)" }, { clipPath: "ellipse(160% 0% at 50% 0%)", duration: T.wipe[1] - T.wipe[0], ease: "power2.inOut" }, T.wipe[0]);
      tl.fromTo(q(".chef-headline .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 0.09, stagger: 0.025, ease: "power3.out" }, T.headline);
      tl.fromTo(q(".chef-mark"), { scaleX: 0 }, { scaleX: 1, duration: 0.06, ease: "power2.out" }, T.mark);
      // Photo: masked reveal from the bottom, settling from a slight scale.
      tl.fromTo(q(".chef-photo"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.1, ease: "power3.out" }, T.photo);
      tl.fromTo(q(".chef-dish-0 .chef-img"), { scale: 1.08 }, { scale: 1, duration: 0.24, ease: "power1.out" }, T.photo);
      tl.fromTo(q(".chef-photo-inner"), { yPercent: 4 }, { yPercent: -4, duration: 1 - T.photo }, T.photo); // subtle parallax
      tl.fromTo(q(".chef-support .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 0.07, stagger: 0.02, ease: "power3.out" }, T.support);
      // Headline makes way for the three statements.
      tl.to(q(".chef-headline .line-inner"), { yPercent: -125, duration: 0.05, stagger: 0.015, ease: "power2.in" }, T.headlineOut);
      tl.to(q(".chef-mark"), { scaleX: 0, transformOrigin: "right center", duration: 0.04, ease: "power2.in" }, T.headlineOut + 0.02);
      T.statements.forEach((at, i) => {
        tl.fromTo(q(`[data-statement="${i}"] .line-inner`), { yPercent: 125 }, { yPercent: 0, duration: 0.06, stagger: 0.015, ease: "power3.out" }, at);
        tl.fromTo(q(`[data-statement="${i}"]`), { borderColor: "rgba(111,14,19,0)" }, { borderColor: "rgba(111,14,19,0.2)", duration: 0.04 }, at);
        if (i > 0) {
          tl.to(q(`[data-statement="${i - 1}"]`), { opacity: 0.28, duration: 0.05 }, at);
          // next dish wipes up over the previous one
          tl.fromTo(q(`.chef-dish-${i}`), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.07, ease: "power3.inOut" }, at);
          tl.fromTo(q(`.chef-dish-${i} .chef-img`), { scale: 1.08 }, { scale: 1, duration: 0.12, ease: "power1.out" }, at);
        }
      });
      tl.set({}, {}, 1);
    });

    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 1023px)", () => {
      // First screen pins while the gravy drains and the headline arrives; the rest flows.
      const intro = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=80%", pin: true, scrub: 0.4 },
      });
      intro.fromTo(q(".chef-wipe"), { clipPath: "ellipse(160% 140% at 50% 0%)" }, { clipPath: "ellipse(160% 0% at 50% 0%)", duration: 0.55, ease: "power2.inOut" }, 0);
      intro.fromTo(q(".chef-headline .line-inner"), { yPercent: 125 }, { yPercent: 0, duration: 0.3, stagger: 0.08, ease: "power3.out" }, 0.45);
      intro.fromTo(q(".chef-mark"), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, 0.8);
      intro.set({}, {}, 1);
      const reveal = (target: string, trigger: string, extra: gsap.TweenVars = {}) =>
        gsap.fromTo(q(target), { yPercent: 125 }, {
          yPercent: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", ...extra,
          scrollTrigger: { trigger: q(trigger)[0], start: "top 85%", toggleActions: "play none none reverse" },
        });
      gsap.fromTo(q(".chef-photo"), { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: q(".chef-photo")[0], start: "top 85%", toggleActions: "play none none reverse" },
      });
      gsap.fromTo(q(".chef-dish-0 .chef-img"), { scale: 1.08 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: q(".chef-photo")[0], start: "top bottom", end: "bottom top", scrub: true },
      });
      reveal(".chef-support .line-inner", ".chef-support");
      STATEMENTS.forEach((_, i) => reveal(`[data-statement="${i}"] .line-inner`, `[data-statement="${i}"]`));
    });

    // Maroon navigation while the cream section is under it. Measured on the pin wrapper
    // (section + its pinned scroll) once the pins above exist.
    const range = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
    const releaseHeader = lightSection(range, "top top-=30%", "bottom top+=40"); // once the gravy has drained off the cream

    return () => {
      releaseHeader();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why"
      aria-labelledby="chef-heading"
      className="chef relative overflow-hidden bg-cream text-maroon lg:h-svh"
    >
      <div className="chef-stage relative mx-auto grid max-w-[1600px] gap-y-16 px-4 pb-28 pt-[max(96px,14vh)] sm:px-8 lg:h-full lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-rows-1 lg:gap-x-[4vw] lg:px-12 lg:pb-[7vh] lg:pt-[max(92px,13vh)]">
        {/* Headline. On desktop it shares the left column with the statements (it leaves before they arrive). */}
        <h2
          id="chef-heading"
          className="chef-headline display m-0 flex min-h-[calc(100svh-max(96px,14vh)-40px)] flex-col text-[length:min(27vw,17vh)] text-maroon lg:col-start-1 lg:row-start-1 lg:min-h-0 lg:self-start lg:text-[length:min(12.5vw,23vh)]"
        >
          <Line>You&apos;re</Line>
          <Line>Still</Line>
          <span className="line-mask">
            <span className="line-inner">
              The{" "}
              <span className="relative inline-block">
                <span aria-hidden="true" className="chef-mark absolute inset-x-[-0.06em] bottom-[0.06em] top-[0.18em] origin-left bg-yellow" />
                <span className="relative">Chef.</span>
              </span>
            </span>
          </span>
        </h2>

        {/* Photography + short supporting copy (right column on desktop, under the headline on phones) */}
        <div className="chef-right flex flex-col gap-6 lg:col-start-2 lg:row-start-1 lg:min-h-0 lg:justify-end">
          <figure className="chef-photo relative m-0 aspect-[4/5] w-full overflow-hidden rounded-[4px] bg-maroon/10 lg:ml-auto lg:h-[min(64vh,48vw)] lg:w-auto">
            <div className="chef-photo-inner absolute inset-[-5%]">
              {DISHES.map((d, i) => (
                <div key={d.src} className={`chef-dish chef-dish-${i} absolute inset-0 ${i > 0 ? "[clip-path:inset(100%_0%_0%_0%)]" : ""}`}>
                  <Image
                    src={d.src}
                    alt={i === 0 ? d.alt : ""}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="chef-img object-cover"
                  />
                </div>
              ))}
            </div>
          </figure>
          <p className="chef-support m-0 max-w-[34ch] text-[17px] leading-[1.5] text-maroon/85 lg:ml-auto lg:text-[18px]">
            <Line>Micky&apos;s handles the time-consuming prep.</Line>
            <Line>You control the seasoning, finishing</Line>
            <Line>and final plate.</Line>
          </p>
        </div>

        {/* Three editorial statements */}
        <ol className="chef-statements m-0 grid list-none gap-[0.55em] p-0 text-[length:min(13vw,8.5vh)] lg:col-start-1 lg:row-start-1 lg:self-end lg:text-[length:min(4.6vw,8vh)]">
          {STATEMENTS.map((s, i) => (
            <ChefStatement key={s.first} index={i} first={s.first} second={s.second} />
          ))}
        </ol>
      </div>

      {/* Same gravy colour the hero ends on; drains away to reveal the section */}
      <div aria-hidden="true" className="chef-wipe pointer-events-none absolute inset-x-0 top-0 z-30 h-svh bg-gravy" />
    </section>
  );
}
