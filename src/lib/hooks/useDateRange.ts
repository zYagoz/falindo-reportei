"use client";

import { useMemo, useState } from "react";
import type { DatePreset } from "@/lib/types/common.types";
import {
  createCustomDateRange,
  DATE_PRESETS,
  DEFAULT_PRESET_INDEX,
  getDateRangeFromPreset,
  getPreviousDateRange,
  getPreviousDateRangeForPreset,
} from "@/lib/utils/dateUtils";

export function useDateRange() {
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_INDEX);
  const [customRange, setCustomRange] = useState<ReturnType<typeof createCustomDateRange> | null>(null);

  const selectedPresetConfig: DatePreset = DATE_PRESETS[selectedPreset];

  const activeRange = useMemo(
    () => customRange ?? getDateRangeFromPreset(selectedPresetConfig),
    [customRange, selectedPresetConfig],
  );
  const previousRange = useMemo(
    () => (customRange ? getPreviousDateRange(activeRange) : getPreviousDateRangeForPreset(selectedPresetConfig)),
    [activeRange, customRange, selectedPresetConfig],
  );

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
