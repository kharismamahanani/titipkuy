"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { cn, normalizeWhatsAppNumber } from "@/lib/utils";
import { uploadToStorage } from "@/lib/supabase";
import { HUB_CONFIG } from "@/lib/constants";
import { PenjemputanArmadaPicker } from "@/components/pesan/penjemputan-armada-picker";
import type { Paket } from "@/types/paket";
import { EMPTY_PENJEMPUTAN, type Hub, type PenjemputanData } from "@/types/slot";

const KAMPUS_OPTIONS = ["UB", "UM", "UIN", "Tidak Berlaku/Wisatawan"];
const HUB_OPTIONS: { value: Hub; label: string; alamat: string }[] = [
  { value: "suhat", label: HUB_CONFIG.suhat.nama, alamat: HUB_CONFIG.suhat.alamat },
  { value: "tidar", label: HUB_CONFIG.tidar.nama, alamat: HUB_CONFIG.tidar.alamat },
];
const MAX_BUKTI_SIZE = 5 * 1024 * 1024;

const WHATSAPP_REGEX = /^(\+?62|0)8\d{8,11}$/;

interface SuccessData {
  id: string;
  nomorRef: string;
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
  const [hub, setHub] = useState<Hub | "">("");
  const [zonaRak, setZonaRak] = useState("");

  const [deklarasi, setDeklarasi] = useState({
    nilaiDeklarasi: "",
    deskripsiDeklarasi: "",
    buktiKepemilikanUrl: null as string | null,
  });
  const [isUploadingBukti, setIsUploadingBukti] = useState(false);

  const [antarJemput, setAntarJemput] = useState(false);
  const [penjemputan, setPenjemputan] = useState<PenjemputanData>(EMPTY_PENJEMPUTAN);

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
      const path = `deklarasi/${transactionId}/${file.name}`;
      const url = await uploadToStorage(path, file);
      setDeklarasi((prev) => ({ ...prev, buktiKepemilikanUrl: url }));
      toast.success("Bukti kepemilikan terupload");
    } catch {
      toast.error("Gagal upload bukti kepemilikan, coba lagi");
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
  const waMessage = successData
    ? `Halo ${pelanggan.nama}! Pesanan TitipKuy!-mu sudah dibuat 🎉\nKlik link ini untuk baca perjanjian, tanda tangan digital, dan konfirmasi pembayaran: ${confirmUrl}\nLink berlaku 24 jam. Ada pertanyaan? Balas WA ini ya!`
    : "";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold">Buat Order Manual</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Untuk customer yang memesan lewat WhatsApp. Isi berdasarkan info dari chat.
      </p>

      <div className="mt-6 max-w-2xl space-y-8">
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold">Data Pelanggan</h2>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap *</Label>
            <Input
              id="nama"
              value={pelanggan.nama}
              onChange={(e) => setPelanggan({ ...pelanggan, nama: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">No WhatsApp *</Label>
            <Input
              id="whatsapp"
              placeholder="08xx atau +628xx"
              value={pelanggan.whatsapp}
              onChange={(e) => setPelanggan({ ...pelanggan, whatsapp: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamatKos">Alamat Kos / Hotel</Label>
            <Input
              id="alamatKos"
              value={pelanggan.alamatKos}
              onChange={(e) => setPelanggan({ ...pelanggan, alamatKos: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kampus">Kampus</Label>
            <Select
              value={pelanggan.kampus}
              onValueChange={(v) => v && setPelanggan({ ...pelanggan, kampus: v })}
            >
              <SelectTrigger id="kampus" className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="noKtpKtm">No KTP/KTM (opsional)</Label>
            <Input
              id="noKtpKtm"
              value={pelanggan.noKtpKtm}
              onChange={(e) => setPelanggan({ ...pelanggan, noKtpKtm: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold">Detail Pesanan</h2>

          <div className="space-y-2">
            <Label htmlFor="paket">Pilih Paket *</Label>
            <Select value={paketId} onValueChange={(v) => v && setPaketId(v)}>
              <SelectTrigger id="paket" className="w-full">
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
              <Label>Tanggal Masuk *</Label>
              <div className="glass-card inline-block rounded-2xl p-2">
                <Calendar
                  mode="single"
                  selected={tanggalMasuk ?? undefined}
                  onSelect={(date) => date && setTanggalMasuk(date)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Jatuh Tempo *</Label>
              <div className="glass-card inline-block rounded-2xl p-2">
                <Calendar
                  mode="single"
                  selected={tanggalJatuhTempo ?? undefined}
                  onSelect={(date) => date && setTanggalJatuhTempo(date)}
                />
              </div>
              {tanggalJatuhTempo && (
                <p className="text-xs text-foreground/60">
                  {format(tanggalJatuhTempo, "d MMMM yyyy", { locale: localeId })}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pilih Hub *</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              {HUB_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHub(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                    hub === opt.value
                      ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                      : "border-card-border text-foreground/80 hover:bg-primary/10"
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>{" "}
                  <span className="opacity-80">({opt.alamat})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zonaRak">Zona Rak (opsional)</Label>
            <Input
              id="zonaRak"
              placeholder="Diisi setelah barang masuk"
              value={zonaRak}
              onChange={(e) => setZonaRak(e.target.value)}
            />
          </div>
        </section>

        {paket?.perluDeklarasi && (
          <section className="glass-card space-y-4 rounded-2xl p-5">
            <h2 className="font-heading text-lg font-bold text-accent">
              Barang Bernilai Tinggi
            </h2>

            <div className="space-y-2">
              <Label htmlFor="nilaiDeklarasi">Nilai Deklarasi (Rp) *</Label>
              <Input
                id="nilaiDeklarasi"
                type="number"
                value={deklarasi.nilaiDeklarasi}
                onChange={(e) =>
                  setDeklarasi({ ...deklarasi, nilaiDeklarasi: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsiDeklarasi">Deskripsi Barang *</Label>
              <Textarea
                id="deskripsiDeklarasi"
                placeholder="Merek, model, no seri"
                value={deklarasi.deskripsiDeklarasi}
                onChange={(e) =>
                  setDeklarasi({ ...deklarasi, deskripsiDeklarasi: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buktiKepemilikan">Upload Bukti Kepemilikan (STNK/nota) *</Label>
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
              {isUploadingBukti && (
                <p className="text-xs text-foreground/60">Mengupload...</p>
              )}
              {deklarasi.buktiKepemilikanUrl && !isUploadingBukti && (
                <p className="text-xs text-primary-from">✓ Bukti sudah terupload</p>
              )}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold">Layanan Antar-Jemput</h2>
          <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
            <Label htmlFor="antarJemput" className="cursor-pointer">
              Ada antar-jemput?
            </Label>
            <Switch
              id="antarJemput"
              checked={antarJemput}
              onCheckedChange={(checked) => setAntarJemput(checked === true)}
            />
          </div>

          {antarJemput && (
            <PenjemputanArmadaPicker
              penjemputan={penjemputan}
              onChange={setPenjemputan}
              onKirimMandiri={() => setAntarJemput(false)}
            />
          )}
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Catatan Admin</h2>
          <Textarea
            placeholder="Catatan internal, tidak terlihat pelanggan"
            value={catatanAdmin}
            onChange={(e) => setCatatanAdmin(e.target.value)}
          />
        </section>

        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={16} />}
          Simpan & Generate Link Konfirmasi
        </Button>
      </div>

      <Dialog open={!!successData} onOpenChange={(open) => !open && setSuccessData(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Berhasil Dibuat 🎉</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Nomor referensi: <span className="font-semibold">{successData?.nomorRef}</span>
            </p>

            <div className="space-y-2">
              <Label>Link Konfirmasi</Label>
              <div className="flex gap-2">
                <Input readOnly value={confirmUrl} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(confirmUrl);
                    toast.success("Link disalin");
                  }}
                >
                  <Copy size={14} />
                  Salin
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Template Pesan WhatsApp</Label>
              <Textarea readOnly rows={6} value={waMessage} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(waMessage);
                    toast.success("Pesan disalin");
                  }}
                >
                  Salin Pesan
                </Button>
                <a
                  href={`https://wa.me/${normalizeWhatsAppNumber(pelanggan.whatsapp)}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-gradient-to-r from-primary-from to-primary-to px-4 py-2 text-center text-sm font-semibold text-white"
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
