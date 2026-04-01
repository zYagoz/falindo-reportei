# Social Insights Dashboard

Dashboard interno para acompanhamento de métricas sociais, com foco inicial em Instagram Business via Meta Graph API.

## Setup

1. Instale as dependências com `npm install`
2. Copie `.env.local.example` para `.env.local`
3. Preencha as variáveis da Meta
4. Rode `npm run dev`

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `META_ACCESS_TOKEN` | Token do System User / app com acesso à Meta Graph API |
| `META_API_VERSION` | Versão da Meta Graph API |
| `META_BASE_URL` | URL base da API da Meta |
| `NEXT_PUBLIC_APP_NAME` | Nome público exibido na interface |

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Lint do projeto |
| `npm run test` | Testes unitários e de integração |
| `npm run test:coverage` | Cobertura com Vitest |
| `npm run test:e2e` | Fluxos E2E com Playwright |

## Plataformas

- Instagram Business
- Facebook placeholder
- LinkedIn placeholder
