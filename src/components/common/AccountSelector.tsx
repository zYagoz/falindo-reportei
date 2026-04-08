"use client";

import { useEffect, useState } from "react";
import type { Platform } from "@/lib/types/common.types";
import type { InstagramAccount } from "@/lib/types/instagram.types";

const STORAGE_KEY = "selected_instagram_account";

interface AccountSelectorProps {
  accounts: InstagramAccount[];
  selectedId: string | null;
  onSelect: (account: InstagramAccount) => void;
  loading: boolean;
  platform: Platform;
}

function InitialsAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  loading,
  platform,
}: AccountSelectorProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (loading || !accounts.length) {
      return;
    }

    const storedId = window.localStorage.getItem(STORAGE_KEY);
    const restored = accounts.find((account) => account.id === storedId);

    if (restored && restored.id !== selectedId) {
      onSelect(restored);
      return;
    }

    if (!selectedId) {
      onSelect(accounts[0]);
    }
  }, [accounts, loading, onSelect, selectedId]);

  const selectedAccount = accounts.find((account) => account.id === selectedId);

  useEffect(() => {
    setImageFailed(false);
  }, [selectedAccount?.id, selectedAccount?.profile_picture_url]);

  function handleChange(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);

    if (!account) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, account.id);
    onSelect(account);
  }

  if (loading) {
    return (
      <div className="card-surface min-w-0 rounded-[24px] p-5">
        <div className="h-11 animate-pulse rounded-2xl bg-[var(--color-primary)]/10" />
      </div>
    );
  }

  return (
    <div className="card-surface min-w-0 rounded-[24px] p-5">
      <label className="mb-3 block text-sm font-medium text-[var(--color-text-muted)]">
        Conta ativa em {platform}
      </label>
      <div className="grid min-w-0 gap-4 min-[1600px]:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] min-[1600px]:items-center">
        <select
          aria-label="Selecionar conta"
          className="min-w-0 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none ring-0"
          onChange={(event) => handleChange(event.target.value)}
          value={selectedId ?? ""}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} (@{account.username})
            </option>
          ))}
        </select>
        {selectedAccount ? (
          <div className="flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-primary)]/8 px-4 py-3">
            {selectedAccount.profile_picture_url && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={selectedAccount.name}
                className="h-11 w-11 rounded-full object-cover"
                onError={() => setImageFailed(true)}
                src={selectedAccount.profile_picture_url}
              />
            ) : (
              <InitialsAvatar name={selectedAccount.name} />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{selectedAccount.name}</p>
              <p className="truncate text-sm text-[var(--color-text-muted)]">@{selectedAccount.username}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
