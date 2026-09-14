# Guia para agentes de IA — AprendaUfu

Este arquivo orienta **qualquer ferramenta de IA** (Claude Code, Cursor, Copilot, Gemini, etc.)
que contribua neste repositório. O padrão técnico completo (arquitetura, autenticação, validação,
segurança por rota) está em **`CONTRIBUTING.md`** — leia-o antes de implementar; este arquivo é a
camada específica para IA.

> Enforcement: no **Claude Code**, os itens **1 e 2** das proibições de segurança são impostos por
> hook (`.claude/settings.json` + `.claude/hooks/ai-guard.mjs`) — bloqueio técnico. Os itens 3 e 4 e
> todo o restante deste guia são obrigatórios por **convenção**. Outras ferramentas de IA **não**
> executam esse hook: para elas, mesmo os itens 1 e 2 valem só por convenção.

## Proibições de segurança (inegociáveis)

1. **Nunca ler, abrir, copiar ou imprimir arquivos `.env`** (`.env`, `.env.local`, `.env.production`,
   etc.). Use `.env.example` como referência de variáveis. Segredos não entram no contexto da IA.
2. **Nunca executar operações destrutivas no banco**, mesmo conectado a um banco de dev:
   `DROP`, `TRUNCATE`, `prisma migrate reset`, `prisma db push --force-reset`, e `DELETE`/`UPDATE`
   sem `WHERE`. Alterações de schema vêm por migration versionada, nunca por comando direto.
3. **Nunca enfraquecer os próprios guardrails.** Não edite nem desabilite `.claude/settings.json`,
   `.claude/hooks/ai-guard.mjs`, este `AGENTS.md`/`CLAUDE.md` ou as permissões para contornar uma
   restrição. Se um bloqueio atrapalha uma tarefa legítima, **pare e pergunte** — não "conserte"
   removendo a trava.
4. **Nunca commitar segredo** (chave, token, senha, connection string) nem logar credenciais.

## Dependências (supply-chain)

- Não adicione pacote npm sem necessidade real — prefira o que já existe no projeto.
- Antes de adicionar, verifique que o pacote é reputável e mantido; desconfie de nomes parecidos
  (typosquat) e de pacotes obscuros/sem manutenção.
- Rode `npm audit` após mexer em dependências; não introduza vulnerabilidade conhecida.
- Mantenha o `package-lock.json` versionado; não o apague sem motivo. Em CI, use `npm ci`.

## Tratamento de erros — não mascarar

- Erro de dependência/infra (banco fora, config faltando) deve **aparecer e ser logado**, nunca
  virar tela branca ou redirect silencioso. Um bloqueio que "some" é pior que um erro visível.
- Trate erro apenas nas **fronteiras** do sistema (input do usuário, APIs externas, banco); no meio
  do fluxo, deixe o erro propagar para ser diagnosticado.

## Estrutura do monorepo

- Turborepo + npm workspaces (`apps/*`, `packages/*`). Mapa completo em `CONTRIBUTING.md` §1.
- **Pacote com valores em runtime** (ex.: `@aprendaufu/messages`) é **buildado** (tsc → `dist`,
  espelhando `packages/auth`) e consumido pelo `dist`. **Contrato só-tipo** vai em
  `packages/shared-types` e é importado com `import type`.
- Rode `npm run build` antes de `dev`/testes quando mexer em packages — o turbo resolve a ordem pelo
  grafo de dependências (`^build`); um workspace consome o `dist` do outro.

## Regras de código

- **Zero comentários** — nomes e estrutura autoexplicativos; sem código morto/comentado.
- **Sem magic strings/numbers** — mensagens exibidas vêm de `@aprendaufu/messages`; rotas/chaves em
  constantes; papéis no enum `Role` do Prisma.
- **DDD em camadas** (Domain/Application/Infrastructure/Presentation) — ver `CONTRIBUTING.md` §1.
  Nada de lógica de negócio ou Prisma em `apps/web`.
- **Async ponta a ponta**; **YAGNI / sem over-engineering** — resolva o problema real, sem abstração
  especulativa.

## Backend (NestJS)

- Cross-cutting concerns via **Guards/Pipes/Interceptors/Filters**, não middleware cru.
- **Um único ponto de emissão de JWT** (`AuthService.buildResponse`) — não crie outro mecanismo de
  sessão/token. Reutilize `packages/auth` (guards, strategies, helpers).

## Contrato e validação

- Todo endpoint novo tem tipo em `packages/shared-types` (contrato) e DTO com `class-validator` na
  `apps/api`. Nunca `any` em body de controller.
- Nunca retornar entidade do Prisma nem campos sensíveis (`passwordHash`) — monte DTO de resposta.

## Segurança por rota

- `JwtAuthGuard` quando exige login; `RolesGuard` + `@Roles(...)` quando restrito a papel; autorização
  de dono do recurso quando aplicável. Ver checklist em `CONTRIBUTING.md` §4.

## Banco de dados (Prisma)

- Só a `api` toca no Prisma. Mudança de schema vem com a migration gerada **no mesmo PR**.
- **Nunca** edite uma migration já commitada. `camelCase` no Prisma, `snake_case` no Postgres via
  `@map`/`@@map`.

## Qualidade, escalabilidade e observabilidade

- **Testes junto com a feature** (Jest na `apps/api`, Vitest na `apps/web`), cobrindo caminho feliz e
  ao menos um caso de erro/borda para regra de negócio nova.
- **Escalabilidade:** prefira soluções stateless; trate concorrência (ex.: violação de unicidade) e
  não introduza estado local que impeça rodar múltiplas instâncias.
- **Observabilidade:** logs estruturados; **nunca logar segredo, token ou senha**; erros de fronteira
  tratados sem vazar detalhe interno ao cliente.

## Ferramentas e scripts

- O time usa **Windows e outros SOs** — scripts e tooling devem ser **cross-platform** (prefira Node
  a comandos só-POSIX). Não assuma bash.

## Escopo e disciplina

- PRs **focados** — não refatore o que não foi pedido. Para feature grande, **planeje antes**.
- Quando o padrão mudar, atualize `CONTRIBUTING.md`, `shared-types` e `@aprendaufu/messages` no mesmo PR.
- Não interaja com o git (commit/push/branch) além do solicitado.

## Antes de concluir

- `npm run lint`, `npm run build` e `npm run test` **verdes** na raiz.
- Critérios de aceite verificados de fato (não só "compila").
- Branch a partir do `upstream/main` mais atual; **conventional commits**; PR com o checklist do
  `CONTRIBUTING.md` §9.
