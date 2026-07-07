import type { Prisma } from "@prisma/client";
import { parseNomorUrutFromSearch } from "@/lib/kode";

// Dipakai di endpoint search admin (arsip, transaksi, print label) — cocokkan
// input pencarian ke kode transaksi (TK-XXXX / nomorUrut) ATAU nama pelanggan.
export function buildKodeSearchFilter(search: string): Prisma.TransaksiWhereInput["OR"] {
  const nomorUrut = parseNomorUrutFromSearch(search);

  return [
    ...(nomorUrut !== null ? [{ nomorUrut }] : []),
    { pelanggan: { nama: { contains: search, mode: "insensitive" as const } } },
  ];
}
