import {
  MessageSquareText,
  PanelsTopLeft,
  ScanSearch,
  SkipBack,
  SkipForward,
  ArrowRightCircle,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatFullNumber } from "@/lib/utils/formatters";
import type { InstagramStoriesAggregate } from "@/lib/types/instagram.types";

interface StoriesSummaryCardProps {
  stories?: InstagramStoriesAggregate | null;
  emptyMessage?: string;
}

interface StoryMetricCardProps {
  label: string;
  value: number;
  icon: ReactNode;
}

function StoryMetricCard({ label, value, icon }: StoryMetricCardProps) {
  return (
    <article className="card-surface flex min-h-[152px] flex-col rounded-[24px] p-5">
      <div className="flex min-h-[56px] items-start justify-between gap-4">
        <p className="text-sm leading-7 text-[var(--color-text-muted)] md:text-base">{label}</p>
        <div className="shrink-0 text-[var(--color-primary)]">{icon}</div>
      </div>
      <strong className="mt-3 block text-3xl font-semibold text-[var(--color-text)]">
        {formatFullNumber(value)}
      </strong>
    </article>
  );
}

export function StoriesSummaryCard({ stories, emptyMessage }: StoriesSummaryCardProps) {
  const message =
    emptyMessage ?? stories?.emptyReason ?? "Nenhum story ativo ou recente encontrado para esta conta.";

  return (
    <div className="card-surface rounded-[28px] p-5 xl:col-span-3">
      <div className="mb-4 space-y-2">
        <h3 className="text-lg font-semibold">Stories</h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Resumo de stories ativos ou recentemente disponiveis na Meta API.
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Os insights de stories expiram rapido e normalmente so ficam disponiveis por cerca de 24 horas.
        </p>
      </div>

      {stories && !stories.emptyReason ? (
        <div className="grid items-stretch gap-4 pt-2 md:grid-cols-2 xl:grid-cols-4">
          <StoryMetricCard icon={<PanelsTopLeft size={20} />} label="Stories ativas" value={stories.stories_count} />
          <StoryMetricCard icon={<ScanSearch size={20} />} label="Alcance" value={stories.reach} />
          <StoryMetricCard icon={<ScanSearch size={20} />} label="Views" value={stories.views} />
          <StoryMetricCard icon={<MessageSquareText size={20} />} label="Respostas" value={stories.replies} />
          <StoryMetricCard icon={<SkipForward size={20} />} label="Toques para avancar" value={stories.taps_forward} />
          <StoryMetricCard icon={<SkipBack size={20} />} label="Toques para voltar" value={stories.taps_back} />
          <StoryMetricCard icon={<XCircle size={20} />} label="Saidas" value={stories.exits} />
          <StoryMetricCard
            icon={<ArrowRightCircle size={20} />}
            label="Pulos para o proximo story"
            value={stories.swipe_forward}
          />
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
          {message}
        </div>
      )}
    </div>
  );
}
