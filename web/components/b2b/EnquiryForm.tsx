"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { B2B_CONTACT, ENQUIRY } from "@/data/b2b";
import { BUSINESS_TYPES, EMPTY_ENQUIRY, INTERESTS, LIMITS, validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/b2b";

export type EnquiryPreset = { intent?: Enquiry["intent"]; interest?: string; n: number };

type Status = "idle" | "sending" | "done" | "error";

const SERVER_ERRORS: Record<string, string> = {
  rate_limited: "You've sent a few enquiries already. Please try again in a few minutes, or call us.",
  unavailable: "Online enquiries aren't switched on yet. Please call or email our B2B team.",
  failed: "We couldn't send your enquiry just now. Please try again, or call or email us.",
  network: "We couldn't reach our server. Please check your connection and try again.",
};

/** Short B2B enquiry form: validated in the browser and again on the server. */
export default function EnquiryForm({ preset }: { preset: EnquiryPreset }) {
  const id = useId();
  const [v, setV] = useState<Enquiry>(EMPTY_ENQUIRY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Enquiry, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  // a CTA elsewhere on the page chose the intent / category (state adjusted during render, no effect)
  const [seen, setSeen] = useState(preset.n);
  if (preset.n !== seen) {
    setSeen(preset.n);
    setV((s) => ({ ...s, ...(preset.intent ? { intent: preset.intent } : {}), ...(preset.interest ? { interest: preset.interest } : {}) }));
    if (status === "done") setStatus("idle");
  }

  useEffect(() => { if (status === "done") doneRef.current?.focus(); }, [status]);

  const set = (k: keyof Enquiry, value: string) => {
    const next = { ...v, [k]: value };
    setV(next);
    if (touched[k] || errors[k]) setErrors((e) => ({ ...e, [k]: validateEnquiry(next).errors[k] }));
  };
  const blur = (k: keyof Enquiry) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validateEnquiry(v).errors[k] }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const { errors: found } = validateEnquiry(v);
    setErrors(found);
    setServerError("");
    const first = (Object.keys(found) as (keyof Enquiry)[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/b2b/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, website: honeypot.current?.value ?? "" }),
      });
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
      <div className="b2b-done" role="status">
        <h3 ref={doneRef} tabIndex={-1} className="display b2b-done-h">
          <span>{ENQUIRY.success[0]}</span>
          <span className="b2b-accent">{ENQUIRY.success[1]}</span>
        </h3>
        <button type="button" className="b2b-link" onClick={() => { setV({ ...EMPTY_ENQUIRY, intent: v.intent }); setErrors({}); setTouched({}); setStatus("idle"); }}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const field = (k: keyof Enquiry) => ({
    id: `${id}-${k}`,
    name: k,
    value: v[k],
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
    onBlur: () => blur(k),
  });
  const err = (k: keyof Enquiry) => errors[k] && <p id={`${id}-${k}-err`} className="b2b-err">{errors[k]}</p>;
  const req = <span className="b2b-req" aria-hidden="true">*</span>;

  return (
    <form ref={formRef} className="b2b-form" noValidate onSubmit={submit} aria-busy={status === "sending"}>
      <fieldset className="b2b-intent">
        <legend className="b2b-label">I&apos;d like to</legend>
        {(Object.keys(ENQUIRY.intents) as Enquiry["intent"][]).map((k) => (
          <label key={k} className={v.intent === k ? "is-on" : ""}>
            <input type="radio" name="intent" value={k} checked={v.intent === k} onChange={() => set("intent", k)} />
            {ENQUIRY.intents[k]}
          </label>
        ))}
      </fieldset>

      <div className="b2b-fields">
        <div className="b2b-field">
          <label htmlFor={`${id}-name`} className="b2b-label">Name {req}</label>
          <input {...field("name")} autoComplete="name" maxLength={LIMITS.name} required onChange={(e) => set("name", e.target.value)} />
          {err("name")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-business`} className="b2b-label">Business name {req}</label>
          <input {...field("business")} autoComplete="organization" maxLength={LIMITS.business} required onChange={(e) => set("business", e.target.value)} />
          {err("business")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-city`} className="b2b-label">City {req}</label>
          <input {...field("city")} autoComplete="address-level2" maxLength={LIMITS.city} required onChange={(e) => set("city", e.target.value)} />
          {err("city")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-mobile`} className="b2b-label">Mobile {req}</label>
          <input {...field("mobile")} type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.mobile} required placeholder="10-digit mobile" onChange={(e) => set("mobile", e.target.value)} />
          {err("mobile")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-email`} className="b2b-label">Email <span className="b2b-opt">(optional)</span></label>
          <input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email} onChange={(e) => set("email", e.target.value)} />
          {err("email")}
        </div>
        <div className="b2b-field">
          <label htmlFor={`${id}-type`} className="b2b-label">Type of business {req}</label>
          <select {...field("type")} required onChange={(e) => set("type", e.target.value)} className={v.type ? "" : "is-empty"}>
            <option value="" disabled>Choose one</option>
            {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {err("type")}
        </div>
        <div className="b2b-field is-wide">
          <label htmlFor={`${id}-interest`} className="b2b-label">Interested products {req}</label>
          <select {...field("interest")} required onChange={(e) => set("interest", e.target.value)} className={v.interest ? "" : "is-empty"}>
            <option value="" disabled>Choose one</option>
            {INTERESTS.map((t) => <option key={t}>{t}</option>)}
          </select>
          {err("interest")}
        </div>
        <div className="b2b-field is-wide">
          <label htmlFor={`${id}-message`} className="b2b-label">Message / requirement <span className="b2b-opt">(optional)</span></label>
          <textarea {...field("message")} rows={4} maxLength={LIMITS.message} placeholder="Dishes, outlets, approximate volumes, anything that helps." onChange={(e) => set("message", e.target.value)} />
          {err("message")}
        </div>
      </div>

      {/* hidden from people; bots fill it in */}
      <div className="b2b-hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input ref={honeypot} id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {serverError && (
        <p className="b2b-server-err" role="alert">
          {serverError}{" "}
          <a href={B2B_CONTACT.phoneHref}>{B2B_CONTACT.phone}</a> · <a href={`mailto:${B2B_CONTACT.email}`}>{B2B_CONTACT.email}</a>
        </p>
      )}

      <div className="b2b-submit-row">
        <button type="submit" className="b2b-btn is-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : ENQUIRY.submit[v.intent]}
        </button>
        <p className="b2b-privacy">{ENQUIRY.privacy}</p>
      </div>
    </form>
  );
}
