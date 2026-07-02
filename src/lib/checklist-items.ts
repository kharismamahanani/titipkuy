import { AlertTriangle, Ban, Clock, FileCheck, ShieldAlert } from "lucide-react";
import type { ChecklistData } from "@/types/pesan";

export const CHECKLIST_ITEMS: {
  key: keyof ChecklistData;
  icon: typeof ShieldAlert;
  label: string;
}[] = [
  {
    key: "limitGantiRugi",
    icon: ShieldAlert,
    label:
      "Saya paham ganti rugi maksimal Rp500.000/kardus (atau sesuai nilai deklarasi jika ada).",
  },
  {
    key: "barangTerlarang",
    icon: Ban,
    label:
      "Saya tidak menitipkan barang terlarang (makanan, bahan berbahaya, barang ilegal).",
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
