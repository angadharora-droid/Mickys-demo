// Company details for the footer and schema. Only verified values; each notes its source.
import { CONTACT, SOCIALS } from "./contact";

export const COMPANY = {
  brand: "Micky's",
  legalName: CONTACT.company, // "Centre Point Foods Private Limited" (every pack: manufactured / marketed by)
  address: CONTACT.address.value, // every pack
  fssai: "11525056000326", // every pack: "FSSAI Lic. No."
  email: CONTACT.email.value, // pack feedback line
  phone: CONTACT.phone.value, // pack feedback line / MRP card
  socials: SOCIALS.filter((s) => s.url) as { id: string; label: string; url: string }[], // none verified yet
};
