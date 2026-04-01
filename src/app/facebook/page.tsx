import { PlatformNav } from "@/components/common/PlatformNav";

export default function FacebookPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1600px] min-w-0 gap-6 overflow-x-clip px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
      <PlatformNav />
      <section className="card-surface flex min-h-[420px] items-center justify-center rounded-[32px] p-8">
        <div className="max-w-lg text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">Facebook</p>
          <h1 className="mt-4 text-4xl font-semibold">Em breve</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            A base estrutural já está pronta. A camada Facebook será adicionada sem refatorar o módulo do Instagram.
          </p>
        </div>
      </section>
    </main>
  );
}
