import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { FotoLightboxGrid } from "@/components/admin/foto-lightbox-grid";
import { FotoKeluarUploader } from "@/components/admin/foto-keluar-uploader";
import { TandaiSelesaiButton } from "@/components/admin/tandai-selesai-button";

export const dynamic = "force-dynamic";

async function getTransaksi(id: string) {
  return prisma.transaksi.findUnique({
    where: { id },
    include: { pelanggan: true, paket: true, fotoMasuk: true, fotoKeluar: true },
  });
}

export default async function AdminTransaksiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let transaksi: Awaited<ReturnType<typeof getTransaksi>> | null = null;

  try {
    transaksi = await getTransaksi(params.id);
  } catch (error) {
    console.error("[AdminTransaksiDetailPage]", error);
  }

  if (!transaksi) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold">Transaksi tidak ditemukan</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Cek kembali link, atau database belum terhubung.
        </p>
        <Link href="/admin/transaksi" className="mt-4 text-sm text-primary-from hover:underline">
          &larr; Kembali ke daftar transaksi
        </Link>
      </div>
    );
  }

  const { pelanggan, paket } = transaksi;
  const fotoMasuk = transaksi.fotoMasuk.map((f) => ({
    ...f,
    uploadedAt: f.uploadedAt.toISOString(),
  }));
  const fotoKeluar = transaksi.fotoKeluar.map((f) => ({
    ...f,
    uploadedAt: f.uploadedAt.toISOString(),
  }));

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link href="/admin/transaksi" className="text-sm text-foreground/60 hover:underline">
          &larr; Kembali ke daftar transaksi
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">{transaksi.nomorRef}</h1>
      </div>

      <div className="glass-card space-y-2 rounded-2xl p-5 text-sm">
        <Row label="Nama" value={pelanggan.nama} />
        <Row label="No. WhatsApp" value={pelanggan.whatsapp} />
        <Row label="Alamat Kos" value={pelanggan.alamatKos} />
        <Row label="Kampus" value={pelanggan.kampus ?? "-"} />
        <Row label="Paket" value={`${paket.nama} · ${formatRupiah(paket.harga)}`} />
        <Row
          label="Masuk"
          value={format(transaksi.tanggalMasuk, "d MMMM yyyy", { locale: localeId })}
        />
        <Row
          label="Jatuh Tempo"
          value={format(transaksi.tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
        />
        <Row
          label="Status Bayar"
          value={transaksi.statusBayar === "LUNAS" ? "Lunas" : "Belum Lunas"}
        />
        <Row label="Status Transaksi" value={transaksi.statusTransaksi} />
        {transaksi.nilaiDeklarasi != null && (
          <Row label="Nilai Deklarasi" value={formatRupiah(transaksi.nilaiDeklarasi)} />
        )}
        {transaksi.deskripsiDeklarasi && (
          <Row label="Deskripsi Barang" value={transaksi.deskripsiDeklarasi} />
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-heading font-bold">Foto Saat Masuk</h2>
        <FotoLightboxGrid fotos={fotoMasuk} emptyText="Tidak ada foto masuk." />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold">Foto Saat Keluar</h2>
        <p className="text-sm text-foreground/60">
          Upload foto kondisi barang saat pelanggan mengambilnya.
        </p>
        <FotoKeluarUploader transaksiId={transaksi.id} fotoKeluar={fotoKeluar} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-bold">Tanda Tangan</h2>
        {transaksi.tandaTanganUrl ? (
          <div className="glass-card inline-block rounded-2xl p-4">
            <div className="relative h-32 w-64">
              <Image
                src={transaksi.tandaTanganUrl}
                alt="Tanda tangan pelanggan"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/50">Belum ada tanda tangan.</p>
        )}
      </section>

      <TandaiSelesaiButton
        transaksiId={transaksi.id}
        statusTransaksi={transaksi.statusTransaksi}
        jumlahFotoKeluar={transaksi.fotoKeluar.length}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-card-border/50 py-1 last:border-0">
      <span className="text-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
