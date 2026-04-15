# Social Insights Dashboard

Dashboard interno para acompanhamento de metricas sociais via Meta Graph API.

## Visao geral

O projeto concentra metricas de conta e conteudo em um unico painel, com foco atual em:

- Instagram Business completo no MVP
- Facebook Page em rollout gradual
- selecao de conta/pagina e presets de periodo
- estados de loading, erro e indisponibilidade de dados

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Vitest + Testing Library + MSW
- Playwright

## Setup

1. Instale as dependencias com `npm install`
2. Copie `.env.local.example` para `.env.local`
3. Preencha as variaveis de ambiente da Meta
4. Rode `npm run dev`

## Variaveis de ambiente

| Variavel | Descricao |
| --- | --- |
| `META_ACCESS_TOKEN` | Token do System User ou app com acesso a Meta Graph API |
| `META_API_VERSION` | Versao da Meta Graph API |
| `META_BASE_URL` | URL base da Meta Graph API |
| `NEXT_PUBLIC_APP_NAME` | Nome publico exibido na interface |

Exemplo base:

```env
META_ACCESS_TOKEN=
META_API_VERSION=v25.0
META_BASE_URL=https://graph.facebook.com
NEXT_PUBLIC_APP_NAME="Social Insights Dashboard"
```

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Ambiente local de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run start` | Servir a build localmente |
| `npm run lint` | Verificacao com ESLint |
| `npm run test` | Testes unitarios e de integracao |
| `npm run test:coverage` | Cobertura com Vitest |
| `npm run test:e2e` | Fluxos E2E com Playwright |

## Escopo atual do MVP

### Instagram Business

Implementado:

- Overview com KPIs agregados de conta
- Feed com resumo e tabela de posts
- Reels com resumo agregado e tabela
- Stories com resumo de stories ativos ou recentes
- Activity com melhores dias e horarios de postagem
- selecao de conta
- presets de periodo: ultimos 7, 30 e 90 dias, este mes e mes anterior

### Facebook Page

Implementado nesta etapa:

- entrada real no menu de plataforma
- selecao de pagina
- persistencia da pagina selecionada
- shell inicial do dashboard
- overview defensivo com snapshot da pagina
- rota interna de debug para investigacao de insights

Ainda pendente para Facebook:

- calibragem final do overview com pagina elegivel e insights reais
- modulo de posts
- modulo de demographics

### Fora do escopo atual

- LinkedIn
- historico persistido proprio fora do que a Meta expoe na consulta
- Activity para Facebook
- Videos/Reels como modulo dedicado no Facebook

## Limitacoes da Meta API

### Instagram

- Stories sao efemeros e dependem da janela curta disponibilizada pela Meta
- nao existe historico amplo de Stories sem persistencia propria no backend
- algumas metricas variam conforme a versao e a disponibilidade da API da Meta
- parte das comparacoes historicas depende das limitacoes de janela da Meta

### Facebook

- o objeto da pagina pode responder normalmente com `followers_count` e `fan_count`, enquanto `/{page-id}/insights` retorna `data: []`
- esse retorno vazio pode acontecer tanto em paginas pequenas quanto em paginas com `fan_count >= 100`
- em contas de baixo volume, em paginas com pouca atividade recente ou em cenarios de elegibilidade restrita, a Meta pode nao devolver insights publicos mesmo quando o Business Suite exibe metricas internamente
- o Meta Business Suite pode mostrar metricas que nao sao devolvidas da mesma forma pela Graph API publica
- por isso, o produto trata `data: []` como **insights indisponiveis via API**, e nao como desempenho zero
- quando os insights do Facebook nao estiverem disponiveis, o dashboard mostra apenas o snapshot basico da pagina e uma mensagem explicita sobre a limitacao da Meta

## Plataformas suportadas

- Instagram Business
- Facebook Page em rollout parcial

## Estrutura principal

```text
src/
  app/
  components/
  lib/
  test/
e2e/
```

## Qualidade e testes

O projeto usa:

- Vitest para testes unitarios e de integracao
- MSW para mocks da Meta API
- Playwright para fluxos E2E

Fluxos validados no MVP:

- carregamento inicial do dashboard
- selecao de conta/pagina
- troca de periodo
- estados de erro
- estado de insights indisponiveis no Facebook
- responsividade basica

## Observacoes de entrega

- o token da Meta e consumido apenas no servidor
- a rota `/api/facebook/overview-debug` existe apenas para diagnostico interno
- o dashboard foi ajustado para desktop, zoom-out, viewport intermediaria e mobile
- o modulo de Stories cobre apenas o que a Meta ainda disponibiliza via API na janela efemera atual
