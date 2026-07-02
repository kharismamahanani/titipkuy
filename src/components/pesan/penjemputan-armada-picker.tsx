"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AKTIF_HUB_KEYS, HUB_CONFIG, SLOT_SESI } from "@/lib/constants";
import type {
  ArmadaTipe,
  Hub,
  PenjemputanData,
  SesiWaktu,
  SlotAvailability,
  SlotConfig,
} from "@/types/slot";

const HUB_OPTIONS: { value: Hub; label: string; alamat: string }[] = AKTIF_HUB_KEYS.map((key) => ({
  value: key,
  label: HUB_CONFIG[key].nama,
  alamat: HUB_CONFIG[key].alamat,
}));

const ARMADA_TIPE_LABEL: Record<ArmadaTipe, string> = {
  motor: "Motor",
  mobil: "Mobil",
};

const H1_MS = 24 * 60 * 60 * 1000;

interface PenjemputanArmadaPickerProps {
  penjemputan: PenjemputanData;
  onChange: (data: PenjemputanData) => void;
  onKirimMandiri: () => void;
}

export function PenjemputanArmadaPicker({
  penjemputan,
  onChange,
  onKirimMandiri,
}: PenjemputanArmadaPickerProps) {
  const [config, setConfig] = useState<SlotConfig | null>(null);
  const [availability, setAvailability] = useState<SlotAvailability | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    fetch("/api/slot")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SlotConfig | null) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (!penjemputan.hub && HUB_OPTIONS.length === 1) {
      onChange({ ...penjemputan, hub: HUB_OPTIONS[0].value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!penjemputan.hub || !penjemputan.tanggal) {
      setAvailability(null);
      return;
    }

    const iso = format(penjemputan.tanggal, "yyyy-MM-dd");
    setIsLoadingAvailability(true);
    fetch(`/api/slot?tanggal=${iso}&hub=${penjemputan.hub}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SlotAvailability | null) => setAvailability(data))
      .catch(() => setAvailability(null))
      .finally(() => setIsLoadingAvailability(false));
  }, [penjemputan.hub, penjemputan.tanggal]);

  function handleHubChange(hub: Hub) {
    onChange({ ...penjemputan, hub, sesiWaktu: "", armadaTipe: "", armadaId: null });
  }

  function handleTanggalChange(tanggal: Date) {
    onChange({ ...penjemputan, tanggal, sesiWaktu: "", armadaTipe: "", armadaId: null });
  }

  function handlePilihSesi(sesiWaktu: SesiWaktu, armadaTipe: ArmadaTipe, armadaId: string) {
    onChange({ ...penjemputan, sesiWaktu, armadaTipe, armadaId });
  }

  function isDateDisabled(date: Date) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (date < startOfToday) return true;
    if (!config) return false;

    if (config.lockHariMinggu && date.getDay() === 0) return true;

    const iso = format(date, "yyyy-MM-dd");
    if (config.tanggalMerah.includes(iso)) return true;

    if (config.lockH1) {
      // Sesi siang (13:00) adalah sesi terakhir di hari itu — kalau sesi ini
      // saja sudah kurang dari 24 jam lagi, seluruh tanggal otomatis terkunci.
      const sesiSiangTerakhir = new Date(date);
      sesiSiangTerakhir.setHours(13, 0, 0, 0);
      if (sesiSiangTerakhir.getTime() - Date.now() < H1_MS) return true;
    }

    return false;
  }

  return (
    <div className="glass-card space-y-6 rounded-2xl p-5">
      <div>
        <p className="font-heading font-bold">
          📅 Pilih Jadwal Antar-Jemput Armada TitipKuy!
        </p>
        <p className="mt-1 text-xs text-foreground/60">
          Maksimal pemesanan slot adalah H-1 (24 jam sebelum pengambilan). Penjemputan
          di hari Minggu/libur dialihkan ke hari kerja berikutnya.
        </p>
      </div>

      {HUB_OPTIONS.length > 1 && (
        <div className="space-y-2">
          <Label>Pilih Hub</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            {HUB_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleHubChange(opt.value)}
                className={cn(
                  "flex-1 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  penjemputan.hub === opt.value
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
      )}

      {penjemputan.hub && (
        <div className="space-y-2">
          <Label>Pilih Tanggal Penjemputan</Label>
          <div className="glass-card inline-block rounded-2xl p-2">
            <Calendar
              mode="single"
              selected={penjemputan.tanggal ?? undefined}
              onSelect={(date) => date && handleTanggalChange(date)}
              disabled={isDateDisabled}
            />
          </div>
        </div>
      )}

      {isLoadingAvailability && (
        <p className="flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="animate-spin" size={16} />
          Memuat ketersediaan slot...
        </p>
      )}

      {availability && availability.liburLocked && (
        <div className="space-y-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <p>💡 {availability.pesanHariLibur}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onKirimMandiri}
            className="border-yellow-500/40 text-yellow-100 hover:bg-yellow-500/10"
          >
            Saya mau kirim mandiri via Grab/Lalamove
          </Button>
        </div>
      )}

      {availability && !availability.liburLocked && (
        <div className="space-y-4">
          <Label>Pilih Sesi & Armada</Label>
          {(Object.keys(SLOT_SESI) as SesiWaktu[]).map((sesiWaktu) => {
            const sesiInfo = availability.sesi[sesiWaktu];
            return (
              <div key={sesiWaktu} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Sesi {sesiWaktu} ({sesiInfo.label})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["motor", "mobil"] as const).map((tipe) => {
                    const info = sesiInfo[tipe];
                    const penuh = info.sisa <= 0 || !info.armadaId;
                    const disabled = sesiInfo.locked || penuh;
                    const isSelected =
                      penjemputan.sesiWaktu === sesiWaktu && penjemputan.armadaTipe === tipe;

                    return (
                      <button
                        key={tipe}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          info.armadaId && handlePilihSesi(sesiWaktu, tipe, info.armadaId)
                        }
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors",
                          disabled
                            ? "cursor-not-allowed border-card-border text-foreground/30"
                            : isSelected
                              ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                              : "border-card-border text-foreground/80 hover:bg-primary/10"
                        )}
                      >
                        <span>{ARMADA_TIPE_LABEL[tipe]}</span>
                        <span className="text-xs">
                          {sesiInfo.locked ? "Terkunci" : penuh ? "Penuh" : `${info.sisa} slot tersisa`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
