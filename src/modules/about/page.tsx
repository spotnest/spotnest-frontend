import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import {
  Hero,
  Story,
  Values,
  Mission,
  OwnerCTA,
} from "@/src/modules/about";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#f8f9fa]">
        <Hero />
        <Story />
        <Values />
        <Mission />
        <OwnerCTA />
      </main>

      <Footer />
    </>
  );
}