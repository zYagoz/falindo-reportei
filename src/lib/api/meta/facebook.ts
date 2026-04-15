import type { FacebookInsights, FacebookOverviewAggregate, FacebookPage } from "@/lib/types/facebook.types";
import { parseMetricAggregateTotal, parseMetricTimeSeries } from "@/lib/utils/metaApiHelpers";
import { metaFetch } from "./client";

type MetaFacebookPage = {
  id: string;
  name: string;
  username?: string;
  category?: string;
  access_token?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
};

type MetaFacebookPageSnapshot = {
  followers_count?: number;
  fan_count?: number;
};

type DateWindow = {
  since: string;
  until: string;
};

type FacebookDebugWindowResponse = {
  window: DateWindow;
  params: {
    metric: string;
    period: string;
    since: string;
    until: string;
  };
  returned_metrics: string[];
  raw: unknown;
};

type FacebookOverviewWindowResult = {
  aggregate: FacebookOverviewAggregate;
  hasMetrics: boolean;
};

const MAX_PAGE_INSIGHTS_WINDOW_DAYS = 90;

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateParam(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildDateWindows(since: string, until: string): DateWindow[] {
  const windows: DateWindow[] = [];
  const rangeStart = toUtcDate(since);
  const rangeEnd = toUtcDate(until);

  let cursor = new Date(rangeStart);

  while (cursor <= rangeEnd) {
    const windowEnd = new Date(cursor);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + (MAX_PAGE_INSIGHTS_WINDOW_DAYS - 1));

    if (windowEnd > rangeEnd) {
      windowEnd.setTime(rangeEnd.getTime());
    }

    windows.push({
      since: toDateParam(cursor),
      until: toDateParam(windowEnd),
    });

    cursor = new Date(windowEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return windows;
}

function mergeFacebookOverview(
  snapshot: MetaFacebookPageSnapshot,
  windows: FacebookOverviewAggregate[],
): FacebookOverviewAggregate {
  return windows.reduce<FacebookOverviewAggregate>(
    (accumulator, current) => {
      accumulator.follows += current.follows;
      accumulator.unfollows += current.unfollows;
      accumulator.net_followers += current.net_followers;
      accumulator.views += current.views;
      accumulator.page_visits += current.page_visits;
      accumulator.content_interactions += current.content_interactions;
      return accumulator;
    },
    {
      followers_total: snapshot.followers_count ?? 0,
      fan_count: snapshot.fan_count ?? 0,
      follows: 0,
      unfollows: 0,
      net_followers: 0,
      views: 0,
      page_visits: 0,
      content_interactions: 0,
      insights_available: true,
    },
  );
}

function responseHasMetrics(response: unknown): boolean {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return false;
  }

  const parsed = response as { data?: unknown[] };
  return Array.isArray(parsed.data) && parsed.data.length > 0;
}

function resolveInsightsUnavailableReason(snapshot: MetaFacebookPageSnapshot): string {
  if ((snapshot.fan_count ?? 0) > 0 && (snapshot.fan_count ?? 0) < 100) {
    return `Insights indisponiveis via API para esta pagina. A Meta libera Page Insights apenas para paginas com pelo menos 100 curtidas. Curtidas atuais: ${snapshot.fan_count}.`;
  }

  return "Insights indisponiveis via API para esta pagina no periodo selecionado. A Meta retornou data vazio para /insights, entao os cards abaixo nao representam desempenho zero.";
}

async function fetchFacebookOverviewWindow(
  pageId: string,
  pageAccessToken: string,
  window: DateWindow,
): Promise<FacebookOverviewWindowResult> {
  const response = await metaFetch(`${pageId}/insights`, {
    accessToken: pageAccessToken,
    params: {
      metric:
        "page_daily_follows_unique,page_daily_unfollows_unique,page_media_view,page_views_total,page_post_engagements",
      period: "day",
      since: window.since,
      until: window.until,
    },
    revalidate: 1800,
  });

  const follows = parseMetricAggregateTotal(response, "page_daily_follows_unique");
  const unfollows = parseMetricAggregateTotal(response, "page_daily_unfollows_unique");

  return {
    hasMetrics: responseHasMetrics(response),
    aggregate: {
      followers_total: 0,
      fan_count: 0,
      follows,
      unfollows,
      net_followers: follows - unfollows,
      views: parseMetricAggregateTotal(response, "page_media_view"),
      page_visits: parseMetricAggregateTotal(response, "page_views_total"),
      content_interactions: parseMetricAggregateTotal(response, "page_post_engagements"),
      insights_available: true,
    },
  };
}

async function fetchManagedFacebookPages(): Promise<MetaFacebookPage[]> {
  const response = await metaFetch<{ data: MetaFacebookPage[] }>("me/accounts", {
    params: {
      fields: "id,name,username,picture{url},category,access_token",
    },
    revalidate: 3600,
  });

  return response.data;
}

function extractReturnedMetrics(response: unknown): string[] {
  if (!response || typeof response !== "object" || !("data" in response)) {
    return [];
  }

  const parsed = response as { data?: Array<{ name?: string }> };
  return parsed.data?.flatMap((metric) => (metric.name ? [metric.name] : [])) ?? [];
}

async function resolveManagedFacebookPage(pageId: string): Promise<MetaFacebookPage> {
  const pages = await fetchManagedFacebookPages();
  const page = pages.find((item) => item.id === pageId);

  if (!page) {
    throw new Error("Pagina do Facebook nao encontrada entre as paginas gerenciadas.");
  }

  return page;
}

async function resolveFacebookPageAccessToken(pageId: string): Promise<string> {
  const page = await resolveManagedFacebookPage(pageId);

  if (!page.access_token) {
    throw new Error("Nao foi possivel resolver o Page Access Token desta pagina.");
  }

  return page.access_token;
}

export async function fetchFacebookPages(): Promise<FacebookPage[]> {
  const pages = await fetchManagedFacebookPages();

  return pages.map((page) => ({
    id: page.id,
    name: page.name,
    username: page.username || undefined,
    picture_url: page.picture?.data?.url,
    category: page.category,
  }));
}

export async function fetchFacebookOverviewAggregate(
  pageId: string,
  since: string,
  until: string,
): Promise<FacebookOverviewAggregate> {
  const pageAccessToken = await resolveFacebookPageAccessToken(pageId);
  const [snapshot, overviewWindows] = await Promise.all([
    metaFetch<MetaFacebookPageSnapshot>(pageId, {
      accessToken: pageAccessToken,
      params: {
        fields: "followers_count,fan_count",
      },
      revalidate: 1800,
    }),
    Promise.all(
      buildDateWindows(since, until).map((window) =>
        fetchFacebookOverviewWindow(pageId, pageAccessToken, window),
      ),
    ),
  ]);
  const mergedOverview = mergeFacebookOverview(
    snapshot,
    overviewWindows.map((item) => item.aggregate),
  );
  const overviewHasMetrics = overviewWindows.some((item) => item.hasMetrics);

  if (!overviewHasMetrics) {
    return {
      ...mergedOverview,
      insights_available: false,
      insights_unavailable_reason: resolveInsightsUnavailableReason(snapshot),
    };
  }

  return mergedOverview;
}

export async function fetchFacebookInsights(
  pageId: string,
  since: string,
  until: string,
): Promise<FacebookInsights> {
  const pageAccessToken = await resolveFacebookPageAccessToken(pageId);
  const windows = buildDateWindows(since, until);
  const responses = await Promise.all(
    windows.map((window) =>
      metaFetch(`${pageId}/insights`, {
        accessToken: pageAccessToken,
        params: {
          metric: "page_media_view",
          period: "day",
          since: window.since,
          until: window.until,
        },
        revalidate: 1800,
      }),
    ),
  );

  return {
    views: responses.flatMap((response) => parseMetricTimeSeries(response, "page_media_view")),
  };
}

export async function fetchFacebookOverviewDebug(
  pageId: string,
  since: string,
  until: string,
) {
  const managedPage = await resolveManagedFacebookPage(pageId);
  const pageAccessToken = managedPage.access_token;

  if (!pageAccessToken) {
    throw new Error("Nao foi possivel resolver o Page Access Token desta pagina.");
  }

  const windows = buildDateWindows(since, until);
  const overviewMetric =
    "page_daily_follows_unique,page_daily_unfollows_unique,page_media_view,page_views_total,page_post_engagements";
  const chartMetric = "page_media_view";

  const snapshotResponse = await metaFetch<MetaFacebookPageSnapshot>(pageId, {
    accessToken: pageAccessToken,
    params: {
      fields: "followers_count,fan_count",
    },
    revalidate: 0,
  });

  const [overviewResponses, chartResponses] = await Promise.all([
    Promise.all(
      windows.map(async (window) => {
        const raw = await metaFetch(`${pageId}/insights`, {
          accessToken: pageAccessToken,
          params: {
            metric: overviewMetric,
            period: "day",
            since: window.since,
            until: window.until,
          },
          revalidate: 0,
        });

        return {
          window,
          params: {
            metric: overviewMetric,
            period: "day",
            since: window.since,
            until: window.until,
          },
          returned_metrics: extractReturnedMetrics(raw),
          raw,
        } satisfies FacebookDebugWindowResponse;
      }),
    ),
    Promise.all(
      windows.map(async (window) => {
        const raw = await metaFetch(`${pageId}/insights`, {
          accessToken: pageAccessToken,
          params: {
            metric: chartMetric,
            period: "day",
            since: window.since,
            until: window.until,
          },
          revalidate: 0,
        });

        return {
          window,
          params: {
            metric: chartMetric,
            period: "day",
            since: window.since,
            until: window.until,
          },
          returned_metrics: extractReturnedMetrics(raw),
          raw,
        } satisfies FacebookDebugWindowResponse;
      }),
    ),
  ]);

  const parsedOverview = mergeFacebookOverview(
    snapshotResponse,
    overviewResponses.map((response) => {
      const follows = parseMetricAggregateTotal(response.raw, "page_daily_follows_unique");
      const unfollows = parseMetricAggregateTotal(response.raw, "page_daily_unfollows_unique");

      return {
        followers_total: 0,
        fan_count: 0,
        follows,
        unfollows,
        net_followers: follows - unfollows,
        views: parseMetricAggregateTotal(response.raw, "page_media_view"),
        page_visits: parseMetricAggregateTotal(response.raw, "page_views_total"),
        content_interactions: parseMetricAggregateTotal(response.raw, "page_post_engagements"),
        insights_available: true,
      };
    }),
  );

  const overviewHasMetrics = overviewResponses.some((response) => responseHasMetrics(response.raw));

  const parsedInsights = {
    views: chartResponses.flatMap((response) => parseMetricTimeSeries(response.raw, "page_media_view")),
  };

  return {
    page: {
      id: managedPage.id,
      name: managedPage.name,
      username: managedPage.username,
      category: managedPage.category,
    },
    period: {
      since,
      until,
      windows,
    },
    snapshot: {
      fields: "followers_count,fan_count",
      raw: snapshotResponse,
    },
    overview_requests: overviewResponses,
    chart_requests: chartResponses,
    parsed: {
      overview: overviewHasMetrics
        ? parsedOverview
        : {
            ...parsedOverview,
            insights_available: false,
            insights_unavailable_reason: resolveInsightsUnavailableReason(snapshotResponse),
          },
      insights: parsedInsights,
    },
  };
}
