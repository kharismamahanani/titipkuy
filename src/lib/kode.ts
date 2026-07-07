// Satu-satunya sistem kode di seluruh app — menggantikan nomorRef
// (TK-[HUB]-[YYYYMM]-[XXXX]), Kode Unik (LELY-XXXX), dan kodeLabel lama
// (TK-[HUB]-[PAKET]-[BARANG]-[XXXX]). Semuanya diturunkan dari
// Transaksi.nomorUrut (Int @unique @default(autoincrement())).

export const MAX_BARANG_PER_TRANSAKSI = 26; // A-Z

export function kodeTransaksi(nomorUrut: number): string {
  return `TK-${String(nomorUrut).padStart(4, "0")}`;
}

export function kodeLabel(nomorUrut: number, urutan: number): string {
  const huruf = String.fromCharCode(65 + urutan); // 0->A, 1->B, ...
  return `TK-${String(nomorUrut).padStart(4, "0")}-${huruf}`;
}

// Ekstrak nomorUrut dari input pencarian admin, mis. "TK-0089", "tk0089",
// "0089", atau "89" -> 89. Return null kalau bukan pola kode transaksi.
export function parseNomorUrutFromSearch(search: string): number | null {
  const match = search.trim().match(/^tk-?0*(\d+)$/i) ?? search.trim().match(/^0*(\d+)$/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isInteger(value) ? value : null;
}
