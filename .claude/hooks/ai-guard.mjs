import { readFileSync } from "node:fs";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  payload = {};
}

const toolName = payload.tool_name ?? "";
const toolInput = payload.tool_input ?? {};

const ENV_MESSAGE =
  "Bloqueado pelo guardrail do projeto: leitura/manipulacao de arquivos .env e proibida para IA (use .env.example). Ver AGENTS.md.";
const DB_MESSAGE =
  "Bloqueado pelo guardrail do projeto: operacoes destrutivas de banco (DROP/TRUNCATE/migrate reset/--force-reset/DELETE ou UPDATE sem WHERE) sao proibidas para IA. Ver AGENTS.md.";

const ALLOWED_ENV = /(^|[\\/])\.env\.(example|template|sample|dist)$/i;
const REAL_ENV = /(^|[\\/])\.env(\.[A-Za-z0-9_-]+)?$/;

const DB_CLIENT =
  /\b(psql|pg_dump|pg_restore|prisma|mysql|mariadb|sqlite3|mongosh?|knex|sequelize|typeorm)\b/i;
const STRONG_DESTRUCTIVE = [
  /\bdrop\s+(database|table|schema|index|view|type|sequence|column|constraint|role|user|trigger|function)\b/i,
  /\bdelete\s+from\b(?![\s\S]*\bwhere\b)/i,
  /prisma\s+migrate\s+reset\b/i,
  /--force-reset\b/i,
];
const CLIENT_GATED_DESTRUCTIVE = [
  /\btruncate\b/i,
  /\bupdate\b[\s\S]*\bset\b(?![\s\S]*\bwhere\b)/i,
];

function isRealEnvPath(value) {
  if (typeof value !== "string") return false;
  const clean = value.trim().replace(/["']/g, "");
  return REAL_ENV.test(clean) && !ALLOWED_ENV.test(clean);
}

function bashTouchesRealEnv(command) {
  if (typeof command !== "string") return false;
  return command
    .split(/[\s;|&()<>]+/)
    .some((token) => isRealEnvPath(token));
}

function bashDestructiveDb(command) {
  if (typeof command !== "string") return false;
  if (STRONG_DESTRUCTIVE.some((re) => re.test(command))) return true;
  if (DB_CLIENT.test(command) && CLIENT_GATED_DESTRUCTIVE.some((re) => re.test(command))) {
    return true;
  }
  return false;
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

if (toolName === "Read" || toolName === "Edit" || toolName === "Write") {
  if (isRealEnvPath(toolInput.file_path)) deny(ENV_MESSAGE);
}

if (toolName === "Grep" || toolName === "Glob") {
  if (
    isRealEnvPath(toolInput.path) ||
    isRealEnvPath(toolInput.glob) ||
    isRealEnvPath(toolInput.pattern)
  ) {
    deny(ENV_MESSAGE);
  }
}

if (toolName === "Bash") {
  const command = toolInput.command ?? "";
  if (bashTouchesRealEnv(command)) deny(ENV_MESSAGE);
  if (bashDestructiveDb(command)) deny(DB_MESSAGE);
}

process.exit(0);
