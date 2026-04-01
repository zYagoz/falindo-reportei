import { PlatformNav } from "@/components/common/PlatformNav";

export default function LinkedInPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1600px] min-w-0 gap-6 overflow-x-clip px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
      <PlatformNav />
      <section className="card-surface flex min-h-[420px] items-center justify-center rounded-[32px] p-8">
        <div className="max-w-lg text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">LinkedIn</p>
          <h1 className="mt-4 text-4xl font-semibold">Em breve</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            O placeholder confirma a extensibilidade da navegação enquanto o conector dedicado não é implementado.
          </p>
        </div>
      </section>
    </main>
  );
}
