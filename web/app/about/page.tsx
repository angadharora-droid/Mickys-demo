import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import AboutPage from "@/components/about/AboutPage";
import { ABOUT_PHOTOS } from "@/data/about";

const DESCRIPTION = "Micky's takes care of the repetitive preparation, so you can focus on flavour, finishing and the final dish. We make the base. You make the dish.";

export const metadata: Metadata = {
  title: "About Micky's | Cooking should still feel like cooking",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: "We believe cooking should still feel like cooking | Micky's", description: DESCRIPTION, url: "/about", images: [ABOUT_PHOTOS.hero.src] },
};

// photo slots fill in automatically once their files exist in /public
const hasFile = (src: string) => existsSync(path.join(process.cwd(), "public", src));

export default function AboutRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-maroon">
        <AboutPage photos={{ ingredients: hasFile(ABOUT_PHOTOS.ingredients.src), chef: hasFile(ABOUT_PHOTOS.chef.src) }} />
      </main>
    </>
  );
}
