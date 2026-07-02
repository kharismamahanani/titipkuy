"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintableLabel } from "@/components/admin/printable-label";
import type { TransaksiSearchResult } from "@/types/transaksi";

type FetchState = "loading" | "success" | "error";

export default function LabelPrintPage({
  params,
}: {
  params: { transaksiId: string };
}) {
  const [transaksi, setTransaksi] = useState<TransaksiSearchResult | null>(null);
  const [state, setState] = useState<FetchState>("loading");
  const [origin, setOrigin] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: transaksi ? `Label-${transaksi.nomorRef}` : "Label",
  });

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
      <div className="print:hidden flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <Link href="/admin/label" className="text-sm text-gray-600 hover:underline">
          &larr; Kembali
        </Link>
        <Button type="button" onClick={() => handlePrint()}>
          <Printer size={16} />
          Print
        </Button>
      </div>

      <div ref={printRef} className="flex flex-wrap gap-2 p-4">
        {transaksi.barangLabel.map((barang) => (
          <PrintableLabel
            key={barang.id}
            barang={barang}
            transaksi={transaksi}
            verifyUrl={`${origin}/transaksi/${transaksi.id}`}
          />
        ))}
      </div>
    </div>
  );
}
