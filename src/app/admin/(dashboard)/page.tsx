import Link from "next/link";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { CopyWaButton } from "@/components/admin/copy-wa-button";
import { TandaiLunasButton } from "@/components/admin/tandai-lunas-button";

// Data berubah tiap ada transaksi baru/dibayar — jangan biarkan Next.js
// menyimpannya sebagai halaman statis, selalu render ulang dari database.
export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const in3Days = addDays(now, 3);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [transaksiAktif, jatuhTempoSoon, belumLunas, omzetTransaksi, recentTransaksi] =
    await Promise.all([
      prisma.transaksi.count({ where: { statusTransaksi: "AKTIF" } }),
      prisma.transaksi.findMany({
        where: {
          statusTransaksi: "AKTIF",
          tanggalJatuhTempo: { gte: now, lte: in3Days },
        },
        include: { pelanggan: true },
        orderBy: { tanggalJatuhTempo: "asc" },
      }),
      prisma.transaksi.count({ where: { statusBayar: "BELUM_BAYAR" } }),
      prisma.transaksi.findMany({
        where: { createdAt: { gte: startOfMonth } },
        include: { paket: true },
      }),
      prisma.transaksi.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { pelanggan: true, paket: true },
      }),
    ]);

  const omzetBulanIni = omzetTransaksi.reduce((sum, t) => sum + t.paket.harga, 0);

  return {
    transaksiAktif,
    jatuhTempoSoon,
    belumLunas,
    omzetBulanIni,
    recentTransaksi,
  };
}

export default async function AdminDashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboardData>> | null = null;

  try {
    data = await getDashboardData();
  } catch (error) {
    console.error("[AdminDashboardPage]", error);
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold">Dashboard belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  const { transaksiAktif, jatuhTempoSoon, belumLunas, omzetBulanIni, recentTransaksi } =
    data;

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transaksi Aktif" value={String(transaksiAktif)} />
        <StatCard label="Omzet Bulan Ini" value={formatRupiah(omzetBulanIni)} />
        <StatCard
          label="Jatuh Tempo ≤3 Hari"
          value={String(jatuhTempoSoon.length)}
          danger={jatuhTempoSoon.length > 0}
        />
        <StatCard label="Belum Lunas" value={String(belumLunas)} />
      </div>

      {jatuhTempoSoon.length > 0 && (
        <section className="glass-card space-y-4 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" size={18} />
            <h2 className="font-heading font-bold">Perlu Tindakan</h2>
          </div>

          <div className="space-y-3">
            {jatuhTempoSoon.map((t) => {
              const tanggal = format(t.tanggalJatuhTempo, "d MMMM yyyy", {
                locale: localeId,
              });
              const message = `Halo ${t.pelanggan.nama}, barang titipanmu di TitipKuy! jatuh tempo pada ${tanggal}. Segera konfirmasi perpanjangan atau pengambilan ya! 🙏`;

              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-2 rounded-xl border border-card-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{t.pelanggan.nama}</p>
                    <p className="text-xs text-foreground/60">
                      {t.nomorRef} &middot; jatuh tempo {tanggal}
                    </p>
                  </div>
                  <CopyWaButton message={message} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-heading font-bold">Transaksi Terbaru</h2>

        <div className="glass-card overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-card-border text-foreground/60">
              <tr>
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Paket</th>
                <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                <th className="px-4 py-3 font-medium">Status Bayar</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentTransaksi.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {recentTransaksi.map((t) => (
                <tr key={t.id} className="border-b border-card-border last:border-0">
                  <td className="px-4 py-3 font-medium">{t.nomorRef}</td>
                  <td className="px-4 py-3">{t.pelanggan.nama}</td>
                  <td className="px-4 py-3">{t.paket.nama}</td>
                  <td className="px-4 py-3">
                    {format(t.tanggalJatuhTempo, "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="px-4 py-3">
                    {t.statusBayar === "LUNAS" ? (
                      <span className="text-primary-from">Lunas</span>
                    ) : (
                      <span className="text-accent">Belum Lunas</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {t.statusBayar === "BELUM_BAYAR" && (
                        <TandaiLunasButton id={t.id} />
                      )}
                      <Link
                        href={`/admin/transaksi/${t.id}`}
                        className="rounded-lg border border-card-border px-3 py-1.5 text-xs hover:bg-primary/10"
                      >
                        Lihat Detail
                      </Link>
                      <Link
                        href={`/admin/label?transaksiId=${t.id}`}
                        className="rounded-lg border border-card-border px-3 py-1.5 text-xs hover:bg-primary/10"
                      >
                        Print Label
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
