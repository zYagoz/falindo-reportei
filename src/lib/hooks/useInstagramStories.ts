"use client";

import { useEffect, useState } from "react";
import type { InstagramStoriesAggregate } from "@/lib/types/instagram.types";

export function useInstagramStories(accountId: string | null) {
  const [stories, setStories] = useState<InstagramStoriesAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;
    let active = true;

    async function loadStories() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);

        const response = await fetch(`/api/instagram/stories?${params}`);
        const payload = (await response.json()) as { stories?: InstagramStoriesAggregate; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar stories.");
        }

        if (active) {
          setStories(payload.stories ?? null);
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

    loadStories();

    return () => {
      active = false;
    };
  }, [accountId]);

  return { stories, loading, error };
}
