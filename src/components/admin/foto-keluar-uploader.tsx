"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buildFotoPath, uploadToStorage } from "@/lib/supabase";
import { FotoLightboxGrid } from "@/components/admin/foto-lightbox-grid";
import type { Foto } from "@/types/transaksi";

const MAX_FOTO_SIZE = 8 * 1024 * 1024; // 8MB

interface FotoKeluarUploaderProps {
  transaksiId: string;
  fotoKeluar: Foto[];
}

export function FotoKeluarUploader({ transaksiId, fotoKeluar }: FotoKeluarUploaderProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const tooBig = fileArray.find((f) => f.size > MAX_FOTO_SIZE);
    if (tooBig) {
      toast.error(`"${tooBig.name}" terlalu besar, maksimal 8MB`);
      return;
    }

    setProgress({ done: 0, total: fileArray.length });

    const urls: string[] = [];
    for (const file of fileArray) {
      try {
        const path = buildFotoPath(`fotos/keluar/${transaksiId}`);
        const url = await uploadToStorage(path, file);
        urls.push(url);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          error instanceof Error ? error.message : `Gagal upload "${file.name}"`
        );
      } finally {
        setProgress((prev) => (prev ? { done: prev.done + 1, total: prev.total } : null));
      }
    }

    if (urls.length > 0) {
      try {
        const res = await fetch(`/api/admin/transaksi/${transaksiId}/foto-keluar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        });
        if (!res.ok) throw new Error();

        toast.success(`${urls.length} foto keluar ditambahkan`);
        router.refresh();
      } catch {
        toast.error("Gagal menyimpan foto keluar ke database");
      }
    }

    setProgress(null);
  }

  async function handleDelete(foto: Foto) {
    try {
      const res = await fetch(`/api/admin/foto/${foto.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus foto");

      toast.success("Foto dihapus");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus foto");
    }
  }

  const isUploading = progress !== null;

  return (
    <div className="space-y-4">
      <FotoLightboxGrid fotos={fotoKeluar} emptyText="Belum ada foto keluar." onDelete={handleDelete} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-card-border py-8 text-center transition-colors",
          isDragging && "border-primary-from bg-primary/5"
        )}
      >
        <Camera className="text-primary-from" size={28} />
        <p className="text-sm font-medium">Klik atau seret foto ke sini</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Loader2 className="animate-spin" size={16} />
          Mengupload {progress.done}/{progress.total} foto...
        </div>
      )}
    </div>
  );
}
