import { render, screen } from "@testing-library/react";
import { BestDayChart } from "@/components/instagram/activity/BestDayChart";
import { BestHourChart } from "@/components/instagram/activity/BestHourChart";
import { activityFixture } from "@/test/mocks/fixtures/meta";

vi.setConfig({ testTimeout: 15000 });

describe("activity charts", () => {
  it("renders activity headings and limitation notice", () => {
    render(
      <BestDayChart
        activity={{
          ...activityFixture,
          limitedToLast30Days: true,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Melhor dia para postagens" })).toBeInTheDocument();
    expect(screen.getByText("A Meta disponibiliza activity apenas dos últimos 30 dias.")).toBeInTheDocument();
  });

  it("renders empty state for missing data", () => {
    render(
      <BestHourChart
        activity={{
          ...activityFixture,
          bestHour: null,
          hours: activityFixture.hours.map((bucket) => ({ ...bucket, value: 0, sampleCount: 0, totalValue: 0, highlighted: false })),
          emptyReason: "Dados indisponíveis para contas com menos de 100 seguidores.",
        }}
      />,
    );

    expect(screen.getByText("Dados indisponíveis para contas com menos de 100 seguidores.")).toBeInTheDocument();
  });
});
