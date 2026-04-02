import type {
  AgeBreakdown,
  ActivityBucket,
  CityBreakdown,
  DemographicData,
  FollowsData,
  GenderBreakdown,
  InstagramActivity,
  InstagramInsights,
  InstagramOverviewAggregate,
  InstagramReelsAggregate,
  MetricDataPoint,
  OnlineFollowersPoint,
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

export function parseMetricBreakdownTotalValue(
  response: unknown,
  metricName: string,
  dimensionValue: string,
): number {
  const metric = getMetric(response, metricName);

  if (!metric) {
    return 0;
  }

  const match = getBreakdownResults(metric).find((result) => result.dimension_values?.[0] === dimensionValue);
  return sumMetricObject(match?.value);
}

export function parseMetricBreakdownTotalValueExcluding(
  response: unknown,
  metricName: string,
  excludedDimensions: string[],
): number {
  const metric = getMetric(response, metricName);

  if (!metric) {
    return 0;
  }

  return getBreakdownResults(metric)
    .filter((result) => !excludedDimensions.includes(result.dimension_values?.[0] ?? ""))
    .reduce((total, result) => total + sumMetricObject(result.value), 0);
}

export function parseMetricSeriesTotal(response: unknown, metricName: string): number {
  const metric = getMetric(response, metricName);

  if (!metric?.values?.length) {
    return 0;
  }

  return metric.values.reduce((total, entry) => total + sumMetricObject(entry.value), 0);
}

export function parseMetricAggregateTotal(response: unknown, metricName: string): number {
  const metric = getMetric(response, metricName);

  if (!metric) {
    return 0;
  }

  if (typeof metric.total_value?.value === "number" && Number.isFinite(metric.total_value.value)) {
    return metric.total_value.value;
  }

  if (!metric.values?.length) {
    return 0;
  }

  return metric.values.reduce((total, entry) => total + sumMetricObject(entry.value), 0);
}

export function parseReachTimeSeries(response: unknown): MetricDataPoint[] {
  const metric = getMetric(response, "reach");

  if (!metric?.values?.length) {
    return [];
  }

  return metric.values
    .filter((entry) => entry.end_time && typeof entry.value === "number" && Number.isFinite(entry.value))
    .map((entry) => ({
      value: entry.value as number,
      end_time: entry.end_time as string,
    }));
}

export function parseOnlineFollowersSeries(response: unknown): OnlineFollowersPoint[] {
  const metric = getMetric(response, "online_followers");

  if (!metric?.values?.length) {
    return [];
  }

  return metric.values.flatMap((entry) => {
    if (!entry.end_time) {
      return [];
    }

    if (typeof entry.value === "number" && Number.isFinite(entry.value)) {
      return [
        {
          value: entry.value,
          end_time: entry.end_time,
        },
      ];
    }

    if (entry.value && typeof entry.value === "object") {
      return Object.entries(entry.value)
        .filter(([hour, value]) => /^\d+$/.test(hour) && typeof value === "number" && Number.isFinite(value))
        .map(([hour, value]) => ({
          value,
          end_time: entry.end_time as string,
          hour: Number(hour),
        }));
    }

    return [];
  });
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

export function parseReelsAggregate(
  viewsResponse: unknown,
  reachResponse: unknown,
  interactionsResponse: unknown,
): InstagramReelsAggregate {
  const views = parseMetricBreakdownTotalValue(viewsResponse, "views", "REEL");
  const reach = parseMetricBreakdownTotalValue(reachResponse, "reach", "REEL");
  const total_interactions = parseMetricBreakdownTotalValue(
    interactionsResponse,
    "total_interactions",
    "REEL",
  );

  return {
    views,
    reach,
    total_interactions,
    engagement_rate: reach ? Number(((total_interactions / reach) * 100).toFixed(2)) : 0,
  };
}

export function parseOverviewAggregate(
  followersCount: number,
  followerCountResponse: unknown,
  profileViewsResponse: unknown,
  reachResponse: unknown,
  linkTapsResponse: unknown,
): InstagramOverviewAggregate {
  return {
    followers_count: followersCount,
    new_followers: parseMetricAggregateTotal(followerCountResponse, "follower_count"),
    profile_views: parseMetricAggregateTotal(profileViewsResponse, "profile_views"),
    profile_reach: parseMetricBreakdownTotalValueExcluding(reachResponse, "reach", [
      "AD",
      "DEFAULT_DO_NOT_USE",
    ]),
    profile_links_taps: parseMetricTotalValue(linkTapsResponse, "profile_links_taps"),
  };
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => `${hour}h`);
const ACTIVITY_WINDOW_DAYS = 30;
const ACTIVITY_TIMEZONE = "America/Sao_Paulo";

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatLocalParts(
  value: string,
  timeZone = ACTIVITY_TIMEZONE,
): { date: string; dayIndex: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(new Date(value));

  const partMap = new Map(parts.map((part) => [part.type, part.value]));
  const weekday = partMap.get("weekday") ?? "Sun";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    date: `${partMap.get("year")}-${partMap.get("month")}-${partMap.get("day")}`,
    dayIndex: weekdayMap[weekday] ?? 0,
    hour: Number(partMap.get("hour") ?? 0),
  };
}

function createEmptyBuckets(labels: readonly string[]): ActivityBucket[] {
  return labels.map((label) => ({
    label,
    value: 0,
    sampleCount: 0,
    totalValue: 0,
    highlighted: false,
  }));
}

function markBestBucket(buckets: ActivityBucket[]): { buckets: ActivityBucket[]; best: ActivityBucket | null } {
  const bestIndex = buckets.reduce<number>((currentBest, bucket, index) => {
    if (bucket.sampleCount === 0) {
      return currentBest;
    }

    if (currentBest === -1) {
      return index;
    }

    const best = buckets[currentBest];

    if (bucket.value > best.value) {
      return index;
    }

    if (bucket.value === best.value && bucket.sampleCount > best.sampleCount) {
      return index;
    }

    if (bucket.value === best.value && bucket.sampleCount === best.sampleCount && bucket.totalValue > best.totalValue) {
      return index;
    }

    return currentBest;
  }, -1);

  return {
    buckets: buckets.map((bucket, index) => ({
      ...bucket,
      highlighted: index === bestIndex,
    })),
    best: bestIndex >= 0 ? { ...buckets[bestIndex], highlighted: true } : null,
  };
}

export function buildInstagramActivity(
  points: OnlineFollowersPoint[],
  selectedSince: string,
  selectedUntil: string,
  referenceDate = new Date(),
  timeZone = ACTIVITY_TIMEZONE,
): InstagramActivity {
  const days = createEmptyBuckets(DAY_LABELS);
  const hours = createEmptyBuckets(HOUR_LABELS);
  const pointsWithDateKeys = points.map((point) => ({
    ...point,
    dateKey: point.dateKey ?? formatLocalParts(point.end_time, timeZone).date,
  }));
  const latestPointDate = pointsWithDateKeys.reduce<string | null>((latest, point) => {
    const localDate = point.dateKey as string;

    if (!latest || localDate > latest) {
      return localDate;
    }

    return latest;
  }, null);
  const availableUntilDate = toUtcDate(latestPointDate ?? formatDateKey(referenceDate));
  const availableSinceDate = new Date(availableUntilDate);
  availableSinceDate.setUTCDate(availableSinceDate.getUTCDate() - (ACTIVITY_WINDOW_DAYS - 1));
  const availableSince = formatDateKey(availableSinceDate);
  const availableUntil = formatDateKey(availableUntilDate);
  const selectedRangeDays =
    Math.floor((toUtcDate(selectedUntil).getTime() - toUtcDate(selectedSince).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const limitedToLast30Days = selectedRangeDays > ACTIVITY_WINDOW_DAYS || selectedSince < availableSince;

  const effectiveSince = limitedToLast30Days
    ? availableSince
    : formatDateKey(new Date(Math.max(toUtcDate(selectedSince).getTime(), availableSinceDate.getTime())));
  const effectiveUntil = limitedToLast30Days
    ? availableUntil
    : formatDateKey(new Date(Math.min(toUtcDate(selectedUntil).getTime(), availableUntilDate.getTime())));

  const filteredPoints = pointsWithDateKeys.filter((point) => {
    const localDate = point.dateKey as string;
    return localDate >= effectiveSince && localDate <= effectiveUntil;
  });

  if (!filteredPoints.length) {
    return {
      bestDay: null,
      bestHour: null,
      days,
      hours,
      effectiveSince,
      effectiveUntil,
      limitedToLast30Days,
      emptyReason: "A Meta não disponibilizou activity utilizável para esta conta no período selecionado.",
    };
  }

  const dayTotals = new Map<string, { dayIndex: number; totalValue: number; sampleCount: number }>();

  for (const point of filteredPoints) {
    const local = formatLocalParts(point.end_time, timeZone);
    const dayKey = point.dateKey as string;
    const hourIndex = typeof point.hour === "number" ? point.hour : local.hour;
    const hourBucket = hours[hourIndex];

    hourBucket.sampleCount += 1;
    hourBucket.totalValue += point.value;

    const currentDay = dayTotals.get(dayKey) ?? { dayIndex: local.dayIndex, totalValue: 0, sampleCount: 0 };
    currentDay.totalValue += point.value;
    currentDay.sampleCount += 1;
    dayTotals.set(dayKey, currentDay);
  }

  for (const { dayIndex, totalValue, sampleCount } of dayTotals.values()) {
    const dayBucket = days[dayIndex];
    dayBucket.sampleCount += 1;
    dayBucket.totalValue += sampleCount ? totalValue / sampleCount : 0;
  }

  for (const bucket of [...days, ...hours]) {
    bucket.value = bucket.sampleCount ? Number((bucket.totalValue / bucket.sampleCount).toFixed(2)) : 0;
  }

  const daysWithBest = markBestBucket(days);
  const hoursWithBest = markBestBucket(hours);

  return {
    bestDay: daysWithBest.best,
    bestHour: hoursWithBest.best,
    days: daysWithBest.buckets,
    hours: hoursWithBest.buckets,
    effectiveSince,
    effectiveUntil,
    limitedToLast30Days,
  };
}
