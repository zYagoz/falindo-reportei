import { render, screen } from "@testing-library/react";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { DATE_PRESETS } from "@/lib/utils/dateUtils";

describe("DateRangePicker", () => {
  it("shows presets and active period", () => {
    render(
      <DateRangePicker
        activeRange={{ since: "2026-03-03", until: "2026-04-01", label: "Últimos 30 dias" }}
        onPresetChange={vi.fn()}
        presets={DATE_PRESETS}
        selectedPreset={1}
      />,
    );

    expect(screen.getByText("Últimos 30 dias")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-03-03")).toBeInTheDocument();
    expect(screen.getByText("03/03/2026 - 01/04/2026")).toBeInTheDocument();
  });
});
