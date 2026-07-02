import { prisma } from "@/lib/prisma";
import { AntarJemputManager } from "@/components/admin/antar-jemput-manager";

export const dynamic = "force-dynamic";

export default async function AdminAntarJemputPage() {
  let options: Awaited<ReturnType<typeof getOptions>> | null = null;

  try {
    options = await getOptions();
  } catch (error) {
    console.error("[AdminAntarJemputPage]", error);
  }

  if (!options) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold">Data belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Antar-Jemput</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Kelola opsi add-on antar-jemput yang tampil di form pemesanan.
      </p>

      <div className="mt-6">
        <AntarJemputManager initialOptions={options} />
      </div>
    </div>
  );
}

function getOptions() {
  return prisma.antarJemputOption.findMany({ orderBy: { urutan: "asc" } });
}
