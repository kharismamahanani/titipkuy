import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Log kondisi env vars (jangan log nilai aslinya)
    console.log("[upload] supabaseUrl ada:", !!supabaseUrl);
    console.log("[upload] serviceKey ada:", !!serviceKey);
    console.log("[upload] serviceKey prefix:", serviceKey?.substring(0, 20));

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "env var hilang", supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const folder = formData.get("folder") as string; // contoh: "motor/ktp"
    const transactionId = formData.get("transactionId") as string;

    console.log("[upload] bucket:", bucket);
    console.log("[upload] folder:", folder);
    console.log("[upload] transactionId ada:", !!transactionId);
    console.log("[upload] file ada:", !!file);
    console.log("[upload] file type:", file?.type);
    console.log("[upload] file size:", file?.size);

    if (!file || !bucket || !folder || !transactionId) {
      return NextResponse.json(
        { error: "parameter kurang", file: !!file, bucket, folder, transactionId: !!transactionId },
        { status: 400 }
      );
    }

    const allowedBuckets = ["ttd", "dokumen", "fotos", "perjanjian"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Bucket tidak diizinkan: " + bucket }, { status: 403 });
    }

    // Server yang generate path — tidak pakai nama file asli SAMA SEKALI
    const ext = file.type.includes("pdf") ? "pdf" : file.type.includes("png") ? "png" : "jpg";
    const cleanPath = `${folder}/${transactionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    console.log("[upload] cleanPath:", cleanPath);

    const arrayBuffer = await file.arrayBuffer();

    // Storage REST API langsung (bukan lewat supabase-js) — dipakai di sini
    // terutama supaya kita bisa lihat status HTTP & body respons Storage API
    // apa adanya untuk debugging, bukan hasil parse ulang oleh storage-js.
    const storageUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${cleanPath}`;
    console.log("[upload] storageUrl:", storageUrl);

    const uploadRes = await fetch(storageUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: arrayBuffer,
    });

    console.log("[upload] HTTP status:", uploadRes.status);
    const responseText = await uploadRes.text();
    console.log("[upload] response body:", responseText);

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: `Storage error ${uploadRes.status}: ${responseText}`, path: cleanPath },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;

    return NextResponse.json({
      path: cleanPath,
      publicUrl,
    });
  } catch (err) {
    console.error("[upload] exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
