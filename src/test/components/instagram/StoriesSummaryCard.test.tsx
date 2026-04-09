import { render, screen } from "@testing-library/react";
import { StoriesSummaryCard } from "@/components/instagram/stories/StoriesSummaryCard";
import { storiesFixture } from "@/test/mocks/fixtures/meta";

describe("StoriesSummaryCard", () => {
  it("renders story metrics", () => {
    render(<StoriesSummaryCard stories={storiesFixture} />);

    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Stories ativas")).toBeInTheDocument();
    expect(screen.getByText("3.580")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Toques para avançar")).toBeInTheDocument();
    expect(screen.getByText("Pulos para o próximo story")).toBeInTheDocument();
    expect(screen.queryByText("Atividade de perfil")).not.toBeInTheDocument();
    expect(screen.queryByText("Compartilhamentos")).not.toBeInTheDocument();
    expect(screen.queryByText("Impressões")).not.toBeInTheDocument();
  });

  it("renders an empty state", () => {
    render(<StoriesSummaryCard stories={{ ...storiesFixture, stories_count: 0, emptyReason: "Sem stories" }} />);

    expect(screen.getByText("Sem stories")).toBeInTheDocument();
  });
});
