import { render, screen } from "@testing-library/react";
import { OverviewKPIs } from "@/components/instagram/overview/OverviewKPIs";
import { overviewFixture, previousOverviewFixture } from "@/test/mocks/fixtures/meta";

describe("OverviewKPIs", () => {
  it("renders the five overview cards with previous-period comparison", () => {
    render(<OverviewKPIs overview={overviewFixture} previousOverview={previousOverviewFixture} />);

    expect(screen.getByText("Seguidores atuais")).toBeInTheDocument();
    expect(screen.getByText("Novos seguidores no período")).toBeInTheDocument();
    expect(screen.getByText("Visitas ao perfil")).toBeInTheDocument();
    expect(screen.getByText("Alcance do perfil")).toBeInTheDocument();
    expect(screen.getByText("Cliques no link")).toBeInTheDocument();
    expect(screen.queryByText(/Base anterior: 3.9k/)).not.toBeInTheDocument();
    expect(screen.getByText("Base anterior: 84")).toBeInTheDocument();
    expect(screen.getByText("Base anterior: 13.6k")).toBeInTheDocument();
    expect(screen.getByText("Base anterior: 7.2k")).toBeInTheDocument();
    expect(screen.getByText("Base anterior: 42")).toBeInTheDocument();
  });
});
