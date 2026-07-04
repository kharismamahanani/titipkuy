"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TkCard } from "@/components/ui/tk-card";
import { tkButtonVariants } from "@/components/ui/tk-button";
import { cn, formatRupiah } from "@/lib/utils";
import { useDeteksiLokasi } from "@/hooks/use-deteksi-lokasi";
import { DeteksiLokasiBlock } from "@/components/shared/deteksi-lokasi-block";
import type { KalkulatorMode } from "@/types/kalkulator";

// Katalog harga di-hardcode (bukan fetch API) supaya kalkulator tetap bisa
// dipakai meski API paket sedang lambat/error. Nilai diambil dari katalog
// resmi TitipKuy! — update manual di sini kalau ada perubahan harga.
const JENIS_HARIAN = [
  { value: "koper-kabin", label: "Koper Kabin (Box M)", harga: 15000 },
  { value: "koper-besar", label: "Koper Besar (Box L)", harga: 20000 },
  { value: "ransel", label: "Ransel/Sling (Box S)", harga: 10000 },
];

const JENIS_BULANAN = [
  { value: "box-s", label: "Box S", harga: 45000 },
  { value: "box-l", label: "Box L", harga: 70000 },
  { value: "koper-besar", label: "Koper Besar", harga: 80000 },
  { value: "elektronik-s", label: "Elektronik S", harga: 40000 },
  { value: "elektronik-l", label: "Elektronik L", harga: 95000 },
  { value: "motor", label: "Motor", harga: 150000 },
];

const DURASI_BULANAN = [
  { value: "1", label: "1 Bulan" },
  { value: "3", label: "3 Bulan" },
  { value: "6", label: "6 Bulan" },
];

const ANTAR_JEMPUT_TIPE = [
  { value: "motor", label: "Motor" },
  { value: "mobil", label: "Mobil" },
];

const ANTAR_JEMPUT_RADIUS = [
  { value: "<3km", label: "<3 km" },
  { value: "3-6km", label: "3–6 km" },
];

const ANTAR_JEMPUT_HARGA: Record<string, Record<string, number>> = {
  motor: { "<3km": 15000, "3-6km": 25000 },
  mobil: { "<3km": 45000, "3-6km": 60000 },
};

const ANTAR_JEMPUT_KAPASITAS: Record<string, string> = {
  motor: "Maks. 2 Box S atau 1 Koper Kabin",
  mobil: "Maks. 6 Box L atau Koper Besar",
};

const inputClass =
  "h-auto w-full rounded-lg border-2 border-tk-charcoal bg-tk-card px-[14px] py-[10px] font-sans text-sm text-tk-charcoal focus-visible:border-tk-charcoal focus-visible:ring-2 focus-visible:ring-tk-orange/40";

const triggerClass =
  "h-auto w-full rounded-lg border-2 border-tk-charcoal bg-tk-card px-[14px] py-[10px] font-sans text-sm text-tk-charcoal focus-visible:border-tk-charcoal focus-visible:ring-2 focus-visible:ring-tk-orange/40";

interface KalkulatorProps {
  mode: KalkulatorMode;
  onModeChange: (mode: KalkulatorMode) => void;
}

export function Kalkulator({ mode, onModeChange }: KalkulatorProps) {
  const [jenisHarian, setJenisHarian] = useState(JENIS_HARIAN[0].value);
  const [durasiHari, setDurasiHari] = useState(1);
  const [jenisBulanan, setJenisBulanan] = useState(JENIS_BULANAN[0].value);
  const [jumlah, setJumlah] = useState(1);
  const [durasiBulanan, setDurasiBulanan] = useState(DURASI_BULANAN[0].value);
  const [antarJemput, setAntarJemput] = useState(false);
  const [armadaTipe, setArmadaTipe] = useState(ANTAR_JEMPUT_TIPE[0].value);
  const [radius, setRadius] = useState(ANTAR_JEMPUT_RADIUS[0].value);
  const { detect, isDetecting, result: lokasiResult, error: lokasiError } = useDeteksiLokasi();

  function handleDetectLokasi() {
    detect((detected) => {
      if (detected.kategori === "jauh") return;
      setArmadaTipe("motor");
      setRadius(detected.kategori === "dekat" ? "<3km" : "3-6km");
    });
  }

  const disabledByJarak = lokasiResult?.kategori === "jauh";

  const jenisHarianOpt = JENIS_HARIAN.find((j) => j.value === jenisHarian)!;
  const jenisBulananOpt = JENIS_BULANAN.find((j) => j.value === jenisBulanan)!;
  const durasiBulananNum = Number(durasiBulanan);

  const subtotal = useMemo(() => {
    if (mode === "harian") return jenisHarianOpt.harga * durasiHari;
    return jenisBulananOpt.harga * jumlah * durasiBulananNum;
  }, [mode, jenisHarianOpt, durasiHari, jenisBulananOpt, jumlah, durasiBulananNum]);

  const antarJemputFee =
    antarJemput && !disabledByJarak ? ANTAR_JEMPUT_HARGA[armadaTipe][radius] : 0;
  const total = subtotal + antarJemputFee;

  const rincianLabel =
    mode === "harian"
      ? `${jenisHarianOpt.label} × ${durasiHari} hari`
      : `${jenisBulananOpt.label} × ${jumlah} unit × ${durasiBulananNum} bulan`;

  return (
    <section id="kalkulator" className="bg-tk-cream px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-tk-charcoal">
            Hitung Biaya Sekarang ⚡
          </h2>
          <p className="mt-3 text-tk-muted">Tahu total tagihan sebelum booking.</p>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {(["harian", "bulanan"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={cn(
                "rounded-lg border-2 border-tk-charcoal px-5 py-2 text-sm font-bold transition-colors",
                mode === m ? "bg-tk-charcoal text-tk-cream" : "bg-tk-cream text-tk-charcoal"
              )}
            >
              {m === "harian" ? "🧳 Harian" : "🎓 Bulanan"}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <TkCard className="space-y-5">
            {mode === "harian" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-tk-charcoal">Jenis Barang</label>
                  <Select value={jenisHarian} onValueChange={(v) => v && setJenisHarian(v)}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue>
                        {(v: string) =>
                          JENIS_HARIAN.find((opt) => opt.value === v)?.label ?? v
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_HARIAN.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} — {formatRupiah(opt.harga)}/hari
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-tk-charcoal">Durasi (hari)</label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={durasiHari}
                    onChange={(e) =>
                      setDurasiHari(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className={inputClass}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-tk-charcoal">Jenis</label>
                  <Select value={jenisBulanan} onValueChange={(v) => v && setJenisBulanan(v)}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue>
                        {(v: string) =>
                          JENIS_BULANAN.find((opt) => opt.value === v)?.label ?? v
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_BULANAN.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} — {formatRupiah(opt.harga)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-tk-charcoal">Jumlah Unit</label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={jumlah}
                    onChange={(e) =>
                      setJumlah(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-tk-charcoal">Durasi</label>
                  <Select value={durasiBulanan} onValueChange={(v) => v && setDurasiBulanan(v)}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue>
                        {(v: string) =>
                          DURASI_BULANAN.find((opt) => opt.value === v)?.label ?? v
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {DURASI_BULANAN.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-bold text-tk-charcoal">Layanan Antar-Jemput</label>
              <Switch checked={antarJemput} onCheckedChange={(v) => setAntarJemput(!!v)} />
            </div>

            {antarJemput && (
              <div className="space-y-3">
                <DeteksiLokasiBlock
                  isDetecting={isDetecting}
                  jarak={lokasiResult?.jarak ?? null}
                  kategori={lokasiResult?.kategori ?? null}
                  error={lokasiError}
                  onDetect={handleDetectLokasi}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-tk-muted">Armada</label>
                    <Select
                      value={armadaTipe}
                      onValueChange={(v) => v && setArmadaTipe(v)}
                      disabled={disabledByJarak}
                    >
                      <SelectTrigger className={triggerClass}>
                        <SelectValue>
                          {(v: string) =>
                            ANTAR_JEMPUT_TIPE.find((opt) => opt.value === v)?.label ?? v
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ANTAR_JEMPUT_TIPE.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-tk-muted">Radius</label>
                    <Select
                      value={radius}
                      onValueChange={(v) => v && setRadius(v)}
                      disabled={disabledByJarak}
                    >
                      <SelectTrigger className={triggerClass}>
                        <SelectValue>
                          {(v: string) =>
                            ANTAR_JEMPUT_RADIUS.find((opt) => opt.value === v)?.label ?? v
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ANTAR_JEMPUT_RADIUS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!disabledByJarak && (
                  <p className="text-xs text-tk-muted">{ANTAR_JEMPUT_KAPASITAS[armadaTipe]}</p>
                )}
              </div>
            )}
          </TkCard>

          <TkCard variant="outline" className="flex h-full flex-col">
            <p className="text-sm font-extrabold text-tk-charcoal">Rincian Biaya</p>

            <div className="mt-4 flex-1 space-y-2 border-t-2 border-tk-charcoal pt-4 text-sm">
              <div className="flex justify-between text-tk-muted">
                <span>{rincianLabel}</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {antarJemput && !disabledByJarak && (
                <div className="flex justify-between text-tk-muted">
                  <span>
                    Antar-jemput ({ANTAR_JEMPUT_TIPE.find((t) => t.value === armadaTipe)?.label}
                    , {radius})
                  </span>
                  <span>+{formatRupiah(antarJemputFee)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t-2 border-tk-charcoal pt-4">
              <span className="font-extrabold text-tk-charcoal">TOTAL</span>
              <span className="text-2xl font-extrabold text-tk-orange">
                {formatRupiah(total)}
              </span>
            </div>

            <Link
              href="/pesan"
              className={cn(tkButtonVariants({ variant: "primary", size: "md" }), "mt-6 justify-center")}
            >
              Pesan sekarang →
            </Link>

            <p className="mt-4 text-center text-xs text-tk-light">
              Harga dapat berubah. Total final dikonfirmasi saat pemesanan.
            </p>
          </TkCard>
        </div>
      </div>
    </section>
  );
}
