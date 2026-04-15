"use client";

import { useEffect, useState } from "react";
import type { FacebookPage } from "@/lib/types/facebook.types";

export function useFacebookPages() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPages() {
      try {
        const response = await fetch("/api/facebook/pages");
        const payload = (await response.json()) as { pages?: FacebookPage[]; error?: string };

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Falha ao buscar paginas do Facebook.");
        }

        if (active) {
          setPages(payload.pages ?? []);
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

    loadPages();

    return () => {
      active = false;
    };
  }, []);

  return { pages, loading, error };
}
