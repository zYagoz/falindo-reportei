interface ErrorMessageProps {
  title?: string;
  message: string;
}

export function ErrorMessage({ title = "Falha ao carregar a seção", message }: ErrorMessageProps) {
  return (
    <div className="rounded-[24px] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-5 text-[var(--color-text)]">
      <p className="mb-2 font-semibold text-[var(--color-danger)]">{title}</p>
      <p className="break-words text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
