import { fireEvent, render, screen } from "@testing-library/react";
import { AccountSelector } from "@/components/common/AccountSelector";
import { instagramAccountsFixture } from "@/test/mocks/fixtures/meta";

describe("AccountSelector", () => {
  it("renders loading skeleton", () => {
    const onSelect = vi.fn();
    render(
      <AccountSelector
        accounts={[]}
        loading
        onSelect={onSelect}
        platform="instagram"
        selectedId={null}
      />,
    );

    expect(screen.queryByLabelText("Selecionar conta")).not.toBeInTheDocument();
  });

  it("persists and restores account selection", async () => {
    const onSelect = vi.fn();

    render(
      <AccountSelector
        accounts={instagramAccountsFixture}
        loading={false}
        onSelect={onSelect}
        platform="instagram"
        selectedId={instagramAccountsFixture[0].id}
      />,
    );

    fireEvent.change(screen.getByLabelText("Selecionar conta"), {
      target: { value: instagramAccountsFixture[1].id },
    });

    expect(localStorage.getItem("selected_instagram_account")).toBe(instagramAccountsFixture[1].id);
    expect(onSelect).toHaveBeenLastCalledWith(instagramAccountsFixture[1]);
  });
});
