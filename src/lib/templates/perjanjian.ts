export const PERJANJIAN_STANDAR = `PERJANJIAN PENITIPAN BARANG TITIPKUY!

Perjanjian ini dibuat antara TitipKuy! ("Penyedia Jasa") dan Pelanggan yang mengisi form pemesanan ("Penitip"), yang berlaku sejak tanggal barang diserahkan kepada Penyedia Jasa.

1. GANTI RUGI
Penyedia Jasa bertanggung jawab atas kehilangan atau kerusakan barang akibat kelalaian Penyedia Jasa, dengan batas maksimal ganti rugi Rp500.000 (lima ratus ribu rupiah) per kardus/barang, kecuali Penitip mengisi nilai deklarasi resmi di awal pemesanan — maka ganti rugi mengikuti nilai deklarasi tersebut, maksimal sesuai bukti kepemilikan yang dilampirkan.

2. BARANG TERLARANG
Penitip dilarang menitipkan makanan/minuman mudah basi, bahan berbahaya/mudah terbakar, hewan hidup, senjata, narkotika, atau barang ilegal lainnya. Penyedia Jasa berhak menolak atau mengeluarkan barang tersebut tanpa kompensasi apa pun.

3. JANGKA WAKTU & DENDA KETERLAMBATAN
Barang harus diambil paling lambat pada tanggal jatuh tempo yang tercantum di pemesanan. Keterlambatan pengambilan akan dikenakan denda harian sesuai kebijakan Penyedia Jasa yang berlaku saat itu.

4. BARANG TIDAK DIAMBIL
Apabila barang tidak diambil dalam waktu lebih dari 30 (tiga puluh) hari sejak tanggal jatuh tempo tanpa konfirmasi dari Penitip, Penyedia Jasa berhak melepas kepemilikan barang tersebut (termasuk menjual, menyumbangkan, atau memusnahkannya) tanpa kewajiban kompensasi kepada Penitip.

5. DOKUMENTASI
Penyedia Jasa akan mendokumentasikan kondisi barang melalui foto saat barang masuk dan keluar sebagai bukti kondisi, dan Penitip menyetujui penggunaan foto tersebut sebagai bukti dalam hal terjadi perselisihan.

6. PERSETUJUAN
Dengan mencentang kotak persetujuan dan menandatangani secara digital pada form pemesanan, Penitip menyatakan telah membaca, memahami, dan menyetujui seluruh isi perjanjian ini.`;

export const ADENDUM_BARANG_BERNILAI_TINGGI = `ADENDUM — BARANG BERNILAI TINGGI

Adendum ini berlaku tambahan atas Perjanjian Penitipan Barang TitipKuy! karena Penitip menitipkan barang yang memerlukan deklarasi nilai (barang bernilai tinggi seperti motor, elektronik, atau barang berharga lainnya).

1. NILAI DEKLARASI
Penitip menyatakan bahwa nilai deklarasi yang diisi pada form pemesanan adalah nilai yang benar dan wajar atas barang yang dititipkan, dan bersedia melampirkan bukti kepemilikan (STNK/BPKB/nota pembelian) sebagai dasar verifikasi.

2. BATAS GANTI RUGI
Apabila terjadi kehilangan atau kerusakan akibat kelalaian Penyedia Jasa, ganti rugi yang diberikan adalah maksimal sebesar nilai deklarasi yang telah disepakati, dan tidak akan melebihi nilai yang tercantum pada bukti kepemilikan.

3. PERNYATAAN KEBENARAN DATA
Penitip bertanggung jawab penuh atas kebenaran data (merek, model, nomor seri) dan nilai deklarasi yang diisi. Apabila di kemudian hari ditemukan ketidaksesuaian atau indikasi penggelembungan nilai, Penyedia Jasa berhak menyesuaikan atau menolak klaim ganti rugi.`;

export function generateNomorRef(
  hub: string,
  paketKategori: string,
  urutan: number
): string {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const urutanStr = String(urutan).padStart(4, "0");

  // Catatan: format resmi nomorRef adalah TK-[HUB]-[YYYYMM]-[XXXX] (lihat
  // prisma/schema.prisma). Parameter `paketKategori` disediakan sesuai
  // permintaan untuk keperluan pencatatan/urutan per kategori paket, namun
  // saat ini belum ditampilkan sebagai segmen terpisah pada kode referensi.
  void paketKategori;

  return `TK-${hub}-${yyyymm}-${urutanStr}`;
}
