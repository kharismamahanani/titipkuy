import { AlertTriangle, Ban, Box, Clock, FileCheck, ShieldAlert, Bike } from "lucide-react";
import type { ChecklistData } from "@/types/pesan";

export const CHECKLIST_ITEMS: {
  key: keyof ChecklistData;
  icon: typeof ShieldAlert;
  label: string;
}[] = [
  {
    key: "pengemasanWajib",
    icon: Box,
    label:
      "Saya memahami semua barang WAJIB dikemas dalam kardus tertutup atau dibungkus bubble wrap minimal 2 lapis. TitipKuy! berhak menolak barang yang tidak terkemas. Kerusakan pada barang tanpa kemasan bukan tanggung jawab TitipKuy!",
  },
  {
    key: "limitGantiRugi",
    icon: ShieldAlert,
    label:
      "Saya setuju ketentuan ganti rugi: tanpa deklarasi maks. Rp300.000/barang; dengan deklarasi sesuai nilai yang disepakati. Ganti rugi hanya untuk kelalaian TitipKuy! yang dibuktikan foto masuk vs keluar. Klaim wajib diajukan saat pengambilan di hub.",
  },
  {
    key: "barangTerlarang",
    icon: Ban,
    label:
      "Barang yang dititipkan bukan narkotika, bahan berbahaya, makanan mudah busuk, hewan hidup, atau senjata. Pelanggaran: pernyataan kesediaan ini batal tanpa pengembalian biaya.",
  },
  {
    key: "jatuhTempo",
    icon: Clock,
    label: "Saya paham akan dikenakan denda jika terlambat mengambil barang.",
  },
  {
    key: "lepasSetelah30Hari",
    icon: AlertTriangle,
    label:
      "Saya paham barang yang tidak diambil lebih dari 30 hari bisa dilepas oleh TitipKuy!.",
  },
];

export const DEKLARASI_ITEM = {
  key: "deklarasiBenar" as const,
  icon: FileCheck,
  label: "Saya menyatakan nilai deklarasi yang saya isi adalah benar.",
};

export const MOTOR_ITEM = {
  key: "motorDeklarasiBenar" as const,
  icon: Bike,
  label:
    "Saya menyatakan motor yang dititipkan adalah milik saya atau saya memiliki wewenang untuk menitipkannya. Dokumen KTP dan STNK yang diupload adalah asli dan valid.",
};
