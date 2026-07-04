"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TkCard } from "@/components/ui/tk-card";
import { cn, formatRupiah } from "@/lib/utils";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { buildStoragePath, uploadToStorage } from "@/lib/supabase";
import { GANTI_RUGI, hitungPremi, tentukanTier } from "@/lib/ganti-rugi";
import { AntarJemputPicker } from "@/components/pesan/antar-jemput-picker";
import { HUB_CONFIG, JAM_DROP_OFF_MANDIRI } from "@/lib/constants";
import type { Paket } from "@/types/paket";
import type { DeklarasiData, DokumenMotorData, MetodePengiriman } from "@/types/pesan";
import type { AntarJemputOption } from "@/types/antar-jemput";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Armada TitipKuy! hanya bisa dipesan minimal H-1 (24 jam sebelumnya) dan
// tidak beroperasi di hari Minggu.
function isTanggalValidUntukArmada(tanggal: Date) {
  const diffHours = (tanggal.getTime() - Date.now()) / (1000 * 60 * 60);
  const isSunday = tanggal.getDay() === 0;
  return diffHours >= 24 && !isSunday;
}

interface Step2Props {
  transactionId: string;
  paket: Paket | null;
  tanggalMasuk: Date | null;
  deklarasi: DeklarasiData;
  dokumenMotor: DokumenMotorData;
  metodePengiriman: MetodePengiriman;
  antarJemputOption: AntarJemputOption | null;
  preselectedPaketId?: string;
  preselectedMode?: "harian" | "bulanan";
  onPaketChange: (paket: Paket) => void;
  onTanggalChange: (date: Date) => void;
  onDeklarasiChange: (data: DeklarasiData) => void;
  onDokumenMotorChange: (data: DokumenMotorData) => void;
  onMetodePengirimanChange: (metode: MetodePengiriman) => void;
  onAntarJemputOptionChange: (option: AntarJemputOption | null) => void;
}

export function Step2PaketTanggal({
  transactionId,
  paket,
  tanggalMasuk,
  deklarasi,
  dokumenMotor,
  metodePengiriman,
  antarJemputOption,
  preselectedPaketId,
  preselectedMode,
  onPaketChange,
  onTanggalChange,
  onDeklarasiChange,
  onDokumenMotorChange,
  onMetodePengirimanChange,
  onAntarJemputOptionChange,
}: Step2Props) {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [tab, setTab] = useState<"harian" | "bulanan">(preselectedMode ?? "harian");
  const [pilihDeklarasi, setPilihDeklarasi] = useState(!!deklarasi.nilaiDeklarasi);
  const [uploadingDokumen, setUploadingDokumen] = useState<
    Record<"ktp" | "stnk" | "bpkb", boolean>
  >({ ktp: false, stnk: false, bpkb: false });

  useEffect(() => {
    let isMounted = true;

    fetch("/api/paket")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data paket");
        return res.json();
      })
      .then((data: Paket[]) => {
        if (isMounted) {
          setPaketList(data);
          setState("success");

          if (preselectedPaketId && !paket) {
            const match = data.find((item) => item.id === preselectedPaketId);
            if (match) {
              onPaketChange(match);
              setTab(match.kategori === "harian" ? "harian" : "bulanan");
            }
          }
        }
      })
      .catch(() => {
        if (isMounted) setState("error");
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDokumenUpload(jenis: "ktp" | "stnk" | "bpkb", file: File) {
    if (file.size > MAX_UPLOAD_SIZE) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingDokumen((prev) => ({ ...prev, [jenis]: true }));
    try {
      const path = buildStoragePath(`dokumen/motor/${transactionId}`, `${jenis}-${file.name}`);
      const url = await uploadToStorage(path, file);
      onDokumenMotorChange({ ...dokumenMotor, [`${jenis}Url`]: url });
      toast.success(`${jenis.toUpperCase()} terupload`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : `Gagal upload ${jenis.toUpperCase()}, coba lagi`);
    } finally {
      setUploadingDokumen((prev) => ({ ...prev, [jenis]: false }));
    }
  }

  const tanggalJatuhTempo =
    tanggalMasuk && paket
      ? addDays(tanggalMasuk, paket.durasiHari ?? 1)
      : null;

  const filteredPaketList = paketList.filter((item) =>
    tab === "harian" ? item.kategori === "harian" : item.kategori !== "harian"
  );

  const isSunday = tanggalMasuk ? tanggalMasuk.getDay() === 0 : false;
  const isSaturday = tanggalMasuk ? tanggalMasuk.getDay() === 6 : false;
  const armadaValid = tanggalMasuk ? isTanggalValidUntukArmada(tanggalMasuk) : true;
  const saturdaySatuHariConflict = isSaturday && paket?.durasiHari === 1;
  const isMotor = paket?.kategori === "motor";

  const nilaiDeklarasiNum = Number(deklarasi.nilaiDeklarasi) || 0;
  const tierGantiRugi = tentukanTier(nilaiDeklarasiNum);
  const durasiHari = paket?.durasiHari ?? 1;
  const premi = tierGantiRugi === "standar" ? 0 : hitungPremi(nilaiDeklarasiNum, durasiHari);

  useEffect(() => {
    if (tanggalMasuk && !armadaValid && metodePengiriman === "armada") {
      onMetodePengirimanChange("mandiri");
      onAntarJemputOptionChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggalMasuk, armadaValid]);

  function handleTanggalChange(date: Date) {
    if (date.getDay() === 0) {
      toast.error("Hub tutup di hari Minggu. Silakan pilih hari lain.");
      return;
    }
    onTanggalChange(date);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-tk-charcoal">Pilih Paket & Tanggal</h2>
        <p className="mt-1 text-sm text-tk-muted">
          Pilih paket yang sesuai, lalu tentukan tanggal masuk barang.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {(["harian", "bulanan"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg border-2 border-tk-charcoal px-5 py-2 text-sm font-bold transition-colors",
              tab === t ? "bg-tk-charcoal text-tk-cream" : "bg-tk-cream text-tk-charcoal"
            )}
          >
            {t === "harian" ? "🧳 Harian" : "🎓 Bulanan"}
          </button>
        ))}
      </div>

      {state === "loading" && <p className="text-sm text-tk-muted">Memuat paket...</p>}
      {state === "error" && (
        <p className="text-sm font-semibold text-[#C0392B]">
          Gagal memuat paket. Coba muat ulang halaman ini.
        </p>
      )}

      {state === "success" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPaketList.map((item) => {
            const isSelected = paket?.id === item.id;
            const isBlocked = isSaturday && item.durasiHari === 1;
            return (
              <button
                key={item.id}
                type="button"
                disabled={isBlocked}
                onClick={() => !isBlocked && onPaketChange(item)}
                className={cn(
                  "rounded-lg border-2 border-tk-charcoal bg-white p-4 text-left transition-all",
                  isSelected
                    ? "bg-tk-orange/15 [box-shadow:3px_3px_0_var(--tk-charcoal)]"
                    : "hover:[box-shadow:3px_3px_0_var(--tk-charcoal)]",
                  isBlocked && "cursor-not-allowed opacity-40 hover:shadow-none"
                )}
              >
                <p className="font-extrabold text-tk-charcoal">{item.nama}</p>
                <p className="text-xs text-tk-muted">
                  {item.durasiHari ? `${item.durasiHari} hari` : "Harian"}
                </p>
                <p className="mt-2 text-lg font-extrabold text-tk-orange">
                  {formatRupiah(item.harga)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {paket && (
        <div className="space-y-3">
          <Label className={tkLabelClass}>Tanggal Masuk Barang</Label>
          <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
            <Calendar
              mode="single"
              selected={tanggalMasuk ?? undefined}
              onSelect={(date) => date && handleTanggalChange(date)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0}
            />
          </div>

          {saturdaySatuHariConflict && (
            <div className="rounded-lg border-2 border-[#C0392B] bg-white p-3 text-xs font-semibold text-[#C0392B]">
              ⚠️ Titip 1 hari di hari Sabtu tidak tersedia karena hub tutup di hari Minggu. Pilih
              durasi minimal 2 hari, atau pilih hari lain.
            </div>
          )}

          {tanggalMasuk && tanggalJatuhTempo && (
            <p className="text-sm text-tk-muted">
              Masuk{" "}
              <span className="font-bold text-tk-charcoal">
                {format(tanggalMasuk, "d MMMM yyyy", { locale: localeId })}
              </span>{" "}
              &rarr; Jatuh tempo{" "}
              <span className="font-bold text-tk-charcoal">
                {format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
              </span>
            </p>
          )}
        </div>
      )}

      {paket && !isMotor && (
        <TkCard className="space-y-4">
          <p className="text-sm font-extrabold text-tk-charcoal">🛡️ Perlindungan Barang</p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setPilihDeklarasi(false);
                onDeklarasiChange({ nilaiDeklarasi: "" });
              }}
              className={cn(
                "w-full rounded-lg border-2 border-tk-charcoal px-4 py-3 text-left text-sm transition-colors",
                !pilihDeklarasi
                  ? "bg-tk-charcoal text-tk-cream"
                  : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              <span className="font-bold">○ Standar (tanpa deklarasi) — GRATIS</span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  !pilihDeklarasi ? "text-tk-cream/80" : "text-tk-muted"
                )}
              >
                {GANTI_RUGI.standar.deskripsi}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPilihDeklarasi(true)}
              className={cn(
                "w-full rounded-lg border-2 border-tk-charcoal px-4 py-3 text-left text-sm transition-colors",
                pilihDeklarasi
                  ? "bg-tk-charcoal text-tk-cream"
                  : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              <span className="font-bold">○ Saya ingin deklarasi nilai barang</span>
            </button>
          </div>

          {pilihDeklarasi && (
            <div>
              <Label htmlFor="nilaiDeklarasi" className={tkLabelClass}>
                Nilai Deklarasi (Rp)
              </Label>
              <Input
                id="nilaiDeklarasi"
                type="number"
                min={300001}
                placeholder="Contoh: 2000000"
                value={deklarasi.nilaiDeklarasi}
                onChange={(e) => onDeklarasiChange({ nilaiDeklarasi: e.target.value })}
                className={tkInputClass}
              />
              <p className="mt-1 text-xs text-tk-light">Minimal Rp300.001</p>

              {nilaiDeklarasiNum > 300_000 && (
                <div className="mt-3 rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-3 text-xs text-tk-charcoal">
                  {tierGantiRugi === "deklarasi" && (
                    <p>
                      <span className="font-extrabold">Tier Deklarasi</span> — Premi:{" "}
                      <span className="font-extrabold">{formatRupiah(premi)}</span>/bulan (1% dari
                      nilai)
                    </p>
                  )}
                  {tierGantiRugi === "bernilaiTinggi" && (
                    <>
                      <p>
                        <span className="font-extrabold">Tier Bernilai Tinggi</span> — Premi:{" "}
                        <span className="font-extrabold">{formatRupiah(premi)}</span>/bulan (2%
                        dari nilai)
                      </p>
                      <p className="mt-1 font-bold text-[#C0392B]">
                        ⚠️ Wajib tunjukkan foto nota/serial number saat serah terima di hub
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </TkCard>
      )}

      {paket && isMotor && (
        <TkCard className="space-y-4">
          <p className="text-sm font-extrabold text-tk-charcoal">🏍️ Dokumen Wajib untuk Titip Motor</p>
          <p className="text-xs text-tk-muted">
            Upload dokumen berikut (format JPG/PNG/PDF, maks. 5MB per file):
          </p>

          <DokumenUploadField
            id="ktp"
            label="KTP Pemilik Motor *"
            url={dokumenMotor.ktpUrl}
            isUploading={uploadingDokumen.ktp}
            onUpload={(file) => handleDokumenUpload("ktp", file)}
          />
          <DokumenUploadField
            id="stnk"
            label="STNK Motor *"
            url={dokumenMotor.stnkUrl}
            isUploading={uploadingDokumen.stnk}
            onUpload={(file) => handleDokumenUpload("stnk", file)}
          />
          <DokumenUploadField
            id="bpkb"
            label="BPKB (opsional, jika ada)"
            url={dokumenMotor.bpkbUrl}
            isUploading={uploadingDokumen.bpkb}
            onUpload={(file) => handleDokumenUpload("bpkb", file)}
          />

          <p className="text-xs text-tk-light">
            ℹ️ Dokumen disimpan aman dan hanya diakses oleh tim TitipKuy! untuk keperluan
            verifikasi kepemilikan.
          </p>
        </TkCard>
      )}

      {paket && tanggalMasuk && (
        <TkCard className="space-y-4">
          <Label className={tkLabelClass}>🚚 Bagaimana barang kamu sampai ke hub?</Label>

          {!armadaValid && (
            <div className="rounded-lg border-2 border-[#C0392B] bg-white p-3 text-xs font-semibold text-[#C0392B]">
              {isSunday
                ? "🚫 Armada tidak beroperasi di hari Minggu. Pilih hari lain atau gunakan opsi kirim mandiri."
                : "⚠️ Pemesanan armada minimal H-1 (24 jam sebelumnya). Untuk hari ini, pilih opsi kirim mandiri."}
            </div>
          )}

          <div className="space-y-2">
            {armadaValid && (
              <button
                type="button"
                onClick={() => onMetodePengirimanChange("armada")}
                className={cn(
                  "w-full rounded-lg border-2 border-tk-charcoal px-4 py-3 text-left text-sm transition-colors",
                  metodePengiriman === "armada"
                    ? "bg-tk-charcoal text-tk-cream"
                    : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                )}
              >
                <span className="font-bold">◉ Dijemput armada TitipKuy!</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onMetodePengirimanChange("mandiri");
                onAntarJemputOptionChange(null);
              }}
              className={cn(
                "w-full rounded-lg border-2 border-tk-charcoal px-4 py-3 text-left text-sm transition-colors",
                metodePengiriman === "mandiri"
                  ? "bg-tk-charcoal text-tk-cream"
                  : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
              )}
            >
              <span className="font-bold">
                ○ Saya kirim sendiri atau via Grab/Lalamove/ekspedisi
              </span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  metodePengiriman === "mandiri" ? "text-tk-cream/80" : "text-tk-muted"
                )}
              >
                Info: {HUB_CONFIG.suhat.nama}, {HUB_CONFIG.suhat.alamat}. Jam drop-off:{" "}
                {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu).
              </span>
            </button>
          </div>

          {metodePengiriman === "armada" ? (
            <AntarJemputPicker
              value={antarJemputOption}
              onChange={onAntarJemputOptionChange}
              hideMandiriOption
            />
          ) : (
            <div className="rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-3 text-xs text-tk-charcoal">
              📌 Jam drop-off ke {HUB_CONFIG.suhat.nama}: {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu).
              Alamat: {HUB_CONFIG.suhat.alamat}. Setelah submit, kamu akan dapat Kode Unik di
              halaman konfirmasi — tulis kode itu di kardus/koper sebelum dikirim.
            </div>
          )}
        </TkCard>
      )}
    </div>
  );
}

function DokumenUploadField({
  id,
  label,
  url,
  isUploading,
  onUpload,
}: {
  id: string;
  label: string;
  url: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const isPdf = url?.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <Label htmlFor={id} className={tkLabelClass}>
        {label}
      </Label>
      <Input
        id={id}
        type="file"
        accept="image/*,application/pdf"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className={tkInputClass}
      />
      {isUploading && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-tk-muted">
          <Loader2 className="animate-spin" size={12} />
          Mengupload...
        </p>
      )}
      {url && !isUploading && (
        <div className="mt-2 flex items-center gap-2">
          {isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-tk-orange-dark underline"
            >
              📄 Lihat file PDF
            </a>
          ) : (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-tk-charcoal">
              <Image src={url} alt={label} fill unoptimized className="object-cover" />
            </div>
          )}
          <p className="text-xs font-bold text-tk-sage-dark">✓ Terupload</p>
        </div>
      )}
    </div>
  );
}
