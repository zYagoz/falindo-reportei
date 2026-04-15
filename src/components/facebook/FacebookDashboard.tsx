"use client";

import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { AccountSelector } from "@/components/common/AccountSelector";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useFacebookInsights } from "@/lib/hooks/useFacebookInsights";
import { useFacebookOverview } from "@/lib/hooks/useFacebookOverview";
import { useFacebookPages } from "@/lib/hooks/useFacebookPages";
import type { FacebookPage } from "@/lib/types/facebook.types";
import { formatShortDate } from "@/lib/utils/dateUtils";
import { FacebookOverviewKPIs } from "./overview/FacebookOverviewKPIs";
import { FacebookReachChart } from "./overview/FacebookReachChart";

export function FacebookDashboard() {
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const { activeRange, previousRange, presets, selectedPreset, setCustomRange, setSelectedPreset } =
    useDateRange();
  const { pages, loading: pagesLoading, error: pagesError } = useFacebookPages();
  const { overview, loading: overviewLoading, error: overviewError } = useFacebookOverview(
    selectedPage?.id ?? null,
    activeRange,
  );
  const { overview: previousOverview } = useFacebookOverview(selectedPage?.id ?? null, previousRange);
  const { insights, loading: insightsLoading, error: insightsError } = useFacebookInsights(
    selectedPage?.id ?? null,
    activeRange,
  );

  return (
    <div className="min-w-0 space-y-8 overflow-x-clip">
      <section className="panel-surface min-w-0 rounded-[32px] p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
              Facebook Pages
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Social Insights Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Primeira fatia do modulo Facebook: shell navegavel, selecao de pagina e periodo ativo prontos
              para receber overview, posts e demographics nas proximas etapas.
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary-dark)]">
            Shell + Pages
          </div>
        </div>
        <div className="grid min-w-0 gap-4 min-[1680px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <AccountSelector
            accounts={pages}
            loading={pagesLoading}
            onSelect={setSelectedPage}
            platform="facebook"
            selectedId={selectedPage?.id ?? null}
          />
          <DateRangePicker
            activeRange={activeRange}
            onCustomRangeChange={setCustomRange}
            onPresetChange={setSelectedPreset}
            presets={presets}
            selectedPreset={selectedPreset}
          />
        </div>
        {pagesError ? (
          <div className="mt-4">
            <ErrorMessage message={pagesError} />
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeader
          description="Validacao da navegacao, persistencia da pagina e periodo selecionado antes de plugar os modulos de dados."
          eyebrow="01. Base Facebook"
          title="Shell inicial"
        />
        {pagesLoading ? null : pagesError ? (
          <ErrorMessage message={pagesError} />
        ) : !pages.length ? (
          <div className="card-surface rounded-[28px] p-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <LayoutDashboard size={18} />
              Nenhuma pagina do Facebook foi encontrada para este token.
            </div>
          </div>
        ) : !selectedPage ? (
          <div className="card-surface rounded-[28px] p-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <LayoutDashboard size={18} />
              Selecione uma pagina para iniciar.
            </div>
          </div>
        ) : (
          <div className="card-surface rounded-[28px] p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary-dark)]">
                Pagina selecionada
              </span>
              {selectedPage.username ? (
                <span className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-text-muted)]">
                  @{selectedPage.username}
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{selectedPage.name}</h2>
              {selectedPage.category ? (
                <p className="text-sm text-[var(--color-text-muted)]">{selectedPage.category}</p>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[var(--color-primary)]/8 p-5">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Periodo ativo</p>
                <p className="mt-2 text-lg font-semibold">{activeRange.label}</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {formatShortDate(activeRange.since)} - {formatShortDate(activeRange.until)}
                </p>
              </div>
              <div className="rounded-[24px] bg-white p-5">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Proximas fatias</p>
                <p className="mt-2 text-lg font-semibold">Posts e Demographics</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  Esta tela ja esta pronta para receber os proximos blocos sem refatorar navegacao,
                  selecao ou periodo.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          description="KPIs agregados e serie temporal principal de visualizacoes do Facebook Page."
          eyebrow="02. Visao Geral"
          title="KPIs e visualizacoes"
        />
        {!selectedPage ? (
          <div className="card-surface rounded-[28px] p-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <LayoutDashboard size={18} />
              Selecione uma pagina para carregar o overview.
            </div>
          </div>
        ) : overviewLoading || insightsLoading ? (
          <LoadingSkeleton lines={6} />
        ) : overviewError || insightsError ? (
          <ErrorMessage message={overviewError ?? insightsError ?? "Falha ao carregar overview do Facebook."} />
        ) : overview && insights ? (
          overview.insights_available ? (
            <div className="space-y-4">
              <FacebookOverviewKPIs overview={overview} previousOverview={previousOverview} />
              <FacebookReachChart data={insights.views} />
            </div>
          ) : (
            <div className="card-surface rounded-[28px] p-6">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary-dark)]">
                  Insights indisponiveis via API
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-[var(--color-primary)]/8 p-5">
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">Seguidores atuais</p>
                  <p className="mt-2 text-3xl font-semibold">{overview.followers_total}</p>
                </div>
                <div className="rounded-[24px] bg-white p-5">
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">Curtidas da pagina</p>
                  <p className="mt-2 text-3xl font-semibold">{overview.fan_count}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--color-text-muted)]">
                {overview.insights_unavailable_reason ??
                  "A Meta retornou data vazio para /insights nesta pagina, entao o dashboard nao vai exibir zeros como se fossem desempenho real."}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Assim que a pagina atingir o limiar exigido pela Meta, o overview de insights passa a ser
                carregado automaticamente nesta tela.
              </p>
            </div>
          )
        ) : (
          <div className="card-surface rounded-[28px] p-6">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <LayoutDashboard size={18} />
              A Meta nao retornou overview utilizavel para esta pagina no periodo.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
