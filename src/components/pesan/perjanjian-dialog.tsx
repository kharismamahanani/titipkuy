"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PerjanjianDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-sm font-medium text-primary-from underline underline-offset-4">
        Baca Perjanjian Lengkap
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Perjanjian Penitipan Barang TitipKuy!</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-foreground/80">
          <p>
            Perjanjian ini dibuat antara <strong>TitipKuy!</strong>
            (&quot;Penyedia Jasa&quot;) dan Pelanggan yang mengisi form
            pemesanan ini (&quot;Penitip&quot;), yang berlaku sejak tanggal
            barang diserahkan.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            1. Ganti Rugi
          </h3>
          <p>
            Penyedia Jasa bertanggung jawab atas kehilangan atau kerusakan
            barang akibat kelalaian Penyedia Jasa, dengan batas maksimal
            ganti rugi Rp500.000 per kardus/barang, kecuali Penitip mengisi
            nilai deklarasi resmi di awal pemesanan — maka ganti rugi
            mengikuti nilai deklarasi tersebut (maksimal sesuai bukti
            kepemilikan yang dilampirkan).
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            2. Barang Terlarang
          </h3>
          <p>
            Penitip dilarang menitipkan makanan/minuman mudah basi, bahan
            berbahaya/mudah terbakar, hewan hidup, senjata, narkotika, atau
            barang ilegal lainnya. Penyedia Jasa berhak menolak atau
            mengeluarkan barang tersebut tanpa kompensasi apa pun.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            3. Jangka Waktu & Denda Keterlambatan
          </h3>
          <p>
            Barang harus diambil paling lambat pada tanggal jatuh tempo yang
            tercantum di pemesanan. Keterlambatan pengambilan akan dikenakan
            denda harian sesuai kebijakan Penyedia Jasa yang berlaku saat
            itu.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            4. Barang Tidak Diambil
          </h3>
          <p>
            Apabila barang tidak diambil dalam waktu lebih dari 30 (tiga
            puluh) hari sejak tanggal jatuh tempo tanpa konfirmasi dari
            Penitip, Penyedia Jasa berhak melepas kepemilikan barang tersebut
            (termasuk menjual, menyumbangkan, atau memusnahkannya) tanpa
            kewajiban kompensasi kepada Penitip.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            5. Dokumentasi
          </h3>
          <p>
            Penyedia Jasa akan mendokumentasikan kondisi barang melalui foto
            saat barang masuk dan keluar sebagai bukti kondisi, dan Penitip
            menyetujui penggunaan foto tersebut sebagai bukti dalam hal
            terjadi perselisihan.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            6. Persetujuan
          </h3>
          <p>
            Dengan mencentang kotak persetujuan dan menandatangani secara
            digital pada form pemesanan, Penitip menyatakan telah membaca,
            memahami, dan menyetujui seluruh isi perjanjian ini.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
