/**
 * Instala (ou remove, com --remover) os hooks do escritório no settings.json do Claude Code.
 * Funciona no Linux, macOS e Windows. Faz backup antes de mexer e preserva seus outros hooks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLAUDE_DIR } from "../server/config.js";

const MARCA = "--escritorio-agentes";
const EVENTOS = ["SessionStart", "UserPromptSubmit", "PreToolUse", "PostToolUse", "Notification", "Stop", "SessionEnd"];
const COM_MATCHER = new Set(["PreToolUse", "PostToolUse"]);

const remover = process.argv.includes("--remover");
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Barras normais funcionam no Windows e evitam problemas de escape no JSON
const hook = path.join(raiz, "hooks", "enviar-evento.js").replace(/\\/g, "/");
const comando = `node "${hook}" ${MARCA}`;
const arquivo = path.join(CLAUDE_DIR, "settings.json");

let settings = {};
if (fs.existsSync(arquivo)) {
  const texto = fs.readFileSync(arquivo, "utf8");
  try {
    settings = texto.trim() ? JSON.parse(texto) : {};
  } catch {
    console.error(`Não consegui ler ${arquivo}: o JSON está inválido. Corrija o arquivo e rode de novo.`);
    process.exit(1);
  }
  const backup = `${arquivo}.bak-escritorio-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  fs.copyFileSync(arquivo, backup);
  console.log(`Backup salvo em ${backup}`);
}

settings.hooks = settings.hooks || {};
for (const ev of EVENTOS) {
  let grupos = (settings.hooks[ev] || [])
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !String(h.command || "").includes(MARCA)) }))
    .filter((g) => g.hooks.length);
  if (!remover) {
    const grupo = { hooks: [{ type: "command", command: comando, timeout: 5 }] };
    if (COM_MATCHER.has(ev)) grupo.matcher = "*";
    grupos.push(grupo);
  }
  if (grupos.length) settings.hooks[ev] = grupos;
  else delete settings.hooks[ev];
}
if (!Object.keys(settings.hooks).length) delete settings.hooks;

fs.mkdirSync(CLAUDE_DIR, { recursive: true });
fs.writeFileSync(arquivo, JSON.stringify(settings, null, 2) + "\n");

if (remover) {
  console.log(`Hooks do escritório removidos de ${arquivo}.`);
} else {
  console.log(`Hooks instalados em ${arquivo}`);
  console.log(`Comando: ${comando}`);
  console.log("Abra uma sessão nova do Claude Code para os hooks valerem. Se ele pedir, revise-os em /hooks.");
}
