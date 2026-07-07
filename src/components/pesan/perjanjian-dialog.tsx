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
      <DialogTrigger className="text-sm font-bold text-tk-orange-dark underline underline-offset-4">
        Baca Syarat & Ketentuan Lengkap
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-tk-charcoal">
            Pernyataan Kesediaan Penitipan Barang TitipKuy!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-tk-muted">
          <p>
            Saya yang bertanda tangan di bawah ini menyatakan telah membaca dan
            memahami seluruh syarat dan ketentuan layanan <strong>TitipKuy!</strong>,
            bersedia mematuhi tata cara penitipan yang berlaku, dan menyatakan
            bahwa barang yang dititipkan adalah milik saya atau saya memiliki
            wewenang untuk menitipkannya.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            1. Pengemasan Barang
          </h3>
          <p>
            Saya memahami semua barang WAJIB dikemas dalam kardus tertutup atau
            dibungkus bubble wrap minimal 2 lapis sebelum diserahkan ke
            TitipKuy!. TitipKuy! berhak menolak barang yang tidak terkemas
            sesuai ketentuan ini. Kerusakan pada barang yang diserahkan tanpa
            kemasan yang layak bukan tanggung jawab TitipKuy!.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            2. Ganti Rugi
          </h3>
          <p>
            Tanpa deklarasi nilai, ganti rugi maksimal Rp300.000 per barang
            (tier Standar). Dengan deklarasi nilai barang di awal pemesanan,
            ganti rugi mengikuti nilai deklarasi tersebut — maksimal
            Rp5.000.000 (tier Deklarasi Mandiri, premi 1%/bulan) atau
            maksimal Rp20.000.000 untuk barang bernilai tinggi (premi
            2%/bulan). Ganti rugi hanya berlaku untuk kehilangan atau
            kerusakan akibat kelalaian TitipKuy! yang dibuktikan dengan foto
            kondisi barang saat masuk vs saat keluar. Klaim wajib diajukan
            saat pengambilan barang di hub.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            3. Barang Terlarang
          </h3>
          <p>
            Saya menyatakan barang yang dititipkan bukan makanan/minuman mudah
            basi, bahan berbahaya/mudah terbakar, hewan hidup, senjata,
            narkotika, atau barang ilegal lainnya. Pelanggaran ketentuan ini
            menyebabkan pernyataan kesediaan ini batal tanpa pengembalian
            biaya, dan TitipKuy! berhak menolak atau mengeluarkan barang
            tersebut tanpa kompensasi apa pun.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            4. Jangka Waktu & Denda Keterlambatan
          </h3>
          <p>
            Barang harus diambil paling lambat pada tanggal jatuh tempo yang
            tercantum di pemesanan. Keterlambatan pengambilan akan dikenakan
            denda harian sesuai kebijakan TitipKuy! yang berlaku saat itu.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            5. Barang Tidak Diambil
          </h3>
          <p>
            Apabila barang tidak diambil dalam waktu lebih dari 30 (tiga
            puluh) hari sejak tanggal jatuh tempo tanpa konfirmasi dari saya,
            TitipKuy! berhak melepas kepemilikan barang tersebut (termasuk
            menjual, menyumbangkan, atau memusnahkannya) tanpa kewajiban
            kompensasi.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            6. Dokumentasi
          </h3>
          <p>
            TitipKuy! akan mendokumentasikan kondisi barang melalui foto saat
            barang masuk dan keluar sebagai bukti kondisi, dan saya menyetujui
            penggunaan foto tersebut sebagai bukti dalam hal terjadi
            perselisihan.
          </p>

          <h3 className="font-heading font-semibold text-foreground">
            7. Kesediaan
          </h3>
          <p>
            Dengan mencentang kotak persetujuan dan menandatangani secara
            digital pada form pemesanan, saya menyatakan kesediaan untuk
            mematuhi seluruh ketentuan di atas dan menggunakan layanan
            TitipKuy! dengan itikad baik.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
