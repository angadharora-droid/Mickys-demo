import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import PrepToPlate from "@/components/PrepToPlate";
import QualitySeal from "@/components/QualitySeal";
import WhyMickys from "@/components/WhyMickys";

export const metadata: Metadata = {
  title: "Why Micky's | Less prep. More control.",
  description: "Micky's removes the repetitive prep. The chef keeps the control.",
  alternates: { canonical: "/why-mickys" },
  openGraph: { title: "Why Micky's | Less prep. More control.", description: "Micky's removes the repetitive prep. The chef keeps the control.", url: "/why-mickys", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Micky\'s pouches" }] },
};

export default function WhyMickysPage() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-why">
        <WhyMickys />
        <PrepToPlate />
        <QualitySeal />
      </main>
    </>
  );
}
