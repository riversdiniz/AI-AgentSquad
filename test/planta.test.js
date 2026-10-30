import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// Carrega public/js/planta.js como no navegador e confere se a planta é válida.
// Se você redesenhar a PLANTA, estes testes avisam o que ficou errado.
const arquivo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "js", "planta.js");
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(arquivo, "utf8") + "\n;globalThis.__ = { PLANTA, DESKS, SPOTS, ELEVATOR, at, walkable };", ctx);
const { PLANTA, DESKS, SPOTS, ELEVATOR, at, walkable } = ctx.__;

function alcancaveis() {
  const vistos = new Set([`${ELEVATOR.x},${ELEVATOR.y}`]), fila = [ELEVATOR];
  while (fila.length) {
    const c = fila.shift();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x = c.x + dx, y = c.y + dy, k = `${x},${y}`;
      if (!vistos.has(k) && walkable(x, y)) { vistos.add(k); fila.push({ x, y }); }
    }
  }
  return vistos;
}

describe("planta do escritório", () => {
  it("todas as linhas têm o mesmo tamanho", () => {
    const tamanhos = new Set(PLANTA.map((l) => l.length));
    assert.equal(tamanhos.size, 1, `linhas com tamanhos diferentes: ${[...tamanhos].join(", ")}`);
  });

  it("só usa caracteres da legenda", () => {
    const validos = new Set(".,_:;cD#EPWRKCFtoVSALIQG");
    PLANTA.forEach((linha, y) => [...linha].forEach((c, x) => assert.ok(validos.has(c), `caractere "${c}" desconhecido em x=${x}, y=${y}`)));
  });

  it("tem um elevador", () => {
    assert.equal(PLANTA.join("").split("E").length - 1, 1);
  });

  it("toda cadeira de mesa tem uma mesa logo abaixo", () => {
    assert.ok(DESKS.length > 0);
    for (const d of DESKS) assert.equal(at(d.x, d.y + 1), "D", `cadeira em x=${d.x}, y=${d.y} sem mesa embaixo`);
  });

  it("dá para chegar do elevador a todas as mesas e lugares", () => {
    const ok = alcancaveis();
    for (const d of DESKS) assert.ok(ok.has(`${d.x},${d.y}`), `mesa em x=${d.x}, y=${d.y} inacessível`);
    for (const s of SPOTS) assert.ok(ok.has(`${s.x},${s.y}`), `${s.tipo} em x=${s.x}, y=${s.y} inacessível`);
  });

  it("tem pelo menos um lugar para cada atividade de vida social", () => {
    const tipos = new Set(SPOTS.map((s) => s.tipo));
    for (const t of ["cafe", "conversa", "futebol", "games", "pingpong", "espelho"]) assert.ok(tipos.has(t), `falta lugar para ${t}`);
  });
});
