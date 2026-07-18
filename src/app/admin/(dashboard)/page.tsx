import Link from "next/link";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";
import { StatCard } from "@/components/admin/stat-card";
import { CopyWaButton } from "@/components/admin/copy-wa-button";
import { TandaiLunasButton } from "@/components/admin/tandai-lunas-button";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { hargaAntarJemputTransaksi, omzetTransaksi } from "@/lib/harga-antar-jemput";

// Data berubah tiap ada transaksi baru/dibayar — jangan biarkan Next.js
// menyimpannya sebagai halaman statis, selalu render ulang dari database.
export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const in3Days = addDays(now, 3);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [transaksiAktif, jatuhTempoSoon, belumLunas, transaksiOmzetBulanIni, recentTransaksi] =
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
      // Sama persis dengan filter & rumus /api/admin/rekap (bulan berjalan,
      // hanya yang LUNAS, hargaPaketTertagih + premi + biaya antar-jemput)
      // supaya angka omzet di Dashboard dan Rekap Keuangan selalu konsisten.
      prisma.transaksi.findMany({
        where: { tanggalMasuk: { gte: startOfMonth, lt: startOfNextMonth }, statusBayar: "LUNAS" },
        include: { paket: true, antarJemputOption: true },
      }),
      prisma.transaksi.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { pelanggan: true, paket: true, antarJemputOption: true },
      }),
    ]);

  const omzetBulanIni = transaksiOmzetBulanIni.reduce((sum, t) => sum + omzetTransaksi(t), 0);

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
        <h1 className="text-xl font-extrabold text-tk-charcoal">Dashboard belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-tk-muted">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  const { transaksiAktif, jatuhTempoSoon, belumLunas, omzetBulanIni, recentTransaksi } =
    data;

  const linkButtonClass = cn(tkButtonVariants({ variant: "secondary", size: "sm" }));

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transaksi Aktif" value={String(transaksiAktif)} accent="sage" />
        <StatCard label="Omzet Bulan Ini" value={formatRupiah(omzetBulanIni)} accent="orange" />
        <StatCard
          label="Jatuh Tempo ≤3 Hari"
          value={String(jatuhTempoSoon.length)}
          danger={jatuhTempoSoon.length > 0}
        />
        <StatCard label="Belum Lunas" value={String(belumLunas)} accent="charcoal" />
      </div>

      {jatuhTempoSoon.length > 0 && (
        <section className="space-y-4 rounded-lg border-2 border-tk-charcoal bg-white p-5 [box-shadow:3px_3px_0_var(--tk-charcoal)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#C0392B]" size={18} />
            <h2 className="font-extrabold text-tk-charcoal">Perlu Tindakan</h2>
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
                  className="flex flex-col gap-2 rounded-lg border-2 border-tk-charcoal p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-tk-charcoal">{t.pelanggan.nama}</p>
                    <p className="text-xs text-tk-muted">
                      {kodeTransaksi(t.nomorUrut)} &middot; jatuh tempo {tanggal}
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
        <h2 className="font-extrabold text-tk-charcoal">Transaksi Terbaru</h2>

        <div className="overflow-x-auto rounded-lg border-2 border-tk-charcoal">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-tk-charcoal text-tk-cream">
              <tr>
                <th className="px-4 py-3 font-bold">Kode</th>
                <th className="px-4 py-3 font-bold">Nama</th>
                <th className="px-4 py-3 font-bold">Paket</th>
                <th className="px-4 py-3 font-bold">Jatuh Tempo</th>
                <th className="px-4 py-3 font-bold">Status Bayar</th>
                <th className="px-4 py-3 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentTransaksi.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-tk-muted">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {recentTransaksi.map((t, index) => (
                <tr
                  key={t.id}
                  className={cn(
                    "border-b border-[#D6CEC4] transition-colors last:border-0 hover:bg-tk-cream-alt",
                    index % 2 === 0 ? "bg-white" : "bg-tk-cream"
                  )}
                >
                  <td className="px-4 py-3 font-bold text-tk-charcoal">
                    {kodeTransaksi(t.nomorUrut)}
                  </td>
                  <td className="px-4 py-3 text-tk-charcoal">{t.pelanggan.nama}</td>
                  <td className="px-4 py-3 text-tk-charcoal">{t.paket.nama}</td>
                  <td className="px-4 py-3 text-tk-charcoal">
                    {format(t.tanggalJatuhTempo, "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.statusBayar}>
                      {t.statusBayar === "LUNAS" ? "Lunas" : "Belum Lunas"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <TandaiLunasButton
                        id={t.id}
                        nomorUrut={t.nomorUrut}
                        pelanggan={t.pelanggan}
                        hargaPaketTertagih={t.hargaPaketTertagih}
                        antarJemputHarga={hargaAntarJemputTransaksi(t)}
                        tanggalJatuhTempo={t.tanggalJatuhTempo}
                        statusBayar={t.statusBayar}
                      />
                      <Link href={`/admin/transaksi/${t.id}`} className={linkButtonClass}>
                        Lihat Detail
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
