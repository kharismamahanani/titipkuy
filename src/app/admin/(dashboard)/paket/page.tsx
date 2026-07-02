import { prisma } from "@/lib/prisma";
import { PaketManager } from "@/components/admin/paket-manager";

export const dynamic = "force-dynamic";

export default async function AdminPaketPage() {
  let paketList: Awaited<ReturnType<typeof getPaketList>> | null = null;

  try {
    paketList = await getPaketList();
  } catch (error) {
    console.error("[AdminPaketPage]", error);
  }

  if (!paketList) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold">Data paket belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Kelola Paket</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Atur paket yang tampil di landing page dan form pemesanan.
      </p>

      <div className="mt-6">
        <PaketManager
          initialPaket={paketList.map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

function getPaketList() {
  return prisma.paket.findMany({ orderBy: { urutan: "asc" } });
}
