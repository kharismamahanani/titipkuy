import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// DEBUG SEMENTARA — verifikasi SUPABASE_SERVICE_ROLE_KEY di production
// benar-benar bisa bypass RLS. Hapus setelah root cause ditemukan.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(url, key);

  const { data: buckets, error: bucketsError } = await admin.storage.listBuckets();

  const testPath = `ttd/keytest/${Date.now()}.txt`;
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("ttd")
    .upload(testPath, "test", { contentType: "text/plain", upsert: false });

  if (uploadData) {
    await admin.storage.from("ttd").remove([testPath]);
  }

  return NextResponse.json({
    keyPrefix: key?.substring(0, 20),
    keyLength: key?.length,
    listBuckets: {
      count: buckets?.length,
      names: buckets?.map((b) => b.name),
      error: bucketsError?.message,
    },
    testUpload: {
      success: !!uploadData,
      error: uploadError?.message,
      status: uploadError?.status,
    },
  });
}
