import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PORT, HOST, CLAUDE_DIR } from "./config.js";
import { snapshot, assinar, receberEvento, definirDemo } from "./escritorio.js";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

const json = (res, dados, status = 200) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(dados));
};
const ehLocal = (req) => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);

function lerCorpo(req, limite = 1_000_000) {
  return new Promise((ok, erro) => {
    let dados = "";
    req.setEncoding("utf8");
    req.on("data", (c) => { dados += c; if (dados.length > limite) { erro(new Error("corpo grande demais")); req.destroy(); } });
    req.on("end", () => ok(dados));
    req.on("error", erro);
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  // Estado ao vivo para a página (Server-Sent Events)
  if (url.pathname === "/api/stream") {
    res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache", Connection: "keep-alive" });
    const enviar = (s) => res.write(`event: snapshot\ndata: ${JSON.stringify(s)}\n\n`);
    enviar(snapshot());
    const sair = assinar(enviar);
    const ping = setInterval(() => res.write(": ping\n\n"), 20_000);
    req.on("close", () => { sair(); clearInterval(ping); });
    return;
  }

  if (url.pathname === "/api/snapshot") return json(res, snapshot());
  if (url.pathname === "/api/health") return json(res, { ok: true, claudeDir: CLAUDE_DIR, ...snapshot() });

  // Eventos dos hooks e controles: só da própria máquina
  if (req.method === "POST" && (url.pathname === "/api/hook" || url.pathname === "/api/demo")) {
    if (!ehLocal(req)) return json(res, { erro: "Só aceito isso da própria máquina." }, 403);
    let corpo;
    try { corpo = JSON.parse(await lerCorpo(req) || "{}"); } catch { return json(res, { erro: "JSON inválido" }, 400); }
    if (url.pathname === "/api/hook") receberEvento(corpo);
    else definirDemo(!!corpo.enabled);
    return json(res, { ok: true });
  }

  // Arquivos da página
  if (req.method !== "GET" && req.method !== "HEAD") return json(res, { erro: "Método não suportado" }, 405);
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const alvo = path.resolve(PUBLIC, "." + rel);
  if (!alvo.startsWith(PUBLIC + path.sep)) return json(res, { erro: "Caminho inválido" }, 403);
  try {
    const dados = await fs.readFile(alvo);
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(alvo).toLowerCase()] || "application/octet-stream" });
    res.end(dados);
  } catch {
    json(res, { erro: "Não encontrado" }, 404);
  }
});

servidor.on("error", (e) => {
  if (e.code === "EADDRINUSE") console.error(`A porta ${PORT} já está em uso. Rode com outra porta: npm start -- --porta 4322`);
  else console.error(e);
  process.exit(1);
});

servidor.listen(PORT, HOST, () => {
  console.log(`Escritório aberto em http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`Pasta do Claude Code: ${CLAUDE_DIR}`);
  console.log(`Modo demonstração: ${snapshot().modoDemo}`);
});
