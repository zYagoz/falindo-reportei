# Briefing Técnico para Pesquisa de Facebook Page Insights

## Contexto

Estou evoluindo um dashboard interno em Next.js que hoje já possui um módulo de Instagram Business funcional via Meta Graph API.

Agora quero planejar o módulo de **Facebook Page**, mantendo o **mesmo padrão estrutural, de métricas e de gráficos do Instagram sempre que houver equivalente confiável**.

A intenção não é reinventar o produto para Facebook.
Quero um desenho paralelo ao Instagram:

- mesma arquitetura interna
- mesmas camadas
- mesma filosofia de período
- mesma ideia de comparação com período anterior
- mesma organização por módulos, quando fizer sentido

## Arquitetura atual do projeto

O projeto hoje funciona assim:

1. frontend chama rota interna
2. rota interna chama função do API layer
3. API layer chama Meta Graph API
4. helpers fazem parsing e normalização
5. frontend renderiza cards, tabelas e gráficos

### Stack atual

- Next.js App Router
- TypeScript
- Meta Graph API
- API routes internas
- API layer em `src/lib/api/meta`
- hooks por domínio
- componentes por domínio
- testes com Vitest, MSW e Playwright

## Como estamos fazendo no Instagram hoje

Quero que a pesquisa de Facebook seja feita levando em conta o que já existe no Instagram, porque o novo módulo deve seguir a mesma lógica estrutural.

### 1. Seleção de conta

No Instagram, listamos contas a partir de:

- `GET /me/accounts`
- buscamos páginas Meta com `instagram_business_account`

Isso alimenta o seletor de conta do dashboard.

### 2. Overview

No Instagram temos uma rota interna agregada:

- `GET /api/instagram/overview?accountId=&since=&until=`

Ela consolida:

- seguidores atuais
- novos seguidores no período
- visitas ao perfil
- alcance do perfil
- cliques no link

Observações:

- quebramos ranges longos em janelas no backend quando necessário
- recompomos no servidor
- comparamos com período anterior

### 3. Série temporal

No Instagram temos gráfico principal de linha com série temporal de alcance diário.

### 4. Posts

No Instagram temos:

- listagem de posts por período
- insights por post
- tabela com métricas principais

### 5. Reels

No Instagram temos módulo separado para reels:

- listagem
- insights por item
- resumo agregado da conta

### 6. Stories

No Instagram temos módulo separado para stories, mas com comportamento efêmero e sem histórico amplo.

### 7. Demographics

No Instagram temos blocos demográficos como:

- gênero
- cidades
- faixas etárias

### 8. Activity

No Instagram temos um bloco de activity com:

- melhor dia para postagens
- melhor horário para postagens

Importante:

- isso hoje depende de `online_followers`
- se o Facebook não tiver equivalente confiável, não queremos forçar paridade artificial

## O que queremos para Facebook

Tudo agora será referente a **Facebook Page**.

Queremos manter o **mesmo padrão estrutural do Instagram**, principalmente em:

- módulos
- contratos internos
- lógica de período
- comparação com período anterior
- visual geral dos gráficos e cards

### Primeiro corte desejado

Escopo conservador do MVP de Facebook:

- Overview
- Posts
- Demographics

Fora do primeiro corte, por enquanto:

- Activity
- separação detalhada de vídeos vs reels
- qualquer módulo que exija inferência frágil

## Padrão estrutural esperado para Facebook

Quero algo equivalente ao Instagram, com:

- `src/lib/api/meta/facebook.ts`
- rotas internas em `src/app/api/facebook/...`
- hooks `useFacebook*`
- componentes `src/components/facebook/...`

Rotas internas prováveis:

- `/api/facebook/accounts` ou `/api/facebook/pages`
- `/api/facebook/overview`
- `/api/facebook/posts`
- `/api/facebook/demographics`

Pesquisar também se faz sentido já prever:

- `/api/facebook/time-series`
- `/api/facebook/videos`

Mas sem assumir que essas rotas entram no primeiro corte.

## O que precisa ser pesquisado

Quero uma resposta baseada em documentação oficial da Meta, se possível.

## 1. Seleção de páginas

Pesquisar:

- endpoint correto para listar páginas acessíveis ao token atual
- campos ideais para montar o seletor de página
- se há equivalentes a:
  - id
  - nome
  - username
  - imagem de perfil
  - total de seguidores
  - categoria

Não assumir que os nomes dos campos sugeridos estejam corretos sem validação oficial.

## 2. Overview de Facebook Page

Queremos um bloco semelhante ao Instagram, mas só com métricas oficialmente suportadas e defensáveis.

Pesquisar equivalentes confiáveis para:

- seguidores atuais da página
- novos seguidores no período
- visitas à página ou ao perfil
- alcance da página
- cliques principais da página ou CTA

Importante:

- não assumir sem validação que `views`, `page_views_total` ou `page_total_actions` sejam equivalentes perfeitos
- precisamos saber o endpoint real, o nome oficial da métrica, a granularidade e o período suportado

Quero saber:

- quais métricas existem de fato hoje
- quais aceitam `since` e `until`
- quais são `lifetime`
- quais são `day`, `week`, `days_28`
- quais permitem comparação entre períodos

## 3. Série temporal

Queremos um gráfico principal no Facebook equivalente ao gráfico de alcance do Instagram.

Pesquisar:

- qual métrica temporal é a melhor candidata no Facebook
- se existe algo que represente bem:
  - alcance diário
  - impressões diárias
  - visualizações de página diárias
  - engajamento diário

Não assumir uma métrica como definitiva antes de validar na documentação.
Queremos recomendação com justificativa.

## 4. Posts da página

Queremos um módulo de posts semelhante ao feed do Instagram.

Pesquisar:

- endpoint correto para listar posts da página por período
- se o correto é `/feed`, `/posts` ou outro edge
- como filtrar por data
- quais campos básicos puxar na listagem:
  - id
  - message
  - full_picture
  - created_time
  - permalink, se aplicável

Pesquisar também os insights por post:

- alcance
- impressões ou views
- comentários
- compartilhamentos
- cliques
- engajamento
- reactions

Importante:

- precisamos saber se essas métricas vêm via edge do post, via insights, ou misto
- não queremos inventar uma fórmula se a API não entregar o dado com consistência

## 5. Reactions no Facebook

No Instagram atual do projeto, não trabalhamos com reactions.
Trate **reactions como uma dúvida específica do Facebook**, não do Instagram.

Pesquisar:

- como obter reactions por post
- se existe:
  - total de reactions
  - breakdown por tipo
  - ambos
- se os tipos incluem algo como:
  - LIKE
  - LOVE
  - HAHA
  - WOW
  - SAD
  - ANGRY
  - CARE
- se isso vem:
  - no edge do post
  - em insights do post
  - em reactions summary separado

Recomendação desejada para o contrato interno:

- `reactions_total`
- `reactions_breakdown?`
- ou ambos

No primeiro corte, a pesquisa deve considerar que queremos **total + breakdown**, mesmo que a UI inicial mostre só o total.

## 6. Demographics

Queremos algo equivalente ao Instagram:

- gênero
- cidade
- país, se fizer mais sentido que cidade
- faixa etária

Pesquisar:

- quais métricas demográficas de Facebook Page existem hoje
- quais são estáveis na versão atual da API
- quais limites de amostra existem
- quais exigem mínimo de audiência
- se retornam vazio em vez de erro quando não há massa crítica

Não assumir nomes de métricas como definitivos sem validação oficial.

## 7. Activity

Hoje no Instagram usamos `online_followers` para:

- melhor dia para postagens
- melhor horário para postagens

Para Facebook:

- pesquisar se existe algum equivalente confiável
- se não existir, deixar isso claramente fora do MVP inicial

Importante:

- não queremos uma métrica inferida ou artificial no primeiro corte
- activity deve entrar só se houver equivalente real e defensável

## 8. Vídeos / Reels

Para este primeiro corte, isso não entra como módulo obrigatório.
Mas quero que você pesquise, sem transformar isso em escopo imediato:

- existe separação confiável entre posts, vídeos e reels no Facebook Page Graph API?
- quais endpoints existem para vídeos
- se reels têm edge ou insights próprios
- se no futuro vale criar um módulo separado como no Instagram

Por enquanto, trate isso como pesquisa de expansão futura, não como parte do MVP inicial.

## 9. Limitações da API

Quero um mapeamento claro de limitações reais da API do Facebook Page, incluindo:

- limites de período por query
- retenção histórica
- diferenças entre métricas `day`, `week`, `days_28`, `lifetime`
- métricas deprecated
- permissões necessárias
- atrasos de processamento
- quórum mínimo para demographics
- qualquer diferença relevante entre versões da Graph API

## Como responder

Quero que você devolva:

1. endpoints necessários para um módulo inicial de Facebook Page
2. sugestão de rotas internas do projeto para Facebook
3. métricas recomendadas para:
   - overview
   - série temporal
   - posts
   - demographics
4. proposta de contrato interno mínimo para o MVP
5. proposta de contrato opcional para reactions
6. o que pode entrar já no primeiro corte
7. o que deve ficar explicitamente fora do MVP
8. riscos e limitações reais da API

## Restrições importantes

- manter o padrão estrutural já usado no Instagram
- não fugir muito do PRD
- priorizar equivalentes reais do Instagram, sem forçar paridade falsa
- não inventar métricas sintéticas
- não tratar activity como garantido
- tratar `reactions` como pesquisa específica do Facebook
- considerar `Overview + Posts + Demographics` como primeiro corte conservador
