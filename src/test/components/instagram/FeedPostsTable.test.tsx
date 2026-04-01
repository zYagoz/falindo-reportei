import { render, screen, within } from "@testing-library/react";
import { FeedPostsTable } from "@/components/instagram/posts/FeedPostsTable";
import { postsFixture } from "@/test/mocks/fixtures/meta";

describe("FeedPostsTable", () => {
  it("orders by descending date and calculates engagement in the front-end", () => {
    render(<FeedPostsTable posts={postsFixture} />);

    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Campanha lançamento")).toBeInTheDocument();
    expect(screen.getByText("+12.52%")).toBeInTheDocument();
  });
});
