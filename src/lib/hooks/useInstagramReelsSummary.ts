"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramReelsAggregate } from "@/lib/types/instagram.types";

export function useInstagramReelsSummary(accountId: string | null, dateRange: DateRange) {
  const [summary, setSummary] = useState<InstagramReelsAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;
    let active = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);
        const response = await fetch(`/api/instagram/reels-summary?${params}`);
        const payload = (await response.json()) as { summary?: InstagramReelsAggregate; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar resumo de reels.");
        }

        if (active) {
          setSummary(payload.summary ?? null);
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

    loadSummary();

    return () => {
      active = false;
    };
  }, [accountId, dateRange.since, dateRange.until]);

  return { summary, loading, error };
}
