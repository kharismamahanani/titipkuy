import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";
import { TkCard } from "@/components/ui/tk-card";
import { FotoMasukUploader } from "@/components/admin/foto-masuk-uploader";
import { KirimKonfirmasiMasukButton } from "@/components/admin/kirim-konfirmasi-masuk-button";
import { LabelSection } from "@/components/admin/label-section";
import { PengambilanBarangSection } from "@/components/admin/pengambilan-barang-section";
import { TandaiBarangTibaButton } from "@/components/admin/tandai-barang-tiba-button";
import { TandaiLunasButton } from "@/components/admin/tandai-lunas-button";
import { BatalkanTransaksiButton } from "@/components/admin/batalkan-transaksi-button";
import { GeneratePdfButton } from "@/components/admin/generate-pdf-button";
import { hargaAntarJemputTransaksi } from "@/lib/harga-antar-jemput";
import type { TransaksiDetail } from "@/types/transaksi";

export const dynamic = "force-dynamic";

async function getTransaksi(id: string) {
  return prisma.transaksi.findUnique({
    where: { id },
    include: {
      pelanggan: true,
      paket: true,
      fotoMasuk: true,
      fotoKeluar: true,
      antarJemputOption: true,
      armada: true,
      barangLabel: true,
    },
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
        <h1 className="text-xl font-extrabold text-tk-charcoal">Transaksi tidak ditemukan</h1>
        <p className="mt-2 text-sm text-tk-muted">
          Cek kembali link, atau database belum terhubung.
        </p>
        <Link href="/admin/transaksi" className="mt-4 text-sm font-bold text-tk-orange-dark hover:underline">
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
  const barangLabel = transaksi.barangLabel.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));
  const transaksiDetail: TransaksiDetail = {
    id: transaksi.id,
    nomorUrut: transaksi.nomorUrut,
    pelanggan: { ...pelanggan, createdAt: pelanggan.createdAt.toISOString() },
    paket: { ...paket, createdAt: paket.createdAt.toISOString(), updatedAt: paket.updatedAt.toISOString() },
    hargaPaketTertagih: transaksi.hargaPaketTertagih,
    nilaiDeklarasi: transaksi.nilaiDeklarasi,
    deskripsiDeklarasi: transaksi.deskripsiDeklarasi,
    buktiKepemilikanUrl: transaksi.buktiKepemilikanUrl,
    tierGantiRugi: transaksi.tierGantiRugi,
    premiGantiRugi: transaksi.premiGantiRugi,
    ktpUrl: transaksi.ktpUrl,
    stnkUrl: transaksi.stnkUrl,
    bpkbUrl: transaksi.bpkbUrl,
    tanggalMasuk: transaksi.tanggalMasuk.toISOString(),
    tanggalJatuhTempo: transaksi.tanggalJatuhTempo.toISOString(),
    statusBayar: transaksi.statusBayar,
    statusTransaksi: transaksi.statusTransaksi,
    hub: transaksi.hub,
    metodePengiriman: transaksi.metodePengiriman as "armada" | "mandiri" | null,
    barangTibaMandiri: transaksi.barangTibaMandiri,
    layananJemput: transaksi.layananJemput,
    layananAntar: transaksi.layananAntar,
    antarJemputOption: transaksi.antarJemputOption,
    armada: transaksi.armada,
    tandaTanganUrl: transaksi.tandaTanganUrl,
    pdfUrl: transaksi.pdfUrl,
    createdAt: transaksi.createdAt.toISOString(),
  };

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link href="/admin/transaksi" className="text-sm font-bold text-tk-orange-dark hover:underline">
          &larr; Kembali ke daftar transaksi
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-tk-charcoal">
          {kodeTransaksi(transaksi.nomorUrut)}
        </h1>
      </div>

      <TkCard className="space-y-2 text-sm">
        <Row label="Nama" value={pelanggan.nama} />
        <Row label="No. WhatsApp" value={pelanggan.whatsapp} />
        <Row label="Alamat Kos" value={pelanggan.alamatKos} />
        <Row label="Kampus" value={pelanggan.kampus ?? "-"} />
        <Row label="Paket" value={`${paket.nama} · ${formatRupiah(transaksi.hargaPaketTertagih)}`} />
        <Row
          label="Metode Pengiriman"
          value={
            <MetodePengirimanValue
              layananJemput={transaksi.layananJemput}
              layananAntar={transaksi.layananAntar}
              armadaNama={transaksi.armada?.nama ?? null}
              tanggalMasuk={transaksi.tanggalMasuk}
              tanggalJatuhTempo={transaksi.tanggalJatuhTempo}
              metodePengiriman={transaksiDetail.metodePengiriman}
            />
          }
        />
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
        {transaksi.statusTransaksi === "DIBATALKAN" && transaksi.alasanPembatalan && (
          <Row label="Alasan Pembatalan" value={transaksi.alasanPembatalan} />
        )}
        {transaksi.tierGantiRugi && (
          <Row label="Tier Ganti Rugi" value={TIER_LABEL[transaksi.tierGantiRugi] ?? transaksi.tierGantiRugi} />
        )}
        {!!transaksi.premiGantiRugi && (
          <Row label="Premi Perlindungan" value={`${formatRupiah(transaksi.premiGantiRugi)}/bulan`} />
        )}
        {transaksi.nilaiDeklarasi != null && (
          <Row label="Nilai Deklarasi" value={formatRupiah(transaksi.nilaiDeklarasi)} />
        )}
        {transaksi.deskripsiDeklarasi && (
          <Row label="Deskripsi Barang" value={transaksi.deskripsiDeklarasi} />
        )}
      </TkCard>

      {(transaksi.ktpUrl || transaksi.stnkUrl || transaksi.bpkbUrl) && (
        <section className="space-y-3">
          <h2 className="font-extrabold text-tk-charcoal">📋 Dokumen Motor</h2>
          <div className="flex flex-wrap gap-4">
            {transaksi.ktpUrl && <DokumenThumbnail label="KTP" url={transaksi.ktpUrl} />}
            {transaksi.stnkUrl && <DokumenThumbnail label="STNK" url={transaksi.stnkUrl} />}
            {transaksi.bpkbUrl && <DokumenThumbnail label="BPKB" url={transaksi.bpkbUrl} />}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-extrabold text-tk-charcoal">Foto Saat Masuk</h2>
        <p className="text-sm text-tk-muted">Upload foto kondisi barang saat tiba di hub.</p>
        <FotoMasukUploader transaksiId={transaksi.id} fotoMasuk={fotoMasuk} />
        <KirimKonfirmasiMasukButton
          nomorUrut={transaksi.nomorUrut}
          pelanggan={pelanggan}
          paket={paket}
          tanggalMasuk={transaksi.tanggalMasuk}
          tanggalJatuhTempo={transaksi.tanggalJatuhTempo}
          jumlahFotoMasuk={transaksi.fotoMasuk.length}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-extrabold text-tk-charcoal">Label Barang</h2>
        <p className="text-sm text-tk-muted">
          Tambahkan barang dan cetak label langsung dari sini.
        </p>
        <LabelSection transaksi={transaksiDetail} barangLabel={barangLabel} />
      </section>

      <PengambilanBarangSection
        transaksiId={transaksi.id}
        statusTransaksi={transaksi.statusTransaksi}
        fotoKeluar={fotoKeluar}
        jumlahFotoKeluar={transaksi.fotoKeluar.length}
      />

      <section className="space-y-3">
        <h2 className="font-extrabold text-tk-charcoal">Tanda Tangan</h2>
        {transaksi.tandaTanganUrl ? (
          <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-4">
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
          <p className="text-sm text-tk-light">Belum ada tanda tangan.</p>
        )}
      </section>

      {transaksi.metodePengiriman === "mandiri" && (
        <section className="space-y-2">
          <h2 className="font-extrabold text-tk-charcoal">Kiriman Mandiri</h2>
          <TandaiBarangTibaButton
            transaksiId={transaksi.id}
            barangTibaMandiri={transaksi.barangTibaMandiri}
          />
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <TandaiLunasButton
          id={transaksi.id}
          nomorUrut={transaksi.nomorUrut}
          pelanggan={pelanggan}
          hargaPaketTertagih={transaksi.hargaPaketTertagih}
          antarJemputHarga={hargaAntarJemputTransaksi(transaksiDetail)}
          tanggalJatuhTempo={transaksi.tanggalJatuhTempo}
          statusBayar={transaksi.statusBayar}
        />
        <GeneratePdfButton transaksiId={transaksi.id} pdfUrl={transaksi.pdfUrl} />
        <BatalkanTransaksiButton
          transaksiId={transaksi.id}
          statusTransaksi={transaksi.statusTransaksi}
          statusBayar={transaksi.statusBayar}
          sudahMasukHub={transaksi.fotoMasuk.length > 0}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between border-b border-[#D6CEC4] py-1 last:border-0">
      <span className="text-tk-muted">{label}</span>
      <span className="font-bold text-tk-charcoal">{value}</span>
    </div>
  );
}

function MetodePengirimanValue({
  layananJemput,
  layananAntar,
  armadaNama,
  tanggalMasuk,
  tanggalJatuhTempo,
  metodePengiriman,
}: {
  layananJemput: boolean;
  layananAntar: boolean;
  armadaNama: string | null;
  tanggalMasuk: Date;
  tanggalJatuhTempo: Date;
  metodePengiriman: "armada" | "mandiri" | null;
}) {
  if (!layananJemput && !layananAntar) {
    return <>{metodePengiriman === "mandiri" ? "📦 Kirim mandiri" : "-"}</>;
  }

  const fmt = (d: Date) => format(d, "d MMM yyyy", { locale: localeId });
  const armadaSuffix = armadaNama ? ` (Armada ${armadaNama})` : "";

  return (
    <div className="space-y-0.5 text-right">
      {layananJemput ? (
        <p>{layananAntar ? "🔄" : "🛵"} Jemput: {fmt(tanggalMasuk)}{armadaSuffix}</p>
      ) : (
        <p>Pengantaran barang: Datang sendiri ke Hub</p>
      )}
      {layananAntar ? (
        <p>📦 Antar: {fmt(tanggalJatuhTempo)}{armadaSuffix}</p>
      ) : (
        <p>Pengambilan: Datang sendiri ke Hub</p>
      )}
    </div>
  );
}

const TIER_LABEL: Record<string, string> = {
  standar: "Standar",
  deklarasi: "Deklarasi Mandiri",
  bernilaiTinggi: "Barang Bernilai Tinggi",
};

function dokumenViewHref(url: string) {
  return `/api/admin/dokumen-url?url=${encodeURIComponent(url)}`;
}

function DokumenThumbnail({ label, url }: { label: string; url: string }) {
  const href = dokumenViewHref(url);
  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5"
    >
      {isPdf ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-tk-charcoal bg-white text-3xl">
          📄
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- gambar dari signed URL redirect, tidak cocok dioptimasi next/image
        <img
          src={href}
          alt={label}
          className="h-24 w-24 rounded-lg border-2 border-tk-charcoal object-cover"
        />
      )}
      <span className="text-xs font-bold text-tk-charcoal">{label}</span>
    </a>
  );
}
