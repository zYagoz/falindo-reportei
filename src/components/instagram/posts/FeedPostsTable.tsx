import type { InstagramPost } from "@/lib/types/instagram.types";
import { calculateEngagementRate, formatDate, formatFullNumber, formatPercent } from "@/lib/utils/formatters";
import { DataTable } from "@/components/common/DataTable";

interface FeedPostsTableProps {
  posts: InstagramPost[];
}

export function FeedPostsTable({ posts }: FeedPostsTableProps) {
  const orderedPosts = [...posts].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );

  return (
    <DataTable description="Posts do feed ordenados do mais recente para o mais antigo." title="Posts do feed">
      <table className="min-w-[960px] text-left text-sm md:min-w-[1180px]">
        <thead className="bg-[var(--color-primary)]/8 text-[var(--color-text-muted)]">
          <tr>
            {[
              "Postagem",
              "Criado em",
              "Alcance",
              "Curtidas",
              "Comentários",
              "Salvos",
              "Compartilhamentos",
              "Começaram a seguir",
              "Interações",
              "Taxa de interação",
            ].map((label) => (
              <th key={label} className="px-4 py-3 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderedPosts.map((post) => {
            const engagementRate = calculateEngagementRate(
              post.insights.total_interactions,
              post.insights.reach,
            );

            return (
              <tr key={post.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {post.thumbnail_url || post.media_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={post.caption ?? "Post"}
                        className="h-10 w-10 rounded-xl object-cover"
                        src={post.thumbnail_url ?? post.media_url}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10" />
                    )}
                    <span className="max-w-[220px] truncate">{post.caption || "Sem legenda"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{formatDate(post.timestamp)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.reach)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.likes)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.comments)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.saved)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.shares)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.follows)}</td>
                <td className="px-4 py-3">{formatFullNumber(post.insights.total_interactions)}</td>
                <td className="px-4 py-3 font-semibold">{formatPercent(engagementRate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTable>
  );
}
