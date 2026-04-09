import type { CityBreakdown } from "@/lib/types/instagram.types";
import { formatFullNumber } from "@/lib/utils/formatters";

interface TopCitiesTableProps {
  cities: CityBreakdown[];
}

export function TopCitiesTable({ cities }: TopCitiesTableProps) {
  return (
    <div className="card-surface rounded-[28px] p-5">
      <h3 className="mb-4 text-lg font-semibold">Top cidades</h3>
      {cities.length ? (
        <div className="space-y-3">
          {cities.slice(0, 5).map((city) => (
            <div key={city.city} className="flex items-start justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3">
              <span className="min-w-0 flex-1 break-words">{city.city}</span>
              <strong className="shrink-0">{formatFullNumber(city.value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Sem cidades disponíveis.</p>
      )}
    </div>
  );
}
