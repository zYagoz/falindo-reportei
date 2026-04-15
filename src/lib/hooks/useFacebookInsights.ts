"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { FacebookInsights } from "@/lib/types/facebook.types";

export function useFacebookInsights(pageId: string | null, dateRange: DateRange) {
  const [insights, setInsights] = useState<FacebookInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedPageId = pageId;

    if (!resolvedPageId) {
      return;
    }

    const pageIdValue: string = resolvedPageId;
    let active = true;

    async function loadInsights() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("pageId", pageIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);

        const response = await fetch(`/api/facebook/insights?${params}`);
        const payload = (await response.json()) as { insights?: FacebookInsights; error?: string };

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
  }, [dateRange.since, dateRange.until, pageId]);

  return { insights, loading, error };
}
