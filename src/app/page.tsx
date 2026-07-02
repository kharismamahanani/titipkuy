import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { PaketSection } from "@/components/sections/paket-section";
import { CaraKerja } from "@/components/sections/cara-kerja";

export default function Home() {
  return (
    <div className="bg-bg-dark">
      <Navbar />
      <main>
        <Hero />
        <PaketSection />
        <CaraKerja />
      </main>
      <Footer />
    </div>
  );
}
