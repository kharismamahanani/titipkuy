import {
  LayoutDashboard,
  Receipt,
  Package,
  Archive,
  Wallet,
  Truck,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Transaksi", href: "/admin/transaksi", icon: Receipt },
  { label: "Kelola Paket", href: "/admin/paket", icon: Package },
  { label: "Armada & Layanan", href: "/admin/armada-layanan", icon: Truck },
  { label: "Arsip Pernyataan", href: "/admin/arsip", icon: Archive },
  { label: "Rekap Keuangan", href: "/admin/rekap", icon: Wallet },
];
