import { render, screen } from "@testing-library/react";
import { ReelsTable } from "@/components/instagram/reels/ReelsTable";
import { reelsFixture } from "@/test/mocks/fixtures/meta";

vi.setConfig({ testTimeout: 15000 });

describe("ReelsTable", () => {
  it("renders reel columns and rows", () => {
    const { container } = render(
      <ReelsTable
        reels={[
          reelsFixture[0],
          {
            ...reelsFixture[0],
            id: "reel-2",
            caption: "Segundo reel",
            timestamp: "2026-03-08T09:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Reels" })).toBeInTheDocument();
    expect(screen.getByText("Somente itens com media_type VIDEO.")).toBeInTheDocument();
    expect(container.querySelectorAll("thead th")).toHaveLength(8);
    expect(container.textContent).toContain("Segundo reel");
    expect(container.textContent).toContain("Reel de");
  });
});
