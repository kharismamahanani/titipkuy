"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      <span className="flex items-center gap-2 text-sm font-medium text-primary-from">
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
    <Button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className="bg-gradient-to-r from-primary-from to-primary-to text-white"
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      Tandai Barang Sudah Tiba
    </Button>
  );
}
