"use client";

import { JAM_DROP_OFF_MANDIRI } from "@/lib/constants";

const STEPS = [
  "Isi form pemesanan di website — Kode Unik langsung muncul di halaman konfirmasi setelah submit. Catat atau screenshot kodenya (contoh: LELY-089).",
  "Tulis kode itu dengan spidol besar di luar kardus/koper.",
  `Pesan Grab/Lalamove atau datang langsung ke Hub Suhat pada: 📍 Jam Drop-Off: ${JAM_DROP_OFF_MANDIRI} (di luar jam ini hub bisa sedang tidak ada pegawai).`,
  "Pegawai memotret kondisi barang saat diterima.",
  "Pegawai memasang label bernomor seri pada kardus/koper.",
  "Nomor label dikirim ke WhatsApp kamu sebagai bukti ✅",
];

export function CaraTitipMandiri() {
  return (
    <section className="bg-tk-card px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-tk-charcoal">Titip Mandiri 📦</h2>
          <p className="mt-3 text-tk-muted">Kirim via Grab, Lalamove, atau datang langsung.</p>
        </div>

        <div className="mt-8 rounded-lg border-2 border-[#C0392B] bg-[#C0392B]/10 p-4 text-sm font-bold text-[#C0392B]">
          📦 SYARAT WAJIB: Semua barang harus dalam kardus tertutup atau terbungkus bubble
          wrap. Barang tanpa kemasan TIDAK diterima.
        </div>

        <div className="mt-8 space-y-2">
          {STEPS.map((text, index) => (
            <div key={text} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-tk-charcoal bg-tk-orange text-sm font-extrabold text-tk-charcoal">
                  {index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mt-1 h-full w-[2px] flex-1 bg-[#D6CEC4]" />
                )}
              </div>
              <p className="pb-8 pt-1.5 text-sm text-tk-charcoal">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border-2 border-tk-charcoal bg-tk-cream-alt p-5 text-sm text-tk-charcoal">
          📦 Kirim dari luar kota via ekspedisi (JNE, J&amp;T, dll)? Tulis Kode Unik di luar
          paket dan sertakan kertas kecil berisi nama + no. HP di dalam paket. Hubungi admin
          via WhatsApp setelah paket dikirim agar bisa dipantau kedatangannya.
        </div>

        <div className="mt-4 rounded-lg border-2 border-tk-charcoal bg-tk-cream-alt p-5 text-sm text-tk-charcoal">
          💡 Drop-off mandiri tidak perlu booking slot armada. Cukup isi form web, dapat
          kode unik, dan datang/kirim pada jam drop-off di atas.
        </div>
      </div>
    </section>
  );
}
