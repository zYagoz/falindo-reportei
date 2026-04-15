"use client";

import { useEffect, useState } from "react";
import type { Platform, SocialAccount } from "@/lib/types/common.types";

interface AccountSelectorProps<TAccount extends SocialAccount> {
  accounts: TAccount[];
  selectedId: string | null;
  onSelect: (account: TAccount) => void;
  loading: boolean;
  platform: Platform;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

function InitialsAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function getStorageKey(platform: Platform) {
  return `selected_${platform}_account`;
}

function getPictureUrl(account: SocialAccount) {
  return account.picture_url ?? account.profile_picture_url;
}

function formatAccountLabel(account: SocialAccount) {
  return account.username ? `${account.name} (@${account.username})` : account.name;
}

export function AccountSelector<TAccount extends SocialAccount>({
  accounts,
  selectedId,
  onSelect,
  loading,
  platform,
}: AccountSelectorProps<TAccount>) {
  const [imageFailed, setImageFailed] = useState(false);
  const storageKey = getStorageKey(platform);
  const selectedAccount = accounts.find((account) => account.id === selectedId) ?? null;
  const selectedPictureUrl = selectedAccount ? getPictureUrl(selectedAccount) : undefined;

  useEffect(() => {
    if (loading || !accounts.length) {
      return;
    }

    const storedId = window.localStorage.getItem(storageKey);
    const restored = accounts.find((account) => account.id === storedId);

    if (restored && restored.id !== selectedId) {
      onSelect(restored);
      return;
    }

    if (!selectedId) {
      onSelect(accounts[0]);
    }
  }, [accounts, loading, onSelect, selectedId, storageKey]);

  useEffect(() => {
    setImageFailed(false);
  }, [selectedAccount?.id, selectedPictureUrl]);

  function handleChange(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);

    if (!account) {
      return;
    }

    window.localStorage.setItem(storageKey, account.id);
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
        Conta ativa em {PLATFORM_LABELS[platform]}
      </label>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] xl:items-center">
        <select
          aria-label="Selecionar conta"
          className="min-w-0 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none ring-0"
          disabled={!accounts.length}
          onChange={(event) => handleChange(event.target.value)}
          value={selectedId ?? ""}
        >
          {!accounts.length ? <option value="">Nenhuma conta disponivel</option> : null}
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {formatAccountLabel(account)}
            </option>
          ))}
        </select>
        {selectedAccount ? (
          <div className="flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-primary)]/8 px-4 py-3">
            {selectedPictureUrl && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={selectedAccount.name}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
                onError={() => setImageFailed(true)}
                src={selectedPictureUrl}
              />
            ) : (
              <InitialsAvatar name={selectedAccount.name} />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{selectedAccount.name}</p>
              {selectedAccount.username ? (
                <p className="truncate text-sm text-[var(--color-text-muted)]">@{selectedAccount.username}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
