import type { DateRange } from "@/lib/types/common.types";

export const DATE_PRESETS = [
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
] as const;

export const DEFAULT_PRESET_INDEX = 1;

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateRange(days: number, referenceDate = new Date()): DateRange {
  const until = new Date(referenceDate);
  const since = new Date(referenceDate);
  since.setDate(since.getDate() - (days - 1));

  return {
    since: toDateString(since),
    until: toDateString(until),
    label: `Últimos ${days} dias`,
  };
}

export function createCustomDateRange(since: string, until: string): DateRange {
  return {
    since,
    until,
    label: `${formatShortDate(since)} - ${formatShortDate(until)}`,
  };
}

export function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getPreviousDateRange(range: DateRange): DateRange {
  const currentSince = parseDateString(range.since);
  const currentUntil = parseDateString(range.until);
  const diffInDays = Math.floor(
    (currentUntil.getTime() - currentSince.getTime()) / (1000 * 60 * 60 * 24),
  );
  const rangeDays = Math.max(diffInDays + 1, 1);

  const previousUntil = new Date(currentSince);
  previousUntil.setDate(previousUntil.getDate() - 1);

  const previousSince = new Date(previousUntil);
  previousSince.setDate(previousSince.getDate() - (rangeDays - 1));

  return {
    since: toDateString(previousSince),
    until: toDateString(previousUntil),
    label: `Período anterior (${rangeDays} dias)`,
  };
}

export function getDefaultDateRange(referenceDate = new Date()): DateRange {
  return getDateRange(DATE_PRESETS[DEFAULT_PRESET_INDEX].days, referenceDate);
}
