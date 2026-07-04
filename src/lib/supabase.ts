import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.startsWith("http");

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Ada 3 bucket terpisah di Supabase Storage (bukan 1 bucket dengan
// subfolder). Path yang dipakai di seluruh app diawali salah satu dari
// prefix ini, mis. "fotos/masuk/x.jpg" -> bucket "fotos", object
// "masuk/x.jpg". "deklarasi/..." (bukti kepemilikan) ikut ditaruh di
// bucket "fotos" karena isinya juga foto/dokumen, dan tidak ada bucket
// terpisah untuk itu.
const BUCKET_BY_PREFIX: Record<string, string> = {
  fotos: "fotos",
  deklarasi: "fotos",
  ttd: "ttd",
  perjanjian: "perjanjian",
  dokumen: "dokumen",
};

function resolveBucketAndPath(path: string) {
  const [prefix, ...rest] = path.split("/");
  const bucket = BUCKET_BY_PREFIX[prefix] ?? "fotos";
  const objectPath = rest.length > 0 ? rest.join("/") : prefix;
  return { bucket, objectPath };
}

// Nama file harus aman untuk URL — buang spasi & karakter khusus supaya
// tidak memicu error atau URL yang rusak di Supabase Storage.
function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

// Dipakai untuk dokumen yang bisa berupa gambar ATAU PDF (mis. bukti
// kepemilikan) — ekstensi asli tetap dipakai (setelah disanitasi) supaya
// file PDF tidak berakhir dengan nama ".jpg".
export function buildStoragePath(folder: string, originalFileName: string) {
  assertValidPathSegment(folder, "folder");

  const ext = originalFileName.includes(".")
    ? originalFileName.slice(originalFileName.lastIndexOf("."))
    : "";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  return `${folder}/${sanitizeFileName(unique)}`;
}

// Dipakai khusus untuk upload FOTO oleh admin (foto masuk & foto keluar).
// Nama file asli (bisa berisi spasi/karakter aneh) TIDAK pernah dipakai
// sama sekali — path selalu berbentuk
// "<folder>/<timestamp>-<random>.jpg" supaya konsisten dan aman untuk
// Supabase Storage.
export function buildFotoPath(folder: string) {
  assertValidPathSegment(folder, "folder");

  const random = Math.random().toString(36).slice(2, 8);
  const fileName = `${Date.now()}-${random}.jpg`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanFolder}/${fileName}`.replace(/\/{2,}/g, "/");
}

// Cegah path yang mengandung "undefined"/"null"/string kosong lolos ke
// Supabase — ini bikin error samar "Invalid path specified in request
// URL" yang susah dilacak kalau tidak divalidasi lebih awal di sini.
function assertValidPathSegment(value: string, label: string) {
  if (!value || value.trim() === "") {
    throw new Error(`Path upload tidak valid: "${label}" kosong.`);
  }
  if (/undefined|null/i.test(value)) {
    throw new Error(
      `Path upload tidak valid: "${label}" mengandung nilai "${value}" (kemungkinan variabel belum siap).`
    );
  }
}

// Bucket "dokumen" hanya punya SELECT policy untuk role "authenticated"
// (bukan "anon"), supaya dokumen sensitif (KTP/STNK/BPKB) tidak bisa
// dibaca sembarangan dari client publik. Konsekuensinya: upload dengan
// upsert:true GAGAL dengan pesan RLS yang membingungkan ("new row
// violates row-level security policy"), karena Supabase perlu melakukan
// pre-check SELECT untuk deteksi konflik saat upsert, dan anon tidak
// punya akses SELECT ke bucket itu. Path dokumen sudah selalu unik
// (timestamp + random), jadi upsert:false aman dipakai di sini dan
// tidak memerlukan pelonggaran policy privasi.
const BUCKETS_WITHOUT_UPSERT = new Set(["dokumen"]);

export async function uploadToStorage(path: string, file: File) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase belum dikonfigurasi: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di environment."
    );
  }
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Cek NEXT_PUBLIC_SUPABASE_URL di .env.local.");
  }

  assertValidPathSegment(path, "path");
  if (path.includes("undefined") || path.includes("null")) {
    throw new Error(`Path upload mengandung "undefined"/"null": ${path}`);
  }

  const { bucket, objectPath } = resolveBucketAndPath(path);

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, { upsert: !BUCKETS_WITHOUT_UPSERT.has(bucket) });

    if (error) {
      console.log("Upload error detail:", JSON.stringify(error));
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  } catch (err) {
    console.error("[uploadToStorage] Upload error:", err);
    const message = err instanceof Error ? err.message : "Gagal upload file";
    throw new Error(`Gagal upload ke Supabase Storage (bucket "${bucket}"): ${message}`);
  }
}

// Ambil path relatif (dengan prefix bucket, mis. "fotos/masuk/x.jpg") dari
// public URL Supabase Storage — dipakai lagi sebagai argumen
// deleteFromStorage() supaya bucket-nya ikut terselesaikan dengan benar.
export function getStoragePathFromUrl(url: string): string | null {
  const marker = "/object/public/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function deleteFromStorage(path: string) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Cek NEXT_PUBLIC_SUPABASE_URL di .env.local.");
  }

  const { bucket, objectPath } = resolveBucketAndPath(path);
  const { error } = await supabase.storage.from(bucket).remove([objectPath]);
  if (error) throw error;
}
