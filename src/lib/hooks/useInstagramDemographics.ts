"use client";

import { useEffect, useState } from "react";
import type { DemographicData } from "@/lib/types/instagram.types";

export function useInstagramDemographics(accountId: string | null, timeframe: "this_month" | "this_week") {
  const [demographics, setDemographics] = useState<DemographicData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;

    let active = true;

    async function loadDemographics() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("timeframe", timeframe);
        const response = await fetch(`/api/instagram/demographics?${params}`);
        const payload = (await response.json()) as { demographics?: DemographicData; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar demographics.");
        }

        if (active) {
          setDemographics(payload.demographics ?? null);
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

    loadDemographics();

    return () => {
      active = false;
    };
  }, [accountId, timeframe]);

  return { demographics, loading, error };
}
