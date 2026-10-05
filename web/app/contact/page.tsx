import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact Micky's | Product, Order & B2B Enquiries",
  description: "Questions about Micky's, your order, or working with us? Send us a message, or call or email the Micky's team.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Let's talk food | Contact Micky's", description: "Questions about Micky's, your order, or working with us? Send us a message.", url: "/contact", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Micky's pouches" }] },
};

export default function ContactRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <ContactPage />
      </main>
    </>
  );
}
