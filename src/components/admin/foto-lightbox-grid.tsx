"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Foto } from "@/types/transaksi";

interface FotoLightboxGridProps {
  fotos: Foto[];
  emptyText: string;
  onDelete?: (foto: Foto) => void;
}

export function FotoLightboxGrid({ fotos, emptyText, onDelete }: FotoLightboxGridProps) {
  const [selected, setSelected] = useState<Foto | null>(null);

  if (fotos.length === 0) {
    return <p className="text-sm text-tk-light">{emptyText}</p>;
  }

  function handleDelete(e: React.MouseEvent, foto: Foto) {
    e.stopPropagation();
    if (!onDelete) return;
    if (!window.confirm("Hapus foto ini? Tidak bisa dibatalkan")) return;
    onDelete(foto);
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-tk-charcoal">
            <button
              type="button"
              onClick={() => setSelected(foto)}
              className="absolute inset-0"
            >
              <Image src={foto.url} alt={foto.fileName} fill className="object-cover" unoptimized />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => handleDelete(e, foto)}
                aria-label="Hapus foto"
                className="absolute right-1 top-1 rounded-full bg-tk-charcoal/80 p-1.5 text-tk-cream opacity-0 transition-opacity hover:bg-[#C0392B] group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
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
