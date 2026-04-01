import type { ReactNode } from "react";

interface DataTableProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DataTable({ title, description, children }: DataTableProps) {
  return (
    <section className="card-surface w-full overflow-hidden rounded-[28px]">
      <header className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      </header>
      <div className="w-full overflow-x-auto">{children}</div>
    </section>
  );
}
