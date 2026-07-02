import { Sidebar } from "@/components/admin/sidebar";
import { BottomNav } from "@/components/admin/bottom-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
