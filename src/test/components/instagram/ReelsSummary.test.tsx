import { render, screen } from "@testing-library/react";
import { ReelsSummary } from "@/components/instagram/reels/ReelsSummary";
import {
  previousReelsSummaryFixture,
  reelsFixture,
  reelsSummaryFixture,
} from "@/test/mocks/fixtures/meta";

describe("ReelsSummary", () => {
  it("renders aggregated reel metrics", () => {
    render(
      <ReelsSummary
        previousReels={[]}
        previousSummary={previousReelsSummaryFixture}
        reels={reelsFixture}
        summary={reelsSummaryFixture}
      />,
    );

    expect(screen.getByText("Visualizações")).toBeInTheDocument();
    expect(screen.getByText("17.295")).toBeInTheDocument();
    expect(screen.getByText("Base anterior: 7.299")).toBeInTheDocument();
  });
});
