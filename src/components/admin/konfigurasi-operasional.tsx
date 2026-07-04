"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";
import { TkCard } from "@/components/ui/tk-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { tkInputClass, tkLabelClass } from "@/lib/form-style";
import { cn } from "@/lib/utils";
import type { KonfigurasiOperasional as KonfigurasiOperasionalType } from "@/types/armada";

interface KonfigurasiOperasionalProps {
  initialKonfigurasi: KonfigurasiOperasionalType;
}

export function KonfigurasiOperasional({ initialKonfigurasi }: KonfigurasiOperasionalProps) {
  const [lockH1, setLockH1] = useState(initialKonfigurasi.lockH1);
  const [lockHariMinggu, setLockHariMinggu] = useState(initialKonfigurasi.lockHariMinggu);
  const [tanggalMerah, setTanggalMerah] = useState<string[]>(initialKonfigurasi.tanggalMerah);
  const [pesanHariLibur, setPesanHariLibur] = useState(initialKonfigurasi.pesanHariLibur);
  const [tanggalBaru, setTanggalBaru] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  function handleTambahTanggal() {
    if (!tanggalBaru) return;
    const iso = format(tanggalBaru, "yyyy-MM-dd");
    if (tanggalMerah.includes(iso)) {
      toast.error("Tanggal itu sudah ada di daftar");
      return;
    }
    setTanggalMerah([...tanggalMerah, iso].sort());
    setTanggalBaru(undefined);
  }

  function handleHapusTanggal(iso: string) {
    setTanggalMerah(tanggalMerah.filter((t) => t !== iso));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/konfigurasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockH1, lockHariMinggu, tanggalMerah, pesanHariLibur }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan konfigurasi");

      toast.success("Konfigurasi disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TkCard className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2">
        <Label htmlFor="lockH1" className="cursor-pointer text-sm font-bold text-tk-charcoal">
          Kunci pemesanan H-1 (24 jam sebelum)
        </Label>
        <Switch id="lockH1" checked={lockH1} onCheckedChange={(checked) => setLockH1(checked === true)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border-2 border-tk-charcoal bg-white px-3 py-2">
        <Label htmlFor="lockHariMinggu" className="cursor-pointer text-sm font-bold text-tk-charcoal">
          Tidak ada armada hari Minggu
        </Label>
        <Switch
          id="lockHariMinggu"
          checked={lockHariMinggu}
          onCheckedChange={(checked) => setLockHariMinggu(checked === true)}
        />
      </div>

      <div className="space-y-2">
        <Label className={tkLabelClass}>Tanggal Merah</Label>
        {tanggalMerah.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tanggalMerah.map((iso) => (
              <span
                key={iso}
                className="flex items-center gap-1.5 rounded-[20px] border-2 border-tk-charcoal bg-tk-orange px-3 py-1 text-xs font-bold text-tk-charcoal"
              >
                {format(new Date(iso), "d MMM yyyy", { locale: localeId })}
                <button
                  type="button"
                  onClick={() => handleHapusTanggal(iso)}
                  aria-label={`Hapus tanggal ${iso}`}
                  className="hover:text-[#C0392B]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="inline-flex flex-col items-start gap-2 rounded-lg border-2 border-tk-charcoal bg-white p-2">
          <Calendar
            mode="single"
            selected={tanggalBaru}
            onSelect={setTanggalBaru}
          />
          <TkButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={!tanggalBaru}
            onClick={handleTambahTanggal}
            className="w-full justify-center"
          >
            Tambah Tanggal
          </TkButton>
        </div>
      </div>

      <div>
        <Label htmlFor="pesanHariLibur" className={tkLabelClass}>
          Pesan untuk Hari Libur
        </Label>
        <Textarea
          id="pesanHariLibur"
          rows={3}
          value={pesanHariLibur}
          onChange={(e) => setPesanHariLibur(e.target.value)}
          className={cn(tkInputClass, "min-h-20")}
        />
      </div>

      <TkButton
        type="button"
        variant="primary"
        disabled={isSaving}
        onClick={handleSave}
        className="w-full justify-center"
      >
        {isSaving && <Loader2 className="mr-2 animate-spin" size={16} />}
        Simpan
      </TkButton>
    </TkCard>
  );
}
