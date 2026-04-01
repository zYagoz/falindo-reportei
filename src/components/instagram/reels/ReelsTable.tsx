import type { InstagramReel } from "@/lib/types/instagram.types";
import { formatDate, formatNumber, formatPercent } from "@/lib/utils/formatters";
import { DataTable } from "@/components/common/DataTable";

interface ReelsTableProps {
  reels: InstagramReel[];
}

export function ReelsTable({ reels }: ReelsTableProps) {
  const orderedReels = [...reels].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );

  return (
    <DataTable description="Somente itens com media_type VIDEO." title="Reels">
      <table className="w-full min-w-[860px] text-left text-sm md:min-w-[920px]">
        <thead className="bg-[var(--color-primary)]/8 text-[var(--color-text-muted)]">
          <tr>
            {["Reel", "Criado em", "Plays", "Alcance", "Curtidas", "Comentários", "Interações", "ER"].map(
              (label) => (
                <th key={label} className="px-4 py-3 font-medium">
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {orderedReels.map((reel) => (
            <tr key={reel.id} className="border-t border-[var(--color-border)]">
              <td className="w-[32%] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {reel.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={reel.caption ?? "Reel"}
                      className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      src={reel.thumbnail_url}
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--color-primary)]/10" />
                  )}
                  <span className="min-w-0 max-w-[280px] truncate">{reel.caption || "Sem legenda"}</span>
                </div>
              </td>
              <td className="px-4 py-3">{formatDate(reel.timestamp)}</td>
              <td className="px-4 py-3">{formatNumber(reel.insights.views)}</td>
              <td className="px-4 py-3">{formatNumber(reel.insights.reach)}</td>
              <td className="px-4 py-3">{formatNumber(reel.insights.likes)}</td>
              <td className="px-4 py-3">{formatNumber(reel.insights.comments)}</td>
              <td className="px-4 py-3">{formatNumber(reel.insights.total_interactions)}</td>
              <td className="px-4 py-3 font-semibold">{formatPercent(reel.insights.engagement_rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
