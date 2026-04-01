import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AccountSelector
        accounts={instagramAccountsFixture}
        loading={false}
        onSelect={onSelect}
        platform="instagram"
        selectedId={null}
      />,
    );

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(instagramAccountsFixture[0]));

    await user.selectOptions(screen.getByLabelText("Selecionar conta"), instagramAccountsFixture[1].id);

    expect(localStorage.getItem("selected_instagram_account")).toBe(instagramAccountsFixture[1].id);
    expect(onSelect).toHaveBeenLastCalledWith(instagramAccountsFixture[1]);
  });
});
