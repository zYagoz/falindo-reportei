"use client";

import { useEffect, useState } from "react";
import type { InstagramAccount } from "@/lib/types/instagram.types";

export function useInstagramAccounts() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      try {
        const response = await fetch("/api/instagram/accounts");
        const payload = (await response.json()) as { accounts?: InstagramAccount[]; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao buscar contas do Instagram.");
        }

        if (active) {
          setAccounts(payload.accounts ?? []);
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

    loadAccounts();

    return () => {
      active = false;
    };
  }, []);

  return { accounts, loading, error };
}
