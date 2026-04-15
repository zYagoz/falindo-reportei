import { fireEvent, render, screen } from "@testing-library/react";
import { AccountSelector } from "@/components/common/AccountSelector";
import { facebookPagesFixture, instagramAccountsFixture } from "@/test/mocks/fixtures/meta";

vi.setConfig({ testTimeout: 15000 });

describe("AccountSelector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it("persists account selection with a platform-specific storage key", async () => {
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
    expect(localStorage.getItem("selected_facebook_account")).toBeNull();
    expect(onSelect).toHaveBeenLastCalledWith(instagramAccountsFixture[1]);
  });

  it("restores the stored facebook page selection independently from instagram", () => {
    const onSelect = vi.fn();
    localStorage.setItem("selected_facebook_account", facebookPagesFixture[1].id);
    localStorage.setItem("selected_instagram_account", instagramAccountsFixture[0].id);

    render(
      <AccountSelector
        accounts={facebookPagesFixture}
        loading={false}
        onSelect={onSelect}
        platform="facebook"
        selectedId={null}
      />,
    );

    expect(onSelect).toHaveBeenCalledWith(facebookPagesFixture[1]);
  });

  it("renders without a username when the selected account does not have one", () => {
    const onSelect = vi.fn();

    render(
      <AccountSelector
        accounts={[facebookPagesFixture[1]]}
        loading={false}
        onSelect={onSelect}
        platform="facebook"
        selectedId={facebookPagesFixture[1].id}
      />,
    );

    expect(screen.getByLabelText("Selecionar conta")).toHaveValue("fb-page-2");
    expect(screen.getAllByText("Nova Dental")).toHaveLength(2);
    expect(screen.queryByText("@undefined")).not.toBeInTheDocument();
  });

  it("falls back to initials when the profile photo fails and resets on account change", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <AccountSelector
        accounts={instagramAccountsFixture}
        loading={false}
        onSelect={onSelect}
        platform="instagram"
        selectedId={instagramAccountsFixture[0].id}
      />,
    );

    const image = screen.getByRole("img", { name: instagramAccountsFixture[0].name });
    fireEvent.error(image);

    expect(screen.getByText("HA")).toBeInTheDocument();

    rerender(
      <AccountSelector
        accounts={instagramAccountsFixture}
        loading={false}
        onSelect={onSelect}
        platform="instagram"
        selectedId={instagramAccountsFixture[1].id}
      />,
    );

    expect(screen.queryByText("HA")).not.toBeInTheDocument();
    expect(screen.getByText("NO")).toBeInTheDocument();
  });
});
