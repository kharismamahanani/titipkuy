"use client";

import { useEffect, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { TkButton } from "@/components/ui/tk-button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { tkLabelClass } from "@/lib/form-style";
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
      // Kunci berdasarkan hari kalender (H-1), bukan jam sesi terakhir —
      // sebelumnya dibandingkan ke sesi siang jam 13:00, jadi H+1 ikut
      // terkunci begitu jam sekarang lewat 13:00 padahal seharusnya H+1
      // tetap bisa dipesan sepanjang hari ini (sampai 23:59).
      if (differenceInCalendarDays(date, new Date()) < 1) return true;
    }

    return false;
  }

  return (
    <div className="space-y-6 rounded-lg border-2 border-tk-charcoal bg-white p-5">
      <div>
        <p className="font-extrabold text-tk-charcoal">
          📅 Pilih Jadwal Antar-Jemput Armada TitipKuy!
        </p>
        <p className="mt-1 text-xs text-tk-muted">
          Maksimal pemesanan slot adalah H-1 (24 jam sebelum pengambilan). Penjemputan
          di hari Minggu/libur dialihkan ke hari kerja berikutnya.
        </p>
      </div>

      {HUB_OPTIONS.length > 1 && (
        <div className="space-y-2">
          <Label className={tkLabelClass}>Pilih Hub</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            {HUB_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleHubChange(opt.value)}
                className={cn(
                  "flex-1 rounded-lg border-2 border-tk-charcoal px-4 py-2.5 text-left text-sm transition-colors",
                  penjemputan.hub === opt.value
                    ? "bg-tk-charcoal text-tk-cream"
                    : "bg-white text-tk-charcoal hover:bg-tk-cream-alt"
                )}
              >
                <span className="font-bold">{opt.label}</span>{" "}
                <span className="opacity-80">({opt.alamat})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {penjemputan.hub && (
        <div className="space-y-2">
          <Label className={tkLabelClass}>Pilih Tanggal Penjemputan</Label>
          <div className="inline-block rounded-lg border-2 border-tk-charcoal bg-white p-2">
            <Calendar
              mode="single"
              selected={penjemputan.tanggal ?? undefined}
              onSelect={(date) => date && handleTanggalChange(date)}
              disabled={isDateDisabled}
            />
          </div>
          <p className="text-xs text-tk-light">🚫 Hari Minggu & tanggal merah: Hub tutup</p>
        </div>
      )}

      {isLoadingAvailability && (
        <p className="flex items-center gap-2 text-sm text-tk-muted">
          <Loader2 className="animate-spin" size={16} />
          Memuat ketersediaan slot...
        </p>
      )}

      {availability && availability.liburLocked && (
        <div className="space-y-3 rounded-lg border-2 border-tk-orange bg-tk-orange/10 p-4 text-sm text-tk-charcoal">
          <p>💡 {availability.pesanHariLibur}</p>
          <TkButton type="button" size="sm" variant="secondary" onClick={onKirimMandiri}>
            Saya mau kirim mandiri via Grab/Lalamove
          </TkButton>
        </div>
      )}

      {availability && !availability.liburLocked && (
        <div className="space-y-4">
          <Label className={tkLabelClass}>Pilih Sesi & Armada</Label>
          {(Object.keys(SLOT_SESI) as SesiWaktu[]).map((sesiWaktu) => {
            const sesiInfo = availability.sesi[sesiWaktu];
            return (
              <div key={sesiWaktu} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-tk-muted">
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
                          "flex items-center justify-between rounded-lg border-2 px-4 py-2.5 text-sm transition-colors",
                          disabled
                            ? "cursor-not-allowed border-[#D6CEC4] text-tk-light"
                            : isSelected
                              ? "border-tk-charcoal bg-tk-charcoal text-tk-cream"
                              : "border-tk-charcoal bg-white text-tk-charcoal hover:bg-tk-cream-alt"
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
