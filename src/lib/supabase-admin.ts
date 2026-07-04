import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client privileged (service_role) — HANYA dipakai di server (API routes),
// tidak pernah diimpor dari komponen client. Dipakai untuk mengakses
// bucket privat seperti "dokumen" (KTP/STNK/BPKB) yang RLS-nya membatasi
// SELECT hanya untuk role authenticated/service_role, bukan anon.
const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

// URL yang disimpan di DB berbentuk publicUrl (".../object/public/<bucket>/<path>")
// meski bucket-nya privat — ekstrak bucket & path dari situ supaya cocok
// dengan yang dipakai getStoragePathFromUrl() di src/lib/supabase.ts.
export function parseBucketAndPath(publicUrl: string): { bucket: string; path: string } | null {
  const marker = "/object/public/";
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  const rest = decodeURIComponent(publicUrl.slice(index + marker.length));
  const [bucket, ...pathParts] = rest.split("/");
  if (!bucket || pathParts.length === 0) return null;
  return { bucket, path: pathParts.join("/") };
}

// Buat signed URL berumur pendek untuk dokumen di bucket privat. Perlu
// SUPABASE_SERVICE_ROLE_KEY di environment — tanpa itu, dokumen di bucket
// privat tidak bisa ditampilkan admin sama sekali (sesuai desain: bucket
// "dokumen" sengaja tidak public).
export async function createSignedDokumenUrl(
  publicUrl: string,
  expiresInSeconds = 3600
): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diset di environment — dokumen di bucket privat tidak bisa ditampilkan tanpa ini."
    );
  }

  const parsed = parseBucketAndPath(publicUrl);
  if (!parsed) {
    throw new Error("URL dokumen tidak valid.");
  }

  const { data, error } = await supabaseAdmin.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresInSeconds);

  if (error || !data) {
    throw new Error(error?.message || "Gagal membuat signed URL dokumen.");
  }

  return data.signedUrl;
}
