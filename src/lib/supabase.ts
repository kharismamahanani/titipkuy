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
  const ext = originalFileName.includes(".")
    ? originalFileName.slice(originalFileName.lastIndexOf("."))
    : "";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  return `${folder}/${sanitizeFileName(unique)}`;
}

// Dipakai khusus untuk upload FOTO (Step 3 form pemesanan, foto keluar,
// dll). Nama file asli dari user (bisa berisi spasi/karakter aneh) TIDAK
// pernah dipakai sama sekali — path selalu berbentuk
// "<folder>/<timestamp>-<random>.jpg" supaya konsisten dan aman untuk
// Supabase Storage.
export function buildFotoPath(folder: string) {
  const random = Math.random().toString(36).slice(2, 8);
  const fileName = `${Date.now()}-${random}.jpg`;
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanFolder}/${fileName}`.replace(/\/{2,}/g, "/");
}

export async function uploadToStorage(path: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Cek NEXT_PUBLIC_SUPABASE_URL di .env.local.");
  }

  const { bucket, objectPath } = resolveBucketAndPath(path);
  console.log("Upload path:", `${bucket}/${objectPath}`);

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, { upsert: true });

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
