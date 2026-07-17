import { prisma } from "@/lib/prisma";
import { VoucherManager } from "@/components/admin/voucher-manager";

export const dynamic = "force-dynamic";

export default async function AdminVoucherPage() {
  let voucherList: Awaited<ReturnType<typeof getVoucherList>> | null = null;

  try {
    voucherList = await getVoucherList();
  } catch (error) {
    console.error("[AdminVoucherPage]", error);
  }

  if (!voucherList) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-extrabold text-tk-charcoal">Data voucher belum bisa dimuat</h1>
        <p className="mt-2 text-sm text-tk-muted">
          Database belum terhubung. Coba muat ulang halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">Kelola Voucher</h1>
      <p className="mt-1 text-sm text-tk-muted">
        Buat kode voucher diskon persen untuk dipakai pelanggan saat memesan.
      </p>

      <div className="mt-6">
        <VoucherManager
          initialVoucher={voucherList.map((v) => ({
            ...v,
            berlakuMulai: v.berlakuMulai ? v.berlakuMulai.toISOString() : null,
            berlakuSampai: v.berlakuSampai ? v.berlakuSampai.toISOString() : null,
            createdAt: v.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

function getVoucherList() {
  return prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
}
