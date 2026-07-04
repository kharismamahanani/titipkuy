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
    const folder = formData.get("folder") as string; // contoh: "motor/ktp"
    const transactionId = formData.get("transactionId") as string;

    if (!file || !bucket || !folder || !transactionId) {
      return NextResponse.json(
        { error: "file, bucket, folder, transactionId wajib diisi" },
        { status: 400 }
      );
    }

    const allowedBuckets = ["ttd", "dokumen", "fotos", "perjanjian"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Bucket tidak diizinkan" }, { status: 403 });
    }

    // Server yang generate path — tidak pakai nama file asli SAMA SEKALI
    const ext = file.type.includes("pdf") ? "pdf" : file.type.includes("png") ? "png" : "jpg";
    const cleanPath = `${folder}/${transactionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(cleanPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("[API Upload] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(cleanPath);

    return NextResponse.json({
      path: cleanPath,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    console.error("[API Upload] exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
