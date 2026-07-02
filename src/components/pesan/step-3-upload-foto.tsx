"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase, STORAGE_BUCKET, uploadToStorage } from "@/lib/supabase";

const MIN_FOTO = 3;
const MAX_FOTO = 10;
const MAX_FOTO_SIZE = 8 * 1024 * 1024; // 8MB

interface UploadedFoto {
  url: string;
  path: string;
}

interface Step3Props {
  transactionId: string;
  fotoMasukUrls: string[];
  onChange: (urls: string[]) => void;
}

export function Step3UploadFoto({
  transactionId,
  fotoMasukUrls,
  onChange,
}: Step3Props) {
  const [uploaded, setUploaded] = useState<UploadedFoto[]>(
    fotoMasukUrls.map((url) => ({ url, path: "" }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));

    if (uploaded.length + fileArray.length > MAX_FOTO) {
      toast.error(`Maksimal ${MAX_FOTO} foto`);
      return;
    }

    const tooBig = fileArray.find((f) => f.size > MAX_FOTO_SIZE);
    if (tooBig) {
      toast.error(`"${tooBig.name}" terlalu besar, maksimal 8MB`);
      return;
    }

    setProgress({ done: 0, total: fileArray.length });

    const newFotos: UploadedFoto[] = [];
    for (const file of fileArray) {
      try {
        const path = `fotos/masuk/${transactionId}/${Date.now()}-${file.name}`;
        const url = await uploadToStorage(path, file);
        newFotos.push({ url, path });
      } catch {
        toast.error(`Gagal upload "${file.name}"`);
      } finally {
        setProgress((prev) =>
          prev ? { done: prev.done + 1, total: prev.total } : null
        );
      }
    }

    const combined = [...uploaded, ...newFotos];
    setUploaded(combined);
    onChange(combined.map((f) => f.url));
    setProgress(null);
  }

  async function handleRemove(index: number) {
    const target = uploaded[index];
    if (target.path && supabase) {
      await supabase.storage.from(STORAGE_BUCKET).remove([target.path]);
    }
    const combined = uploaded.filter((_, i) => i !== index);
    setUploaded(combined);
    onChange(combined.map((f) => f.url));
  }

  const isUploading = progress !== null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-bold">Upload Foto Barang</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Foto ini jadi bukti kondisi barang saat masuk — penting!
        </p>
      </div>

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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-card-border py-12 text-center transition-colors",
          isDragging && "border-primary-from bg-primary/5"
        )}
      >
        <Camera className="text-primary-from" size={36} />
        <p className="text-sm font-medium">
          Klik atau seret foto ke sini
        </p>
        <p className="text-xs text-foreground/50">
          Minimal {MIN_FOTO}, maksimal {MAX_FOTO} foto
        </p>
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

      {uploaded.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {uploaded.map((foto, index) => (
            <div key={foto.url} className="group relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={foto.url}
                alt={`Foto barang ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="Hapus foto"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground/50">
        {uploaded.length}/{MIN_FOTO} foto minimum terupload
      </p>
    </div>
  );
}
