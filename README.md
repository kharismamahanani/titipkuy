# TitipKuy! 📦

Aplikasi manajemen jasa penitipan barang — Malang, Indonesia.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Nunito font
- Prisma ORM + PostgreSQL (Supabase)
- Supabase Storage (bucket: `fotos`, `perjanjian`, `ttd`, `dokumen`)
- Vercel (deployment)
- Upstash Redis (rate limiting)

## Environment Variables yang Dibutuhkan

Buat file `.env.local` dengan variable berikut (nilai asli ada di Google
Drive — JANGAN commit ke Git):

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `INTERNAL_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Setup Lokal

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Deploy

Push ke branch `main` → Vercel auto-deploy. Pastikan semua env vars sudah
diisi di Vercel dashboard.

## Backup & Recovery

- Source code: github.com/kharismamahanani/titipkuy (Private)
- Env vars: disimpan di Google Drive (terenkripsi)
- Database: Supabase project `tswlkkwecbhhnrdamlzg`
- Rollback: Vercel Deployments → pilih deployment lama → Promote

## Keamanan

- Panel admin (`/admin/*` dan `/api/admin/*`) dilindungi terpusat lewat
  `src/middleware.ts` — request tanpa cookie sesi admin yang valid otomatis
  ditolak (halaman di-redirect ke `/admin/login`, API mengembalikan `401`).
- Halaman verifikasi QR publik (`/transaksi/[id]`) hanya mengambil field
  yang aman ditampilkan ke siapa saja (nama depan, status, tanggal, kode
  label) lewat `select` eksplisit di `src/app/api/transaksi/[id]/verifikasi/route.ts`
  — data sensitif (WhatsApp, alamat, KTP/KTM, dokumen, nilai deklarasi,
  tanda tangan) tidak pernah dikirim ke endpoint ini.
- Jangan commit file `.env*` apa pun — sudah di-cover oleh `.gitignore`.
