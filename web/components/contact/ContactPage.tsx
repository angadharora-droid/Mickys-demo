"use client";

import { useId, useState } from "react";
import { CONTACT_COPY, CONTACT_HERO, FAQ, PATHS } from "@/data/contact";
import type { Topic } from "@/lib/contact";
import { scrollToY } from "@/lib/smoothScroll";
import { Line } from "../ScrollCopy";
import LightHeader from "../shop/LightHeader";
import ContactChannels from "./ContactChannels";
import ContactForm, { type TopicPreset } from "./ContactForm";

const dev = process.env.NODE_ENV !== "production";

export default function ContactPage() {
  const [preset, setPreset] = useState<TopicPreset>({ topic: "Product Question", n: 0 });
  const [active, setActive] = useState<Topic | null>(null);
  const faqId = useId();
  const faqs = FAQ.filter((f) => f.status === "verified" || dev);

  const choose = (topic: Topic) => {
    setActive(topic);
    setPreset((p) => ({ topic, n: p.n + 1 }));
    const form = document.getElementById("contact-form");
    if (!form) return;
    // phones: bring the form into view; desktop: it's already beside the paths
    if (window.innerWidth < 1024) scrollToY(form.getBoundingClientRect().top + window.scrollY - 90, 0.9);
    setTimeout(() => form.querySelector<HTMLElement>("select, input")?.focus({ preventScroll: true }), 450);
  };

  return (
    <div className="ct">
      <LightHeader />
      <section className="ct-hero" aria-labelledby="ct-h">
        <h1 id="ct-h" className="display ct-hero-h" aria-label={CONTACT_HERO.headline.join(" ")}>
          <Line>{CONTACT_HERO.headline[0]}</Line>
          <Line className="ct-accent">{CONTACT_HERO.headline[1]}</Line>
        </h1>
        <p className="ct-hero-sub">{CONTACT_HERO.support.map((l) => <span key={l}>{l} </span>)}</p>
      </section>

      <nav className="ct-paths" aria-label="What can we help with?">
        {PATHS.map((p) => (
          <button key={p.topic} type="button" className={`ct-path${active === p.topic ? " is-on" : ""}`} onClick={() => choose(p.topic)}>
            <span className="display ct-path-t">{p.title}</span>
            <span className="ct-path-x">{p.text}</span>
            <span className="ct-path-go" aria-hidden="true">→</span>
          </button>
        ))}
      </nav>

      <div className="ct-main">
        <section className="ct-form-col" aria-label="Send us a message">
          <ContactForm preset={preset} />
        </section>
        <section className="ct-info" aria-labelledby="ct-info-h">
          <h2 id="ct-info-h" className="ct-eyebrow">Contact details</h2>
          <p className="ct-intro">{CONTACT_COPY.detailsIntro}</p>
          <ContactChannels />
        </section>
      </div>

      {faqs.length > 0 && (
        <section className="ct-faq" aria-labelledby={`${faqId}-h`}>
          <h2 id={`${faqId}-h`} className="display ct-faq-h">Good to know</h2>
          <div className="ct-faq-list">
            {faqs.map((f) => (
              <details key={f.q} className={`ct-q${f.status !== "verified" ? " is-pending" : ""}`} data-source={f.source}>
                <summary><span>{f.q}</span><span className="ct-q-icon" aria-hidden="true" /></summary>
                <p>{f.a ?? `Pending · hidden on live site (${f.source}).`}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
