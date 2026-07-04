"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-tk-charcoal bg-tk-charcoal md:hidden">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold",
              isActive ? "text-tk-orange" : "text-tk-cream/70"
            )}
          >
            <Icon size={20} />
            <span className="line-clamp-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
