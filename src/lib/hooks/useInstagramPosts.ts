"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import type { InstagramPost } from "@/lib/types/instagram.types";

export function useInstagramPosts(accountId: string | null, dateRange: DateRange) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedAccountId = accountId;

    if (!resolvedAccountId) {
      return;
    }

    const accountIdValue: string = resolvedAccountId;

    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("accountId", accountIdValue);
        params.set("since", dateRange.since);
        params.set("until", dateRange.until);
        const response = await fetch(`/api/instagram/posts?${params}`);
        const payload = (await response.json()) as { posts?: InstagramPost[]; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao carregar posts.");
        }

        if (active) {
          setPosts(payload.posts ?? []);
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

    loadPosts();

    return () => {
      active = false;
    };
  }, [accountId, dateRange.since, dateRange.until]);

  return { posts, loading, error };
}
