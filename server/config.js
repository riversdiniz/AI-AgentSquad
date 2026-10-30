import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};

/** Porta e endereço do servidor. Por padrão só aceita conexões da própria máquina. */
export const PORT = Number(arg("--porta") || process.env.PORT || 4321);
export const HOST = arg("--host") || process.env.HOST || "127.0.0.1";

/**
 * Pasta de configuração do Claude Code.
 * Linux/macOS: ~/.claude   Windows: C:\Users\<você>\.claude
 * Respeita CLAUDE_CONFIG_DIR, como o próprio Claude Code.
 */
export const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");

/**
 * Modo demonstração:
 *   auto  liga enquanto nenhuma sessão real aparecer (padrão)
 *   on    sempre ligado (npm run demo)
 *   off   sempre desligado
 */
export const DEMO = args.includes("--demo") ? "on" : (process.env.DEMO || "auto").toLowerCase();

/** Sessões sem nenhum evento por esse tempo saem do escritório (Claude fechado à força, por exemplo). */
export const SESSAO_EXPIRA_MIN = Number(process.env.SESSAO_EXPIRA_MIN || 180);
