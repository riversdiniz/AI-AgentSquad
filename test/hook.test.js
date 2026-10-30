import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hook = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "hooks", "enviar-evento.js");

function rodarHook(evento, url) {
  return new Promise((ok) => {
    const inicio = Date.now();
    const p = spawn(process.execPath, [hook], { env: { ...process.env, ESCRITORIO_URL: url } });
    let saida = "";
    p.stdout.on("data", (d) => { saida += d; });
    p.stderr.on("data", (d) => { saida += d; });
    p.on("exit", (code) => ok({ code, saida, ms: Date.now() - inicio }));
    p.stdin.end(typeof evento === "string" ? evento : JSON.stringify(evento));
  });
}

describe("hook enviar-evento", () => {
  it("com o escritório desligado, sai rápido, sem erro e sem imprimir nada", async () => {
    const r = await rodarHook({ session_id: "x", hook_event_name: "Stop" }, "http://127.0.0.1:9");
    assert.equal(r.code, 0);
    assert.equal(r.saida, "");
    assert.ok(r.ms < 3000, `demorou ${r.ms} ms`);
  });

  it("com entrada inválida, também sai em silêncio", async () => {
    const r = await rodarHook("isso não é json", "http://127.0.0.1:9");
    assert.equal(r.code, 0);
    assert.equal(r.saida, "");
  });

  it("manda só o necessário: nada do prompt nem do conteúdo dos arquivos", async () => {
    let recebido;
    const srv = http.createServer((req, res) => {
      let corpo = "";
      req.on("data", (c) => { corpo += c; });
      req.on("end", () => { recebido = JSON.parse(corpo); res.end("{}"); });
    });
    await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
    const url = `http://127.0.0.1:${srv.address().port}`;
    const r = await rodarHook({
      session_id: "s", hook_event_name: "PreToolUse", cwd: "/p", tool_name: "Write", prompt: "segredo do prompt",
      tool_input: { file_path: "/p/a.txt", content: "conteúdo secreto" }, transcript_path: "/home/x/.claude/t.jsonl",
    }, url);
    srv.close();
    assert.equal(r.code, 0);
    assert.equal(recebido.tool_input.file_path, "/p/a.txt");
    const texto = JSON.stringify(recebido);
    assert.ok(!texto.includes("segredo do prompt"));
    assert.ok(!texto.includes("conteúdo secreto"));
    assert.ok(!texto.includes("transcript"));
  });
});
