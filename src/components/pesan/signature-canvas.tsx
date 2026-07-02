"use client";

import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  onChange: (dataUrl: string | null) => void;
}

export function SignatureCanvas({ onChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    const pad = new SignaturePad(canvas, {
      backgroundColor: "#1A1A2E",
      penColor: "#F5E642",
    });
    pad.addEventListener("endStroke", () => {
      onChange(pad.isEmpty() ? null : pad.toDataURL("image/png"));
    });
    padRef.current = pad;

    return () => {
      pad.off();
    };
  }, [onChange]);

  function handleClear() {
    padRef.current?.clear();
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="glass-card overflow-hidden rounded-2xl">
        <canvas ref={canvasRef} className="h-40 w-full touch-none" />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleClear}>
        Hapus
      </Button>
    </div>
  );
}
