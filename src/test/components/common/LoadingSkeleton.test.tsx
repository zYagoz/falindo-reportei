import { render } from "@testing-library/react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

describe("LoadingSkeleton", () => {
  it("renders the configured number of lines", () => {
    const { container } = render(<LoadingSkeleton lines={4} className="custom-shell" />);
    const skeletonLines = container.querySelectorAll(".animate-pulse");

    expect(skeletonLines).toHaveLength(4);
    expect(container.firstChild).toHaveClass("custom-shell");
  });
});
