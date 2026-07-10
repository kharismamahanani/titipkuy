import { LogoutButton } from "@/components/admin/logout-button";
import { LogoMark } from "@/components/shared/logo-mark";

// Header khusus mobile — sidebar desktop (yang menyimpan tombol Logout)
// disembunyikan di layar kecil (`hidden md:flex`), jadi admin di HP butuh
// akses logout dari sini.
export function MobileTopBar() {
  return (
    <div className="flex items-center justify-between border-b-2 border-tk-charcoal bg-tk-charcoal px-4 py-3 md:hidden">
      <div className="flex items-center gap-2 text-sm font-extrabold">
        <LogoMark size={24} />
        <span className="text-tk-orange">TitipKuy!</span>
        <span className="rounded-full border border-tk-sage bg-tk-sage/20 px-2 py-0.5 text-[10px] font-bold text-tk-sage">
          Admin
        </span>
      </div>
      <LogoutButton />
    </div>
  );
}
