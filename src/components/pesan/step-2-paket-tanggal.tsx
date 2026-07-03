"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRupiah } from "@/lib/utils";
import { buildStoragePath, uploadToStorage } from "@/lib/supabase";
import { AntarJemputPicker } from "@/components/pesan/antar-jemput-picker";
import { HUB_CONFIG, JAM_DROP_OFF_MANDIRI } from "@/lib/constants";
import type { Paket } from "@/types/paket";
import type { DeklarasiData, MetodePengiriman } from "@/types/pesan";
import type { AntarJemputOption } from "@/types/antar-jemput";

const MAX_BUKTI_SIZE = 5 * 1024 * 1024; // 5MB

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
  metodePengiriman: MetodePengiriman;
  antarJemputOption: AntarJemputOption | null;
  preselectedPaketId?: string;
  preselectedMode?: "harian" | "bulanan";
  onPaketChange: (paket: Paket) => void;
  onTanggalChange: (date: Date) => void;
  onDeklarasiChange: (data: DeklarasiData) => void;
  onMetodePengirimanChange: (metode: MetodePengiriman) => void;
  onAntarJemputOptionChange: (option: AntarJemputOption | null) => void;
}

export function Step2PaketTanggal({
  transactionId,
  paket,
  tanggalMasuk,
  deklarasi,
  metodePengiriman,
  antarJemputOption,
  preselectedPaketId,
  preselectedMode,
  onPaketChange,
  onTanggalChange,
  onDeklarasiChange,
  onMetodePengirimanChange,
  onAntarJemputOptionChange,
}: Step2Props) {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [isUploadingBukti, setIsUploadingBukti] = useState(false);
  const [tab, setTab] = useState<"harian" | "bulanan">(preselectedMode ?? "harian");

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

  async function handleBuktiUpload(file: File) {
    if (file.size > MAX_BUKTI_SIZE) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploadingBukti(true);
    try {
      const path = buildStoragePath(`deklarasi/${transactionId}`, file.name);
      const url = await uploadToStorage(path, file);
      onDeklarasiChange({ ...deklarasi, buktiKepemilikanUrl: url });
      toast.success("Bukti kepemilikan terupload");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal upload bukti kepemilikan, coba lagi"
      );
    } finally {
      setIsUploadingBukti(false);
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
  const armadaValid = tanggalMasuk ? isTanggalValidUntukArmada(tanggalMasuk) : true;

  useEffect(() => {
    if (tanggalMasuk && !armadaValid && metodePengiriman === "armada") {
      onMetodePengirimanChange("mandiri");
      onAntarJemputOptionChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggalMasuk, armadaValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold">Pilih Paket & Tanggal</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Pilih paket yang sesuai, lalu tentukan tanggal masuk barang.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {(["harian", "bulanan"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
              tab === t
                ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                : "border-card-border text-foreground/70 hover:bg-primary/10"
            )}
          >
            {t === "harian" ? "🧳 Harian" : "🎓 Bulanan"}
          </button>
        ))}
      </div>

      {state === "loading" && (
        <p className="text-sm text-foreground/60">Memuat paket...</p>
      )}
      {state === "error" && (
        <p className="text-sm text-destructive">
          Gagal memuat paket. Coba muat ulang halaman ini.
        </p>
      )}

      {state === "success" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPaketList.map((item) => {
            const isSelected = paket?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPaketChange(item)}
                className={cn(
                  "glass-card rounded-2xl p-4 text-left transition-transform hover:scale-[1.02]",
                  isSelected && "gradient-border ring-2 ring-primary-from"
                )}
              >
                <p className="font-heading font-bold">{item.nama}</p>
                <p className="text-xs text-foreground/60">
                  {item.durasiHari ? `${item.durasiHari} hari` : "Harian"}
                </p>
                <p className="gradient-text mt-2 text-lg font-extrabold">
                  {formatRupiah(item.harga)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {paket && (
        <div className="space-y-3">
          <Label>Tanggal Masuk Barang</Label>
          <div className="glass-card inline-block rounded-2xl p-2">
            <Calendar
              mode="single"
              selected={tanggalMasuk ?? undefined}
              onSelect={(date) => date && onTanggalChange(date)}
              disabled={{ before: new Date() }}
            />
          </div>

          {tanggalMasuk && tanggalJatuhTempo && (
            <p className="text-sm text-foreground/70">
              Masuk{" "}
              <span className="font-semibold text-foreground">
                {format(tanggalMasuk, "d MMMM yyyy", { locale: localeId })}
              </span>{" "}
              &rarr; Jatuh tempo{" "}
              <span className="font-semibold text-foreground">
                {format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
              </span>
            </p>
          )}
        </div>
      )}

      {paket?.perluDeklarasi && (
        <div className="glass-card space-y-4 rounded-2xl p-5">
          <p className="text-sm font-semibold text-accent">
            Paket ini butuh deklarasi nilai barang
          </p>

          <div className="space-y-2">
            <Label htmlFor="nilaiDeklarasi">Nilai Deklarasi Barang (Rp)</Label>
            <Input
              id="nilaiDeklarasi"
              type="number"
              placeholder="Contoh: 5000000"
              value={deklarasi.nilaiDeklarasi}
              onChange={(e) =>
                onDeklarasiChange({ ...deklarasi, nilaiDeklarasi: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buktiKepemilikan">
              Bukti Kepemilikan (STNK/BPKB/nota)
            </Label>
            <Input
              id="buktiKepemilikan"
              type="file"
              accept="image/*,application/pdf"
              disabled={isUploadingBukti}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBuktiUpload(file);
              }}
            />
            <p className="text-xs text-foreground/50">Maksimal 5MB.</p>
            {isUploadingBukti && (
              <p className="text-xs text-foreground/60">Mengupload...</p>
            )}
            {deklarasi.buktiKepemilikanUrl && !isUploadingBukti && (
              <p className="text-xs text-primary-from">✓ Bukti sudah terupload</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsiDeklarasi">Deskripsi Detail Barang</Label>
            <Textarea
              id="deskripsiDeklarasi"
              placeholder="Merek, model, no seri, dll"
              value={deklarasi.deskripsiDeklarasi}
              onChange={(e) =>
                onDeklarasiChange({
                  ...deklarasi,
                  deskripsiDeklarasi: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {paket && tanggalMasuk && (
        <div className="glass-card space-y-4 rounded-2xl p-5">
          <Label>🚚 Bagaimana barang kamu sampai ke hub?</Label>

          {!armadaValid && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
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
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  metodePengiriman === "armada"
                    ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                    : "border-card-border text-foreground/80 hover:bg-primary/10"
                )}
              >
                <span className="font-semibold">◉ Dijemput armada TitipKuy!</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onMetodePengirimanChange("mandiri");
                onAntarJemputOptionChange(null);
              }}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                metodePengiriman === "mandiri"
                  ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                  : "border-card-border text-foreground/80 hover:bg-primary/10"
              )}
            >
              <span className="font-semibold">
                ○ Saya kirim sendiri atau via Grab/Lalamove/ekspedisi
              </span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  metodePengiriman === "mandiri" ? "text-white/80" : "text-foreground/50"
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
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
              📌 Jam drop-off ke {HUB_CONFIG.suhat.nama}: {JAM_DROP_OFF_MANDIRI} (Senin–Sabtu).
              Alamat: {HUB_CONFIG.suhat.alamat}. Setelah submit, kamu akan dapat Kode Unik di
              halaman konfirmasi — tulis kode itu di kardus/koper sebelum dikirim.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
