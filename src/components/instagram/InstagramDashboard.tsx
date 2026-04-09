"use client";

import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { AccountSelector } from "@/components/common/AccountSelector";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BestDayChart } from "@/components/instagram/activity/BestDayChart";
import { BestHourChart } from "@/components/instagram/activity/BestHourChart";
import { FeedPostsSummary } from "@/components/instagram/posts/FeedPostsSummary";
import { FeedPostsTable } from "@/components/instagram/posts/FeedPostsTable";
import { ReelsSummary } from "@/components/instagram/reels/ReelsSummary";
import { ReelsTable } from "@/components/instagram/reels/ReelsTable";
import { FollowerGrowthChart } from "@/components/instagram/overview/FollowerGrowthChart";
import { GenderDonutLegendChart } from "@/components/instagram/overview/GenderDonutLegendChart";
import { OverviewKPIs } from "@/components/instagram/overview/OverviewKPIs";
import { TopCitiesTable } from "@/components/instagram/overview/TopCitiesTable";
import { StoriesSummaryCard } from "@/components/instagram/stories/StoriesSummaryCard";
import { useInstagramActivity } from "@/lib/hooks/useInstagramActivity";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useInstagramAccounts } from "@/lib/hooks/useInstagramAccounts";
import { useInstagramDemographics } from "@/lib/hooks/useInstagramDemographics";
import { useInstagramOverview } from "@/lib/hooks/useInstagramOverview";
import { useInstagramInsights } from "@/lib/hooks/useInstagramInsights";
import { useInstagramPosts } from "@/lib/hooks/useInstagramPosts";
import { useInstagramReels } from "@/lib/hooks/useInstagramReels";
import { useInstagramReelsSummary } from "@/lib/hooks/useInstagramReelsSummary";
import { useInstagramStories } from "@/lib/hooks/useInstagramStories";
import type { InstagramAccount } from "@/lib/types/instagram.types";

export function InstagramDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const { activeRange, previousRange, presets, selectedPreset, setCustomRange, setSelectedPreset } =
    useDateRange();
  const { accounts, loading: accountsLoading, error: accountsError } = useInstagramAccounts();
  const { insights, loading: insightsLoading, error: insightsError } = useInstagramInsights(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const { overview, loading: overviewLoading, error: overviewError } = useInstagramOverview(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const { overview: previousOverview } = useInstagramOverview(selectedAccount?.id ?? null, previousRange);
  const { insights: previousInsights } = useInstagramInsights(selectedAccount?.id ?? null, previousRange);
  const { activity, loading: activityLoading, error: activityError } = useInstagramActivity(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const demographicsTimeframe = useMemo(
    () => (activeRange.label === "Últimos 7 dias" ? "this_week" : "this_month"),
    [activeRange.label],
  );
  const { demographics, loading: demographicsLoading, error: demographicsError } =
    useInstagramDemographics(selectedAccount?.id ?? null, demographicsTimeframe);
  const { posts, loading: postsLoading, error: postsError } = useInstagramPosts(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const { posts: previousPosts, loading: previousPostsLoading, error: previousPostsError } = useInstagramPosts(
    selectedAccount?.id ?? null,
    previousRange,
  );
  const { reels, loading: reelsLoading, error: reelsError } = useInstagramReels(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const { summary: reelsSummary, loading: reelsSummaryLoading, error: reelsSummaryError } = useInstagramReelsSummary(
    selectedAccount?.id ?? null,
    activeRange,
  );
  const { reels: previousReels, loading: previousReelsLoading, error: previousReelsError } = useInstagramReels(
    selectedAccount?.id ?? null,
    previousRange,
  );
  const {
    summary: previousReelsSummary,
    loading: previousReelsSummaryLoading,
    error: previousReelsSummaryError,
  } = useInstagramReelsSummary(selectedAccount?.id ?? null, previousRange);
  const { stories, loading: storiesLoading, error: storiesError } = useInstagramStories(
    selectedAccount?.id ?? null,
  );

  return (
    <div className="min-w-0 space-y-8 overflow-x-clip">
      <section className="panel-surface min-w-0 rounded-[32px] p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
              Instagram Business
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Social Insights Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Navegue entre contas, altere a janela temporal e acompanhe performance de conteúdo sem expor o token
              da Meta ao browser.
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary-dark)]">
            App Router + Meta API + Testes integrados
          </div>
        </div>
        <div className="grid min-w-0 gap-4 min-[1680px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <AccountSelector
            accounts={accounts}
            loading={accountsLoading}
            onSelect={setSelectedAccount}
            platform="instagram"
            selectedId={selectedAccount?.id ?? null}
          />
          <DateRangePicker
            activeRange={activeRange}
            onCustomRangeChange={setCustomRange}
            onPresetChange={setSelectedPreset}
            presets={presets}
            selectedPreset={selectedPreset}
          />
        </div>
        {accountsError ? (
          <div className="mt-4">
            <ErrorMessage message={accountsError} />
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeader
          action={
            selectedAccount ? (
              <div className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-text-muted)]">
                @{selectedAccount.username}
              </div>
            ) : null
          }
          description="KPIs consolidados, série temporal de alcance e recortes demográficos."
          eyebrow="01. Visão Geral"
          title="KPIs e audiência"
        />
        {!selectedAccount ? (
          <div className="card-surface rounded-[28px] p-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <LayoutDashboard size={18} />
              Selecione uma conta para iniciar.
            </div>
          </div>
        ) : null}
        {selectedAccount && (insightsLoading || overviewLoading) ? <LoadingSkeleton className="mb-4" lines={5} /> : null}
        {selectedAccount && (insightsError || overviewError) ? (
          <ErrorMessage message={insightsError ?? overviewError ?? "Falha ao carregar overview."} />
        ) : null}
        {selectedAccount && insights && overview ? (
          <div className="min-w-0 space-y-4">
            <OverviewKPIs overview={overview} previousOverview={previousOverview} />
            <div className="min-w-0 space-y-4">
              <FollowerGrowthChart data={insights.reach} />
              {demographicsLoading ? <LoadingSkeleton lines={4} /> : null}
              {demographicsError ? <ErrorMessage message={demographicsError} /> : null}
              {demographics ? <GenderDonutLegendChart data={demographics.followers_by_gender} /> : null}
              {demographics ? <TopCitiesTable cities={demographics.followers_by_city} /> : null}
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeader
          description="Posts do feed com cálculo de taxa de engajamento no front."
          eyebrow="02. Feed"
          title="Posts do feed"
        />
        {!selectedAccount ? null : postsLoading ? (
          <LoadingSkeleton lines={6} />
        ) : postsError ? (
          <ErrorMessage message={postsError} />
        ) : (
          <div className="min-w-0 space-y-4">
            <FeedPostsSummary
              posts={posts}
              previousPosts={previousPostsLoading || previousPostsError ? undefined : previousPosts}
              previousProfileVisits={previousInsights?.profile_links_taps}
              profileVisits={insights?.profile_links_taps}
            />
            <FeedPostsTable posts={posts} />
          </div>
        )}
      </section>

      <section>
        <SectionHeader eyebrow="03. Reels" title="Performance de reels" />
        {!selectedAccount ? null : reelsLoading || reelsSummaryLoading ? (
          <LoadingSkeleton lines={6} />
        ) : reelsError || reelsSummaryError ? (
          <ErrorMessage message={reelsError ?? reelsSummaryError ?? "Falha ao carregar reels."} />
        ) : (
          <div className="min-w-0 space-y-4">
            <ReelsSummary
              previousReels={previousReelsLoading || previousReelsError ? undefined : previousReels}
              previousSummary={
                previousReelsSummaryLoading || previousReelsSummaryError ? undefined : (previousReelsSummary ?? undefined)
              }
              reels={reels}
              summary={reelsSummary ?? { views: 0, reach: 0, total_interactions: 0, engagement_rate: 0 }}
            />
            <ReelsTable reels={reels} />
          </div>
        )}
      </section>

      <section className="space-y-4">
        {!selectedAccount ? (
          <StoriesSummaryCard emptyMessage="Selecione uma conta para carregar stories recentes." />
        ) : storiesLoading ? (
          <LoadingSkeleton lines={6} />
        ) : storiesError ? (
          <div>
            <ErrorMessage message={storiesError} />
          </div>
        ) : (
          <StoriesSummaryCard stories={stories} />
        )}
        <div className="mx-auto grid max-w-[1180px] gap-4 xl:grid-cols-2">
          {!selectedAccount ? (
          <>
            <div className="card-surface rounded-[28px] p-5">
              <h3 className="mb-2 text-lg font-semibold">Melhor dia para postagens</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Selecione uma conta para carregar activity.</p>
            </div>
            <div className="card-surface rounded-[28px] p-5">
              <h3 className="mb-2 text-lg font-semibold">Melhor horário para postagens</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Selecione uma conta para carregar activity.</p>
            </div>
          </>
        ) : activityLoading ? (
          <>
            <LoadingSkeleton lines={5} />
            <LoadingSkeleton lines={5} />
          </>
        ) : activityError ? (
          <>
            <ErrorMessage message={activityError} />
            <ErrorMessage message={activityError} />
          </>
        ) : activity ? (
          <>
            <BestDayChart activity={activity} />
            <BestHourChart activity={activity} />
          </>
        ) : (
          <>
            <div className="card-surface rounded-[28px] p-5">
              <h3 className="mb-2 text-lg font-semibold">Melhor dia para postagens</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                A Meta nao disponibilizou activity utilizavel para esta conta no periodo selecionado.
              </p>
            </div>
            <div className="card-surface rounded-[28px] p-5">
              <h3 className="mb-2 text-lg font-semibold">Melhor horario para postagens</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                A Meta nao disponibilizou activity utilizavel para esta conta no periodo selecionado.
              </p>
            </div>
          </>
          )}
        </div>
      </section>
    </div>
  );
}
