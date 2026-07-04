"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";
import { LogoutButton } from "@/components/admin/logout-button";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col bg-tk-charcoal transition-all md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 text-lg font-extrabold">
            <span className="text-tk-orange">TitipKuy!</span>
            <span className="rounded-full border border-tk-sage bg-tk-sage/20 px-2 py-0.5 text-[10px] font-bold text-tk-sage">
              Admin
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Perbesar sidebar" : "Kecilkan sidebar"}
          className={cn(
            "rounded-full p-1.5 text-tk-cream/70 hover:bg-white/[0.08] hover:text-tk-cream",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2 text-sm font-semibold transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "border-l-tk-orange bg-tk-muted text-tk-cream"
                  : "border-l-transparent text-tk-cream/80 hover:bg-white/[0.08] hover:text-tk-cream"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-tk-muted px-3 py-4">
        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
