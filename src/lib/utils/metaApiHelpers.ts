import type {
  AgeBreakdown,
  CityBreakdown,
  DemographicData,
  FollowsData,
  GenderBreakdown,
  InstagramInsights,
  MetricDataPoint,
  PostInsights,
  ReelInsights,
} from "@/lib/types/instagram.types";

type MetaResult = {
  dimension_values?: string[];
  value?: number | Record<string, number>;
};

type MetaBreakdown = {
  dimension_keys?: string[];
  results?: MetaResult[];
};

type MetaMetric = {
  name?: string;
  total_value?: {
    value?: number | Record<string, number>;
    breakdowns?: MetaBreakdown[];
  };
  values?: Array<{
    value?: number | Record<string, number>;
    end_time?: string;
    breakdowns?: MetaBreakdown[];
  }>;
};

type MetaInsightsResponse = {
  data?: MetaMetric[];
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function asResponse(response: unknown, fallbackMessage: string): MetaInsightsResponse {
  invariant(
    typeof response === "object" && response !== null && "data" in response,
    fallbackMessage,
  );

  return response as MetaInsightsResponse;
}

function getMetric(response: unknown, metricName: string): MetaMetric | undefined {
  const parsed = asResponse(response, "Resposta da Meta API inválida para parsing.");
  return parsed.data?.find((metric) => metric.name === metricName);
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getBreakdownResults(metric: MetaMetric): MetaResult[] {
  return (
    metric.total_value?.breakdowns?.flatMap((item) => item.results ?? []) ??
    metric.values?.flatMap((item) => item.breakdowns?.flatMap((entry) => entry.results ?? []) ?? []) ??
    []
  );
}

function sumMetricObject(value: number | Record<string, number> | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return 0;
  }

  return Object.values(value).reduce((total, item) => total + toNumber(item), 0);
}

function buildGenderBreakdown(results: MetaResult[]): GenderBreakdown {
  return results.reduce<GenderBreakdown>(
    (accumulator, result) => {
      const dimension = result.dimension_values?.[0];
      const value = sumMetricObject(result.value);

      if (dimension === "M" || dimension === "F" || dimension === "U") {
        accumulator[dimension] += value;
      }

      return accumulator;
    },
    { M: 0, F: 0, U: 0 },
  );
}

function buildCityBreakdown(results: MetaResult[]): CityBreakdown[] {
  return results
    .map((result) => ({
      city: result.dimension_values?.[0] ?? "Desconhecida",
      value: sumMetricObject(result.value),
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
}

function buildAgeBreakdown(results: MetaResult[]): AgeBreakdown[] {
  const grouped = new Map<string, AgeBreakdown>();

  for (const result of results) {
    const [range = "unknown", gender] = result.dimension_values ?? [];
    const current =
      grouped.get(range) ??
      {
        range,
        M: 0,
        F: 0,
        U: 0,
      };

    if (typeof result.value === "object" && result.value !== null) {
      current.M += toNumber(result.value.M);
      current.F += toNumber(result.value.F);
      current.U += toNumber(result.value.U);
    } else if (gender === "M" || gender === "F" || gender === "U") {
      current[gender] += toNumber(result.value);
    } else {
      current.U += toNumber(result.value);
    }

    grouped.set(range, current);
  }

  return Array.from(grouped.values());
}

export function parseMetricTotalValue(response: unknown, metricName: string): number {
  const metric = getMetric(response, metricName);

  if (!metric) {
    return 0;
  }

  if (typeof metric.total_value?.value === "number") {
    return metric.total_value.value;
  }

  if (metric.values?.length) {
    return sumMetricObject(metric.values[metric.values.length - 1]?.value);
  }

  return 0;
}

export function parseReachTimeSeries(response: unknown): MetricDataPoint[] {
  const metric = getMetric(response, "reach");

  if (!metric?.values?.length) {
    return [];
  }

  return metric.values
    .filter((entry) => entry.end_time)
    .map((entry) => ({
      value: toNumber(entry.value),
      end_time: entry.end_time as string,
    }));
}

export function parseFollowsAndUnfollows(response: unknown): FollowsData {
  const metric = getMetric(response, "follows_and_unfollows");

  if (!metric) {
    return { follows: 0, unfollows: 0, net: 0 };
  }

  const totals = getBreakdownResults(metric).reduce(
    (accumulator, result) => {
      const key = result.dimension_values?.[0]?.toLowerCase() ?? "";
      const value = sumMetricObject(result.value);

      if (key.includes("follow") && !key.includes("unfollow")) {
        accumulator.follows += value;
      }

      if (key.includes("unfollow")) {
        accumulator.unfollows += value;
      }

      return accumulator;
    },
    { follows: 0, unfollows: 0 },
  );

  return {
    ...totals,
    net: totals.follows - totals.unfollows,
  };
}

export function parseInsightsResponse(
  totalValueResponse: unknown,
  timeSeriesResponse: unknown,
  followsResponse: unknown,
): InstagramInsights {
  return {
    reach: parseReachTimeSeries(timeSeriesResponse),
    accounts_engaged: parseMetricTotalValue(totalValueResponse, "accounts_engaged"),
    total_interactions: parseMetricTotalValue(totalValueResponse, "total_interactions"),
    follows_and_unfollows: parseFollowsAndUnfollows(followsResponse),
    profile_links_taps: parseMetricTotalValue(totalValueResponse, "profile_links_taps"),
    views: parseMetricTotalValue(totalValueResponse, "views"),
  };
}

export function parseFollowersGender(response: unknown): GenderBreakdown {
  const metric = getMetric(response, "follower_demographics");

  if (!metric) {
    return { M: 0, F: 0, U: 0 };
  }

  return buildGenderBreakdown(getBreakdownResults(metric));
}

export function parseFollowersCity(response: unknown): CityBreakdown[] {
  const metric = getMetric(response, "follower_demographics");

  if (!metric) {
    return [];
  }

  return buildCityBreakdown(getBreakdownResults(metric));
}

export function parseReachedAge(response: unknown): AgeBreakdown[] {
  const metric = getMetric(response, "reached_audience_demographics");

  if (!metric) {
    return [];
  }

  return buildAgeBreakdown(getBreakdownResults(metric));
}

export function parseDemographicsResponse(
  followersGenderResponse: unknown,
  followersCityResponse: unknown,
  reachedAgeResponse: unknown,
): DemographicData {
  return {
    followers_by_gender: parseFollowersGender(followersGenderResponse),
    followers_by_city: parseFollowersCity(followersCityResponse),
    reached_by_age: parseReachedAge(reachedAgeResponse),
    engaged_by_age: [],
  };
}

function parseNamedInsights<T extends string>(
  response: unknown,
  keys: readonly T[],
): Record<T, number> {
  return keys.reduce(
    (accumulator, key) => {
      accumulator[key] = parseMetricTotalValue(response, key);
      return accumulator;
    },
    {} as Record<T, number>,
  );
}

export function parsePostInsights(response: unknown): PostInsights {
  const parsed = parseNamedInsights(response, [
    "reach",
    "likes",
    "comments",
    "saved",
    "shares",
    "follows",
    "total_interactions",
  ] as const);

  return {
    views: parseMetricTotalValue(response, "views"),
    ...parsed,
    engagement_rate: 0,
  };
}

export function parseReelInsights(response: unknown): ReelInsights {
  const parsed = parseNamedInsights(response, [
    "reach",
    "likes",
    "comments",
    "saved",
    "shares",
    "total_interactions",
  ] as const);

  return {
    views: parseMetricTotalValue(response, "views"),
    ...parsed,
    engagement_rate: 0,
  };
}
