export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-extrabold text-tk-charcoal">{title}</h1>
      <p className="mt-2 text-sm text-tk-muted">
        Halaman ini sedang disiapkan — segera hadir.
      </p>
    </div>
  );
}
