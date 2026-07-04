import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Gunakan service role key — melewati RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const path = formData.get("path") as string;

    if (!file || !bucket || !path) {
      return NextResponse.json(
        { error: "file, bucket, dan path wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi bucket yang diizinkan
    const allowedBuckets = ["ttd", "dokumen", "fotos", "perjanjian"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Bucket tidak diizinkan" }, { status: 403 });
    }

    // Validasi path tidak mengandung karakter berbahaya
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json({ error: "Path tidak valid" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return public URL (untuk bucket public) atau path saja
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      path: data.path,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: "Upload gagal: " + String(err) }, { status: 500 });
  }
}
