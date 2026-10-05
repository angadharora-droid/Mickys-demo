"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CONTACT, CONTACT_COPY } from "@/data/contact";
import { BUSINESS_TYPES } from "@/lib/b2b";
import { CONTACT_LIMITS as L, EMPTY_MESSAGE, TOPICS, validateContact, type ContactErrors, type ContactMessage, type Topic } from "@/lib/contact";

export type TopicPreset = { topic: Topic; n: number };
type Status = "idle" | "sending" | "done" | "error";

const SERVER_ERRORS: Record<string, string> = {
  rate_limited: "You've sent a few messages already. Please try again in a few minutes, or call us.",
  unavailable: "Online messages aren't switched on yet. Please call or email us.",
  failed: "We couldn't send your message just now. Please try again, or call or email us.",
  network: "We couldn't reach our server. Please check your connection and try again.",
};

/** Short contact form: extra fields appear only for Order Support and B2B. Validated here and on the server. */
export default function ContactForm({ preset }: { preset: TopicPreset }) {
  const id = useId();
  const [v, setV] = useState<ContactMessage>(EMPTY_MESSAGE);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactMessage, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  // one of the three paths above chose the topic (state adjusted during render, no effect)
  const [seen, setSeen] = useState(preset.n);
  if (preset.n !== seen) {
    setSeen(preset.n);
    setV((s) => ({ ...s, topic: preset.topic }));
    if (status === "done") setStatus("idle");
  }

  useEffect(() => { if (status === "done") doneRef.current?.focus(); }, [status]);

  const set = (k: keyof ContactMessage, value: string) => {
    const next = { ...v, [k]: value } as ContactMessage;
    setV(next);
    if (touched[k] || errors[k]) setErrors((e) => ({ ...e, [k]: validateContact(next).errors[k] }));
  };
  const blur = (k: keyof ContactMessage) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validateContact(v).errors[k] }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const { errors: found } = validateContact(v);
    setErrors(found);
    setServerError("");
    // focus the first invalid field in on-screen order
    const first = [...(formRef.current?.querySelectorAll<HTMLElement>("[name]") ?? [])].find((el) => (el as HTMLInputElement).name in found);
    if (first) { first.focus(); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, website: honeypot.current?.value ?? "" }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setStatus("done"); return; }
      if (data.fields) setErrors(data.fields);
      setServerError(SERVER_ERRORS[data.error] ?? (data.fields ? "Please check the highlighted fields." : SERVER_ERRORS.failed));
      setStatus("error");
    } catch {
      setServerError(SERVER_ERRORS.network);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="ct-done" role="status">
        <p className="ct-eyebrow">{CONTACT_COPY.success.eyebrow}</p>
        <h2 ref={doneRef} tabIndex={-1} className="display ct-done-h">
          <span>{CONTACT_COPY.success.headline[0]}</span>
          <span className="ct-accent">{CONTACT_COPY.success.headline[1]}</span>
        </h2>
        <button type="button" className="b2b-link" onClick={() => { setV({ ...EMPTY_MESSAGE, topic: v.topic }); setErrors({}); setTouched({}); setStatus("idle"); }}>
          Send another message
        </button>
      </div>
    );
  }

  const field = (k: keyof ContactMessage) => ({
    id: `${id}-${k}`, name: k, value: v[k],
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
    onBlur: () => blur(k),
  });
  const err = (k: keyof ContactMessage) => errors[k] && <p id={`${id}-${k}-err`} className="b2b-err">{errors[k]}</p>;
  const req = <span className="b2b-req" aria-hidden="true">*</span>;
  const opt = <span className="b2b-opt">(optional)</span>;

  return (
    <form ref={formRef} id="contact-form" className="b2b-form ct-form" noValidate onSubmit={submit} aria-busy={status === "sending"}>
      <div className="b2b-fields">
        <div className="b2b-field is-wide">
          <label htmlFor={`${id}-topic`} className="b2b-label">I&apos;m contacting about</label>
          <select {...field("topic")} onChange={(e) => set("topic", e.target.value)}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {v.topic === "Order Support" && (
          <div className="b2b-field is-wide ct-extra">
            <label htmlFor={`${id}-orderNumber`} className="b2b-label">Order number {opt}</label>
            <input {...field("orderNumber")} maxLength={L.orderNumber} autoComplete="off" placeholder="If you have it" onChange={(e) => set("orderNumber", e.target.value)} />
            {err("orderNumber")}
          </div>
        )}

        {v.topic === "B2B" && (
          <>
            <div className="b2b-field ct-extra">
              <label htmlFor={`${id}-business`} className="b2b-label">Business name {req}</label>
              <input {...field("business")} autoComplete="organization" maxLength={L.business} onChange={(e) => set("business", e.target.value)} />
              {err("business")}
            </div>
            <div className="b2b-field ct-extra">
              <label htmlFor={`${id}-city`} className="b2b-label">City {req}</label>
              <input {...field("city")} autoComplete="address-level2" maxLength={L.city} onChange={(e) => set("city", e.target.value)} />
              {err("city")}
            </div>
            <div className="b2b-field is-wide ct-extra">
              <label htmlFor={`${id}-type`} className="b2b-label">Type of business {req}</label>
              <select {...field("type")} onChange={(e) => set("type", e.target.value)} className={v.type ? "" : "is-empty"}>
                <option value="" disabled>Choose one</option>
                {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {err("type")}
            </div>
            <p className="ct-b2b-note is-wide ct-extra">{CONTACT_COPY.b2bLink} <Link href="/b2b#enquiry">→</Link></p>
          </>
        )}

        <div className="b2b-field">
          <label htmlFor={`${id}-name`} className="b2b-label">Name {req}</label>
          <input {...field("name")} autoComplete="name" maxLength={L.name} onChange={(e) => set("name", e.target.value)} />
          {err("name")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-email`} className="b2b-label">Email {req}</label>
          <input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={L.email} onChange={(e) => set("email", e.target.value)} />
          {err("email")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-mobile`} className="b2b-label">Mobile {opt}</label>
          <input {...field("mobile")} type="tel" inputMode="tel" autoComplete="tel" maxLength={L.mobile} placeholder="10-digit mobile" onChange={(e) => set("mobile", e.target.value)} />
          {err("mobile")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-subject`} className="b2b-label">Subject {req}</label>
          <input {...field("subject")} maxLength={L.subject} onChange={(e) => set("subject", e.target.value)} />
          {err("subject")}
        </div>
        <div className="b2b-field is-wide">
          <label htmlFor={`${id}-message`} className="b2b-label">Message {req}</label>
          <textarea {...field("message")} rows={5} maxLength={L.message} onChange={(e) => set("message", e.target.value)} />
          {err("message")}
        </div>
      </div>

      <div className="b2b-hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input ref={honeypot} id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {serverError && (
        <p className="b2b-server-err" role="alert">
          {serverError}{" "}
          {CONTACT.phone.value && <a href={`tel:${CONTACT.phone.value.replace(/\s/g, "")}`}>{CONTACT.phone.value}</a>}
          {CONTACT.email.value && <> · <a href={`mailto:${CONTACT.email.value}`}>{CONTACT.email.value}</a></>}
        </p>
      )}

      <div className="b2b-submit-row">
        <button type="submit" className="b2b-btn is-primary ct-submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
        <p className="b2b-privacy">{CONTACT_COPY.privacy}</p>
      </div>
    </form>
  );
}
