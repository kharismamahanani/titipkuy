import {
  LayoutDashboard,
  Receipt,
  Package,
  Printer,
  Archive,
  Wallet,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Transaksi", href: "/admin/transaksi", icon: Receipt },
  { label: "Kelola Paket", href: "/admin/paket", icon: Package },
  { label: "Print Label", href: "/admin/label", icon: Printer },
  { label: "Arsip Perjanjian", href: "/admin/arsip", icon: Archive },
  { label: "Rekap Keuangan", href: "/admin/rekap", icon: Wallet },
];
