import { render, screen } from "@testing-library/react";
import { FeedPostsSummary } from "@/components/instagram/posts/FeedPostsSummary";
import { FollowerGrowthChart } from "@/components/instagram/overview/FollowerGrowthChart";
import { GenderDonutLegendChart } from "@/components/instagram/overview/GenderDonutLegendChart";
import { TopCitiesTable } from "@/components/instagram/overview/TopCitiesTable";
import { postsFixture } from "@/test/mocks/fixtures/meta";

vi.mock("@/components/charts/LineChart", () => ({
  LineChart: ({ data }: { data: Array<{ date: string; value: number }> }) => (
    <div data-testid="line-chart">{JSON.stringify(data)}</div>
  ),
}));

vi.mock("@/components/charts/DonutChart", () => ({
  DonutChart: ({ data }: { data: Array<{ name: string; value: number }> }) => (
    <div data-testid="donut-chart">{JSON.stringify(data)}</div>
  ),
}));

describe("overview and feed summary blocks", () => {
  it("renders the follower growth chart and empty state", () => {
    const { rerender } = render(
      <FollowerGrowthChart data={[{ end_time: "2026-04-01T00:00:00+0000", value: 5300 }]} />,
    );

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();

    rerender(<FollowerGrowthChart data={[]} />);
    expect(screen.getByText("Sem dados de alcance para o período.")).toBeInTheDocument();
  });

  it("renders the gender chart legend and empty state", () => {
    const { rerender } = render(<GenderDonutLegendChart data={{ M: 40, F: 54, U: 6 }} />);

    expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("Feminino")).toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();

    rerender(<GenderDonutLegendChart data={{ M: 0, F: 0, U: 0 }} />);
    expect(screen.getByText("Sem dados demográficos para o período.")).toBeInTheDocument();
  });

  it("renders the top cities table and empty state", () => {
    const { rerender } = render(
      <TopCitiesTable
        cities={[
          { city: "São Paulo", value: 3200 },
          { city: "Rio de Janeiro", value: 1800 },
        ]}
      />,
    );

    expect(screen.getByText("São Paulo")).toBeInTheDocument();
    expect(screen.getByText("Rio de Janeiro")).toBeInTheDocument();

    rerender(<TopCitiesTable cities={[]} />);
    expect(screen.getByText("Sem cidades disponíveis.")).toBeInTheDocument();
  });

  it("renders the feed summary totals and previous-period comparisons", () => {
    render(
      <FeedPostsSummary
        posts={postsFixture}
        previousPosts={postsFixture.slice(0, 1)}
        profileVisits={88}
        previousProfileVisits={40}
      />,
    );

    expect(screen.getByText("Compartilhamentos")).toBeInTheDocument();
    expect(screen.getByText("Começaram a seguir")).toBeInTheDocument();
    expect(screen.getByText("Visitas ao perfil")).toBeInTheDocument();
    expect(screen.getByText("Posts no período")).toBeInTheDocument();
    expect(screen.getByText("Taxa de interação")).toBeInTheDocument();
    expect(screen.getByText("Interações")).toBeInTheDocument();
    expect(screen.getByText("Base anterior: 40")).toBeInTheDocument();
  });
});
