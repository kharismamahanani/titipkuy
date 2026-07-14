"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tkErrorClass, tkInputClass, tkLabelClass, tkSelectTriggerClass } from "@/lib/form-style";
import { KAMPUS_OPTIONS, type PelangganData } from "@/types/pesan";

const WHATSAPP_REGEX = /^08\d{8,11}$/;

interface Step1Props {
  data: PelangganData;
  errors: Partial<Record<keyof PelangganData, string>>;
  onChange: (data: PelangganData) => void;
}

export function Step1DataPelanggan({ data, errors, onChange }: Step1Props) {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [alreadyLookedUp, setAlreadyLookedUp] = useState(false);

  function update<K extends keyof PelangganData>(key: K, value: PelangganData[K]) {
    onChange({ ...data, [key]: value });
  }

  async function handleWhatsappBlur() {
    const whatsapp = data.whatsapp.trim();
    if (!WHATSAPP_REGEX.test(whatsapp) || alreadyLookedUp) return;

    setIsLookingUp(true);
    setAlreadyLookedUp(true);
    try {
      const res = await fetch(`/api/pelanggan/cari?whatsapp=${encodeURIComponent(whatsapp)}`);
      if (!res.ok) return;

      const found: {
        nama: string;
        alamatKos: string;
        kampus: string | null;
        noKtpKtm: string | null;
      } = await res.json();

      onChange({
        ...data,
        nama: data.nama.trim() ? data.nama : found.nama,
        alamatKos: data.alamatKos.trim() ? data.alamatKos : found.alamatKos,
        kampus: data.kampus || ((found.kampus as PelangganData["kampus"]) ?? ""),
        noKtpKtm: data.noKtpKtm.trim() ? data.noKtpKtm : found.noKtpKtm ?? "",
      });
      toast.success("Ketemu! Data pemesanan sebelumnya otomatis diisi.");
    } catch {
      // Diam-diam gagal — pelanggan baru tetap isi manual seperti biasa.
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-tk-charcoal">Data Pelanggan</h2>
        <p className="mt-1 text-sm text-tk-muted">
          Isi data diri kamu untuk proses penitipan barang.
        </p>
      </div>

      <div>
        <Label htmlFor="nama" className={tkLabelClass}>
          Nama Lengkap
        </Label>
        <Input
          id="nama"
          placeholder="Nama sesuai KTP/KTM"
          value={data.nama}
          onChange={(e) => update("nama", e.target.value)}
          aria-invalid={!!errors.nama}
          className={tkInputClass}
        />
        {errors.nama && <p className={tkErrorClass}>{errors.nama}</p>}
      </div>

      <div>
        <Label htmlFor="whatsapp" className={tkLabelClass}>
          No WhatsApp
        </Label>
        <Input
          id="whatsapp"
          placeholder="08xxxxxxxxxx"
          inputMode="numeric"
          value={data.whatsapp}
          onChange={(e) => {
            update("whatsapp", e.target.value);
            setAlreadyLookedUp(false);
          }}
          onBlur={handleWhatsappBlur}
          aria-invalid={!!errors.whatsapp}
          className={tkInputClass}
        />
        {isLookingUp && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-tk-muted">
            <Loader2 className="animate-spin" size={12} />
            Mengecek data pemesanan sebelumnya...
          </p>
        )}
        {errors.whatsapp && <p className={tkErrorClass}>{errors.whatsapp}</p>}
      </div>

      <div>
        <Label htmlFor="alamatKos" className={tkLabelClass}>
          Alamat Kos
        </Label>
        <Input
          id="alamatKos"
          placeholder="Jl. ... No. ..., Malang"
          value={data.alamatKos}
          onChange={(e) => update("alamatKos", e.target.value)}
          aria-invalid={!!errors.alamatKos}
          className={tkInputClass}
        />
        {errors.alamatKos && <p className={tkErrorClass}>{errors.alamatKos}</p>}
      </div>

      <div>
        <Label htmlFor="kampus" className={tkLabelClass}>
          Kampus (opsional)
        </Label>
        <Select
          value={data.kampus || "none"}
          onValueChange={(value) =>
            update("kampus", value === "none" ? "" : (value as PelangganData["kampus"]))
          }
        >
          <SelectTrigger id="kampus" className={tkSelectTriggerClass}>
            <SelectValue placeholder="-- Tidak ada / Wisatawan --">
              {(v: string) => (v === "none" ? "-- Tidak ada / Wisatawan --" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Tidak ada / Wisatawan --</SelectItem>
            {KAMPUS_OPTIONS.map((kampus) => (
              <SelectItem key={kampus} value={kampus}>
                {kampus}
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
          placeholder="Boleh dikosongkan"
          value={data.noKtpKtm}
          onChange={(e) => update("noKtpKtm", e.target.value)}
          className={tkInputClass}
        />
      </div>
    </div>
  );
}
