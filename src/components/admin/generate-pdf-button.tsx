"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";

interface GeneratePdfButtonProps {
  transaksiId: string;
  pdfUrl: string | null;
}

export function GeneratePdfButton({ transaksiId, pdfUrl }: GeneratePdfButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (pdfUrl) return null;

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}/generate-pdf`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat PDF perjanjian");

      toast.success("PDF perjanjian berhasil dibuat");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat PDF perjanjian");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TkButton type="button" variant="secondary" disabled={isLoading} onClick={handleClick}>
      {isLoading ? (
        <Loader2 className="mr-1.5 animate-spin" size={16} />
      ) : (
        <FileText className="mr-1.5" size={16} />
      )}
      Generate PDF Perjanjian
    </TkButton>
  );
}
