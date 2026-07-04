"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";

interface TandaiSelesaiButtonProps {
  transaksiId: string;
  statusTransaksi: "AKTIF" | "SELESAI" | "DIBATALKAN";
  jumlahFotoKeluar: number;
}

export function TandaiSelesaiButton({
  transaksiId,
  statusTransaksi,
  jumlahFotoKeluar,
}: TandaiSelesaiButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (statusTransaksi === "SELESAI") {
    return (
      <span className="flex items-center gap-2 text-sm font-bold text-tk-sage-dark">
        <CheckCircle2 size={18} />
        Transaksi Selesai
      </span>
    );
  }

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusTransaksi: "SELESAI" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menandai selesai");

      toast.success("Transaksi ditandai selesai!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menandai selesai");
    } finally {
      setIsLoading(false);
    }
  }

  const disabled = jumlahFotoKeluar === 0 || isLoading;

  return (
    <div className="space-y-1">
      <TkButton type="button" variant="primary" disabled={disabled} onClick={handleClick}>
        {isLoading && <Loader2 className="mr-1.5 animate-spin" size={16} />}
        Tandai Selesai
      </TkButton>
      {jumlahFotoKeluar === 0 && (
        <p className="text-xs text-tk-light">
          Upload minimal 1 foto keluar dulu untuk mengaktifkan tombol ini.
        </p>
      )}
    </div>
  );
}
