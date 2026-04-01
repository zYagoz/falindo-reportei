"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "@/lib/types/common.types";
import {
  createCustomDateRange,
  DATE_PRESETS,
  DEFAULT_PRESET_INDEX,
  getDateRange,
  getPreviousDateRange,
} from "@/lib/utils/dateUtils";

export function useDateRange() {
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_INDEX);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const activeRange = useMemo(
    () => customRange ?? getDateRange(DATE_PRESETS[selectedPreset].days),
    [customRange, selectedPreset],
  );
  const previousRange = useMemo(() => getPreviousDateRange(activeRange), [activeRange]);

  function selectPreset(index: number) {
    setSelectedPreset(index);
    setCustomRange(null);
  }

  function updateCustomRange(since: string, until: string) {
    setCustomRange(createCustomDateRange(since, until));
  }

  return {
    activeRange,
    previousRange,
    presets: DATE_PRESETS,
    selectedPreset,
    setSelectedPreset: selectPreset,
    setCustomRange: updateCustomRange,
  };
}
