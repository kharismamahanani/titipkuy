export async function uploadViaApi(
  file: File | Blob,
  bucket: string,
  path: string,
  filename?: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, filename || "file");
  formData.append("bucket", bucket);
  formData.append("path", path);

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
