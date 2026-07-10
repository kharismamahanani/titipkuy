import { Sidebar } from "@/components/admin/sidebar";
import { BottomNav } from "@/components/admin/bottom-nav";
import { MobileTopBar } from "@/components/admin/mobile-top-bar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F0EA]">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <MobileTopBar />
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
