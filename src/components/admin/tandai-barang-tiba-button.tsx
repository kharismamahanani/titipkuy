"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";

interface TandaiBarangTibaButtonProps {
  transaksiId: string;
  barangTibaMandiri: boolean;
}

export function TandaiBarangTibaButton({
  transaksiId,
  barangTibaMandiri,
}: TandaiBarangTibaButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (barangTibaMandiri) {
    return (
      <span className="flex items-center gap-2 text-sm font-bold text-tk-sage-dark">
        <CheckCircle2 size={18} />
        Barang sudah tiba di hub
      </span>
    );
  }

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barangTibaMandiri: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menandai barang tiba");

      toast.success("Barang ditandai sudah tiba!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menandai barang tiba");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TkButton type="button" variant="primary" disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="mr-1.5 animate-spin" size={16} />}
      Tandai Barang Sudah Tiba
    </TkButton>
  );
}
