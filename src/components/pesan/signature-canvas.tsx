"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { TkButton } from "@/components/ui/tk-button";

interface SignatureCanvasProps {
  onChange: (dataUrl: string | null) => void;
}

export interface SignatureCanvasHandle {
  getDataUrl: () => string | null;
  isEmpty: () => boolean;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas({ onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const padRef = useRef<SignaturePad | null>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    // Simpan callback terbaru di ref supaya effect di bawah (yang membuat
    // SignaturePad) tidak perlu bergantung pada identitas `onChange`. Kalau
    // effect itu bergantung langsung ke `onChange` — yang di komponen induk
    // selalu berupa arrow function baru setiap render (mis. saat checklist
    // dicentang) — canvas akan dibuat ulang dari nol dan tanda tangan yang
    // sudah digambar hilang tanpa disadari pengguna. Ini akar masalah
    // "tanda tangan tidak tersimpan".
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        const pad = padRef.current;
        if (!pad || pad.isEmpty()) return null;
        return pad.toDataURL("image/png");
      },
      isEmpty: () => padRef.current?.isEmpty() ?? true,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      const pad = new SignaturePad(canvas, {
        backgroundColor: "#FFFFFF",
        penColor: "#3D4A41",
      });
      pad.addEventListener("beginStroke", () => setIsEmpty(false));
      pad.addEventListener("endStroke", () => {
        onChangeRef.current(pad.isEmpty() ? null : pad.toDataURL("image/png"));
      });
      padRef.current = pad;

      return () => {
        pad.off();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja cuma jalan sekali, lihat komentar onChangeRef di atas.
    }, []);

    function handleClear() {
      padRef.current?.clear();
      setIsEmpty(true);
      onChange(null);
    }

    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-[10px] border-2 border-tk-charcoal bg-white">
          <canvas ref={canvasRef} className="h-40 w-full touch-none" />
          {isEmpty && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-tk-light">
              Tanda tangan di sini
            </span>
          )}
        </div>
        <TkButton type="button" variant="secondary" size="sm" onClick={handleClear}>
          Hapus
        </TkButton>
      </div>
    );
  }
);
