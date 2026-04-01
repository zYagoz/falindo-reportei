import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
