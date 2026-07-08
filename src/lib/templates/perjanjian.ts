import {
  GANTI_RUGI_STANDAR,
  GANTI_RUGI_DEKLARASI_MAKS,
  GANTI_RUGI_TINGGI_MAKS,
} from "@/lib/ganti-rugi";

const fmt = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export const PERJANJIAN_STANDAR = `PERNYATAAN KESEDIAAN PENITIPAN BARANG TITIPKUY!

Saya yang bertanda tangan di bawah ini menyatakan bahwa:
1. Saya telah membaca dan memahami seluruh syarat dan ketentuan layanan TitipKuy!
2. Saya bersedia mematuhi tata cara penitipan yang berlaku
3. Saya menyatakan bahwa barang yang dititipkan adalah milik saya atau saya memiliki wewenang untuk menitipkannya

1. PENGEMASAN BARANG
Saya memahami semua barang WAJIB dikemas dalam kardus tertutup atau dibungkus bubble wrap minimal 2 lapis sebelum dititipkan. TitipKuy! berhak menolak barang yang tidak terkemas sesuai ketentuan ini.

2. GANTI RUGI
Saya menyetujui ketentuan ganti rugi TitipKuy!:
- Tanpa deklarasi: maksimal ${fmt(GANTI_RUGI_STANDAR)} per barang (gratis, otomatis)
- Dengan deklarasi mandiri: sesuai nilai yang dinyatakan, maksimal ${fmt(GANTI_RUGI_DEKLARASI_MAKS)} (dikenakan premi 1% per bulan dari nilai barang)
- Barang bernilai tinggi (di atas ${fmt(GANTI_RUGI_DEKLARASI_MAKS)}): maksimal ${fmt(GANTI_RUGI_TINGGI_MAKS)} (premi 2% per bulan, wajib melampirkan foto nota pembelian/nomor seri)

Ganti rugi hanya berlaku untuk kerusakan atau kehilangan yang terbukti akibat kelalaian TitipKuy! dan didukung dokumentasi foto kondisi barang.

3. BARANG TERLARANG
Saya menyatakan barang yang dititipkan bukan narkotika, bahan berbahaya/mudah terbakar, makanan/minuman mudah busuk, hewan hidup, senjata, atau barang ilegal lainnya. Pelanggaran ketentuan ini menyebabkan pernyataan kesediaan ini batal tanpa pengembalian biaya, dan TitipKuy! berhak menolak atau mengeluarkan barang tersebut.

4. JANGKA WAKTU & DENDA KETERLAMBATAN
Saya paham akan dikenakan denda jika terlambat mengambil barang melewati tanggal jatuh tempo yang tercantum di pemesanan, sesuai kebijakan TitipKuy! yang berlaku saat itu.

5. BARANG TIDAK DIAMBIL
Saya paham barang yang tidak diambil dalam waktu lebih dari 30 (tiga puluh) hari sejak tanggal jatuh tempo tanpa konfirmasi dapat dilepas oleh TitipKuy! (termasuk dijual, disumbangkan, atau dimusnahkan) tanpa kewajiban kompensasi.

6. DOKUMENTASI
Saya menyetujui TitipKuy! mendokumentasikan kondisi barang melalui foto saat masuk dan keluar sebagai bukti kondisi, dan penggunaan foto tersebut sebagai bukti apabila terjadi perselisihan.

Dengan menandatangani pernyataan ini secara digital, saya menyatakan kesediaan saya untuk mematuhi seluruh ketentuan di atas dan menggunakan layanan TitipKuy! dengan itikad baik.`;

export const ADENDUM_BARANG_BERNILAI_TINGGI = `ADENDUM — BARANG BERNILAI TINGGI

Adendum ini berlaku tambahan atas Pernyataan Kesediaan Penitipan Barang TitipKuy! karena saya menitipkan barang yang memerlukan deklarasi nilai (barang bernilai tinggi seperti motor, elektronik, atau barang berharga lainnya).

1. NILAI DEKLARASI
Saya menyatakan bahwa nilai deklarasi yang saya isi pada form pemesanan adalah nilai yang benar dan wajar atas barang yang dititipkan, dan bersedia melampirkan bukti kepemilikan (STNK/BPKB/nota pembelian) sebagai dasar verifikasi.

2. BATAS GANTI RUGI
Apabila terjadi kehilangan atau kerusakan akibat kelalaian TitipKuy!, ganti rugi yang diberikan maksimal sebesar nilai deklarasi yang telah disepakati, dan tidak akan melebihi nilai yang tercantum pada bukti kepemilikan.

3. PERNYATAAN KEBENARAN DATA
Saya bertanggung jawab penuh atas kebenaran data (merek, model, nomor seri) dan nilai deklarasi yang saya isi. Apabila di kemudian hari ditemukan ketidaksesuaian atau indikasi penggelembungan nilai, TitipKuy! berhak menyesuaikan atau menolak klaim ganti rugi.`;
