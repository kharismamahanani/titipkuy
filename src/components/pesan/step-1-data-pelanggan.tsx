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
        <h2 className="font-heading text-xl font-bold">Data Pelanggan</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Isi data diri kamu untuk proses penitipan barang.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          placeholder="Nama sesuai KTP/KTM"
          value={data.nama}
          onChange={(e) => update("nama", e.target.value)}
          aria-invalid={!!errors.nama}
        />
        {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">No WhatsApp</Label>
        <Input
          id="whatsapp"
          placeholder="08xxxxxxxxxx"
          inputMode="numeric"
          value={data.whatsapp}
          onChange={(e) => update("whatsapp", e.target.value)}
          aria-invalid={!!errors.whatsapp}
        />
        {errors.whatsapp && (
          <p className="text-xs text-destructive">{errors.whatsapp}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="alamatKos">Alamat Kos</Label>
        <Input
          id="alamatKos"
          placeholder="Jl. ... No. ..., Malang"
          value={data.alamatKos}
          onChange={(e) => update("alamatKos", e.target.value)}
          aria-invalid={!!errors.alamatKos}
        />
        {errors.alamatKos && (
          <p className="text-xs text-destructive">{errors.alamatKos}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kampus">Kampus</Label>
        <Select
          value={data.kampus || undefined}
          onValueChange={(value) => update("kampus", value as PelangganData["kampus"])}
        >
          <SelectTrigger id="kampus" className="w-full">
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

      <div className="space-y-2">
        <Label htmlFor="noKtpKtm">No KTP/KTM (opsional)</Label>
        <Input
          id="noKtpKtm"
          placeholder="Boleh dikosongkan"
          value={data.noKtpKtm}
          onChange={(e) => update("noKtpKtm", e.target.value)}
        />
      </div>
    </div>
  );
}
