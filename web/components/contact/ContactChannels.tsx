import { CONTACT, SOCIALS } from "@/data/contact";

const dev = process.env.NODE_ENV !== "production";
const tel = (v: string) => `tel:${v.replace(/\s/g, "")}`;
const wa = (v: string) => `https://wa.me/${v.replace(/\D/g, "")}`;

/** Verified contact details only. Missing channels are hidden (listed as pending in development). */
export default function ContactChannels() {
  const socials = SOCIALS.filter((s) => s.url);
  const pending = [
    !CONTACT.whatsapp.value && "WhatsApp business number",
    ...SOCIALS.filter((s) => !s.url).map((s) => `${s.label} URL`),
  ].filter(Boolean);

  return (
    <div className="ct-channels">
      <dl className="ct-list">
        {CONTACT.email.value && (
          <div><dt>Email</dt><dd><a href={`mailto:${CONTACT.email.value}`}>{CONTACT.email.value}</a></dd></div>
        )}
        {CONTACT.phone.value && (
          <div><dt>Phone</dt><dd><a href={tel(CONTACT.phone.value)}>{CONTACT.phone.value}</a></dd></div>
        )}
        {CONTACT.b2bEmail.value && (
          <div><dt>B2B &amp; trade</dt><dd><a href={`mailto:${CONTACT.b2bEmail.value}`}>{CONTACT.b2bEmail.value}</a></dd></div>
        )}
        {CONTACT.address.value && (
          <div><dt>Address</dt><dd><address>{CONTACT.company}<br />{CONTACT.address.value}</address></dd></div>
        )}
      </dl>

      {CONTACT.whatsapp.value && (
        <a className="b2b-btn is-dark ct-wa" href={wa(CONTACT.whatsapp.value)} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
      )}

      {socials.length > 0 && (
        <ul className="ct-social" aria-label="Micky's on social media">
          {socials.map((s) => <li key={s.id}><a href={s.url!} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
        </ul>
      )}

      {dev && pending.length > 0 && <p className="ct-pending">Pending · hidden on live site: {pending.join(", ")}</p>}
    </div>
  );
}
