export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="card-surface w-full max-w-xl rounded-[28px] p-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[var(--color-primary)]/20" />
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
          Carregando dashboard
        </p>
      </div>
    </main>
  );
}
