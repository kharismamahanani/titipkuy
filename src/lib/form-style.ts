// Kelas styling bersama untuk input/label/error di form pemesanan, mengikuti
// design system TitipKuy! (Nunito, neobrutalist, light mode).
// Catatan: box-shadow fokus dipaksa "!important" karena utility ring-0
// bawaan komponen (dipakai untuk mematikan ring default) menulis properti
// box-shadow yang sama — tanpa ini, urutan CSS bisa membuat ring-0 menang
// dan shadow fokus custom kita tidak pernah muncul.
export const tkInputClass =
  "h-auto w-full rounded-lg border-2 border-tk-charcoal bg-white px-[14px] py-[10px] font-sans text-sm text-tk-charcoal placeholder:text-tk-light focus-visible:border-tk-orange focus-visible:ring-0 focus-visible:![box-shadow:0_0_0_3px_rgba(232,156,101,0.15)] aria-invalid:border-[#C0392B]";

export const tkSelectTriggerClass = tkInputClass;

export const tkLabelClass = "mb-1 block text-[13px] font-bold text-tk-charcoal";

export const tkErrorClass = "mt-1 text-xs font-semibold text-[#C0392B]";

// Tombol destruktif (hapus dsb) — bukan bagian dari TkButton karena warnanya
// selalu merah, terlepas dari variant.
export const tkDangerButtonClass =
  "inline-flex items-center justify-center rounded-[10px] border-2 border-[#C0392B] bg-tk-cream px-4 py-2 text-sm font-extrabold text-[#C0392B] transition-all hover:bg-[#C0392B]/10";
