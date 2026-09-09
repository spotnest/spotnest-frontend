import Navbar from "@/src/components/layout/Navbar";
import {
  FeaturedProperties,
  Footer,
  Hero,
  HowItWorks,
  OwnerCTA,
  Search,
  WhyChooseUs,
} from "@/src/modules/landing";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#f8f9fa]">
        <Hero />
        <Search />
        <FeaturedProperties />
        <HowItWorks />
        <WhyChooseUs />
        <OwnerCTA />
      </main>
      <Footer />
    </>
  );
}
