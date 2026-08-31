import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { BrandStrip } from "@/components/sections/BrandStrip";
import { Consorcio } from "@/components/sections/Consorcio";
import { Features } from "@/components/sections/Features";
import { Collection } from "@/components/sections/Collection";
import { Faq } from "@/components/sections/Faq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandStrip />
        <Consorcio />
        <Features />
        <Collection />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
