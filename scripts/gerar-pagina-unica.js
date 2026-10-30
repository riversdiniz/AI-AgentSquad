/**
 * Junta public/index.html, o CSS e os scripts num único arquivo HTML (dist/ai-agentsquad.html).
 * Útil para mandar o escritório para alguém ou publicar só a demonstração.
 * Uso: npm run build:unico
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(raiz, "public");
let html = fs.readFileSync(path.join(pub, "index.html"), "utf8");

html = html.replace(/<link rel="stylesheet" href="([^"]+\.css)">/g, (_, arq) =>
  `<style>\n${fs.readFileSync(path.join(pub, arq), "utf8")}</style>`);
html = html.replace(/<script src="([^"]+\.js)"><\/script>/g, (_, arq) =>
  `<script>\n${fs.readFileSync(path.join(pub, arq), "utf8").replace(/<\/script/gi, "<\\/script")}</script>`);

fs.mkdirSync(path.join(raiz, "dist"), { recursive: true });
const saida = path.join(raiz, "dist", "ai-agentsquad.html");
fs.writeFileSync(saida, html);
console.log(`Página única gerada em ${saida} (${Math.round(html.length / 1024)} KB)`);
