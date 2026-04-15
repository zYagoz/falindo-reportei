import { render, screen, waitFor } from "@testing-library/react";
import { FacebookDashboard } from "@/components/facebook/FacebookDashboard";
import {
  facebookInsightsFixture,
  facebookOverviewFixture,
  facebookOverviewUnavailableFixture,
  facebookPagesFixture,
} from "@/test/mocks/fixtures/meta";

const useFacebookPagesMock = vi.fn();
const useFacebookOverviewMock = vi.fn();
const useFacebookInsightsMock = vi.fn();

vi.setConfig({ testTimeout: 15000 });

vi.mock("@/lib/hooks/useFacebookPages", () => ({
  useFacebookPages: () => useFacebookPagesMock(),
}));

vi.mock("@/lib/hooks/useFacebookOverview", () => ({
  useFacebookOverview: () => useFacebookOverviewMock(),
}));

vi.mock("@/lib/hooks/useFacebookInsights", () => ({
  useFacebookInsights: () => useFacebookInsightsMock(),
}));

describe("FacebookDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    useFacebookPagesMock.mockReset();
    useFacebookOverviewMock.mockReset();
    useFacebookInsightsMock.mockReset();
    useFacebookOverviewMock.mockReturnValue({
      overview: null,
      loading: false,
      error: null,
    });
    useFacebookInsightsMock.mockReturnValue({
      insights: null,
      loading: false,
      error: null,
    });
  });

  it("renders the shell and loading selector state", () => {
    useFacebookPagesMock.mockReturnValue({
      pages: [],
      loading: true,
      error: null,
    });

    render(<FacebookDashboard />);

    expect(screen.getByRole("heading", { name: "Social Insights Dashboard", level: 1 })).toBeInTheDocument();
    expect(screen.queryByLabelText("Selecionar conta")).not.toBeInTheDocument();
  });

  it("shows a pages error", () => {
    useFacebookPagesMock.mockReturnValue({
      pages: [],
      loading: false,
      error: "Falha ao buscar paginas.",
    });

    render(<FacebookDashboard />);

    expect(screen.getAllByText("Falha ao buscar paginas.").length).toBeGreaterThan(0);
  });

  it("shows an empty state when there are no pages", () => {
    useFacebookPagesMock.mockReturnValue({
      pages: [],
      loading: false,
      error: null,
    });

    render(<FacebookDashboard />);

    expect(screen.getByText("Nenhuma pagina do Facebook foi encontrada para este token.")).toBeInTheDocument();
  });

  it("shows the selected page card when pages are available", async () => {
    useFacebookPagesMock.mockReturnValue({
      pages: facebookPagesFixture,
      loading: false,
      error: null,
    });
    useFacebookOverviewMock.mockImplementation(() => ({
      overview: facebookOverviewFixture,
      loading: false,
      error: null,
    }));
    useFacebookInsightsMock.mockImplementation(() => ({
      insights: facebookInsightsFixture,
      loading: false,
      error: null,
    }));

    render(<FacebookDashboard />);

    await waitFor(() => expect(screen.getByText("Pagina selecionada")).toBeInTheDocument());

    expect(screen.getByRole("heading", { name: "Hazel Studio", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Posts e Demographics")).toBeInTheDocument();
    expect(screen.getAllByText("@hazelstudiofb")).toHaveLength(2);
    expect(screen.getByText("KPIs e visualizacoes")).toBeInTheDocument();
    expect(screen.getByText("Seguidores atuais")).toBeInTheDocument();
    expect(screen.getByText("Seguidores liquidos")).toBeInTheDocument();
    expect(screen.getByText("Visitas ao Facebook")).toBeInTheDocument();
    expect(screen.getByText("Interacoes com o conteudo")).toBeInTheDocument();
    expect(screen.getByText("Visualizacoes ao longo do periodo")).toBeInTheDocument();
  });

  it("shows an unavailable insights state instead of zeroed cards", async () => {
    useFacebookPagesMock.mockReturnValue({
      pages: facebookPagesFixture,
      loading: false,
      error: null,
    });
    useFacebookOverviewMock.mockImplementation(() => ({
      overview: facebookOverviewUnavailableFixture,
      loading: false,
      error: null,
    }));
    useFacebookInsightsMock.mockImplementation(() => ({
      insights: { views: [] },
      loading: false,
      error: null,
    }));

    render(<FacebookDashboard />);

    await waitFor(() =>
      expect(screen.getByText("Insights indisponiveis via API")).toBeInTheDocument(),
    );

    expect(screen.getByText("Curtidas da pagina")).toBeInTheDocument();
    expect(screen.getAllByText("7")).toHaveLength(2);
    expect(
      screen.getByText(
        "Assim que a pagina atingir o limiar exigido pela Meta, o overview de insights passa a ser carregado automaticamente nesta tela.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Visualizacoes ao longo do periodo")).not.toBeInTheDocument();
  });
});
