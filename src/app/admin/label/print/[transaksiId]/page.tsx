"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintableLabel } from "@/components/admin/printable-label";
import { ThermalLabel } from "@/components/admin/thermal-label";
import type { TransaksiSearchResult } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";
type PrintMode = "a4" | "thermal";

export default function LabelPrintPage({
  params,
}: {
  params: { transaksiId: string };
}) {
  const [transaksi, setTransaksi] = useState<TransaksiSearchResult | null>(null);
  const [state, setState] = useState<FetchState>("loading");
  const [origin, setOrigin] = useState("");
  const [mode, setMode] = useState<PrintMode>("a4");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: transaksi ? `Label-${transaksi.nomorRef}` : "Label",
  });

  function triggerPrint(nextMode: PrintMode) {
    setMode(nextMode);
    // Tunggu DOM commit dulu (setState async) sebelum trigger print,
    // supaya react-to-print mengambil layout mode yang baru, bukan yang lama.
    requestAnimationFrame(() => requestAnimationFrame(() => handlePrint()));
  }

  useEffect(() => {
    setOrigin(window.location.origin);

    fetch(`/api/admin/transaksi/${params.transaksiId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: TransaksiSearchResult) => {
        setTransaksi(data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [params.transaksiId]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-white text-black">
        <Loader2 className="animate-spin" size={16} />
        Memuat label...
      </div>
    );
  }

  if (state === "error" || !transaksi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        Transaksi tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {mode === "thermal" && (
        <style>{`
          @page { size: 78mm 100mm; margin: 0; }
          @media print {
            .thermal-label { break-after: page; }
            .thermal-label:last-child { break-after: auto; }
          }
        `}</style>
      )}

      <div className="print:hidden flex flex-col gap-4 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/label" className="text-sm text-gray-600 hover:underline">
            &larr; Kembali
          </Link>
          <div className="flex gap-2">
            <Button type="button" onClick={() => triggerPrint("a4")}>
              <Printer size={16} />
              🖨️ Print A4
            </Button>
            <Button type="button" variant="outline" onClick={() => triggerPrint("thermal")}>
              🖨️ Print Thermal (78×100mm)
            </Button>
          </div>
        </div>

        {mode === "thermal" && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-bold">📋 Pengaturan printer yang diperlukan:</p>
            <ul className="mt-1 list-disc pl-4">
              <li>Pilih printer: Xprinter XP-420B</li>
              <li>Ukuran kertas: 78 × 100 mm (atau Custom)</li>
              <li>Margin: None / Tanpa margin</li>
              <li>Skala: 100% (jangan Fit to page)</li>
              <li>Hilangkan centang &quot;Headers and footers&quot; di Chrome</li>
            </ul>
          </div>
        )}
      </div>

      <div
        ref={printRef}
        className={mode === "thermal" ? "flex flex-col" : "flex flex-wrap gap-2 p-4"}
      >
        {transaksi.barangLabel.map((barang) =>
          mode === "thermal" ? (
            <ThermalLabel
              key={barang.id}
              barang={barang}
              transaksi={transaksi}
              verifyUrl={`${origin}/transaksi/${transaksi.id}`}
            />
          ) : (
            <PrintableLabel
              key={barang.id}
              barang={barang}
              transaksi={transaksi}
              verifyUrl={`${origin}/transaksi/${transaksi.id}`}
            />
          )
        )}
      </div>
    </div>
  );
}
