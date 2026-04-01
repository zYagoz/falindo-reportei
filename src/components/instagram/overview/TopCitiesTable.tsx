import type { CityBreakdown } from "@/lib/types/instagram.types";
import { formatNumber } from "@/lib/utils/formatters";

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
            <div key={city.city} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
              <span>{city.city}</span>
              <strong>{formatNumber(city.value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Sem cidades disponíveis.</p>
      )}
    </div>
  );
}
