import type { Metadata } from "next";
import Header from "@/components/Header";
import LightHeader from "@/components/shop/LightHeader";
import PolicyPage from "@/components/legal/PolicyPage";
import { policy } from "@/data/legal";

const P = policy("privacy-policy")!;

export const metadata: Metadata = {
  title: `${P.title} | Micky's`,
  description: `Micky's ${P.title.toLowerCase()}.`,
  alternates: { canonical: "/privacy-policy" },
  // kept out of search until the approved text is published
  robots: P.body ? undefined : { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <LightHeader />
        <PolicyPage policy={P} />
      </main>
    </>
  );
}
