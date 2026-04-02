"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramActivity } from "@/lib/types/instagram.types";

export function useInstagramActivity(accountId: string | null, dateRange: DateRange) {
  const [activity, setActivity] = useState<InstagramActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;

    let active = true;

    async function loadActivity() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);

        const response = await fetch(`/api/instagram/activity?${params}`);
        const payload = (await response.json()) as { activity?: InstagramActivity; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar activity.");
        }

        if (active) {
          setActivity(payload.activity ?? null);
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

    loadActivity();

    return () => {
      active = false;
    };
  }, [accountId, dateRange.since, dateRange.until]);

  return { activity, loading, error };
}
