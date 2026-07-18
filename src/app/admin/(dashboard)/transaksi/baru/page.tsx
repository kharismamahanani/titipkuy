"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { TkButton, tkButtonVariants } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";
import { cn, normalizeWhatsAppNumber, formatRupiah } from "@/lib/utils";
import { hitungHargaPaketTertagih } from "@/lib/harga-paket";
import { ADMIN_NAME } from "@/constants/site";
import { buildStoragePath, uploadToStorage } from "@/lib/supabase";
import { AKTIF_HUB_KEYS, HUB_CONFIG } from "@/lib/constants";
import { PenjemputanArmadaPicker } from "@/components/pesan/penjemputan-armada-picker";
import { AntarJemputPickerAdmin } from "@/components/admin/antar-jemput-picker-admin";
import { kodeTransaksi } from "@/lib/kode";
import { hargaAntarJemput, type AntarJemputSelection } from "@/types/antar-jemput";
import type { Paket } from "@/types/paket";
import { EMPTY_PENJEMPUTAN, type Hub, type PenjemputanData } from "@/types/slot";

const KAMPUS_OPTIONS = ["UB", "UM", "UIN", "Tidak Berlaku/Wisatawan"];
const HUB_OPTIONS: { value: Hub; label: string; alamat: string }[] = AKTIF_HUB_KEYS.map((key) => ({
  value: key,
  label: HUB_CONFIG[key].nama,
  alamat: HUB_CONFIG[key].alamat,
}));
const MAX_BUKTI_SIZE = 5 * 1024 * 1024;

const WHATSAPP_REGEX = /^(\+?62|0)8\d{8,11}$/;

interface SuccessData {
  id: string;
  nomorUrut: number;
  token: string;
}

export default function AdminBuatOrderManualPage() {
  const [transactionId] = useState(() => crypto.randomUUID());

  const [pelanggan, setPelanggan] = useState({
    nama: "",
    whatsapp: "",
    alamatKos: "",
    kampus: "",
    noKtpKtm: "",
  });

  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [paketId, setPaketId] = useState("");
  const [tanggalMasuk, setTanggalMasuk] = useState<Date | null>(null);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState<Date | null>(null);
  const [hub, setHub] = useState<Hub | "">(
    HUB_OPTIONS.length === 1 ? HUB_OPTIONS[0].value : ""
  );
  const [zonaRak, setZonaRak] = useState("");

  const [deklarasi, setDeklarasi] = useState({
    nilaiDeklarasi: "",
    deskripsiDeklarasi: "",
    buktiKepemilikanUrl: null as string | null,
  });
  const [isUploadingBukti, setIsUploadingBukti] = useState(false);

  const [antarJemput, setAntarJemput] = useState(false);
  const [penjemputan, setPenjemputan] = useState<PenjemputanData>(EMPTY_PENJEMPUTAN);
  const [antarJemputSelection, setAntarJemputSelection] = useState<AntarJemputSelection | null>(
    null
  );
  const [lokasiPelanggan, setLokasiPelanggan] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [kodeVoucherInput, setKodeVoucherInput] = useState("");
  const [voucherState, setVoucherState] = useState<"idle" | "checking" | "valid" | "invalid">(
    "idle"
  );
  const [voucherPersen, setVoucherPersen] = useState<number | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  useEffect(() => {
    fetch("/api/paket")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Paket[]) => setPaketList(data))
      .catch(() => setPaketList([]));
  }, []);

  const paket = paketList.find((p) => p.id === paketId) ?? null;

  const hargaSebelumDiskon =
    paket && tanggalMasuk && tanggalJatuhTempo
      ? hitungHargaPaketTertagih(paket, tanggalMasuk, tanggalJatuhTempo)
      : null;
  const hargaPaketTertagih =
    hargaSebelumDiskon != null && voucherState === "valid" && voucherPersen
      ? Math.round(hargaSebelumDiskon * (1 - voucherPersen / 100))
      : hargaSebelumDiskon;

  async function handleCekVoucher() {
    const kode = kodeVoucherInput.trim();
    if (!kode) return;

    setVoucherState("checking");
    setVoucherError(null);
    try {
      const res = await fetch(`/api/voucher/validasi?kode=${encodeURIComponent(kode)}`);
      const result = await res.json();

      if (!res.ok) {
        setVoucherState("invalid");
        setVoucherPersen(null);
        setVoucherError(result.error || "Kode voucher tidak valid");
        return;
      }

      setVoucherState("valid");
      setVoucherPersen(result.persenDiskon);
    } catch {
      setVoucherState("invalid");
      setVoucherError("Gagal mengecek voucher, coba lagi");
    }
  }

  useEffect(() => {
    if (paket && tanggalMasuk) {
      setTanggalJatuhTempo(addDays(tanggalMasuk, paket.durasiHari ?? 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paketId, tanggalMasuk]);

  async function handleBuktiUpload(file: File) {
    if (file.size > MAX_BUKTI_SIZE) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploadingBukti(true);
    try {
      const path = buildStoragePath(`deklarasi/${transactionId}`, file.name);
      const url = await uploadToStorage(path, file);
      setDeklarasi((prev) => ({ ...prev, buktiKepemilikanUrl: url }));
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

  function validate(): string | null {
    if (!pelanggan.nama.trim()) return "Nama lengkap wajib diisi";
    if (!WHATSAPP_REGEX.test(pelanggan.whatsapp.trim())) {
      return "Format No WhatsApp harus 08xx atau +628xx";
    }
    if (!paket) return "Pilih salah satu paket dahulu";
    if (!tanggalMasuk) return "Pilih tanggal masuk";
    if (!tanggalJatuhTempo) return "Tanggal jatuh tempo wajib diisi";
    if (!hub) return "Pilih hub penyimpanan";

    if (paket.perluDeklarasi) {
      if (!deklarasi.nilaiDeklarasi.trim()) return "Isi nilai deklarasi barang";
      if (!deklarasi.deskripsiDeklarasi.trim()) return "Isi deskripsi barang";
      if (!deklarasi.buktiKepemilikanUrl) return "Upload bukti kepemilikan barang";
    }

    if (antarJemput) {
      if (!penjemputan.hub) return "Pilih hub penjemputan";
      if (!penjemputan.tanggal) return "Pilih tanggal penjemputan";
      if (!penjemputan.sesiWaktu || !penjemputan.armadaId) {
        return "Pilih sesi dan armada penjemputan";
      }
    }

    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    if (!paket || !tanggalMasuk || !tanggalJatuhTempo) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/transaksi/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transactionId,
          pelanggan,
          paketId: paket.id,
          tanggalMasuk,
          tanggalJatuhTempo,
          hub,
          zonaRak: zonaRak || undefined,
          nilaiDeklarasi: deklarasi.nilaiDeklarasi ? Number(deklarasi.nilaiDeklarasi) : undefined,
          deskripsiDeklarasi: deklarasi.deskripsiDeklarasi || undefined,
          buktiKepemilikanUrl: deklarasi.buktiKepemilikanUrl || undefined,
          antarJemput,
          penjemputan: antarJemput
            ? {
                hub: penjemputan.hub,
                tanggal: penjemputan.tanggal ? format(penjemputan.tanggal, "yyyy-MM-dd") : null,
                sesiWaktu: penjemputan.sesiWaktu,
                armadaId: penjemputan.armadaId,
              }
            : undefined,
          catatanAdmin: catatanAdmin || undefined,
          kodeVoucher: voucherState === "valid" ? kodeVoucherInput.trim() : undefined,
          antarJemputId: antarJemputSelection?.option.id,
          layananJemput:
            antarJemputSelection?.layanan === "jemput-saja" ||
            antarJemputSelection?.layanan === "jemput-dan-antar" ||
            undefined,
          layananAntar:
            antarJemputSelection?.layanan === "antar-saja" ||
            antarJemputSelection?.layanan === "jemput-dan-antar" ||
            undefined,
          lokasiLat: lokasiPelanggan?.lat,
          lokasiLng: lokasiPelanggan?.lng,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat order manual");

      setSuccessData(result);
      toast.success("Order manual berhasil dibuat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  const confirmUrl = successData
    ? `${window.location.origin}/konfirmasi-manual/${successData.id}?token=${successData.token}`
    : "";
  // ✅ SUDAH DIISI — template pesan WhatsApp memakai ADMIN_NAME dari constants/site.ts
  const waMessage = successData
    ? `Halo ${pelanggan.nama}! Pesanan ${ADMIN_NAME}-mu sudah dibuat 🎉\nKlik link ini untuk baca pernyataan kesediaan, tanda tangan digital, dan konfirmasi pembayaran: ${confirmUrl}\nLink berlaku 24 jam. Ada pertanyaan? Balas WA ini ya!`
    : "";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Buat Order Manual</h1>
      <p className="mt-1 text-sm text-tk-muted">
        Untuk customer yang memesan lewat WhatsApp. Isi berdasarkan info dari chat.
      </p>

      <div className="mt-6 max-w-2xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-tk-charcoal">Data Pelanggan</h2>

          <div>
            <Label htmlFor="nama" className={tkLabelClass}>
              Nama Lengkap *
            </Label>
            <Input
              id="nama"
              value={pelanggan.nama}
              onChange={(e) => setPelanggan({ ...pelanggan, nama: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="whatsapp" className={tkLabelClass}>
              No WhatsApp *
            </Label>
            <Input
              id="whatsapp"
              placeholder="08xx atau +628xx"
              value={pelanggan.whatsapp}
              onChange={(e) => setPelanggan({ ...pelanggan, whatsapp: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="alamatKos" className={tkLabelClass}>
              Alamat Kos / Hotel
            </Label>
            <Input
              id="alamatKos"
              value={pelanggan.alamatKos}
              onChange={(e) => setPelanggan({ ...pelanggan, alamatKos: e.target.value })}
              className={tkInputClass}
            />
          </div>

          <div>
            <Label htmlFor="kampus" className={tkLabelClass}>
              Kampus
            </Label>
            <Select
              value={pelanggan.kampus}
              onValueChange={(v) => v && setPelanggan({ ...pelanggan, kampus: v })}
            >
              <SelectTrigger id="kampus" className={tkSelectTriggerClass}>
                <SelectValue placeholder="Pilih kampus">
                  {(v: string) => v || "Pilih kampus"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {KAMPUS_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="noKtpKtm" className={tkLabelClass}>
              No KTP/KTM (opsional)
            </Label>
            <Input
              id="noKtpKtm"
              value={pelanggan.noKtpKtm}
              onChange={(e) => setPelanggan({ ...pelanggan, noKtpKtm: e.target.value })}
              className={tkInputClass}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-tk-charcoal">Detail Pesanan</h2>

          <div>
            <Label htmlFor="paket" className={tkLabelClass}>
              Pilih Paket *
            </Label>
            <Select value={paketId} onValueChange={(v) => v && setPaketId(v)}>
              <SelectTrigger id="paket" className={tkSelectTriggerClass}>
                <SelectValue placeholder="Pilih paket">
                  {(v: string) => paketList.find((p) => p.id === v)?.nama ?? "Pilih paket"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paketList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className={tkLabelClass}>Tanggal Masuk *</Label>
              <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
                <Calendar
                  mode="single"
                  selected={tanggalMasuk ?? undefined}
                  onSelect={(date) => date && setTanggalMasuk(date)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={tkLabelClass}>Tanggal Jatuh Tempo *</Label>
              <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
                <Calendar
                  mode="single"
                  selected={tanggalJatuhTempo ?? undefined}
                  onSelect={(date) => date && setTanggalJatuhTempo(date)}
                />
              </div>
              {tanggalJatuhTempo && (
                <p className="text-xs text-tk-muted">
                  {format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
                </p>
              )}
            </div>
          </div>

          {hargaPaketTertagih != null && paket && (
            <div className="rounded-lg border-2 border-tk-orange bg-tk-orange/10 px-4 py-3 text-sm">
              <span className="text-tk-charcoal">
                Harga tertagih:{" "}
                <span className="font-extrabold">{formatRupiah(hargaPaketTertagih)}</span>
                {paket.kategori === "harian" && paket.durasiHari === null && (
                  <span className="text-tk-muted">
                    {" "}
                    ({formatRupiah(paket.harga)}/hari ×{" "}
                    {Math.round((hargaSebelumDiskon ?? hargaPaketTertagih) / paket.harga)} hari)
                  </span>
                )}
                {voucherState === "valid" && voucherPersen && hargaSebelumDiskon != null && (
                  <span className="ml-2 text-tk-muted line-through">
                    {formatRupiah(hargaSebelumDiskon)}
                  </span>
                )}
                {antarJemputSelection && (
                  <span className="ml-2">
                    + {formatRupiah(hargaAntarJemput(antarJemputSelection.option, antarJemputSelection.layanan))}{" "}
                    <span className="text-tk-muted">(antar-jemput)</span>
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="kodeVoucher" className={tkLabelClass}>
              Kode Voucher (opsional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="kodeVoucher"
                value={kodeVoucherInput}
                onChange={(e) => {
                  setKodeVoucherInput(e.target.value.toUpperCase());
                  if (voucherState !== "idle") {
                    setVoucherState("idle");
                    setVoucherPersen(null);
                    setVoucherError(null);
                  }
                }}
                placeholder="HEMAT10"
                className={cn(tkInputClass, "max-w-[200px]")}
              />
              <button
                type="button"
                onClick={handleCekVoucher}
                disabled={!kodeVoucherInput.trim() || voucherState === "checking"}
                className="rounded-lg border-2 border-tk-charcoal bg-white px-4 py-2 text-sm font-bold text-tk-charcoal transition-colors hover:bg-tk-cream-alt disabled:opacity-40"
              >
                {voucherState === "checking" ? <Loader2 className="animate-spin" size={16} /> : "Cek"}
              </button>
            </div>
            {voucherState === "valid" && voucherPersen && (
              <p className="text-xs font-bold text-tk-sage-dark">
                ✓ Voucher berlaku — diskon {voucherPersen}%
              </p>
            )}
            {voucherState === "invalid" && voucherError && (
              <p className="text-xs font-semibold text-[#C0392B]">✗ {voucherError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={tkLabelClass}>Hub Penyimpanan *</Label>
            {HUB_OPTIONS.length > 1 ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                {HUB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHub(opt.value)}
                    className={cn(
                      "flex-1 rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                      hub === opt.value
                        ? "bg-tk-charcoal text-tk-cream"
                        : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                    )}
                  >
                    <span className="font-bold">{opt.label}</span>{" "}
                    <span className="opacity-80">({opt.alamat})</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border-2 border-tk-charcoal bg-white px-4 py-2.5 text-sm text-tk-charcoal">
                <span className="font-bold">{HUB_OPTIONS[0]?.label}</span>{" "}
                <span className="opacity-80">({HUB_OPTIONS[0]?.alamat})</span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="zonaRak" className={tkLabelClass}>
              Zona Rak (opsional)
            </Label>
            <Input
              id="zonaRak"
              placeholder="Diisi setelah barang masuk"
              value={zonaRak}
              onChange={(e) => setZonaRak(e.target.value)}
              className={tkInputClass}
            />
          </div>
        </section>

        {paket?.perluDeklarasi && (
          <TkCard className="space-y-4">
            <h2 className="text-lg font-extrabold text-tk-orange-dark">
              Barang Bernilai Tinggi
            </h2>

            <div>
              <Label htmlFor="nilaiDeklarasi" className={tkLabelClass}>
                Nilai Deklarasi (Rp) *
              </Label>
              <Input
                id="nilaiDeklarasi"
                type="number"
                value={deklarasi.nilaiDeklarasi}
                onChange={(e) =>
                  setDeklarasi({ ...deklarasi, nilaiDeklarasi: e.target.value })
                }
                className={tkInputClass}
              />
            </div>

            <div>
              <Label htmlFor="deskripsiDeklarasi" className={tkLabelClass}>
                Deskripsi Barang *
              </Label>
              <Textarea
                id="deskripsiDeklarasi"
                placeholder="Merek, model, no seri"
                value={deklarasi.deskripsiDeklarasi}
                onChange={(e) =>
                  setDeklarasi({ ...deklarasi, deskripsiDeklarasi: e.target.value })
                }
                className={cn(tkInputClass, "min-h-24")}
              />
            </div>

            <div>
              <Label htmlFor="buktiKepemilikan" className={tkLabelClass}>
                Upload Bukti Kepemilikan (STNK/nota) *
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
                className={tkInputClass}
              />
              {isUploadingBukti && <p className="mt-1 text-xs text-tk-muted">Mengupload...</p>}
              {deklarasi.buktiKepemilikanUrl && !isUploadingBukti && (
                <p className="mt-1 text-xs font-bold text-tk-sage-dark">✓ Bukti sudah terupload</p>
              )}
            </div>
          </TkCard>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-tk-charcoal">Layanan Antar-Jemput</h2>
          <div className="flex items-center justify-between rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2">
            <Label htmlFor="antarJemput" className="cursor-pointer text-sm font-bold text-tk-charcoal">
              Ada antar-jemput?
            </Label>
            <Switch
              id="antarJemput"
              checked={antarJemput}
              onCheckedChange={(checked) => setAntarJemput(checked === true)}
            />
          </div>

          {antarJemput && (
            <>
              <AntarJemputPickerAdmin
                value={antarJemputSelection}
                onChange={setAntarJemputSelection}
                onLokasiChange={(lat, lng) => setLokasiPelanggan({ lat, lng })}
              />
              <PenjemputanArmadaPicker
                penjemputan={penjemputan}
                onChange={setPenjemputan}
                onKirimMandiri={() => setAntarJemput(false)}
              />
            </>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold text-tk-charcoal">Catatan Admin</h2>
          <Textarea
            placeholder="Catatan internal, tidak terlihat pelanggan"
            value={catatanAdmin}
            onChange={(e) => setCatatanAdmin(e.target.value)}
            className={cn(tkInputClass, "min-h-24")}
          />
        </section>

        <TkButton
          type="button"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full justify-center"
        >
          {isSubmitting && <Loader2 className="mr-2 animate-spin" size={16} />}
          Simpan & Generate Link Konfirmasi
        </TkButton>
      </div>

      <Dialog open={!!successData} onOpenChange={(open) => !open && setSuccessData(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-tk-charcoal">Order Berhasil Dibuat 🎉</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-tk-muted">
              Kode transaksi:{" "}
              <span className="font-bold text-tk-charcoal">
                {successData ? kodeTransaksi(successData.nomorUrut) : ""}
              </span>
            </p>

            <div>
              <Label className={tkLabelClass}>Link Konfirmasi</Label>
              <div className="flex gap-2">
                <Input readOnly value={confirmUrl} className={tkInputClass} />
                <TkButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(confirmUrl);
                    toast.success("Link disalin");
                  }}
                >
                  <Copy size={14} className="mr-1.5" />
                  Salin
                </TkButton>
              </div>
            </div>

            <div>
              <Label className={tkLabelClass}>Template Pesan WhatsApp</Label>
              <Textarea readOnly rows={6} value={waMessage} className={tkInputClass} />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <TkButton
                  type="button"
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => {
                    navigator.clipboard.writeText(waMessage);
                    toast.success("Pesan disalin");
                  }}
                >
                  Salin Pesan
                </TkButton>
                <a
                  href={`https://wa.me/${normalizeWhatsAppNumber(pelanggan.whatsapp)}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(tkButtonVariants({ variant: "primary", size: "md" }), "flex-1 justify-center")}
                >
                  Kirim via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
