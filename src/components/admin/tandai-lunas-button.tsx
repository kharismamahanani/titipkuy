"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";

interface TandaiLunasButtonProps {
  id: string;
  onSuccess?: () => void;
}

export function TandaiLunasButton({ id, onSuccess }: TandaiLunasButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusBayar: "LUNAS" }),
      });
      if (!res.ok) throw new Error();

      toast.success("Ditandai lunas");
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Gagal menandai lunas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TkButton type="button" size="sm" variant="primary" disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="mr-1.5 animate-spin" size={14} />}
      Tandai Lunas
    </TkButton>
  );
}
