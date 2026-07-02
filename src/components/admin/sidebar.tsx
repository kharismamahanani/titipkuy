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
        "hidden h-screen flex-col border-r border-card-border bg-card-dark transition-all md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <Link href="/admin" className="gradient-text font-heading text-lg font-extrabold">
            TitipKuy! 📦
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Perbesar sidebar" : "Kecilkan sidebar"}
          className={cn(
            "rounded-full p-1.5 text-foreground/60 hover:bg-primary/10 hover:text-foreground",
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "bg-gradient-to-r from-primary-from to-primary-to text-white"
                  : "text-foreground/70 hover:bg-primary/10 hover:text-foreground"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-card-border px-3 py-4">
        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
