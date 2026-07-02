"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { HubLokasi } from "@/components/sections/hub-lokasi";
import { Kalkulator } from "@/components/sections/kalkulator";
import { KenapaTitipkuy } from "@/components/sections/kenapa-titipkuy";
import { CaraTitipMandiri } from "@/components/sections/cara-titip-mandiri";
import { PaketSection } from "@/components/sections/paket-section";
import { CaraKerja } from "@/components/sections/cara-kerja";
import type { KalkulatorMode } from "@/types/kalkulator";

export default function Home() {
  const [mode, setMode] = useState<KalkulatorMode>("harian");

  return (
    <div className="bg-bg-dark">
      <Navbar />
      <main>
        <Hero onSelectMode={setMode} />
        <HubLokasi />
        <Kalkulator mode={mode} onModeChange={setMode} />
        <KenapaTitipkuy />
        <CaraTitipMandiri />
        <PaketSection />
        <CaraKerja />
      </main>
      <Footer />
    </div>
  );
}
