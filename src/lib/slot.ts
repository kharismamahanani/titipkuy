import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateKonfigurasi, parseTanggalMerah } from "@/lib/konfigurasi";
import { SLOT_SESI } from "@/lib/constants";

// Jam mulai tiap sesi diturunkan dari SLOT_SESI (mis. "08.00 – 11.00 WIB" -> 8).
const SESI_JAM_MULAI: Record<string, number> = Object.fromEntries(
  Object.entries(SLOT_SESI).map(([key, sesi]) => [key, parseInt(sesi.jam, 10)])
);
const TIPE_ARMADA = ["motor", "mobil"] as const;
const H1_MS = 24 * 60 * 60 * 1000;

function parseTanggalLocal(tanggal: string) {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface SlotSesiInfo {
  sisa: number;
  armadaId: string | null;
}

export async function getSlotAvailability(tanggal: string, hub: string) {
  const konfig = await getOrCreateKonfigurasi();
  const tanggalMerahList = parseTanggalMerah(konfig.lockTanggalMerah);

  const tanggalDate = parseTanggalLocal(tanggal);
  const hariMinggu = tanggalDate.getDay() === 0;
  const tanggalMerah = tanggalMerahList.includes(tanggal);

  const armadaAktif = await prisma.armada.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "asc" },
  });
  const armadaIds = armadaAktif.map((a) => a.id);

  const slotRows = armadaIds.length
    ? await prisma.slotArmada.findMany({
        where: { armadaId: { in: armadaIds }, tanggal: tanggalDate, hub },
      })
    : [];

  const terpakaiMap = new Map<string, number>();
  for (const row of slotRows) {
    terpakaiMap.set(`${row.armadaId}|${row.sesiWaktu}`, row.terpakai);
  }

  const now = new Date();
  const [y, m, d] = tanggal.split("-").map(Number);

  const sesi: Record<string, { label: string; locked: boolean; motor: SlotSesiInfo; mobil: SlotSesiInfo }> = {};

  for (const sesiWaktu of Object.keys(SESI_JAM_MULAI)) {
    const sesiDateTime = new Date(y, m - 1, d, SESI_JAM_MULAI[sesiWaktu], 0, 0);
    const isH1Locked = konfig.lockH1 && sesiDateTime.getTime() - now.getTime() < H1_MS;
    const isMingguLocked = konfig.lockHariMinggu && hariMinggu;
    const locked = isH1Locked || isMingguLocked || tanggalMerah;

    const perTipe: Record<string, SlotSesiInfo> = {
      motor: { sisa: 0, armadaId: null },
      mobil: { sisa: 0, armadaId: null },
    };

    for (const armada of armadaAktif) {
      if (!TIPE_ARMADA.includes(armada.tipe as (typeof TIPE_ARMADA)[number])) continue;
      const terpakai = terpakaiMap.get(`${armada.id}|${sesiWaktu}`) ?? 0;
      const sisaArmada = Math.max(0, armada.slotPerHari - terpakai);
      perTipe[armada.tipe].sisa += sisaArmada;
      if (sisaArmada > 0 && !perTipe[armada.tipe].armadaId) {
        perTipe[armada.tipe].armadaId = armada.id;
      }
    }

    sesi[sesiWaktu] = {
      label: SLOT_SESI[sesiWaktu as keyof typeof SLOT_SESI].jam,
      locked,
      motor: perTipe.motor,
      mobil: perTipe.mobil,
    };
  }

  const liburLocked = (konfig.lockHariMinggu && hariMinggu) || tanggalMerah;

  return {
    tanggal,
    hub,
    hariMinggu,
    tanggalMerah,
    liburLocked,
    pesanHariLibur: konfig.pesanHariLibur,
    sesi,
  };
}

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export async function incrementSlotUsage(
  client: PrismaClientOrTx,
  params: { armadaId: string; tanggal: string; sesiWaktu: string; hub: string }
) {
  const armada = await client.armada.findUnique({ where: { id: params.armadaId } });
  if (!armada || !armada.aktif) {
    throw new Error("Armada tidak ditemukan atau nonaktif");
  }

  const tanggalDate = parseTanggalLocal(params.tanggal);

  const existing = await client.slotArmada.findUnique({
    where: {
      armadaId_tanggal_sesiWaktu_hub: {
        armadaId: params.armadaId,
        tanggal: tanggalDate,
        sesiWaktu: params.sesiWaktu,
        hub: params.hub,
      },
    },
  });

  const currentTerpakai = existing?.terpakai ?? 0;
  if (currentTerpakai >= armada.slotPerHari) {
    throw new Error("SLOT_PENUH");
  }

  await client.slotArmada.upsert({
    where: {
      armadaId_tanggal_sesiWaktu_hub: {
        armadaId: params.armadaId,
        tanggal: tanggalDate,
        sesiWaktu: params.sesiWaktu,
        hub: params.hub,
      },
    },
    create: {
      armadaId: params.armadaId,
      tanggal: tanggalDate,
      sesiWaktu: params.sesiWaktu,
      hub: params.hub,
      terpakai: 1,
    },
    update: { terpakai: { increment: 1 } },
  });
}
