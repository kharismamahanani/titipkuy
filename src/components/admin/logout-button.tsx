"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  collapsed?: boolean;
}

export function LogoutButton({ collapsed }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Gagal logout, coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-tk-cream/80 transition-colors hover:bg-white/[0.08] hover:text-tk-cream",
        collapsed && "justify-center"
      )}
    >
      <LogOut size={18} />
      {!collapsed && "Logout"}
    </button>
  );
}
