"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Input } from "@/components/ui/input";
import { tkInputClass } from "@/lib/form-style";
import { FotoKeluarUploader } from "@/components/admin/foto-keluar-uploader";
import { FotoLightboxGrid } from "@/components/admin/foto-lightbox-grid";
import { TandaiSelesaiButton } from "@/components/admin/tandai-selesai-button";
import type { Foto } from "@/types/transaksi";

interface PengambilanBarangSectionProps {
  transaksiId: string;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  fotoKeluar: Foto[];
  jumlahFotoKeluar: number;
}

interface OtpTerkirim {
  otp: string;
  berlakuHingga: string;
  waUrl: string;
}

export function PengambilanBarangSection({
  transaksiId,
  statusTransaksi,
  fotoKeluar,
  jumlahFotoKeluar,
}: PengambilanBarangSectionProps) {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpTerkirim, setOtpTerkirim] = useState<OtpTerkirim | null>(null);
  const [inputOtp, setInputOtp] = useState("");
  const [terverifikasi, setTerverifikasi] = useState(false);

  // Setelah transaksi SELESAI/DIBATALKAN, alur OTP+upload tidak lagi
  // relevan — tapi arsip foto keluar yang sudah pernah diupload tetap
  // harus bisa dilihat, bukan ikut hilang dari tampilan.
  if (statusTransaksi !== "AKTIF") {
    if (fotoKeluar.length === 0) return null;

    return (
      <section className="space-y-3">
        <h2 className="font-extrabold text-tk-charcoal">📸 Arsip Foto Keluar</h2>
        <FotoLightboxGrid fotos={fotoKeluar} emptyText="Belum ada foto keluar." />
      </section>
    );
  }

  async function handleKirimOtp() {
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}/kirim-otp`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat kode OTP");

      setOtpTerkirim(result);
      setInputOtp("");
      toast.success("OTP dibuat — salin atau kirim ke pelanggan via WA");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat kode OTP");
    } finally {
      setIsSending(false);
    }
  }

  function handleSalinOtp() {
    if (!otpTerkirim) return;
    navigator.clipboard
      .writeText(otpTerkirim.otp)
      .then(() => toast.success("OTP disalin"))
      .catch(() => toast.error("Gagal menyalin OTP"));
  }

  async function handleVerifikasi() {
    if (inputOtp.trim().length !== 6) {
      toast.error("Masukkan 6 digit kode OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}/verifikasi-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode: inputOtp.trim() }),
      });
      const result = await res.json();

      if (!result.valid) {
        toast.error(result.alasan || "Kode OTP tidak valid");
        return;
      }

      setTerverifikasi(true);
      toast.success("Identitas terverifikasi!");
    } catch {
      toast.error("Gagal memverifikasi OTP");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-extrabold text-tk-charcoal">🔐 Konfirmasi Pengambilan</h2>

      {!terverifikasi && (
        <TkCard className="space-y-4">
          <p className="text-sm text-tk-muted">
            Kirim kode OTP ke WA pelanggan untuk memverifikasi identitas sebelum barang
            diserahkan.
          </p>

          <TkButton
            type="button"
            variant="primary"
            disabled={isSending}
            onClick={handleKirimOtp}
          >
            {isSending && <Loader2 className="mr-1.5 animate-spin" size={16} />}
            Kirim OTP ke WA Pelanggan
          </TkButton>

          {otpTerkirim && (
            <div className="space-y-3 rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-4">
              <p className="text-sm text-tk-charcoal">
                OTP:{" "}
                <span className="text-lg font-extrabold tracking-widest">
                  {otpTerkirim.otp}
                </span>{" "}
                — berlaku hingga{" "}
                <span className="font-bold">
                  {format(new Date(otpTerkirim.berlakuHingga), "HH:mm", { locale: localeId })}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <TkButton type="button" variant="secondary" size="sm" onClick={handleSalinOtp}>
                  Salin OTP
                </TkButton>
                <a
                  href={otpTerkirim.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[var(--tk-radius)] border-[2.5px] border-tk-charcoal bg-tk-cream px-4 py-2 text-sm font-extrabold text-tk-charcoal [box-shadow:var(--tk-shadow-sm)] hover:bg-tk-cream-alt"
                >
                  <MessageCircle size={14} />
                  Kirim via WA manual
                </a>
              </div>

              <div className="flex items-end gap-2 pt-2">
                <div className="flex-1">
                  <label htmlFor="inputOtp" className="mb-1 block text-xs font-bold text-tk-charcoal">
                    Input OTP dari pelanggan
                  </label>
                  <Input
                    id="inputOtp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="______"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                    className={tkInputClass}
                  />
                </div>
                <TkButton
                  type="button"
                  variant="primary"
                  disabled={isVerifying || inputOtp.length !== 6}
                  onClick={handleVerifikasi}
                >
                  {isVerifying && <Loader2 className="mr-1.5 animate-spin" size={14} />}
                  Verifikasi OTP
                </TkButton>
              </div>
            </div>
          )}
        </TkCard>
      )}

      {terverifikasi && (
        <>
          <div className="flex items-center gap-2 rounded-lg border-2 border-tk-sage bg-tk-sage/15 p-3 text-sm font-bold text-tk-sage-dark">
            <ShieldCheck size={18} />
            Identitas terverifikasi — lanjutkan serahkan barang
          </div>

          <div className="space-y-3">
            <p className="text-sm text-tk-muted">
              Upload foto kondisi barang saat pelanggan mengambilnya.
            </p>
            <FotoKeluarUploader transaksiId={transaksiId} fotoKeluar={fotoKeluar} />
          </div>

          <TandaiSelesaiButton
            transaksiId={transaksiId}
            statusTransaksi={statusTransaksi}
            jumlahFotoKeluar={jumlahFotoKeluar}
          />
        </>
      )}
    </section>
  );
}
