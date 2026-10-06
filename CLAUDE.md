# CLAUDE.md

As regras para trabalhar neste repositório valem para qualquer agente de IA e estão em
**[`AGENTS.md`](./AGENTS.md)** (camada de IA) e **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** (padrão
técnico completo). Leia os dois antes de implementar.

Pontos que o Claude Code impõe por hook (`.claude/settings.json` + `.claude/hooks/ai-guard.mjs`):

- **Nunca** ler/abrir/copiar arquivos `.env` (use `.env.example`).
- **Nunca** executar operações destrutivas no banco (`DROP`, `TRUNCATE`, `prisma migrate reset`,
  `--force-reset`, `DELETE`/`UPDATE` sem `WHERE`).

Todo o restante (DDD em camadas, DTOs em `shared-types`, mensagens em `@aprendaufu/messages`, zero
comentários, testes junto com a feature, segurança por rota, lint/build/test verdes antes de concluir)
está em `AGENTS.md` e `CONTRIBUTING.md`.
