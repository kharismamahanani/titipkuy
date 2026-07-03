"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatRupiah } from "@/lib/utils";
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

  const jenisHarianOpt = JENIS_HARIAN.find((j) => j.value === jenisHarian)!;
  const jenisBulananOpt = JENIS_BULANAN.find((j) => j.value === jenisBulanan)!;
  const durasiBulananNum = Number(durasiBulanan);

  const subtotal = useMemo(() => {
    if (mode === "harian") return jenisHarianOpt.harga * durasiHari;
    return jenisBulananOpt.harga * jumlah * durasiBulananNum;
  }, [mode, jenisHarianOpt, durasiHari, jenisBulananOpt, jumlah, durasiBulananNum]);

  const antarJemputFee = antarJemput ? ANTAR_JEMPUT_HARGA[armadaTipe][radius] : 0;
  const total = subtotal + antarJemputFee;

  const rincianLabel =
    mode === "harian"
      ? `${jenisHarianOpt.label} × ${durasiHari} hari`
      : `${jenisBulananOpt.label} × ${jumlah} unit × ${durasiBulananNum} bulan`;

  return (
    <section id="kalkulator" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Hitung <span className="gradient-text">Biayamu</span> Dulu ⚡
          </h2>
          <p className="mt-3 text-foreground/70">
            Langsung tahu total sebelum pesan.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-8 flex justify-center gap-2">
            {(["harian", "bulanan"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                  mode === m
                    ? "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white"
                    : "border-card-border text-foreground/70 hover:bg-primary/10"
                )}
              >
                {m === "harian" ? "🧳 Harian" : "🎓 Bulanan"}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.15}>
            <div className="glass-card space-y-5 rounded-2xl p-6">
              {mode === "harian" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Jenis Barang</label>
                    <Select value={jenisHarian} onValueChange={(v) => v && setJenisHarian(v)}>
                      <SelectTrigger className="w-full">
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
                    <label className="text-sm font-medium text-foreground/80">Durasi (hari)</label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={durasiHari}
                      onChange={(e) =>
                        setDurasiHari(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Jenis</label>
                    <Select value={jenisBulanan} onValueChange={(v) => v && setJenisBulanan(v)}>
                      <SelectTrigger className="w-full">
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
                    <label className="text-sm font-medium text-foreground/80">Jumlah Unit</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={jumlah}
                      onChange={(e) =>
                        setJumlah(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Durasi</label>
                    <Select value={durasiBulanan} onValueChange={(v) => v && setDurasiBulanan(v)}>
                      <SelectTrigger className="w-full">
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
                <label className="text-sm font-medium text-foreground/80">
                  Layanan Antar-Jemput
                </label>
                <Switch checked={antarJemput} onCheckedChange={(v) => setAntarJemput(!!v)} />
              </div>

              {antarJemput && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground/60">Armada</label>
                    <Select value={armadaTipe} onValueChange={(v) => v && setArmadaTipe(v)}>
                      <SelectTrigger className="w-full">
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
                    <label className="text-xs font-medium text-foreground/60">Radius</label>
                    <Select value={radius} onValueChange={(v) => v && setRadius(v)}>
                      <SelectTrigger className="w-full">
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
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card gradient-border flex h-full flex-col rounded-2xl p-6">
              <p className="text-sm font-semibold text-foreground/80">Rincian Biaya</p>

              <div className="mt-4 flex-1 space-y-2 border-t border-card-border pt-4 text-sm">
                <div className="flex justify-between text-foreground/70">
                  <span>{rincianLabel}</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {antarJemput && (
                  <div className="flex justify-between text-foreground/70">
                    <span>
                      Antar-jemput ({ANTAR_JEMPUT_TIPE.find((t) => t.value === armadaTipe)?.label}
                      , {radius})
                    </span>
                    <span>+{formatRupiah(antarJemputFee)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
                <span className="font-heading font-bold">TOTAL</span>
                <span className="gradient-text font-heading text-2xl font-extrabold">
                  {formatRupiah(total)}
                </span>
              </div>

              <Link
                href="/pesan"
                className="mt-6 block rounded-full bg-gradient-to-r from-primary-from to-primary-to py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
              >
                Pesan Sekarang →
              </Link>

              <p className="mt-4 text-center text-xs text-foreground/50">
                Harga dapat berubah. Total final dikonfirmasi saat pemesanan.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
