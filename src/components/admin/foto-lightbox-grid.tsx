"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Foto } from "@/types/transaksi";

interface FotoLightboxGridProps {
  fotos: Foto[];
  emptyText: string;
}

export function FotoLightboxGrid({ fotos, emptyText }: FotoLightboxGridProps) {
  const [selected, setSelected] = useState<Foto | null>(null);

  if (fotos.length === 0) {
    return <p className="text-sm text-foreground/50">{emptyText}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {fotos.map((foto) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setSelected(foto)}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image src={foto.url} alt={foto.fileName} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle className="sr-only">{selected?.fileName}</DialogTitle>
          {selected && (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={selected.url}
                alt={selected.fileName}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
