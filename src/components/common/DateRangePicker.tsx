"use client";

import type { DateRange } from "@/lib/types/common.types";
import { formatShortDate } from "@/lib/utils/dateUtils";

interface DateRangePickerProps {
  activeRange: DateRange;
  selectedPreset: number;
  presets: readonly { label: string; days: number }[];
  onPresetChange: (index: number) => void;
  onCustomRangeChange?: (since: string, until: string) => void;
}

export function DateRangePicker({
  activeRange,
  selectedPreset,
  presets,
  onPresetChange,
  onCustomRangeChange,
}: DateRangePickerProps) {
  return (
    <div className="card-surface min-w-0 rounded-[24px] p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset, index) => {
          const active = selectedPreset === index && activeRange.label === preset.label;

          return (
            <button
              key={preset.label}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-[var(--color-text)] hover:bg-[var(--color-primary)]/10"
              }`}
              onClick={() => onPresetChange(index)}
              type="button"
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="grid min-w-0 gap-3 md:grid-cols-2 md:items-end min-[1500px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(240px,auto)]">
        <div>
          <label className="mb-2 block text-sm text-[var(--color-text-muted)]">Início</label>
          <input
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3"
            onChange={(event) => onCustomRangeChange?.(event.target.value, activeRange.until)}
            type="date"
            value={activeRange.since}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-[var(--color-text-muted)]">Fim</label>
          <input
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3"
            onChange={(event) => onCustomRangeChange?.(activeRange.since, event.target.value)}
            type="date"
            value={activeRange.until}
          />
        </div>
        <div className="rounded-2xl bg-[var(--color-primary)]/8 px-4 py-3 text-sm text-[var(--color-text-muted)] md:col-span-2 min-[1500px]:col-span-1">
          {formatShortDate(activeRange.since)} - {formatShortDate(activeRange.until)}
        </div>
      </div>
    </div>
  );
}
