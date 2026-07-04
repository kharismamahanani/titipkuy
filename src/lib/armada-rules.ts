export type TipeArmada = "motor" | "mobil" | "semua";

export function armadaYangBisa(paket: {
  nama: string;
  kategori: string;
  deskripsi?: string | null;
}): TipeArmada {
  const nama = paket.nama.toLowerCase();
  const kat = paket.kategori.toLowerCase();

  // Paket motor: tidak perlu antar-jemput (parkir di garasi hub)
  if (kat === "motor") return "semua"; // armada tidak relevan, skip

  // Bundle (lebih dari 1 item atau gabungan S+L)
  if (
    nama.includes("bundle") ||
    nama.includes("5x") ||
    nama.includes("3x") ||
    nama.includes("2x")
  )
    return "mobil";

  // Box L atau Koper Besar atau Elektronik: hanya mobil
  if (
    nama.includes("box l") ||
    nama.includes("koper besar") ||
    nama.includes("carrier") ||
    nama.includes("elektronik") ||
    nama.includes("kulkas") ||
    nama.includes("tv") ||
    kat === "magang"
  )
    return "mobil";

  // Box S dan paket harian kecil: motor atau mobil
  if (
    nama.includes("box s") ||
    nama.includes("ransel") ||
    nama.includes("sling") ||
    nama.includes("tote") ||
    nama.includes("koper kabin") ||
    nama.includes("box m") ||
    nama.includes("kardus mie")
  )
    return "semua";

  // Default: semua bisa
  return "semua";
}
