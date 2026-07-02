import { prisma } from "@/lib/prisma";
import { ArmadaManager } from "@/components/admin/armada-manager";
import { KonfigurasiOperasional } from "@/components/admin/konfigurasi-operasional";
import { getOrCreateKonfigurasi, parseTanggalMerah } from "@/lib/konfigurasi";

export const dynamic = "force-dynamic";

export default async function AdminArmadaPage() {
  let data: Awaited<ReturnType<typeof getData>> | null = null;

  try {
    data = await getData();
  } catch (error) {
    console.error("[AdminArmadaPage]", error);
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold">Data armada belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  const tanggalMerah = parseTanggalMerah(data.konfigurasi.lockTanggalMerah);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Armada & Slot</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Kelola armada antar-jemput dan aturan operasional pemesanan.
      </p>

      <div className="mt-6">
        <h2 className="font-heading text-lg font-bold">Daftar Armada</h2>
        <div className="mt-3">
          <ArmadaManager
            initialArmada={data.armadaList.map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
              updatedAt: a.updatedAt.toISOString(),
            }))}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold">Konfigurasi Operasional</h2>
        <div className="mt-3">
          <KonfigurasiOperasional
            initialKonfigurasi={{
              id: data.konfigurasi.id,
              lockH1: data.konfigurasi.lockH1,
              lockHariMinggu: data.konfigurasi.lockHariMinggu,
              tanggalMerah,
              pesanHariLibur: data.konfigurasi.pesanHariLibur,
              updatedAt: data.konfigurasi.updatedAt.toISOString(),
            }}
          />
        </div>
      </div>
    </div>
  );
}

async function getData() {
  const [armadaList, konfigurasi] = await Promise.all([
    prisma.armada.findMany({ orderBy: { createdAt: "asc" } }),
    getOrCreateKonfigurasi(),
  ]);

  return { armadaList, konfigurasi };
}
