import { render, screen } from "@testing-library/react";
import { SectionHeader } from "@/components/common/SectionHeader";

vi.setConfig({ testTimeout: 15000 });

describe("SectionHeader", () => {
  it("renders eyebrow, title, description and action", () => {
    render(
      <SectionHeader
        eyebrow="01. Visão Geral"
        title="KPIs e audiência"
        description="KPIs consolidados"
        action={<button type="button">Ação</button>}
      />,
    );

    expect(screen.getByText("01. Visão Geral")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "KPIs e audiência" })).toBeInTheDocument();
    expect(screen.getByText("KPIs consolidados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });
});
