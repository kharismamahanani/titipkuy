import { prisma } from "@/lib/prisma";

export async function getOrCreateKonfigurasi() {
  const existing = await prisma.konfigurasiOperasional.findFirst();
  if (existing) return existing;
  return prisma.konfigurasiOperasional.create({ data: {} });
}

export function parseTanggalMerah(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
