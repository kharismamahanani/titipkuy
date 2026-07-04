import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// DEBUG SEMENTARA — dipakai untuk investigasi error upload TTD/dokumen
// di production (titipkuy.online). Hapus setelah root cause ditemukan.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json({
      error: "env missing",
      url: !!url,
      anon: !!anon,
    });
  }

  const supabase = createClient(url, anon);

  const testPath = `ttd/debug-test/${Date.now()}.txt`;
  const { data, error } = await supabase.storage
    .from("ttd")
    .upload(testPath, "test", {
      contentType: "text/plain",
      upsert: false,
    });

  if (data) {
    await supabase.storage.from("ttd").remove([testPath]);
  }

  return NextResponse.json({
    supabaseUrl: url?.substring(0, 30) + "...",
    testPath,
    uploadResult: data,
    uploadError: error,
    errorMessage: error?.message,
    errorDetails: JSON.stringify(error),
  });
}
