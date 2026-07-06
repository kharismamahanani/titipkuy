"use client";

import { Tabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";
import { ArmadaManager } from "@/components/admin/armada-manager";
import { KonfigurasiOperasional } from "@/components/admin/konfigurasi-operasional";
import { RekapJadwalArmada } from "@/components/admin/rekap-jadwal-armada";
import { AntarJemputManager } from "@/components/admin/antar-jemput-manager";
import type { Armada, KonfigurasiOperasional as KonfigurasiOperasionalType } from "@/types/armada";
import type { AntarJemputOption } from "@/types/antar-jemput";

interface ArmadaLayananTabsProps {
  armadaList: Armada[];
  konfigurasi: KonfigurasiOperasionalType;
  antarJemputOptions: AntarJemputOption[];
}

const TAB_TRIGGER_CLASS =
  "rounded-t-lg border-2 border-b-0 border-tk-charcoal px-5 py-2.5 text-sm font-bold text-tk-muted -mb-0.5 data-[selected]:bg-tk-charcoal data-[selected]:text-tk-cream data-[selected]:border-tk-charcoal";

export function ArmadaLayananTabs({
  armadaList,
  konfigurasi,
  antarJemputOptions,
}: ArmadaLayananTabsProps) {
  return (
    <Tabs.Root defaultValue="armada">
      <Tabs.List className="flex gap-2 border-b-2 border-tk-charcoal">
        <Tabs.Tab value="armada" className={cn(TAB_TRIGGER_CLASS)}>
          Armada & Jadwal
        </Tabs.Tab>
        <Tabs.Tab value="layanan" className={cn(TAB_TRIGGER_CLASS)}>
          Layanan & Tarif
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="armada" className="space-y-10 pt-6">
        <div>
          <h2 className="text-lg font-extrabold text-tk-charcoal">Daftar Armada</h2>
          <div className="mt-3">
            <ArmadaManager initialArmada={armadaList} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-tk-charcoal">Rekap Jadwal Perjalanan</h2>
          <div className="mt-3">
            <RekapJadwalArmada />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-tk-charcoal">Konfigurasi Operasional</h2>
          <div className="mt-3">
            <KonfigurasiOperasional initialKonfigurasi={konfigurasi} />
          </div>
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="layanan" className="pt-6">
        <AntarJemputManager initialOptions={antarJemputOptions} />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
