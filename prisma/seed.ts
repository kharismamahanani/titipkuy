import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PAKET_DATA = [
  // ─── KATEGORI A — TITIP HARIAN ───
  {
    nama: "Harian - Box S (Ransel/Sling/Tote)",
    harga: 10000,
    kategori: "harian",
    durasiHari: null,
    deskripsi: "Ransel, sling bag, tote bag. Dihitung per hari kalender.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 1,
  },
  {
    nama: "Harian - Box M (Koper Kabin/Kardus Mie)",
    harga: 15000,
    kategori: "harian",
    durasiHari: null,
    deskripsi: "Koper kabin 20 inch atau kardus ukuran mie instan (40×30×25 cm).",
    perluDeklarasi: false,
    aktif: true,
    urutan: 2,
  },
  {
    nama: "Harian - Box L (Koper Besar/Kardus Rokok)",
    harga: 20000,
    kategori: "harian",
    durasiHari: null,
    deskripsi: "Koper besar 24-28 inch atau kardus ukuran rokok (60×40×40 cm).",
    perluDeklarasi: false,
    aktif: true,
    urutan: 3,
  },

  // ─── KATEGORI B — TITIP BULANAN ───
  {
    nama: "Bulanan - Box S",
    harga: 45000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi: "Kardus mie instan (40×30×25 cm). Min. 1 bulan.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 10,
  },
  {
    nama: "Bulanan - Box L",
    harga: 70000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi: "Kardus rokok (60×40×40 cm). Min. 1 bulan.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 11,
  },
  {
    nama: "Bulanan - Koper Besar / Carrier",
    harga: 80000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi: "Koper 24-28 inch atau tas carrier gunung. Min. 1 bulan.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 12,
  },
  {
    nama: "Bulanan - Elektronik S",
    harga: 40000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi: "Kipas angin, dispenser, rice cooker, printer. Wajib bubble wrap.",
    perluDeklarasi: true,
    aktif: true,
    urutan: 13,
  },
  {
    nama: "Bulanan - Elektronik L",
    harga: 95000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi: "Kulkas mini, TV, PC gaming. WAJIB bubble wrap & deklarasi nilai.",
    perluDeklarasi: true,
    aktif: true,
    urutan: 14,
  },
  {
    nama: "Titip Motor",
    harga: 150000,
    kategori: "motor",
    durasiHari: 30,
    deskripsi: "Hub Bunga Lely (garasi dalam). Wajib STNK & foto kondisi awal.",
    perluDeklarasi: true,
    aktif: true,
    urutan: 20,
  },

  // ─── PROMO PEMBUKAAN s.d. 31 Agustus 2026 ───
  {
    nama: "🎉 PROMO - Harian 3 Hari Box M",
    harga: 36000,
    kategori: "harian",
    durasiHari: 3,
    deskripsi:
      "Promo pembukaan! 3 hari Box M Rp36.000 (normal Rp45.000). Hemat 20%. Berlaku s.d. 31 Agustus 2026.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 40,
  },
  {
    nama: "🎉 PROMO - Bulanan Bundle Box S + Box L",
    harga: 100000,
    kategori: "bulanan",
    durasiHari: 30,
    deskripsi:
      "Promo pembukaan! 1x Box S + 1x Box L Rp100.000 (normal Rp115.000). Berlaku s.d. 31 Agustus 2026.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 41,
  },
  {
    nama: "🎉 PROMO - Magang 3 Bulan (5x Box S)",
    harga: 180000,
    kategori: "magang",
    durasiHari: 90,
    deskripsi:
      "Promo pembukaan! 5x Box S selama 3 bulan Rp180.000 (normal Rp225.000). Hemat Rp45.000. S.d. 31 Agustus 2026.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 42,
  },
  {
    nama: "🎉 PROMO - Magang 3 Bulan (5x Box L)",
    harga: 280000,
    kategori: "magang",
    durasiHari: 90,
    deskripsi:
      "Promo pembukaan! 5x Box L selama 3 bulan Rp280.000 (normal Rp350.000). Hemat Rp70.000. S.d. 31 Agustus 2026.",
    perluDeklarasi: false,
    aktif: true,
    urutan: 43,
  },
  {
    nama: "🎉 PROMO - Titip Motor 2 Bulan",
    harga: 270000,
    kategori: "motor",
    durasiHari: 60,
    deskripsi:
      "Promo pembukaan! Motor 2 bulan Rp270.000 (normal Rp300.000). Hemat Rp30.000. S.d. 31 Agustus 2026.",
    perluDeklarasi: true,
    aktif: true,
    urutan: 44,
  },
];

const ANTAR_JEMPUT_OPTIONS = [
  { label: "Motor - Radius <3 km dari hub", tipe: "motor", radiusLabel: "<3km", harga: 15000, aktif: true, urutan: 1 },
  { label: "Motor - Radius 3–6 km dari hub", tipe: "motor", radiusLabel: "3-6km", harga: 25000, aktif: true, urutan: 2 },
  { label: "Mobil - Radius <3 km dari hub", tipe: "mobil", radiusLabel: "<3km", harga: 45000, aktif: true, urutan: 3 },
  { label: "Mobil - Radius 3–6 km dari hub", tipe: "mobil", radiusLabel: "3-6km", harga: 60000, aktif: true, urutan: 4 },
];

async function seedPaket() {
  await prisma.$transaction([
    prisma.paket.deleteMany(),
    prisma.paket.createMany({ data: PAKET_DATA }),
  ]);
  console.log(`Seeded ${PAKET_DATA.length} paket.`);
}

async function seedAntarJemput() {
  await prisma.$transaction([
    prisma.antarJemputOption.deleteMany(),
    prisma.antarJemputOption.createMany({ data: ANTAR_JEMPUT_OPTIONS }),
  ]);
  console.log(`Seeded ${ANTAR_JEMPUT_OPTIONS.length} opsi antar-jemput.`);
}

async function main() {
  await seedPaket();
  await seedAntarJemput();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
