# Contribuindo com o AprendaUfu

Este documento é o padrão técnico do projeto. Ele existe para que qualquer pessoa do time
consiga implementar uma issue sem precisar decidir de novo "como autentico essa rota?" ou
"onde isso deve morar no monorepo?". Se você notar o código real divergindo do que está
descrito aqui, atualize este arquivo no mesmo PR — ele deve sempre refletir o padrão vigente,
não o ideal.

Contexto de arquitetura mais detalhado (motivação das escolhas, trade-offs, decisões em
aberto) está em `arquitetura-tecnica.md` no repositório `project-management`. Este arquivo é
o "como fazer", aquele é o "por que decidimos assim".

## 1. Mapa do monorepo

Turborepo + npm workspaces.

```
apps/
  api/    # NestJS — toda a lógica de negócio e acesso a dados vive aqui
  web/    # Next.js (App Router) — só UI. Não acessa o banco, só chama apps/api via HTTP
packages/
  auth/           # Guards, strategies e helpers de autenticação/autorização (usado só pela api)
  database/       # schema.prisma, migrations, client Prisma exportado (usado só pela api)
  events/         # event emitter interno + tipos de evento (usado só pela api)
  shared-types/   # DTOs/interfaces compartilhados entre api e web — contrato da API vive aqui
  ui/             # componentes de UI compartilhados (usado só pela web)
  domains/
    roadmaps/       # trilhas
    curation/       # curadoria
    feed/
    gamification/
    certification/
    content/        # conteúdos educacionais
    profile/
    search/
```

**Regra de organização por domínio:** dentro de `apps/api/src/`, cada domínio dos Requisitos
Funcionais vira um módulo Nest próprio (`auth/`, `roadmaps/`, `curation/`, `feed/`,
`gamification/`, `certification/`, `content/`, `profile/`, `search/`), seguindo o modelo já
existente em `apps/api/src/auth/` (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto.ts`).
Regra de negócio pesada ou reaproveitável entre módulos vai para o package correspondente em
`packages/domains/<dominio>` — módulos "finos" na `api` chamando lógica de domínio nesses
packages, não o contrário.

**Nunca:**
- Lógica de negócio ou acesso ao Prisma dentro de `apps/web`.
- Um domínio importando o client Prisma diretamente sem passar pela camada de serviço do
  módulo — sempre acesse dados através do `*.service.ts` do domínio dono da entidade.

## 2. Autenticação — como usar o padrão já criado

O padrão de autenticação **já está implementado** em `packages/auth` e `apps/api/src/auth/`.
Nenhuma issue de implementação deve reinventar isso — deve **reutilizar**.

- Login/registro por e-mail e senha: `AuthService` em `apps/api/src/auth/auth.service.ts`,
  senha com hash via `hashPassword`/`comparePassword` (`bcrypt`, `packages/auth/src/password.ts`).
  Nunca compare senha manualmente nem armazene em texto plano.
- Emissão de token: JWT assinado em `AuthService.buildResponse`, payload `{ sub: userId, role }`.
  Não crie um segundo mecanismo de sessão/token — se precisar de mais claims no payload, altere
  esse ponto único.
- **Toda rota que exige usuário autenticado** deve usar o guard já existente:

  ```ts
  import { JwtAuthGuard } from '@aprendaufu/auth';

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user; // { userId, role } — populado pelo JwtStrategy
  }
  ```

- **Toda rota restrita por papel** (ex.: só professor pode validar conteúdo) combina o guard de
  auth com `RolesGuard` + decorator `@Roles`:

  ```ts
  import { JwtAuthGuard, RolesGuard, Roles } from '@aprendaufu/auth';

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Post(':id/validar')
  validar(@Param('id') id: string) { ... }
  ```

  `JwtAuthGuard` sempre vem antes de `RolesGuard` na lista — `RolesGuard` depende de
  `req.user` já estar populado.

- Os papéis (`Role`) são definidos no enum do Prisma (`packages/database/prisma/schema.prisma`).
  Se um requisito precisar de um papel novo, adicione ao enum ali — não crie strings de papel
  soltas no código do domínio.

- **OAuth (Google / conta institucional .edu.br):** ainda não implementado. Ao implementar,
  siga o mesmo padrão — nova `PassportStrategy` em `packages/auth`, exportada por
  `packages/auth/src/index.ts`, consumida pelo `AuthModule`. Não crie um fluxo de auth paralelo
  fora de `packages/auth`.

- **Frontend:** nunca chame `fetch` diretamente para a API. Use o wrapper
  `apps/web/src/lib/api-client.ts` (`apiClient.get/post`), que já anexa o header
  `Authorization: Bearer <token>` automaticamente a partir do que está salvo por
  `saveSession` (`apps/web/src/lib/auth-client.ts`). Se seu endpoint tiver um método HTTP que o
  `apiClient` ainda não expõe (`put`, `delete`), adicione lá — não implemente uma chamada solta
  no componente.
  - Nota de segurança conhecida: o token hoje é salvo em `localStorage`, não em cookie
    httpOnly (diferente do que estava em `arquitetura-tecnica.md`). É o padrão vigente — siga-o
    por consistência — mas isso significa que uma XSS na aplicação rouba o token. Por isso a
    sanitização de qualquer conteúdo renderizado que venha de outro usuário (bio, comentário,
    nome de trilha, etc.) não é opcional. Ver checklist de segurança abaixo.

## 3. Validação de rotas

O `ValidationPipe` global (`apps/api/src/main.ts`) já está configurado com `whitelist: true` —
ou seja, **qualquer campo do body que não estiver declarado no DTO é descartado
silenciosamente**, e campos sem decorator de validação não são validados.

Isso significa que **toda rota que recebe body precisa de uma classe DTO com decorators do
`class-validator`**, seguindo o padrão de `apps/api/src/auth/dto.ts`:

```ts
import { IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';
import type { CreateRoadmapDto } from '@aprendaufu/shared-types';

export class CreateRoadmapBody implements CreateRoadmapDto {
  @MinLength(3)
  titulo: string;

  @IsIn(['tecnologia', 'ciencia', 'educacao'])
  categoria: string;
}
```

Regras:
- O tipo do DTO (a interface, sem os decorators) é definido em `packages/shared-types` e
  importado tanto pela `api` (que implementa a classe com validação) quanto pela `web` (que usa
  o tipo para tipar o `apiClient.post<T>(...)`). **Isso é o contrato de API do projeto** — se um
  endpoint novo não tem tipo em `shared-types`, frontend e backend vão divergir sem o
  TypeScript avisar. Nenhuma issue de implementação está completa sem atualizar esse package.
- Nunca use `any` ou `@Body() body: Record<string, any>` num controller — sempre uma classe DTO
  tipada.
- IDs recebidos por `@Param` que se referem a outra entidade devem ser validados quanto à
  existência (404) antes de qualquer efeito colateral.

## 4. Checklist de segurança por rota

Aplicar a **toda** rota nova antes de abrir o PR:

- [ ] Rota protegida por `JwtAuthGuard` quando exige usuário logado (ver seção 2) — rotas
      públicas (catálogo, perfil público, verificação de certificado) são exceção explícita, não
      omissão.
- [ ] `RolesGuard` + `@Roles(...)` quando a ação é restrita a um papel (ex.: curadoria é só
      professor).
- [ ] Autorização de dono do recurso verificada quando aplicável — `JwtAuthGuard` garante que
      *alguém* está logado, não que é o dono do recurso. Editar o próprio perfil, por exemplo,
      precisa comparar `req.user.userId` com o id do recurso, não só checar autenticação.
- [ ] Body validado por DTO com `class-validator` (seção 3) — nunca confiar em campo vindo do
      cliente sem decorator de validação.
- [ ] Nenhum dado sensível retornado nas respostas — `passwordHash` nunca deve sair de
      `AuthService`/`UserService`; monte um DTO de resposta explícito em vez de retornar a
      entidade do Prisma direto.
- [ ] Conteúdo gerado por usuário (bio, comentário, título de trilha indicada, nota de
      curadoria) é tratado como não confiável ao ser exibido no frontend — ver nota de XSS na
      seção 2.
- [ ] Erros retornados ao cliente não vazam detalhe interno (stack trace, query SQL) — use as
      exceções do NestJS (`UnauthorizedException`, `ForbiddenException`, `NotFoundException`,
      `ConflictException`) como no `AuthService`.

Rate limiting global ainda não está implementado no projeto — se a sua issue for
explicitamente sobre isso, trate como decisão de arquitetura nova (discutir antes, não decidir
sozinho dentro da issue).

## 5. Banco de dados (Prisma)

- Schema único em `packages/database/prisma/schema.prisma`. Nomes de campo em `camelCase` no
  Prisma, mapeados para `snake_case` no Postgres via `@map`/`@@map` (siga o padrão já usado em
  `User`/`AuthAccount`).
- Toda alteração de schema vem com a migration gerada (`prisma migrate dev`) no mesmo PR —
  nunca editar uma migration já commitada.
- Só a `api` acessa o Prisma. Se dois domínios precisam da mesma entidade, o dono do domínio
  expõe um método de serviço; não importe o client Prisma direto num módulo que não é dono da
  tabela.
- Consulte `modelo-de-dados-proposto.md` (no repo `project-management`) antes de criar uma
  entidade nova — é a proposta de modelo já derivada dos requisitos; se sua issue exigir uma
  tabela que não está lá, atualize aquele documento também.

## 6. Eventos

Duas camadas, conforme `arquitetura-tecnica.md`:

1. **Síncrono in-process** — reações imediatas dentro do mesmo request (ex.: concluir parada →
   atualizar progresso → checar XP). Usa `@nestjs/event-emitter`, tipos e nomes de evento
   centralizados em `packages/events`.
2. **Outbox** — eventos que precisam sobreviver a uma falha do processo (ex.: emissão de
   certificado, e-mail). Grave na tabela `eventos` **na mesma transação** da mudança de negócio;
   não dispare o efeito colateral (gerar PDF, enviar e-mail) diretamente no request.

Todo evento novo — síncrono ou outbox — é declarado em `packages/events` (nome + payload
tipado) antes de ser publicado ou consumido. Não use strings soltas como nome de evento.

## 7. Frontend

- Páginas em `apps/web/src/app/<rota>/page.tsx` (App Router). Componentes de UI reutilizáveis
  entre domínios vão para `packages/ui`; componentes específicos de uma tela ficam em
  `apps/web/src/components/`.
- Toda chamada à API passa pelo `apiClient` (seção 2) e é tipada com o DTO de
  `shared-types` — nunca `fetch` cru, nunca `any` na resposta.
- Estado de sessão (token, usuário logado) só é lido/escrito via `apps/web/src/lib/auth-client.ts`.

## 8. Testes

- **Unitário:** Jest em `apps/api` (regras de negócio, principalmente as RNs do documento de
  requisitos), Vitest em `apps/web`.
- **E2E (Playwright):** reservado para os fluxos críticos — login, concluir trilha até emitir
  certificado, validar conteúdo na curadoria. Não é esperado E2E para toda issue.
- PR que adiciona lógica de negócio nova (serviço, guard, cálculo) vem com teste unitário
  cobrindo o caminho feliz e pelo menos um caso de erro/borda.

## 9. Checklist de PR

Antes de pedir revisão, confirme:

- [ ] Segue a organização por domínio da seção 1 (nada de lógica de negócio em `apps/web`).
- [ ] Checklist de segurança da seção 4 aplicado, se a issue envolve rota nova.
- [ ] DTOs adicionados/atualizados em `packages/shared-types` para qualquer campo novo de
      request ou response.
- [ ] Migration do Prisma incluída, se o schema mudou.
- [ ] Eventos novos declarados em `packages/events`, se aplicável.
- [ ] `npm run lint` e `npm run test` passam na raiz do monorepo.
- [ ] Critérios de aceite da issue foram todos verificados manualmente (rodando a aplicação),
      não só "o código compila".

## 10. Rodando localmente

```bash
npm install          # na raiz — instala para todos os workspaces
npm run dev           # sobe api (porta 3001) e web (porta 3000) via turbo
```

Variáveis de ambiente: copie `apps/api/.env.example` para `apps/api/.env` e preencha
`DATABASE_URL` e `JWT_SECRET`; `apps/web/.env.local` já aponta para a API local por padrão.
