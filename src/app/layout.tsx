import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "../styles/tokens.css";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/constants/site";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

const TITLE = "TitipKuy! | Titip Barang, Tenang Magang 🔥";
const DESCRIPTION =
  "Jasa penitipan barang untuk mahasiswa di Malang. Aman, gampang, dan bikin tenang pas magang, KKN, atau mudik.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "TitipKuy!",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(nunito.variable)}>
      <body className={cn(nunito.className, "antialiased")}>
        {children}
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
