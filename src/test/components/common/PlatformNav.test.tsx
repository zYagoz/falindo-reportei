import { render, screen } from "@testing-library/react";
import { PlatformNav } from "@/components/common/PlatformNav";

vi.setConfig({ testTimeout: 15000 });

const usePathnameMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("PlatformNav", () => {
  it("renders supported platforms and highlights the active one", () => {
    usePathnameMock.mockReturnValue("/instagram");

    render(<PlatformNav />);

    expect(screen.getByRole("link", { name: /Instagram/i })).toHaveAttribute("href", "/instagram");
    expect(screen.getByRole("link", { name: /Facebook/i })).toHaveAttribute("href", "/facebook");
    expect(screen.getByRole("link", { name: /LinkedIn/i })).toHaveAttribute("href", "/linkedin");
    expect(screen.getAllByText("Em breve")).toHaveLength(2);
  });
});
