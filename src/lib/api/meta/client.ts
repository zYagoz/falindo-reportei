interface MetaApiOptions {
  params?: Record<string, string>;
  revalidate?: number;
}

export async function metaFetch<T>(
  endpoint: string,
  options: MetaApiOptions = {},
): Promise<T> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const baseUrl = process.env.META_BASE_URL || "https://graph.facebook.com";
  const apiVersion = process.env.META_API_VERSION || "v21.0";

  if (!accessToken) {
    throw new Error("META_ACCESS_TOKEN não configurado no .env.local");
  }

  const { params = {}, revalidate = 3600 } = options;
  const url = new URL(`${baseUrl}/${apiVersion}/${endpoint}`);

  url.searchParams.set("access_token", accessToken);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      errorPayload &&
      typeof errorPayload === "object" &&
      "error" in errorPayload &&
      typeof errorPayload.error === "object" &&
      errorPayload.error &&
      "message" in errorPayload.error
        ? String(errorPayload.error.message)
        : `Meta API Error: ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
