"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramOverviewAggregate } from "@/lib/types/instagram.types";

export function useInstagramOverview(accountId: string | null, dateRange: DateRange) {
  const [overview, setOverview] = useState<InstagramOverviewAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);
        const response = await fetch(`/api/instagram/overview?${params}`);
        const payload = (await response.json()) as { overview?: InstagramOverviewAggregate; error?: string };

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
  }, [accountId, dateRange.since, dateRange.until]);

  return { overview, loading, error };
}
