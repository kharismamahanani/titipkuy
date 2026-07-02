"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TandaiLunasButton({ id }: { id: string }) {
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
      router.refresh();
    } catch {
      toast.error("Gagal menandai lunas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="animate-spin" size={14} />}
      Tandai Lunas
    </Button>
  );
}
