export async function uploadViaApi(
  file: File | Blob,
  bucket: string,
  folder: string, // contoh: "motor/ktp", "ttd", "motor/stnk"
  transactionId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // JANGAN append nama file di sini
  formData.append("bucket", bucket);
  formData.append("folder", folder);
  formData.append("transactionId", transactionId);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload gagal");
  }

  const data = await res.json();
  return data.publicUrl || data.path;
}
