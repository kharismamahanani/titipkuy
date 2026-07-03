import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, hashCredentials } from "@/lib/admin-auth";
import { VerifikasiClient } from "@/components/transaksi/verifikasi-client";

async function checkIsAdmin() {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  const expectedHash = await hashCredentials(
    process.env.ADMIN_USERNAME ?? "",
    process.env.ADMIN_PASSWORD ?? ""
  );
  return sessionCookie === expectedHash;
}

export default async function VerifikasiTransaksiPage({
  params,
}: {
  params: { id: string };
}) {
  const isAdmin = await checkIsAdmin();

  return <VerifikasiClient id={params.id} isAdmin={isAdmin} />;
}
