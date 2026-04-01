"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramInsights } from "@/lib/types/instagram.types";

export function useInstagramInsights(accountId: string | null, dateRange: DateRange) {
  const [insights, setInsights] = useState<InstagramInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;

    let active = true;

    async function loadInsights() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);

        const response = await fetch(`/api/instagram/insights?${params}`);
        const payload = (await response.json()) as { insights?: InstagramInsights; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar insights.");
        }

        if (active) {
          setInsights(payload.insights ?? null);
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

    loadInsights();

    return () => {
      active = false;
    };
  }, [accountId, dateRange.since, dateRange.until]);

  return { insights, loading, error };
}
