import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = 4400 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${PORTA}`;
let servidor;

describe("servidor", () => {
  before(async () => {
    servidor = spawn(process.execPath, [path.join(raiz, "server", "index.js"), "--porta", String(PORTA)], { stdio: ["ignore", "pipe", "pipe"] });
    await new Promise((ok, erro) => {
      servidor.stdout.on("data", (d) => { if (String(d).includes("Escritório aberto")) ok(); });
      servidor.on("exit", (c) => erro(new Error("servidor saiu com código " + c)));
    });
  });
  after(() => servidor.kill());

  it("entrega a página", async () => {
    const r = await fetch(base + "/");
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /text\/html/);
    for (const arq of ["/css/escritorio.css", "/js/planta.js", "/js/conexao.js"]) assert.equal((await fetch(base + arq)).status, 200, arq);
  });

  it("recebe um evento do hook e mostra no snapshot", async () => {
    const r = await fetch(base + "/api/hook", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: "teste", cwd: "/x/meu-projeto", hook_event_name: "UserPromptSubmit" }) });
    assert.equal(r.status, 200);
    const snap = await (await fetch(base + "/api/snapshot")).json();
    const a = snap.agentes.find((x) => x.id === "teste");
    assert.equal(a.projeto, "meu-projeto");
    assert.equal(a.status, "trabalhando");
  });

  it("recusa JSON inválido", async () => {
    const r = await fetch(base + "/api/hook", { method: "POST", body: "{" });
    assert.equal(r.status, 400);
  });

  it("não deixa sair da pasta public", async () => {
    for (const caminho of ["/..%2fpackage.json", "/%2e%2e/server/config.js", "/js/..%2f..%2fpackage.json"]) {
      const r = await fetch(base + caminho);
      assert.notEqual(r.status, 200, caminho);
    }
  });
});
