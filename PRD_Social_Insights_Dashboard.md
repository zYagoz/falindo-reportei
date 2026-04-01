# Social Insights Dashboard — Product Requirements Document v1.0

> **Para o Claude Code:** Este documento é o guia completo de implementação.
> Siga a ordem de implementação à risca. Não pule etapas.
> **Database first → API Routes → Components → Pages**

---

## 1. Project Identity

**App Name:** Social Insights Dashboard  
**Version:** v1.0 — MVP (Instagram only)  
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS  
**Purpose:** Dashboard interno de agência para visualizar métricas de redes sociais de clientes, consumindo dados direto das APIs (Meta Graph API, futuramente LinkedIn API).

**Success Metrics:**
- Carrega dados do Instagram em < 3s
- Seleção de conta em < 2 cliques
- Zero chamadas desnecessárias à API (cache e deduplicação)
- Suporta adição de Facebook Page e LinkedIn sem refatoração estrutural

---

## 2. Tech Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 14 (App Router) | API Routes no mesmo projeto, SSR, TypeScript nativo |
| Language | TypeScript 5+ | Type-safety nas respostas da Meta API (schemas complexos) |
| Styling | Tailwind CSS + shadcn/ui | Velocidade + componentes acessíveis prontos |
| Charts | Recharts | Leve, declarativo, funciona bem com React |
| Icons | Lucide React | Tree-shakeable, consistente |
| HTTP Client | Fetch nativo (Next.js) | Suporte nativo a cache e revalidação |
| Env | `.env.local` | Tokens fixos da agência |

**NÃO usar:**
- Redux (overkill — usar React state + SWR/fetch)
- Prisma/banco de dados (dados vêm 100% da API)
- NextAuth (sem login — uso interno fixo)

---

## 3. Variáveis de Ambiente (.env.local)

```env
# Meta Graph API
META_ACCESS_TOKEN=seu_token_aqui
META_API_VERSION=v21.0
META_BASE_URL=https://graph.facebook.com

# LinkedIn (futuro — deixar placeholder)
# LINKEDIN_ACCESS_TOKEN=
# LINKEDIN_API_VERSION=202502

# App
NEXT_PUBLIC_APP_NAME="Social Insights Dashboard"
```

> **IMPORTANTE para o Claude Code:** Criar `.env.local.example` com as mesmas chaves mas sem valores reais. Adicionar `.env.local` no `.gitignore`.

---

## 4. Folder Structure (COMPLETA — definir antes de qualquer código)

```
social-insights-dashboard/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (providers, fonts, sidebar)
│   │   ├── page.tsx                      # Redirect para /instagram
│   │   ├── loading.tsx                   # Global loading skeleton
│   │   ├── error.tsx                     # Global error boundary
│   │   │
│   │   ├── instagram/
│   │   │   └── page.tsx                  # /instagram — Dashboard principal IG
│   │   │
│   │   ├── facebook/                     # FUTURO (criar pasta vazia + page.tsx com "Em breve")
│   │   │   └── page.tsx
│   │   │
│   │   ├── linkedin/                     # FUTURO (criar pasta vazia + page.tsx com "Em breve")
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── instagram/
│   │       │   ├── accounts/
│   │       │   │   └── route.ts          # GET /api/instagram/accounts
│   │       │   ├── insights/
│   │       │   │   └── route.ts          # GET /api/instagram/insights?accountId=&since=&until=
│   │       │   ├── posts/
│   │       │   │   └── route.ts          # GET /api/instagram/posts?accountId=&since=&until=
│   │       │   ├── reels/
│   │       │   │   └── route.ts          # GET /api/instagram/reels?accountId=&since=&until=
│   │       │   └── demographics/
│   │       │       └── route.ts          # GET /api/instagram/demographics?accountId=&timeframe=
│   │       │
│   │       ├── facebook/                 # FUTURO — criar pasta vazia
│   │       │   └── .gitkeep
│   │       │
│   │       └── linkedin/                 # FUTURO — criar pasta vazia
│   │           └── .gitkeep
│   │
│   ├── components/
│   │   │
│   │   ├── common/                       # Componentes agnósticos de plataforma
│   │   │   ├── MetricCard.tsx            # Card KPI com variação percentual
│   │   │   ├── DataTable.tsx             # Tabela genérica com sort e scroll
│   │   │   ├── DateRangePicker.tsx       # Seletor de período com presets
│   │   │   ├── PlatformNav.tsx           # Sidebar/tabs IG | FB | LinkedIn
│   │   │   ├── AccountSelector.tsx       # Dropdown de seleção de conta
│   │   │   ├── LoadingSkeleton.tsx       # Skeleton loader para cada seção
│   │   │   ├── ErrorMessage.tsx          # Mensagem de erro padronizada
│   │   │   ├── SectionHeader.tsx         # Título + ícone de cada seção
│   │   │   └── VariationBadge.tsx        # Badge verde/vermelho de variação %
│   │   │
│   │   ├── charts/                       # Wrappers de gráficos reutilizáveis
│   │   │   ├── LineChart.tsx             # Recharts LineChart wrapper
│   │   │   ├── BarChart.tsx              # Recharts BarChart wrapper
│   │   │   ├── DonutChart.tsx            # Recharts PieChart (donut) wrapper
│   │   │   └── AreaChart.tsx             # Recharts AreaChart wrapper (futuro)
│   │   │
│   │   ├── instagram/                    # Componentes específicos do Instagram
│   │   │   ├── InstagramDashboard.tsx    # Container principal — orquestra todos os módulos
│   │   │   ├── overview/
│   │   │   │   ├── FollowerGrowthChart.tsx   # Gráfico de linha — crescimento de seguidores
│   │   │   │   ├── GenderDonutChart.tsx      # Pizza donut — seguidores por gênero
│   │   │   │   ├── TopCitiesTable.tsx        # Tabela ranking — cidades
│   │   │   │   └── OverviewKPIs.tsx          # Blocos: total seguidores, novos, variação
│   │   │   ├── posts/
│   │   │   │   ├── FeedPostsTable.tsx        # Tabela de posts do feed
│   │   │   │   └── FeedPostsSummary.tsx      # Blocos resumo: curtidas, comentários, etc.
│   │   │   ├── reels/
│   │   │   │   ├── ReelsTable.tsx            # Tabela de reels em destaque
│   │   │   │   └── ReelsSummary.tsx          # Blocos resumo de reels
│   │   │   ├── stories/
│   │   │   │   └── StoriesSummary.tsx        # Blocos de métricas de stories
│   │   │   └── activity/
│   │   │       ├── BestDayChart.tsx          # Barras — melhor dia para postar
│   │   │       └── BestHourChart.tsx         # Barras — melhor horário para postar
│   │   │
│   │   ├── facebook/                     # FUTURO — criar pasta vazia
│   │   │   └── .gitkeep
│   │   │
│   │   └── linkedin/                     # FUTURO — criar pasta vazia
│   │       └── .gitkeep
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── meta/
│   │   │   │   ├── client.ts             # Fetch base com token, versão, error handling
│   │   │   │   ├── instagram.ts          # Funções de chamada da Graph API (Instagram)
│   │   │   │   └── facebook.ts           # FUTURO — funções Facebook Page Insights
│   │   │   └── linkedin/
│   │   │       └── client.ts             # FUTURO — LinkedIn API client (token separado)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useInstagramAccounts.ts   # Hook para listar contas IG disponíveis
│   │   │   ├── useInstagramInsights.ts   # Hook para insights da conta selecionada
│   │   │   ├── useInstagramPosts.ts      # Hook para posts do feed
│   │   │   ├── useInstagramReels.ts      # Hook para reels
│   │   │   ├── useInstagramDemographics.ts # Hook para dados demográficos
│   │   │   └── useDateRange.ts           # Hook para gerenciar o período selecionado
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts             # Formatar números, datas, percentuais (pt-BR)
│   │   │   ├── dateUtils.ts              # Helpers de datas (timestamps Unix, ranges)
│   │   │   └── metaApiHelpers.ts         # Funções auxiliares para parsear respostas da API
│   │   │
│   │   └── types/
│   │       ├── instagram.types.ts        # Tipos TypeScript para dados IG
│   │       ├── facebook.types.ts         # FUTURO
│   │       ├── linkedin.types.ts         # FUTURO
│   │       └── common.types.ts           # Tipos compartilhados (DateRange, MetricVariation, etc.)
│   │
│   └── styles/
│       └── globals.css                   # Tailwind + CSS vars de cor (laranja HZ)
│
├── .env.local                            # NÃO commitar
├── .env.local.example                    # Commitar (sem valores)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Naming Conventions

| Contexto | Padrão | Exemplo |
|---------|--------|---------|
| Arquivos de componente | PascalCase.tsx | `MetricCard.tsx` |
| Arquivos de hook | camelCase.ts com prefixo `use` | `useInstagramInsights.ts` |
| Arquivos de util/lib | camelCase.ts | `formatters.ts` |
| API Routes | kebab-case em pastas | `/api/instagram/accounts/route.ts` |
| Variáveis/funções | camelCase | `fetchInstagramAccounts` |
| Constantes | UPPER_SNAKE_CASE | `META_API_VERSION` |
| Types/Interfaces | PascalCase com sufixo | `InstagramInsights`, `DateRange` |
| CSS classes | kebab-case (Tailwind) | `metric-card`, `variation-badge` |

---

## 6. TypeScript Types (definir ANTES de escrever qualquer lógica)

### `src/lib/types/common.types.ts`
```typescript
export interface DateRange {
  since: string;   // formato YYYY-MM-DD
  until: string;   // formato YYYY-MM-DD
  label: string;   // ex: "Últimos 30 dias"
}

export interface MetricVariation {
  current: number;
  previous: number;
  changePercent: number;  // pode ser negativo
  changeAbsolute: number;
}

export type TimeframeOption = 'this_month' | 'this_week';

export type Platform = 'instagram' | 'facebook' | 'linkedin';
```

### `src/lib/types/instagram.types.ts`
```typescript
export interface InstagramAccount {
  id: string;               // Instagram Business Account ID
  name: string;             // Nome do perfil
  username: string;         // @username
  profile_picture_url?: string;
  followers_count?: number;
  pageId: string;           // Facebook Page ID vinculada
  pageName: string;
}

export interface InstagramInsights {
  reach: MetricDataPoint[];
  accounts_engaged: number;
  total_interactions: number;
  follows_and_unfollows: FollowsData;
  profile_links_taps: number;
  views: number;
}

export interface MetricDataPoint {
  value: number;
  end_time: string;         // ISO string
}

export interface FollowsData {
  follows: number;
  unfollows: number;
  net: number;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'CAROUSEL_ALBUM' | 'VIDEO';
  thumbnail_url?: string;
  media_url?: string;
  timestamp: string;
  insights: PostInsights;
}

export interface PostInsights {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  follows: number;
  total_interactions: number;
  engagement_rate: number;  // calculado no front: total_interactions/reach
}

export interface InstagramReel {
  id: string;
  caption?: string;
  thumbnail_url?: string;
  timestamp: string;
  insights: ReelInsights;
}

export interface ReelInsights {
  plays: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  total_interactions: number;
  engagement_rate: number;
}

export interface DemographicData {
  followers_by_gender: GenderBreakdown;
  followers_by_city: CityBreakdown[];
  reached_by_age: AgeBreakdown[];
  engaged_by_age: AgeBreakdown[];
}

export interface GenderBreakdown {
  M: number;
  F: number;
  U: number;  // Unknown
}

export interface CityBreakdown {
  city: string;
  value: number;
}

export interface AgeBreakdown {
  range: string;  // ex: "25-34"
  M: number;
  F: number;
  U: number;
}
```

---

## 7. API Layer — Meta Client

### `src/lib/api/meta/client.ts`

```typescript
// Base client para todas as chamadas à Meta Graph API
// Centraliza: token, versão, error handling, rate limit awareness

const META_BASE_URL = process.env.META_BASE_URL || 'https://graph.facebook.com';
const META_VERSION = process.env.META_API_VERSION || 'v21.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

interface MetaApiOptions {
  params?: Record<string, string>;
  // next.js fetch cache control
  revalidate?: number;  // segundos (default: 3600 = 1h)
}

export async function metaFetch<T>(
  endpoint: string,
  options: MetaApiOptions = {}
): Promise<T> {
  if (!ACCESS_TOKEN) {
    throw new Error('META_ACCESS_TOKEN não configurado no .env.local');
  }

  const { params = {}, revalidate = 3600 } = options;

  const url = new URL(`${META_BASE_URL}/${META_VERSION}/${endpoint}`);
  url.searchParams.set('access_token', ACCESS_TOKEN);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate },  // cache Next.js
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `Meta API Error: ${response.status}`
    );
  }

  return response.json();
}
```

### `src/lib/api/meta/instagram.ts`

```typescript
// Todas as chamadas específicas do Instagram Graph API
// REGRA: Nunca chamar a API diretamente nos componentes — sempre usar estas funções

import { metaFetch } from './client';
import type { InstagramAccount, InstagramInsights, /* ... */ } from '@/lib/types/instagram.types';

// ─── 1. Listar contas IG vinculadas à BM ────────────────────────────────────
export async function fetchInstagramAccounts(): Promise<InstagramAccount[]> {
  // Fluxo: User token → /me/accounts (Facebook Pages) → para cada page → /instagram_accounts
  const pagesResponse = await metaFetch<{ data: FacebookPage[] }>('me/accounts', {
    params: {
      fields: 'id,name,instagram_business_account{id,name,username,profile_picture_url,followers_count}',
    },
    revalidate: 3600,  // cache 1h
  });

  // Filtrar apenas pages que têm conta IG vinculada
  return pagesResponse.data
    .filter(page => page.instagram_business_account)
    .map(page => ({
      id: page.instagram_business_account.id,
      name: page.instagram_business_account.name || page.name,
      username: page.instagram_business_account.username,
      profile_picture_url: page.instagram_business_account.profile_picture_url,
      followers_count: page.instagram_business_account.followers_count,
      pageId: page.id,
      pageName: page.name,
    }));
}

// ─── 2. Insights da conta (métricas de interação) ───────────────────────────
export async function fetchAccountInsights(
  accountId: string,
  since: string,  // YYYY-MM-DD
  until: string   // YYYY-MM-DD
): Promise<InstagramInsights> {
  // ATENÇÃO: Separar chamadas por metric_type (total_value vs time_series)
  // Chamar em paralelo com Promise.all para performance

  const [totalValueResponse, timeSeriesResponse, followsResponse] = await Promise.all([
    // Métricas que exigem metric_type=total_value
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'accounts_engaged,total_interactions,profile_links_taps,views',
        period: 'day',
        metric_type: 'total_value',
        since,
        until,
      },
      revalidate: 1800,
    }),
    // Métricas que suportam time_series (para gráficos de linha)
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'reach',
        period: 'day',
        metric_type: 'time_series',
        since,
        until,
      },
      revalidate: 1800,
    }),
    // Follows/unfollows (requer breakdown separado)
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'follows_and_unfollows',
        period: 'day',
        metric_type: 'total_value',
        breakdown: 'follow_type',
        since,
        until,
      },
      revalidate: 1800,
    }),
  ]);

  return parseInsightsResponse(totalValueResponse, timeSeriesResponse, followsResponse);
}

// ─── 3. Demographics ─────────────────────────────────────────────────────────
export async function fetchDemographics(
  accountId: string,
  timeframe: 'this_month' | 'this_week' = 'this_month'
): Promise<DemographicData> {
  // ATENÇÃO: period=lifetime + timeframe (NÃO usar last_30_days — depreciado v20.0+)
  const [followersGender, followersCity, reachedAge] = await Promise.all([
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'follower_demographics',
        period: 'lifetime',
        timeframe,
        breakdown: 'gender',
        metric_type: 'total_value',
      },
      revalidate: 3600,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'follower_demographics',
        period: 'lifetime',
        timeframe,
        breakdown: 'city',
        metric_type: 'total_value',
      },
      revalidate: 3600,
    }),
    metaFetch(`${accountId}/insights`, {
      params: {
        metric: 'reached_audience_demographics',
        period: 'lifetime',
        timeframe,
        breakdown: 'age',
        metric_type: 'total_value',
      },
      revalidate: 3600,
    }),
  ]);

  return parseDemographicsResponse(followersGender, followersCity, reachedAge);
}

// ─── 4. Posts do Feed ─────────────────────────────────────────────────────────
export async function fetchFeedPosts(
  accountId: string,
  since: string,
  until: string
): Promise<InstagramPost[]> {
  // Busca posts e seus insights em paralelo
  const postsResponse = await metaFetch(`${accountId}/media`, {
    params: {
      fields: 'id,caption,media_type,thumbnail_url,media_url,timestamp',
      since,
      until,
      limit: '50',
    },
    revalidate: 1800,
  });

  // Para cada post, buscar insights individualmente (Graph API não permite bulk aqui)
  const postsWithInsights = await Promise.all(
    postsResponse.data
      .filter((post: any) => post.media_type !== 'VIDEO') // Reels são buscados separado
      .map(async (post: any) => {
        const insights = await fetchPostInsights(post.id);
        return { ...post, insights };
      })
  );

  return postsWithInsights;
}

export async function fetchPostInsights(postId: string): Promise<PostInsights> {
  const response = await metaFetch(`${postId}/insights`, {
    params: {
      metric: 'impressions,reach,likes,comments,saved,shares,follows,total_interactions',
    },
    revalidate: 1800,
  });

  return parsePostInsights(response);
}

// ─── 5. Reels ─────────────────────────────────────────────────────────────────
export async function fetchReels(
  accountId: string,
  since: string,
  until: string
): Promise<InstagramReel[]> {
  const reelsResponse = await metaFetch(`${accountId}/media`, {
    params: {
      fields: 'id,caption,thumbnail_url,timestamp,media_type',
      since,
      until,
      limit: '50',
    },
    revalidate: 1800,
  });

  const reels = reelsResponse.data.filter((m: any) => m.media_type === 'VIDEO');

  const reelsWithInsights = await Promise.all(
    reels.map(async (reel: any) => {
      const insights = await fetchReelInsights(reel.id);
      return { ...reel, insights };
    })
  );

  return reelsWithInsights;
}

export async function fetchReelInsights(reelId: string): Promise<ReelInsights> {
  const response = await metaFetch(`${reelId}/insights`, {
    params: {
      metric: 'plays,reach,likes,comments,saved,shares,total_interactions',
    },
    revalidate: 1800,
  });

  return parseReelInsights(response);
}
```

---

## 8. API Routes (Next.js — servidor)

> **REGRA:** As API Routes são o único ponto de entrada para dados. Componentes NUNCA chamam a Meta API diretamente — sempre passam pelas API Routes.
> Isso garante que o `META_ACCESS_TOKEN` nunca seja exposto ao browser.

### `src/app/api/instagram/accounts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { fetchInstagramAccounts } from '@/lib/api/meta/instagram';

export async function GET() {
  try {
    const accounts = await fetchInstagramAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### `src/app/api/instagram/insights/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchAccountInsights } from '@/lib/api/meta/instagram';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accountId = searchParams.get('accountId');
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  if (!accountId || !since || !until) {
    return NextResponse.json(
      { error: 'Parâmetros obrigatórios: accountId, since, until' },
      { status: 400 }
    );
  }

  try {
    const insights = await fetchAccountInsights(accountId, since, until);
    return NextResponse.json({ insights });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

> **Padrão idêntico para:** `/api/instagram/posts/route.ts`, `/api/instagram/reels/route.ts`, `/api/instagram/demographics/route.ts`

---

## 9. Custom Hooks

### `src/lib/hooks/useDateRange.ts`

```typescript
// Gerencia o período selecionado com presets
// DEFAULT: últimos 30 dias

import { useState } from 'react';
import { DateRange } from '@/lib/types/common.types';
import { getDateRange } from '@/lib/utils/dateUtils';

export const DATE_PRESETS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },   // ← DEFAULT
  { label: 'Últimos 90 dias', days: 90 },
] as const;

export function useDateRange() {
  const [selectedPreset, setSelectedPreset] = useState(1); // índice 1 = 30 dias (default)
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const activeRange: DateRange = customRange ?? getDateRange(DATE_PRESETS[selectedPreset].days);

  return {
    activeRange,
    selectedPreset,
    setSelectedPreset,
    setCustomRange,
    presets: DATE_PRESETS,
  };
}
```

### `src/lib/hooks/useInstagramAccounts.ts`

```typescript
import { useState, useEffect } from 'react';
import { InstagramAccount } from '@/lib/types/instagram.types';

export function useInstagramAccounts() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/instagram/accounts')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAccounts(data.accounts);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { accounts, loading, error };
}
```

### `src/lib/hooks/useInstagramInsights.ts`

```typescript
import { useState, useEffect } from 'react';
import { InstagramInsights } from '@/lib/types/instagram.types';
import { DateRange } from '@/lib/types/common.types';

export function useInstagramInsights(accountId: string | null, dateRange: DateRange) {
  const [insights, setInsights] = useState<InstagramInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      accountId,
      since: dateRange.since,
      until: dateRange.until,
    });

    fetch(`/api/instagram/insights?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInsights(data.insights);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [accountId, dateRange.since, dateRange.until]);

  return { insights, loading, error };
}

// Padrão idêntico para: useInstagramPosts, useInstagramReels, useInstagramDemographics
```

---

## 10. Components Specification

### `MetricCard.tsx` (Common)

```typescript
// Card KPI reutilizável em todas as plataformas
interface MetricCardProps {
  label: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percent' | 'currency';
  icon?: React.ReactNode;
}
// Exibe: label, valor atual, badge de variação (verde+/vermelho-)
// Cores: variação positiva = text-green-600, negativa = text-red-600
// Formato: números ≥ 1000 → "1.2k", ≥ 1M → "1.2M"
```

### `AccountSelector.tsx` (Common)

```typescript
// Dropdown com lista de contas IG da BM
// Estado inicial: loading skeleton → depois lista de opções
// Cada opção: foto de perfil + nome + @username
// Persiste seleção no localStorage (chave: 'selected_instagram_account')
interface AccountSelectorProps {
  accounts: InstagramAccount[];
  selectedId: string | null;
  onSelect: (account: InstagramAccount) => void;
  loading: boolean;
  platform: Platform;  // para labels corretos
}
```

### `DateRangePicker.tsx` (Common)

```typescript
// Três botões de preset + opção de data customizada
// Default selecionado: "Últimos 30 dias" (índice 1)
// Exibe período ativo: "01/02/2026 - 28/02/2026"
interface DateRangePickerProps {
  activeRange: DateRange;
  selectedPreset: number;
  presets: readonly { label: string; days: number }[];
  onPresetChange: (index: number) => void;
}
```

### `InstagramDashboard.tsx`

```typescript
// Componente container principal
// Orquestra: AccountSelector + DateRangePicker + todos os módulos
// Cada módulo recebe: accountId, dateRange → busca seus próprios dados via hook

// Ordem visual das seções (fiel ao relatório PDF):
// 1. Visão Geral (KPIs + seguidores por gênero + top cidades)
// 2. Posts do Feed (tabela + resumo)
// 3. Reels (tabela + resumo)
// 4. Stories (resumo)
// 5. Picos de Atividade (melhor dia + horário)
```

### `FeedPostsTable.tsx`

```typescript
// Tabela com colunas:
// Postagem (thumbnail 40x40 + primeiros 60 chars do caption) | Criado em | 
// Visualizações | Alcance | Curtidas | Comentários | Salvo | Compartilhamentos | 
// Começaram a seguir | Interações | Taxa de Interação

// Ordenação: por padrão, data decrescente (mais recente primeiro)
// Scroll horizontal em mobile
// Taxa de interação = total_interactions / reach * 100 (calculado no front)
```

---

## 11. Formatadores (src/lib/utils/formatters.ts)

```typescript
// Todos os formatos em pt-BR

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString('pt-BR');
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

export function calculateEngagementRate(interactions: number, reach: number): number {
  if (!reach) return 0;
  return (interactions / reach) * 100;
}

export function calculateVariation(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}
```

---

## 12. Design Tokens (Cores HZ Painéis)

```css
/* src/styles/globals.css */
:root {
  --color-primary: #F97316;       /* Laranja HZ */
  --color-primary-dark: #EA580C;
  --color-neutral: #6B7280;
  --color-success: #16A34A;       /* Variação positiva */
  --color-danger: #DC2626;        /* Variação negativa */
  --color-bg: #F9FAFB;
  --color-card: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text: #111827;
  --color-text-muted: #6B7280;
}
```

**Tailwind config — adicionar cor primária:**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#F97316',
        dark: '#EA580C',
      }
    }
  }
}
```

---

## 13. Implementation Roadmap (Ordem Obrigatória)

### Fase 0 — Setup (Fazer primeiro, sem exceção)

```
1. npx create-next-app@latest social-insights-dashboard --typescript --tailwind --app
2. cd social-insights-dashboard
3. npx shadcn@latest init
4. npm install recharts lucide-react
5. Criar estrutura COMPLETA de pastas (todas as pastas do item 4, incluindo .gitkeep nas futuras)
6. Criar .env.local e .env.local.example
7. Adicionar .env.local ao .gitignore
8. Configurar tailwind.config.ts com cores HZ
9. Criar globals.css com CSS vars
10. Commit inicial: "feat: project setup with folder structure"
```

### Fase 1 — Types e Utils (Nenhum componente antes disso)

```
11. Criar src/lib/types/common.types.ts
12. Criar src/lib/types/instagram.types.ts
13. Criar src/lib/utils/formatters.ts
14. Criar src/lib/utils/dateUtils.ts
15. Criar src/lib/utils/metaApiHelpers.ts (funções de parse das respostas da API)
16. Commit: "feat: types and utility functions"
```

### Fase 2 — API Layer

```
17. Criar src/lib/api/meta/client.ts (metaFetch base)
18. Criar src/lib/api/meta/instagram.ts (todas as funções de fetch)
19. Criar src/app/api/instagram/accounts/route.ts
20. Criar src/app/api/instagram/insights/route.ts
21. Criar src/app/api/instagram/posts/route.ts
22. Criar src/app/api/instagram/reels/route.ts
23. Criar src/app/api/instagram/demographics/route.ts
24. TESTAR cada route com: curl http://localhost:3000/api/instagram/accounts
25. Commit: "feat: meta api layer and instagram routes"
```

### Fase 3 — Custom Hooks

```
26. Criar src/lib/hooks/useDateRange.ts
27. Criar src/lib/hooks/useInstagramAccounts.ts
28. Criar src/lib/hooks/useInstagramInsights.ts
29. Criar src/lib/hooks/useInstagramPosts.ts
30. Criar src/lib/hooks/useInstagramReels.ts
31. Criar src/lib/hooks/useInstagramDemographics.ts
32. Commit: "feat: custom hooks for data fetching"
```

### Fase 4 — Common Components (da base para o topo)

```
33. MetricCard.tsx
34. VariationBadge.tsx
35. LoadingSkeleton.tsx
36. ErrorMessage.tsx
37. SectionHeader.tsx
38. AccountSelector.tsx
39. DateRangePicker.tsx
40. PlatformNav.tsx (IG ativo | FB em breve | LinkedIn em breve)
41. DataTable.tsx (tabela genérica reutilizável)
42. Commit: "feat: common components"
```

### Fase 5 — Chart Components

```
43. charts/LineChart.tsx (wrapper Recharts)
44. charts/BarChart.tsx
45. charts/DonutChart.tsx
46. Commit: "feat: chart wrapper components"
```

### Fase 6 — Instagram Components

```
47. instagram/overview/OverviewKPIs.tsx
48. instagram/overview/FollowerGrowthChart.tsx
49. instagram/overview/GenderDonutChart.tsx
50. instagram/overview/TopCitiesTable.tsx
51. instagram/posts/FeedPostsTable.tsx
52. instagram/posts/FeedPostsSummary.tsx
53. instagram/reels/ReelsTable.tsx
54. instagram/reels/ReelsSummary.tsx
55. instagram/stories/StoriesSummary.tsx
56. instagram/activity/BestDayChart.tsx
57. instagram/activity/BestHourChart.tsx
58. instagram/InstagramDashboard.tsx (orquestra tudo)
59. Commit: "feat: instagram dashboard components"
```

### Fase 7 — Pages e Layout

```
60. src/app/layout.tsx (sidebar com PlatformNav, fontes, providers)
61. src/app/page.tsx (redirect para /instagram)
62. src/app/instagram/page.tsx (monta InstagramDashboard com AccountSelector + DateRangePicker no topo)
63. src/app/facebook/page.tsx (placeholder "Em breve — Facebook Page")
64. src/app/linkedin/page.tsx (placeholder "Em breve — LinkedIn Page")
65. Commit: "feat: pages and layout"
```

### Fase 8 — Polish

```
66. Adicionar loading skeletons em todos os estados de carregamento
67. Adicionar ErrorMessage em todos os estados de erro
68. Testar fluxo completo: selecionar conta → selecionar período → ver dados
69. Verificar responsividade (mobile-first)
70. Commit: "feat: loading states, error handling, responsive"
71. Atualizar README com: setup, vars de ambiente, como rodar
```

---

## 14. Erros Comuns da Meta API — Tratar no metaApiHelpers.ts

| Erro | Causa | Solução implementada |
|------|-------|---------------------|
| `metric_type obrigatório` | Misturar métricas de tipos diferentes em 1 chamada | Separar em chamadas distintas por `metric_type` |
| `timeframe inválido` | Usar `last_30_days` (depreciado v20.0+) | Usar apenas `this_month` ou `this_week` |
| `impressions removido` | API v22.0+ | Usar `reach` ou `views` |
| `Token expirado` | System User token pode expirar | Mensagem clara de erro + instrução para renovar no .env |
| Rate limit (429) | Muitas chamadas simultâneas | Promise.all com no máximo 5 paralelas |

---

## 15. Extensibilidade — Como adicionar Facebook Page (futuro)

Quando for implementar Facebook Page:

1. Criar `src/lib/api/meta/facebook.ts` seguindo o mesmo padrão de `instagram.ts`
2. Criar `src/app/api/facebook/` com as routes equivalentes
3. Criar `src/lib/hooks/useFacebook*.ts`
4. Criar `src/components/facebook/` com os componentes específicos
5. Ativar rota `/facebook` no `PlatformNav.tsx` (remover "em breve")
6. **Zero mudança** nos componentes de Instagram ou na estrutura base

### Como adicionar LinkedIn (futuro)

LinkedIn usa token separado (`LINKEDIN_ACCESS_TOKEN`).

1. Criar `src/lib/api/linkedin/client.ts` (client separado com token próprio)
2. Criar `src/app/api/linkedin/` com as routes
3. Criar `src/lib/hooks/useLinkedIn*.ts`
4. Criar `src/components/linkedin/`
5. Ativar no `PlatformNav.tsx`
6. **Zero mudança** nos módulos Meta

---

## 16. README.md (criar junto com o projeto)

```markdown
# Social Insights Dashboard

Dashboard interno para métricas de redes sociais.

## Setup

1. Clone o repositório
2. `npm install`
3. Copie `.env.local.example` → `.env.local` e preencha as variáveis
4. `npm run dev`

## Variáveis de Ambiente

| Variável | Descrição |
|---------|-----------|
| `META_ACCESS_TOKEN` | Token do System User da Business Manager |
| `META_API_VERSION` | Versão da Graph API (padrão: v21.0) |

## Plataformas suportadas

- ✅ Instagram Business
- 🔜 Facebook Page
- 🔜 LinkedIn Page

## Estrutura

Ver `docs/architecture.md` para detalhes da estrutura de pastas.

---

## 17. Checklist de Validação (Claude Code verificar antes de finalizar)

- [ ] `.env.local` está no `.gitignore`
- [ ] `META_ACCESS_TOKEN` nunca aparece em nenhum arquivo client-side
- [ ] Todas as chamadas à API passam pelas API Routes (`/api/...`)
- [ ] Todos os componentes têm estado de loading com skeleton
- [ ] Todos os componentes têm estado de erro com `ErrorMessage`
- [ ] `AccountSelector` persiste seleção no `localStorage`
- [ ] `DateRangePicker` tem "Últimos 30 dias" selecionado por padrão
- [ ] Pastas `facebook/` e `linkedin/` existem com `.gitkeep` e pages de placeholder
- [ ] Recharts usa `ResponsiveContainer` para responsividade
- [ ] Números formatados em pt-BR (vírgula como decimal)
- [ ] Taxas de engajamento calculadas no front (não na API)
- [ ] `Promise.all` usado para chamadas paralelas (performance)
- [ ] Cada API Route tem try/catch com mensagem de erro clara

---

## 18. EstratÃ©gia de Testes

> **Objetivo:** Garantir que o dashboard funcione com previsibilidade em todas as camadas — utils, API layer, hooks, componentes e fluxo final de navegaÃ§Ã£o — sem expor tokens, sem quebrar parsing da Meta API e sem regressÃµes visuais nas principais telas.

### 18.1. Stack de Testes

| Tipo de teste | Ferramenta | Objetivo |
|--------------|-----------|----------|
| UnitÃ¡rio | Vitest | Testar utils, helpers, parsers e lÃ³gica isolada |
| RenderizaÃ§Ã£o de componentes | React Testing Library | Validar comportamento visÃ­vel ao usuÃ¡rio |
| Mock de API | MSW (Mock Service Worker) | Simular respostas da Meta API e das API Routes |
| IntegraÃ§Ã£o | Vitest + RTL + MSW | Testar hooks, rotas e componentes conectados |
| E2E | Playwright | Validar fluxo real no browser |

### 18.2. PrincÃ­pios ObrigatÃ³rios

- Testar comportamento, nÃ£o implementaÃ§Ã£o interna.
- Nenhum teste pode depender da Meta API real.
- Nenhum teste pode usar `META_ACCESS_TOKEN` real.
- Toda chamada externa deve ser mockada.
- Priorizar cobertura nos fluxos crÃ­ticos antes de expandir cobertura geral.
- Se um teste E2E cobrir um fluxo completo, evitar duplicaÃ§Ã£o excessiva com testes de baixo valor.

### 18.3. Estrutura de Pastas para Testes

```bash
src/
├── test/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── utils/
│   │   ├── formatters.test.ts
│   │   ├── dateUtils.test.ts
│   │   └── metaApiHelpers.test.ts
│   ├── api/
│   │   ├── metaClient.test.ts
│   │   └── instagramApi.test.ts
│   ├── hooks/
│   │   ├── useDateRange.test.ts
│   │   ├── useInstagramAccounts.test.ts
│   │   ├── useInstagramInsights.test.ts
│   │   ├── useInstagramPosts.test.ts
│   │   ├── useInstagramReels.test.ts
│   │   └── useInstagramDemographics.test.ts
│   └── components/
│       ├── common/
│       │   ├── MetricCard.test.tsx
│       │   ├── AccountSelector.test.tsx
│       │   ├── DateRangePicker.test.tsx
│       │   └── ErrorMessage.test.tsx
│       └── instagram/
│           ├── InstagramDashboard.test.tsx
│           ├── FeedPostsTable.test.tsx
│           └── OverviewKPIs.test.tsx
│
└── ...
e2e/
├── instagram-dashboard.spec.ts
├── account-selection.spec.ts
├── date-range.spec.ts
└── placeholders.spec.ts
```

### 18.4. Testes UnitÃ¡rios (obrigatÃ³rios)

#### `formatters.ts`

Testar:

- `formatNumber(999) -> 999`
- `formatNumber(1200) -> 1.2k`
- `formatNumber(1250000) -> 1.3M`
- `formatPercent(12.3456) -> +12.35%`
- `formatPercent(-8.1) -> -8.10%`
- `calculateEngagementRate(0, 0) -> 0`
- `calculateEngagementRate(50, 1000) -> 5`
- `calculateVariation(120, 100) -> 20`
- `calculateVariation(100, 0) -> 0`

#### `dateUtils.ts`

Testar:

- geraÃ§Ã£o correta dos presets de 7, 30 e 90 dias
- formato de saÃ­da sempre `YYYY-MM-DD`
- range customizado sobrescreve preset
- o preset default Ã© 30 dias

#### `metaApiHelpers.ts`

Testar:

- parsing correto de `accounts_engaged`
- parsing correto de `total_interactions`
- parsing correto de `reach` em `time_series`
- parsing de `follows_and_unfollows` com breakdown por `follow_type`
- parsing de `follower_demographics` por gÃªnero
- parsing de `follower_demographics` por cidade
- parsing de `reached_audience_demographics` por faixa etÃ¡ria
- fallback seguro quando a API retornar campos ausentes, arrays vazios ou estrutura inesperada
- erros de parsing devem retornar mensagem clara e nunca quebrar silenciosamente

### 18.5. Testes do API Layer

#### `meta/client.ts`

Testar:

- monta URL com `META_BASE_URL`, `META_API_VERSION` e `access_token`
- adiciona params corretamente Ã  query string
- usa `revalidate` default quando nÃ£o informado
- respeita `revalidate` customizado
- lanÃ§a erro se `META_ACCESS_TOKEN` nÃ£o estiver configurado
- propaga mensagem de erro da Meta API quando `response.ok === false`
- fallback de erro para status HTTP sem body vÃ¡lido

#### `instagram.ts`

Testar:

- `fetchInstagramAccounts()` filtra apenas pÃ¡ginas com `instagram_business_account`
- `fetchAccountInsights()` faz chamadas separadas por `metric_type`
- `fetchDemographics()` usa apenas `this_month` e `this_week`
- `fetchFeedPosts()` separa posts de reels corretamente
- `fetchReels()` retorna apenas itens `media_type === 'VIDEO'`
- `fetchPostInsights()` e `fetchReelInsights()` normalizam os dados esperados
- chamadas paralelas usam `Promise.all` nos pontos definidos no PRD

### 18.6. Testes das API Routes

Testar cada route:

#### `/api/instagram/accounts`

- retorna `200` com `{ accounts }` em caso de sucesso
- retorna `500` com `{ error }` em caso de falha interna

#### `/api/instagram/insights`

- retorna `400` se faltar `accountId`
- retorna `400` se faltar `since`
- retorna `400` se faltar `until`
- retorna `200` com `{ insights }` em caso de sucesso
- retorna `500` com mensagem tratada em caso de erro da camada de API

#### `/api/instagram/posts`

- mesmo padrÃ£o de validaÃ§Ã£o e erro

#### `/api/instagram/reels`

- mesmo padrÃ£o de validaÃ§Ã£o e erro

#### `/api/instagram/demographics`

- retorna `400` se faltar `accountId`
- retorna `200` com `{ demographics }`
- retorna `500` com erro tratado

### 18.7. Testes dos Hooks

#### `useDateRange`

Testar:

- inicia com preset de 30 dias
- troca corretamente ao selecionar outro preset
- aceita range customizado
- recalcula `activeRange` corretamente

#### `useInstagramAccounts`

Testar:

- estado inicial `loading=true`
- popula `accounts` em sucesso
- define `error` em falha
- encerra `loading` ao final

#### `useInstagramInsights`, `useInstagramPosts`, `useInstagramReels`, `useInstagramDemographics`

Testar:

- nÃ£o faz fetch sem `accountId`
- faz fetch ao receber `accountId`
- refaz fetch quando `since` ou `until` mudarem
- define `loading` corretamente
- salva resposta no estado correto
- trata erro corretamente

### 18.8. Testes de Componentes

#### Common Components

##### `MetricCard.tsx`

- renderiza label e valor
- renderiza badge de variaÃ§Ã£o quando houver valor anterior
- aplica estilo de positivo/negativo corretamente

##### `AccountSelector.tsx`

- renderiza loading skeleton
- exibe nome, `username` e foto da conta
- chama `onSelect` ao escolher conta
- persiste seleÃ§Ã£o em `localStorage`
- recupera seleÃ§Ã£o persistida quando aplicÃ¡vel

##### `DateRangePicker.tsx`

- renderiza presets
- inicia com "Ãšltimos 30 dias"
- troca visualmente o preset ativo
- exibe perÃ­odo formatado corretamente

##### `ErrorMessage.tsx`

- renderiza mensagem amigÃ¡vel
- nÃ£o quebra layout em mensagens longas

#### Instagram Components

##### `InstagramDashboard.tsx`

- renderiza mÃ³dulos na ordem definida no PRD
- mostra loading por seÃ§Ã£o
- mostra erro por seÃ§Ã£o sem derrubar toda a pÃ¡gina

##### `FeedPostsTable.tsx`

- ordena por data decrescente por padrÃ£o
- calcula taxa de engajamento no front
- exibe scroll horizontal em viewport pequena
- renderiza colunas obrigatÃ³rias

##### `OverviewKPIs.tsx`, `GenderDonutChart.tsx`, `TopCitiesTable.tsx`, `ReelsTable.tsx`

- renderizam estado vazio corretamente
- renderizam dados normalizados corretamente

### 18.9. Testes E2E (fluxos crÃ­ticos)

#### Fluxo 1 — Carregamento inicial

- acessar `/`
- verificar redirecionamento para `/instagram`
- verificar presenÃ§a de navegaÃ§Ã£o lateral
- verificar preset default "Ãšltimos 30 dias"

#### Fluxo 2 — SeleÃ§Ã£o de conta

- abrir seletor
- escolher conta
- verificar atualizaÃ§Ã£o do dashboard
- recarregar pÃ¡gina
- confirmar persistÃªncia da conta no `localStorage`

#### Fluxo 3 — Troca de perÃ­odo

- selecionar "Ãšltimos 7 dias"
- verificar refetch dos dados
- selecionar "Ãšltimos 90 dias"
- verificar nova atualizaÃ§Ã£o

#### Fluxo 4 — Estados de erro

- simular erro na API de insights
- verificar `ErrorMessage`
- confirmar que outras seÃ§Ãµes continuam renderizando se aplicÃ¡vel

#### Fluxo 5 — Responsividade

- abrir dashboard em viewport mobile
- verificar que tabelas mantÃªm usabilidade com scroll horizontal
- verificar que grÃ¡ficos continuam visÃ­veis dentro do container

#### Fluxo 6 — Pages futuras

- acessar `/facebook`
- verificar placeholder "Em breve"
- acessar `/linkedin`
- verificar placeholder "Em breve"

### 18.10. CenÃ¡rios CrÃ­ticos da Meta API (obrigatÃ³rios)

Criar mocks especÃ­ficos para estes casos:

- erro por mistura incorreta de `metric_type`
- erro por `timeframe` invÃ¡lido
- erro por token ausente
- erro por token expirado
- erro HTTP `429` (rate limit)
- resposta parcial com campos faltando
- resposta vazia com `data: []`

### 18.11. Dados Mockados

Criar fixtures reutilizÃ¡veis para:

- lista de contas Instagram
- insights da conta
- demographics por gÃªnero/cidade/idade
- posts do feed
- reels
- erros da Meta API

Regra: fixtures devem refletir a estrutura real da Graph API, nÃ£o apenas o shape final parseado.

### 18.12. Cobertura MÃ­nima

Cobertura mÃ­nima obrigatÃ³ria para aprovaÃ§Ã£o do MVP:

- `formatters.ts`: 100%
- `dateUtils.ts`: 100%
- `metaApiHelpers.ts`: 95%+
- `meta/client.ts`: 90%+
- `instagram.ts`: 85%+
- hooks principais: 85%+
- componentes comuns crÃ­ticos: 80%+
- pelo menos 1 spec E2E cobrindo o fluxo completo do dashboard
- pelo menos 1 spec E2E cobrindo erro de API
- pelo menos 1 spec E2E cobrindo responsividade bÃ¡sica

### 18.13. Scripts no `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 18.14. Roadmap de ImplementaÃ§Ã£o dos Testes

#### Fase 9 — Tests

72. Instalar Vitest, React Testing Library, MSW e Playwright
73. Configurar ambiente global de testes (`src/test/setup.ts`)
74. Criar mocks compartilhados com MSW
75. Implementar testes unitÃ¡rios de utils
76. Implementar testes do API layer
77. Implementar testes das API Routes
78. Implementar testes dos hooks
79. Implementar testes dos componentes comuns
80. Implementar testes dos componentes do Instagram
81. Implementar testes E2E com Playwright
82. Rodar `npm run test`, `npm run test:e2e` e `npm run test:coverage`
83. Corrigir falhas e estabilizar mocks
84. Commit: `test: add unit, integration and e2e coverage`

### 18.15. Checklist de AprovaÃ§Ã£o dos Testes

- [ ] Nenhum teste usa token real
- [ ] Nenhum teste depende da Meta API real
- [ ] Todas as API Routes tÃªm cobertura de sucesso e erro
- [ ] Helpers de parsing cobrem respostas vÃ¡lidas, vazias e invÃ¡lidas
- [ ] Hooks cobrem loading, success e error
- [ ] `AccountSelector` testa persistÃªncia no `localStorage`
- [ ] `DateRangePicker` testa preset default de 30 dias
- [ ] `FeedPostsTable` testa cÃ¡lculo de engajamento no front
- [ ] Existe E2E para seleÃ§Ã£o de conta
- [ ] Existe E2E para troca de perÃ­odo
- [ ] Existe E2E para estados de erro
- [ ] Existe E2E para mobile/responsividade
- [ ] Cobertura mÃ­nima foi atingida

> A stack sugerida estÃ¡ alinhada com as guias atuais do Next.js para testes no App Router: o framework documenta Vitest/Jest para unitÃ¡rios e Playwright para E2E, e ressalta que componentes async do App Router sÃ£o melhores de validar com E2E. Para mocks, o MSW funciona tanto em Node quanto no browser, e a Testing Library segue a linha de testar o que o usuÃ¡rio vÃª e faz.
