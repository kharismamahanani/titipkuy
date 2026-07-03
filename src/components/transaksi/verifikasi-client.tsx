"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Camera, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildFotoPath, uploadToStorage } from "@/lib/supabase";
import type { VerifikasiPublik } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";

const STATUS_LABEL: Record<VerifikasiPublik["statusTransaksi"], string> = {
  AKTIF: "Aktif — masih dititipkan",
  SELESAI: "Selesai — sudah diambil",
  DIBATALKAN: "Dibatalkan",
};

const MAX_FOTO_SIZE = 8 * 1024 * 1024; // 8MB

interface VerifikasiClientProps {
  id: string;
  isAdmin: boolean;
}

export function VerifikasiClient({ id, isAdmin }: VerifikasiClientProps) {
  const [data, setData] = useState<VerifikasiPublik | null>(null);
  const [state, setState] = useState<FetchState>("loading");
  const [justSelesai, setJustSelesai] = useState(false);

  useEffect(() => {
    fetch(`/api/transaksi/${id}/verifikasi`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: VerifikasiPublik) => {
        setData(result);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [id]);

  function handleSelesai() {
    setJustSelesai(true);
    setData((prev) => (prev ? { ...prev, statusTransaksi: "SELESAI" } : prev));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-12">
      <div className="glass-card w-full max-w-sm rounded-2xl p-6 text-center">
        <p className="gradient-text font-heading text-lg font-extrabold">TitipKuy! 📦</p>
        <p className="mt-1 text-xs text-foreground/60">Verifikasi Barang Titipan</p>

        {state === "loading" && (
          <p className="mt-6 text-sm text-foreground/60">Memuat...</p>
        )}

        {state === "error" && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <XCircle className="text-destructive" size={40} />
            <p className="text-sm text-foreground/70">
              Kode ini tidak valid atau transaksi tidak ditemukan.
            </p>
          </div>
        )}

        {state === "success" && data && (
          <>
            <div className="mt-6 space-y-3 text-left text-sm">
              <div className="flex flex-col items-center gap-2 pb-2">
                <CheckCircle2 className="text-primary-from" size={40} />
                <p className="font-semibold">Barang Terverifikasi</p>
              </div>
              <Row label="Nama" value={data.namaDepan} />
              <Row label="Paket" value={data.paketNama} />
              <Row
                label="Masuk"
                value={format(new Date(data.tanggalMasuk), "d MMM yyyy", {
                  locale: localeId,
                })}
              />
              <Row
                label="Jatuh Tempo"
                value={format(new Date(data.tanggalJatuhTempo), "d MMM yyyy", {
                  locale: localeId,
                })}
              />
              <Row label="Status" value={STATUS_LABEL[data.statusTransaksi]} />
              {data.kodeLabel.length > 0 && (
                <div className="border-b border-card-border pb-1">
                  <span className="text-foreground/60">Kode Label</span>
                  <div className="mt-1 flex flex-wrap justify-end gap-1.5">
                    {data.kodeLabel.map((kode) => (
                      <span
                        key={kode}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-from"
                      >
                        {kode}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {justSelesai && (
              <div className="mt-6 space-y-3 rounded-2xl border border-primary-from/30 bg-primary/10 p-4 text-left text-sm">
                <p className="text-center font-medium text-primary-from">
                  ✅ Barang berhasil diserahkan. Transaksi selesai.
                </p>
                <Link
                  href={`/admin/transaksi/${id}`}
                  className="block rounded-full border border-primary-from/60 py-2 text-center text-sm font-semibold hover:bg-primary/10"
                >
                  Lihat Detail Transaksi
                </Link>
              </div>
            )}

            {isAdmin && data.statusTransaksi === "AKTIF" && !justSelesai && (
              <SerahkanBarangPanel transaksiId={id} onSelesai={handleSelesai} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-card-border pb-1">
      <span className="text-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

interface SerahkanBarangPanelProps {
  transaksiId: string;
  onSelesai: () => void;
}

function SerahkanBarangPanel({ transaksiId, onSelesai }: SerahkanBarangPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const tooBig = fileArray.find((f) => f.size > MAX_FOTO_SIZE);
    if (tooBig) {
      toast.error(`"${tooBig.name}" terlalu besar, maksimal 8MB`);
      return;
    }

    setIsUploading(true);
    for (const file of fileArray) {
      try {
        const path = buildFotoPath(`fotos/keluar/${transaksiId}`);
        const url = await uploadToStorage(path, file);
        setFotoUrls((prev) => [...prev, url]);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          error instanceof Error ? error.message : `Gagal upload "${file.name}"`
        );
      }
    }
    setIsUploading(false);
  }

  function handleRemove(url: string) {
    setFotoUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit() {
    if (fotoUrls.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transaksi/${transaksiId}/selesai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoKeluarUrls: fotoUrls }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyelesaikan transaksi");

      toast.success("Barang berhasil diserahkan!");
      onSelesai();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyelesaikan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-card-border bg-card-dark/60 p-4 text-left">
      <p className="text-center text-sm font-semibold text-foreground/90">
        🔑 Mode Admin — Konfirmasi Pengambilan
      </p>
      <p className="text-xs text-foreground/60">
        Upload foto kondisi barang saat diserahkan (wajib, min. 1 foto):
      </p>

      {fotoUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotoUrls.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg">
              <Image src={url} alt="Foto barang keluar" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Hapus foto"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

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
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-card-border py-5 text-center transition-colors",
          isDragging && "border-primary-from bg-primary/5"
        )}
      >
        <Camera className="text-primary-from" size={22} />
        <p className="text-xs font-medium">Klik atau seret foto ke sini</p>
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
        <div className="flex items-center justify-center gap-2 text-xs text-foreground/70">
          <Loader2 className="animate-spin" size={14} />
          Mengupload foto...
        </div>
      )}

      <Button
        type="button"
        disabled={fotoUrls.length === 0 || isUploading || isSubmitting}
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-primary-from to-primary-to text-white"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
        Tandai Selesai & Serahkan Barang
      </Button>
    </div>
  );
}
