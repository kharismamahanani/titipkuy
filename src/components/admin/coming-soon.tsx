export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Halaman ini sedang disiapkan — segera hadir.
      </p>
    </div>
  );
}
