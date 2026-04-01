import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/common/MetricCard";

describe("MetricCard", () => {
  it("renders label, value and variation badge", () => {
    render(<MetricCard label="Interações" previousValue={100} value={120} />);

    expect(screen.getByText("Interações")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("+20.00%")).toBeInTheDocument();
  });
});
