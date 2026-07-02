"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getWhatsAppUrl } from "@/constants/site";
import type { Paket } from "@/types/paket";
import type { KalkulatorMode } from "@/types/kalkulator";

// Belum ada kolom biaya antar-jemput di skema Paket, jadi dipakai angka
// tetap untuk estimasi. Total final tetap dikonfirmasi saat pemesanan.
const ANTAR_JEMPUT_FEE = 15000;

const JENIS_HARIAN = [
  { value: "koper-kecil", label: "Koper Kecil", keywords: ["kecil"] },
  { value: "koper-besar", label: "Koper Besar", keywords: ["besar"] },
  { value: "ransel", label: "Ransel/Tas", keywords: ["ransel", "tas"] },
];

const JENIS_BULANAN = [
  { value: "kardus", label: "Kardus (per box)", keywords: ["kardus"] },
  { value: "elektronik", label: "Elektronik/Barang Berharga", keywords: ["elektronik", "berharga"] },
  { value: "motor", label: "Sepeda Motor", keywords: ["motor"] },
];

const DURASI_BULANAN = [
  { value: "1bulan", label: "1 Bulan" },
  { value: "3bulan", label: "3 Bulan (Magang)" },
  { value: "6bulan", label: "6 Bulan (Magang)" },
];

function findMatch(
  paketList: Paket[],
  mode: KalkulatorMode,
  jenis: string,
  durasi: string
): Paket | null {
  const kategori =
    mode === "harian" ? "harian" : jenis === "motor" ? "motor" : durasi === "1bulan" ? "bulanan" : "magang";

  const candidates = paketList.filter((p) => p.kategori === kategori);
  if (candidates.length === 0) return null;

  const jenisOptions = mode === "harian" ? JENIS_HARIAN : JENIS_BULANAN;
  const keywords = [...(jenisOptions.find((j) => j.value === jenis)?.keywords ?? [])];
  if (kategori === "magang") keywords.push(durasi === "3bulan" ? "3" : "6");

  let best = candidates[0];
  let bestScore = -1;
  for (const p of candidates) {
    const haystack = `${p.nama} ${p.deskripsi ?? ""}`.toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (haystack.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

interface KalkulatorProps {
  mode: KalkulatorMode;
  onModeChange: (mode: KalkulatorMode) => void;
}

export function Kalkulator({ mode, onModeChange }: KalkulatorProps) {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [jenisHarian, setJenisHarian] = useState("koper-kecil");
  const [durasiHari, setDurasiHari] = useState(1);
  const [jenisBulanan, setJenisBulanan] = useState("kardus");
  const [jumlah, setJumlah] = useState(1);
  const [durasiBulanan, setDurasiBulanan] = useState("1bulan");
  const [antarJemput, setAntarJemput] = useState(false);

  useEffect(() => {
    fetch("/api/paket")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Paket[]) => setPaketList(data))
      .catch(() => setPaketList([]))
      .finally(() => setIsLoading(false));
  }, []);

  const jenis = mode === "harian" ? jenisHarian : jenisBulanan;
  const jenisLabel =
    (mode === "harian" ? JENIS_HARIAN : JENIS_BULANAN).find((j) => j.value === jenis)?.label ?? "";
  const multiplier = mode === "harian" ? durasiHari : jumlah;
  const unitLabel = mode === "harian" ? "hari" : "unit";

  const matchedPaket = useMemo(
    () => findMatch(paketList, mode, jenis, durasiBulanan),
    [paketList, mode, jenis, durasiBulanan]
  );

  const unitPrice = matchedPaket?.harga ?? null;
  const subtotal = unitPrice != null ? unitPrice * multiplier : null;
  const antarJemputFee = antarJemput ? ANTAR_JEMPUT_FEE : 0;
  const total = subtotal != null ? subtotal + antarJemputFee : null;

  return (
    <section id="kalkulator" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <FadeIn className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Hitung <span className="gradient-text">Biayamu</span> Sekarang ⚡
          </h2>
          <p className="mt-3 text-foreground/70">
            Langsung tahu tagihanmu sebelum pesan.
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
                          {(v: string) => JENIS_HARIAN.find((opt) => opt.value === v)?.label ?? v}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {JENIS_HARIAN.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                          {(v: string) => JENIS_BULANAN.find((opt) => opt.value === v)?.label ?? v}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {JENIS_BULANAN.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Jumlah Box / Unit</label>
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
                          {(v: string) => DURASI_BULANAN.find((opt) => opt.value === v)?.label ?? v}
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
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card gradient-border flex h-full flex-col rounded-2xl p-6">
              <p className="text-sm font-semibold text-foreground/80">Rincian Biaya</p>

              {isLoading ? (
                <p className="mt-4 text-sm text-foreground/60">Memuat harga...</p>
              ) : !matchedPaket ? (
                <div className="mt-4 flex-1 space-y-3">
                  <p className="text-sm text-foreground/60">
                    Paket untuk pilihan ini belum tersedia. Hubungi kami langsung, ya.
                  </p>
                  <a
                    href={getWhatsAppUrl("Halo TitipKuy! Boleh info harga untuk kebutuhan saya?")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-primary-from/60 px-5 py-2 text-sm font-semibold hover:bg-primary/10"
                  >
                    Tanya via WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex-1 space-y-2 border-t border-card-border pt-4 text-sm">
                    <div className="flex justify-between text-foreground/70">
                      <span>
                        {jenisLabel} &times; {multiplier} {unitLabel}
                      </span>
                      <span>{formatRupiah(subtotal ?? 0)}</span>
                    </div>
                    {antarJemput && (
                      <div className="flex justify-between text-foreground/70">
                        <span>Antar-jemput</span>
                        <span>{formatRupiah(antarJemputFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
                    <span className="font-heading font-bold">TOTAL</span>
                    <span className="gradient-text font-heading text-2xl font-extrabold">
                      {formatRupiah(total ?? 0)}
                    </span>
                  </div>

                  <Link
                    href={`/pesan?paketId=${matchedPaket.id}&mode=${mode}`}
                    className="mt-6 block rounded-full bg-gradient-to-r from-primary-from to-primary-to py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
                  >
                    Lanjut Pesan Sekarang →
                  </Link>
                </>
              )}

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
