import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const instalar = (dir, ...args) => spawnSync(process.execPath, [path.join(raiz, "scripts", "instalar-hooks.js"), ...args], {
  env: { ...process.env, CLAUDE_CONFIG_DIR: dir }, encoding: "utf8",
});
const pastaTemp = () => fs.mkdtempSync(path.join(os.tmpdir(), "aas-"));
const ler = (dir) => JSON.parse(fs.readFileSync(path.join(dir, "settings.json"), "utf8"));
const contarNossos = (s) => JSON.stringify(s).split("--escritorio-agentes").length - 1;

describe("instalador de hooks", () => {
  it("cria o settings.json quando não existe", () => {
    const dir = pastaTemp();
    assert.equal(instalar(dir).status, 0);
    assert.equal(contarNossos(ler(dir)), 7);
  });

  it("preserva o que já existia e não duplica ao rodar de novo", () => {
    const dir = pastaTemp();
    fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({
      model: "opus", hooks: { Stop: [{ hooks: [{ type: "command", command: "echo meu" }] }] },
    }));
    instalar(dir); instalar(dir);
    const s = ler(dir);
    assert.equal(s.model, "opus");
    assert.equal(contarNossos(s), 7);
    assert.ok(JSON.stringify(s.hooks.Stop).includes("echo meu"));
    assert.ok(fs.readdirSync(dir).some((f) => f.startsWith("settings.json.bak-escritorio-")), "faz backup");
  });

  it("usa barras normais no caminho do hook, também no Windows", () => {
    const dir = pastaTemp();
    instalar(dir);
    const cmd = ler(dir).hooks.SessionStart[0].hooks[0].command;
    assert.ok(!cmd.includes("\\"), cmd);
    assert.match(cmd, /^node ".+\/hooks\/enviar-evento\.js" --escritorio-agentes$/);
  });

  it("--remover tira só os hooks do escritório", () => {
    const dir = pastaTemp();
    fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: "command", command: "echo meu" }] }] } }));
    instalar(dir);
    instalar(dir, "--remover");
    const s = ler(dir);
    assert.equal(contarNossos(s), 0);
    assert.deepEqual(Object.keys(s.hooks), ["Stop"]);
  });

  it("não mexe em um settings.json inválido", () => {
    const dir = pastaTemp();
    fs.writeFileSync(path.join(dir, "settings.json"), "{ isso não é json");
    const r = instalar(dir);
    assert.equal(r.status, 1);
    assert.equal(fs.readFileSync(path.join(dir, "settings.json"), "utf8"), "{ isso não é json");
  });
});
