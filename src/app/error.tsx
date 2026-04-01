"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
        <div className="card-surface max-w-xl rounded-[28px] p-8">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.3em] text-[var(--color-danger)]">
            Erro inesperado
          </p>
          <h1 className="mb-3 text-2xl font-semibold">A aplicação encontrou um problema.</h1>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">{error.message}</p>
          <button
            className="rounded-full bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            onClick={reset}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
