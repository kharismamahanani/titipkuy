"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyWaButton({ message }: { message: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Pesan disalin!");
    } catch {
      toast.error("Gagal menyalin pesan");
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
      Salin Pesan WA
    </Button>
  );
}
