"use client";

import { toast } from "sonner";
import { TkButton } from "@/components/ui/tk-button";

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
    <TkButton type="button" size="sm" variant="secondary" onClick={handleCopy}>
      Salin Pesan WA
    </TkButton>
  );
}
