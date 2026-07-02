// Hash sederhana berbasis Web Crypto (jalan di Edge & Node) untuk session
// admin tunggal. Ini BUKAN sistem session yang aman untuk banyak pengguna —
// cocok untuk satu akun admin internal, bukan untuk di-scale ke banyak staf.
export async function hashCredentials(username: string, password: string) {
  const data = new TextEncoder().encode(`${username}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari
