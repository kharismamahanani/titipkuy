"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      <span className="flex items-center gap-2 text-sm font-medium text-primary-from">
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
      <Button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className="bg-gradient-to-r from-primary-from to-primary-to text-white"
      >
        {isLoading && <Loader2 className="animate-spin" size={16} />}
        Tandai Selesai
      </Button>
      {jumlahFotoKeluar === 0 && (
        <p className="text-xs text-foreground/50">
          Upload minimal 1 foto keluar dulu untuk mengaktifkan tombol ini.
        </p>
      )}
    </div>
  );
}
