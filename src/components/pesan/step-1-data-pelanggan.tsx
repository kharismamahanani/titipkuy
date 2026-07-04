"use client";

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

interface Step1Props {
  data: PelangganData;
  errors: Partial<Record<keyof PelangganData, string>>;
  onChange: (data: PelangganData) => void;
}

export function Step1DataPelanggan({ data, errors, onChange }: Step1Props) {
  function update<K extends keyof PelangganData>(key: K, value: PelangganData[K]) {
    onChange({ ...data, [key]: value });
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
          onChange={(e) => update("whatsapp", e.target.value)}
          aria-invalid={!!errors.whatsapp}
          className={tkInputClass}
        />
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
          Kampus
        </Label>
        <Select
          value={data.kampus || undefined}
          onValueChange={(value) => update("kampus", value as PelangganData["kampus"])}
        >
          <SelectTrigger id="kampus" className={tkSelectTriggerClass}>
            <SelectValue placeholder="Pilih kampus" />
          </SelectTrigger>
          <SelectContent>
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
