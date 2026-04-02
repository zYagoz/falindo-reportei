import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "@/components/common/ErrorMessage";

describe("ErrorMessage", () => {
  it("renders the default title and a long message", () => {
    render(<ErrorMessage message={"Erro ".repeat(20)} />);

    expect(screen.getByText("Falha ao carregar a seção")).toBeInTheDocument();
    expect(screen.getByText(/Erro Erro/)).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(<ErrorMessage title="Falha da API" message="Token expirado" />);

    expect(screen.getByText("Falha da API")).toBeInTheDocument();
    expect(screen.getByText("Token expirado")).toBeInTheDocument();
  });
});
