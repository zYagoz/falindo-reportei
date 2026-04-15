# Plano de Implementação do MVP de Facebook Page

## Resumo

O próximo módulo do projeto será **Facebook Page**, seguindo o mesmo padrão estrutural do Instagram, mas com um primeiro corte mais conservador.

Escopo deste MVP:

- seleção de página
- overview com KPIs agregados
- gráfico principal de série temporal
- posts da página
- demographics com tratamento defensivo

Fora desta rodada:

- activity
- módulo separado de vídeos/reels
- métricas de “visitas à página” sem equivalente confiável

## Objetivo do MVP

Entregar uma primeira versão funcional de Facebook dentro do dashboard atual, sem refatorar o módulo de Instagram e sem forçar paridade onde a Meta não tiver equivalente defensável.

O módulo deve:

- reutilizar a arquitetura já adotada no Instagram
- manter comparação com período anterior quando fizer sentido
- tratar respostas vazias como estado vazio amigável
- isolar a complexidade da Meta no backend

## Estrutura técnica

### Backend

Criar a camada Facebook paralela à do Instagram:

- `src/lib/api/meta/facebook.ts`
- `src/lib/types/facebook.types.ts`
- `src/app/api/facebook/...`

Rotas do MVP:

- `/api/facebook/pages`
- `/api/facebook/overview?pageId=&since=&until=`
- `/api/facebook/insights?pageId=&since=&until=`
- `/api/facebook/posts?pageId=&since=&until=`
- `/api/facebook/demographics?pageId=&timeframe=`

### Frontend

Criar:

- `src/components/facebook/FacebookDashboard.tsx`
- hooks `useFacebook*`
- componentes específicos de overview e posts apenas quando não houver reuso direto dos componentes do Instagram

## Contratos internos mínimos

### 1. Página

```ts
interface FacebookPage {
  id: string;
  name: string;
  username?: string;
  picture_url?: string;
  category?: string;
}
```

### 2. Overview

```ts
interface FacebookOverviewAggregate {
  followers_total: number;
  new_followers: number;
  reach: number;
  cta_clicks: number;
}
```

Observação:

- “visitas à página” ficam fora por padrão
- se a pesquisa oficial achar uma métrica realmente defensável, ela pode entrar depois

### 3. Série temporal

```ts
interface FacebookMetricPoint {
  value: number;
  end_time: string;
}
```

### 4. Posts

```ts
interface FacebookPostReactions {
  total: number;
  breakdown?: {
    LIKE?: number;
    LOVE?: number;
    HAHA?: number;
    WOW?: number;
    SAD?: number;
    ANGRY?: number;
    CARE?: number;
  };
}

interface FacebookPostInsights {
  reach?: number;
  clicks?: number;
  comments?: number;
  shares?: number;
  reactions: FacebookPostReactions;
}

interface FacebookPost {
  id: string;
  message?: string;
  full_picture?: string;
  created_time: string;
  permalink_url?: string;
  type?: string;
  insights: FacebookPostInsights;
}
```

### 5. Demographics

```ts
interface FacebookGenderBreakdown {
  M: number;
  F: number;
  U: number;
}

interface FacebookCityBreakdown {
  city: string;
  value: number;
}

interface FacebookCountryBreakdown {
  country: string;
  value: number;
}

interface FacebookDemographics {
  followers_by_gender?: FacebookGenderBreakdown;
  followers_by_city: FacebookCityBreakdown[];
  followers_by_country?: FacebookCountryBreakdown[];
  emptyReason?: string;
}
```

## Regras de implementação

### 1. Métricas só entram após validação oficial

Antes de codar o API layer final, cada métrica precisa ser travada com:

- nome oficial
- endpoint
- período suportado
- se aceita `since` / `until`
- se continua ativa após as deprecações recentes

Se a métrica não estiver clara na doc oficial da Meta:

- ela não entra no MVP

### 2. Comparação com período anterior

Aplicar comparação com período anterior no Facebook apenas para:

- overview
- série temporal, se o endpoint suportar ranges equivalentes

### 3. Posts

Usar `/{page-id}/posts` como padrão inicial, não `/{page-id}/feed`, para manter consistência com conteúdo próprio da página.

### 4. Reactions

Modelar desde o início:

- total
- breakdown opcional

A UI inicial pode mostrar só o total, mas o contrato já deve suportar o breakdown.

### 5. Demographics

Implementar com fallback defensivo:

- se vier vazio, renderizar “dados insuficientes”
- não tratar ausência de demographics como erro de sistema

## Composição visual do dashboard

O Facebook Dashboard deve seguir a mesma organização do Instagram:

1. topo com `AccountSelector` e `DateRangePicker`
2. `01. Visão Geral`
   - cards de KPI
   - gráfico principal
3. `02. Posts`
   - resumo simples, se fizer sentido
   - tabela de posts
4. `03. Demografia`
   - donut de gênero, se houver dado
   - top cidades ou países

Reuso prioritário:

- `PlatformNav`
- `AccountSelector`
- `DateRangePicker`
- `SectionHeader`
- `ErrorMessage`
- `LoadingSkeleton`
- `MetricCard`
- `LineChart`
- `GenderDonutLegendChart`
- `TopCitiesTable`

## Hooks previstos

- `useFacebookPages`
- `useFacebookOverview`
- `useFacebookInsights`
- `useFacebookPosts`
- `useFacebookDemographics`

Todos devem seguir o padrão já existente no Instagram:

- loading
- success
- error
- não buscar sem `pageId`

## Testes

### API layer

Cobrir:

- sucesso por função
- ranges longos, se a API exigir janelas
- reactions sem breakdown não quebram parsing
- demographics vazios viram estado vazio
- erro tratado da Meta sobe de forma coerente

### API routes

Cobrir:

- `/api/facebook/pages`
- `/api/facebook/overview`
- `/api/facebook/insights`
- `/api/facebook/posts`
- `/api/facebook/demographics`

Casos mínimos:

- `200`
- `400` quando faltar query obrigatória
- `500` para erro não tratado

### Hooks

Cobrir:

- loading / success / error
- não dispara fetch sem `pageId`

### Componentes

Cobrir:

- `FacebookDashboard`
- cards do overview
- tabela de posts
- demographics com estado vazio
- erro de seção sem derrubar a página

### E2E

Cobrir:

- carregamento inicial do Facebook
- seleção de página
- troca de período
- estado vazio de demographics
- erro em uma seção sem derrubar o dashboard
- responsividade básica

## Itens fora do MVP

- activity
- vídeos/reels como módulo separado
- qualquer proxy frágil para visitas à página
- qualquer métrica sintética sem suporte explícito da Meta

## Critério de aceite

O MVP estará pronto quando:

- a página `/facebook` deixar de ser placeholder
- o dashboard carregar páginas reais via rota interna
- overview, posts e demographics funcionarem com dados da Meta normalizados
- estados vazios e erros forem tratados por seção
- testes principais de API, hooks, componentes e E2E estiverem verdes

## Assumptions

- Facebook seguirá o mesmo padrão arquitetural do Instagram.
- O primeiro corte será `Overview + Posts + Demographics`.
- `Activity` fica fora até existir equivalente confiável.
- `Reactions` entram desde o início no contrato como `total + breakdown?`.
- “Visitas à página” ficam fora por padrão até existir métrica defensável.
