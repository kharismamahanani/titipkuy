import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.startsWith("http");

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const STORAGE_BUCKET = "titipkuy";

export async function uploadToStorage(path: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Cek NEXT_PUBLIC_SUPABASE_URL di .env.local.");
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Ambil path relatif di dalam bucket dari public URL Supabase Storage,
// mis. ".../object/public/titipkuy/fotos/masuk/x.jpg" -> "fotos/masuk/x.jpg".
export function getStoragePathFromUrl(url: string): string | null {
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function deleteFromStorage(path: string) {
  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi. Cek NEXT_PUBLIC_SUPABASE_URL di .env.local.");
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw error;
}
