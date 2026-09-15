import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import { Hero, ContactInfo } from "@/src/modules/contact";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#f8f9fa]">
        <Hero />

        <section className="px-4 pb-20 sm:px-6 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-[1280px]">
            <ContactInfo />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}