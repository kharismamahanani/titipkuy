import { prisma } from "@/lib/prisma";
import { getOrCreateKonfigurasi, parseTanggalMerah } from "@/lib/konfigurasi";
import { ArmadaLayananTabs } from "@/components/admin/armada-layanan-tabs";

export const dynamic = "force-dynamic";

export default async function ArmadaLayananPage() {
  let data: Awaited<ReturnType<typeof getData>> | null = null;

  try {
    data = await getData();
  } catch (error) {
    console.error("[ArmadaLayananPage]", error);
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-extrabold text-tk-charcoal">Data belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-tk-muted">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  const tanggalMerah = parseTanggalMerah(data.konfigurasi.lockTanggalMerah);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Armada & Layanan</h1>
      <p className="mt-1 text-sm text-tk-muted">
        Kelola armada, jadwal penjemputan, dan opsi antar-jemput.
      </p>

      <div className="mt-6">
        <ArmadaLayananTabs
          armadaList={data.armadaList.map((a) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
          }))}
          konfigurasi={{
            id: data.konfigurasi.id,
            lockH1: data.konfigurasi.lockH1,
            lockHariMinggu: data.konfigurasi.lockHariMinggu,
            tanggalMerah,
            pesanHariLibur: data.konfigurasi.pesanHariLibur,
            updatedAt: data.konfigurasi.updatedAt.toISOString(),
          }}
          antarJemputOptions={data.antarJemputOptions}
        />
      </div>
    </div>
  );
}

async function getData() {
  const [armadaList, konfigurasi, antarJemputOptions] = await Promise.all([
    prisma.armada.findMany({ orderBy: { createdAt: "asc" } }),
    getOrCreateKonfigurasi(),
    prisma.antarJemputOption.findMany({ orderBy: { urutan: "asc" } }),
  ]);

  return { armadaList, konfigurasi, antarJemputOptions };
}
