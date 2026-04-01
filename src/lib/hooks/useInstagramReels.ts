"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramReel } from "@/lib/types/instagram.types";

export function useInstagramReels(accountId: string | null, dateRange: DateRange) {
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;

    let active = true;

    async function loadReels() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);
        const response = await fetch(`/api/instagram/reels?${params}`);
        const payload = (await response.json()) as { reels?: InstagramReel[]; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar reels.");
        }

        if (active) {
          setReels(payload.reels ?? []);
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

    loadReels();

    return () => {
      active = false;
    };
  }, [accountId, dateRange.since, dateRange.until]);

  return { reels, loading, error };
}
