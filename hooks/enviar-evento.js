#!/usr/bin/env node
/**
 * Hook do Claude Code: recebe o evento no stdin e repassa para o escritório.
 * Regras de ouro: nunca imprime nada (a saída de alguns hooks vira contexto do Claude),
 * nunca falha e nunca segura o Claude por mais de ~1 s, mesmo com o escritório fechado.
 * Marca usada pelo instalador: --escritorio-agentes
 */
import http from "node:http";

const alvo = new URL("/api/hook", process.env.ESCRITORIO_URL || "http://127.0.0.1:4321");
const sair = () => process.exit(0);
setTimeout(sair, 1200);

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => { entrada += c; });
process.stdin.on("error", sair);
process.stdin.on("end", () => {
  let ev;
  try { ev = JSON.parse(entrada); } catch { return sair(); }

  // Manda só o necessário: nada de conteúdo de arquivos ou do seu prompt.
  const ti = ev.tool_input || {};
  const enxuto = {
    session_id: ev.session_id,
    hook_event_name: ev.hook_event_name,
    cwd: ev.cwd,
    tool_name: ev.tool_name,
    tool_input: ti && {
      command: ti.command, description: ti.description, file_path: ti.file_path, notebook_path: ti.notebook_path,
      pattern: ti.pattern, query: ti.query, url: ti.url, subagent_type: ti.subagent_type, run_in_background: ti.run_in_background,
    },
    message: ev.message,
  };
  const corpo = JSON.stringify(enxuto);
  const req = http.request(alvo, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(corpo) },
    timeout: 800,
  }, (res) => { res.resume(); res.on("end", sair); });
  req.on("error", sair);
  req.on("timeout", () => { req.destroy(); sair(); });
  req.end(corpo);
});
