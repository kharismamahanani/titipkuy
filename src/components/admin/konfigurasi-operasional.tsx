"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
    <div className="glass-card space-y-5 rounded-2xl p-6">
      <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
        <Label htmlFor="lockH1" className="cursor-pointer">
          Kunci pemesanan H-1 (24 jam sebelum)
        </Label>
        <Switch id="lockH1" checked={lockH1} onCheckedChange={(checked) => setLockH1(checked === true)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2">
        <Label htmlFor="lockHariMinggu" className="cursor-pointer">
          Tidak ada armada hari Minggu
        </Label>
        <Switch
          id="lockHariMinggu"
          checked={lockHariMinggu}
          onCheckedChange={(checked) => setLockHariMinggu(checked === true)}
        />
      </div>

      <div className="space-y-2">
        <Label>Tanggal Merah</Label>
        {tanggalMerah.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tanggalMerah.map((iso) => (
              <span
                key={iso}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-from"
              >
                {format(new Date(iso), "d MMM yyyy", { locale: localeId })}
                <button
                  type="button"
                  onClick={() => handleHapusTanggal(iso)}
                  aria-label={`Hapus tanggal ${iso}`}
                  className="hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="glass-card inline-flex flex-col items-start gap-2 rounded-2xl p-2">
          <Calendar
            mode="single"
            selected={tanggalBaru}
            onSelect={setTanggalBaru}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!tanggalBaru}
            onClick={handleTambahTanggal}
            className="w-full"
          >
            Tambah Tanggal
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pesanHariLibur">Pesan untuk Hari Libur</Label>
        <Textarea
          id="pesanHariLibur"
          rows={3}
          value={pesanHariLibur}
          onChange={(e) => setPesanHariLibur(e.target.value)}
        />
      </div>

      <Button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
      >
        {isSaving && <Loader2 className="animate-spin" size={16} />}
        Simpan
      </Button>
    </div>
  );
}
