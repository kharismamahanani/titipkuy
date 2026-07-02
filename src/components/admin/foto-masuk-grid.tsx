"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FotoLightboxGrid } from "@/components/admin/foto-lightbox-grid";
import type { Foto } from "@/types/transaksi";

interface FotoMasukGridProps {
  fotos: Foto[];
  emptyText: string;
}

export function FotoMasukGrid({ fotos, emptyText }: FotoMasukGridProps) {
  const router = useRouter();

  async function handleDelete(foto: Foto) {
    try {
      const res = await fetch(`/api/admin/foto/${foto.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus foto");

      toast.success("Foto dihapus");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus foto");
    }
  }

  return <FotoLightboxGrid fotos={fotos} emptyText={emptyText} onDelete={handleDelete} />;
}
