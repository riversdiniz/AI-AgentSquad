/**
 * Simula uma sessão do Claude Code passando pelo hook de verdade, sem precisar abrir o Claude.
 * Rode com o servidor ligado: npm start (em outro terminal) e depois npm run hooks:testar
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hook = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "hooks", "enviar-evento.js");
const sessao = "teste-" + Math.random().toString(36).slice(2, 8);
const cwd = process.cwd();
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function enviar(ev) {
  return new Promise((ok) => {
    const p = spawn(process.execPath, [hook], { stdio: ["pipe", "inherit", "inherit"] });
    p.on("exit", ok);
    p.stdin.end(JSON.stringify({ session_id: sessao, cwd, ...ev }));
  });
}

const passos = [
  ["SessionStart", {}],
  ["UserPromptSubmit", {}],
  ["PreToolUse", { tool_name: "Read", tool_input: { file_path: path.join(cwd, "package.json") } }],
  ["PreToolUse", { tool_name: "Edit", tool_input: { file_path: path.join(cwd, "server", "index.js") } }],
  ["Notification", { message: "Claude needs your permission to use Bash" }],
  ["PostToolUse", { tool_name: "Bash" }],
  ["PreToolUse", { tool_name: "Bash", tool_input: { command: "npm test", description: "Rodando os testes" } }],
  ["Stop", {}],
  ["SessionEnd", {}],
];

console.log(`Sessão de teste ${sessao}. Abra o escritório no navegador para acompanhar.`);
for (const [nome, extra] of passos) {
  console.log(`→ ${nome}`);
  await enviar({ hook_event_name: nome, ...extra });
  await espera(nome === "Notification" ? 6000 : nome === "Stop" ? 8000 : 3000);
}
console.log("Pronto.");
