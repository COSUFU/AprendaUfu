---
name: Implementação de Requisito
about: Issue de implementação de um RF/RNF/RN — contrato de API, dados, eventos, UI e segurança
title: "[RFxx] "
labels: ["requisito"]
---

<!--
Antes de preencher: leia CONTRIBUTING.md na raiz do repo. Ele define o padrão de
autenticação, validação de rota e segurança que esta issue assume como já pronto para
reutilizar — esta issue não deve reinventar nenhum desses pontos, só aplicá-los.
-->

## Requisito

- **Código:** RFxx / RNFxx / RNxx
- **Descrição:** (copiar a descrição do requisito de `Documentos/Requisitos Funcionais.md` no
  repo `project-management`)
- **Domínio:** (auth / perfil / trilhas / conteúdos / curadoria / feed / gamificação /
  certificação / busca)

## Regras de Negócio Aplicáveis

- (referenciar código(s) RN, ex.: RN03 — certificado só emitido com todas as paradas
  obrigatórias concluídas)

## RNFs Relacionados

- (referenciar código(s) RNF relevantes a esta issue, ex.: RNF04 — segurança de autenticação,
  RNF09 — tempo de resposta)

## História (Use Case)

Como **[papel — aluno/professor/visitante]**, eu quero **[ação]**, para que **[benefício]**.

## Contrato de API

> Preencher **antes** de começar a implementar. Este contrato é o combinado entre quem
> implementa o backend e quem implementa o frontend — mudar o formato depois de combinado exige
> avisar quem estiver do outro lado.

### Modelo no banco de dados

- Entidade(s) envolvida(s) (ver `modelo-de-dados-proposto.md` no repo `project-management`):
- Campos novos ou alterados:
- Relacionamentos com outras entidades:

### Tipos em `packages/shared-types`

```ts
// nome do arquivo sugerido: packages/shared-types/src/<dominio>.ts
export interface ExemploRequestDto {
  // campos do body/query
}

export interface ExemploResponseDto {
  // formato exato da resposta
}
```

### Endpoints

| Método | Rota | Auth necessária | Request | Response | Erros |
|---|---|---|---|---|---|
| | | (`JwtAuthGuard` / `JwtAuthGuard`+`@Roles(...)` / pública) | | | (401/403/404/409...) |

### Eventos

- **Publica:** (nome do evento, payload, síncrono ou outbox — ver seção 6 de CONTRIBUTING.md)
- **Consome:** (nome do evento, de qual domínio)

### Pontos já existentes a reutilizar

- (ex.: `JwtAuthGuard`/`RolesGuard` de `packages/auth`, `apiClient` de
  `apps/web/src/lib/api-client.ts`, serviço X de outro domínio — linkar o arquivo)

## Frontend

### Frame de referência da UI

<!--
Print/frame exato do vídeo de demonstração (Gravação de Tela) mostrando esta tela/estado.
Anexar a imagem aqui (arrastar o arquivo no campo da issue no GitHub) ou linkar o arquivo em
docs/ui-reference/ do repo. Indicar o timestamp do vídeo de origem para quem quiser conferir o
contexto (transições, estado antes/depois).
-->

- **Timestamp no vídeo original:** `MM:SS`
- **Frame:**

### Estados da tela a cobrir

- [ ] Estado vazio / carregando
- [ ] Estado normal (o do frame acima)
- [ ] Estado de erro (ex.: falha na chamada à API)

## Critérios de Aceite

- [ ]
- [ ]

## Checklist de Segurança

(ver seção 4 de CONTRIBUTING.md para o detalhe de cada item)

- [ ] Rota protegida por `JwtAuthGuard` quando exige usuário logado (ou justificar por que é
      pública)
- [ ] `RolesGuard` + `@Roles(...)` aplicado quando a ação é restrita a um papel
- [ ] Autorização de dono do recurso verificada (não só autenticação), quando aplicável
- [ ] Body validado por DTO com `class-validator` — nenhum campo aceito sem decorator
- [ ] Nenhum dado sensível (ex.: `passwordHash`) retornado na resposta
- [ ] Conteúdo gerado por usuário tratado como não confiável ao ser exibido no frontend
- [ ] Erros expostos ao cliente não vazam detalhe interno
