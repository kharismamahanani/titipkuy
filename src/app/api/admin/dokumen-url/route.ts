import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hashCredentials } from "@/lib/admin-auth";
import { createSignedDokumenUrl } from "@/lib/supabase-admin";

async function isAdminAuthenticated() {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  const expectedHash = await hashCredentials(
    process.env.ADMIN_USERNAME ?? "",
    process.env.ADMIN_PASSWORD ?? ""
  );
  return sessionCookie === expectedHash;
}

// Proxy dokumen privat (KTP/STNK/BPKB) — redirect ke signed URL Supabase
// yang berumur pendek, supaya <img src="..."> dan buka-tab-baru di panel
// admin bisa langsung dipakai tanpa mengekspos dokumen sensitif secara publik.
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const url = new URL(request.url);
  const publicUrl = url.searchParams.get("url");
  if (!publicUrl) {
    return NextResponse.json({ error: "Parameter url wajib diisi" }, { status: 400 });
  }

  try {
    const signedUrl = await createSignedDokumenUrl(publicUrl);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("[GET /api/admin/dokumen-url]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengambil dokumen" },
      { status: 500 }
    );
  }
}
