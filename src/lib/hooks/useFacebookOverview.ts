"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { FacebookOverviewAggregate } from "@/lib/types/facebook.types";

export function useFacebookOverview(pageId: string | null, dateRange: DateRange) {
  const [overview, setOverview] = useState<FacebookOverviewAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedPageId = pageId;

    if (!resolvedPageId) {
      return;
    }

    const pageIdValue: string = resolvedPageId;
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("pageId", pageIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);

        const response = await fetch(`/api/facebook/overview?${params}`);
        const payload = (await response.json()) as { overview?: FacebookOverviewAggregate; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar overview.");
        }

        if (active) {
          setOverview(payload.overview ?? null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erro inesperado.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, [dateRange.since, dateRange.until, pageId]);

  return { overview, loading, error };
}
