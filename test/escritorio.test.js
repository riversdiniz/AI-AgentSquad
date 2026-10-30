import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { receberEvento, snapshot, reiniciar, definirDemo } from "../server/escritorio.js";

const sessao = (extra) => receberEvento({ session_id: "s1", cwd: "/home/river/projetos/loja", ...extra });
const agente = (id = "s1") => snapshot().agentes.find((a) => a.id === id);

describe("tradução dos eventos do Claude Code", () => {
  beforeEach(reiniciar);

  it("SessionStart cria o agente livre, com o nome da pasta como projeto", () => {
    sessao({ hook_event_name: "SessionStart" });
    assert.equal(agente().status, "ocioso");
    assert.equal(agente().projeto, "loja");
  });

  it("entende caminhos do Windows", () => {
    receberEvento({ session_id: "w", cwd: "C:\\Users\\river\\projetos\\api", hook_event_name: "SessionStart" });
    assert.equal(agente("w").projeto, "api");
  });

  it("UserPromptSubmit e PreToolUse colocam o agente para trabalhar", () => {
    sessao({ hook_event_name: "UserPromptSubmit" });
    assert.equal(agente().status, "trabalhando");
    sessao({ hook_event_name: "PreToolUse", tool_name: "Edit", tool_input: { file_path: "/x/src/app.ts" } });
    assert.equal(agente().tarefa, "Editando app.ts");
  });

  it("descreve as ferramentas mais comuns", () => {
    const casos = [
      ["Read", { file_path: "C:\\proj\\README.md" }, "Lendo README.md"],
      ["Bash", { command: "npm test" }, "Rodando npm test"],
      ["Bash", { command: "npm test", description: "Rodando os testes" }, "Rodando os testes"],
      ["Grep", { pattern: "useAuth" }, "Buscando “useAuth” no projeto"],
      ["mcp__github__create_issue", {}, "Usando github › create_issue"],
    ];
    for (const [tool_name, tool_input, esperado] of casos) {
      sessao({ hook_event_name: "PreToolUse", tool_name, tool_input });
      assert.equal(agente().tarefa, esperado);
    }
  });

  it("pedido de permissão vira 'precisa' e a resposta volta ao trabalho", () => {
    sessao({ hook_event_name: "Notification", message: "Claude needs your permission to use Bash" });
    assert.equal(agente().status, "precisa");
    assert.equal(agente().tarefa, "Quer permissão para usar Bash");
    sessao({ hook_event_name: "PostToolUse", tool_name: "Bash" });
    assert.equal(agente().status, "trabalhando");
  });

  it("aviso de espera por resposta deixa o agente livre", () => {
    sessao({ hook_event_name: "Notification", message: "Claude is waiting for your input" });
    assert.equal(agente().status, "ocioso");
  });

  it("Stop libera e SessionEnd tira do escritório", () => {
    sessao({ hook_event_name: "UserPromptSubmit" });
    sessao({ hook_event_name: "Stop" });
    assert.equal(agente().status, "ocioso");
    sessao({ hook_event_name: "SessionEnd" });
    assert.equal(agente(), undefined);
  });

  it("ignora eventos sem session_id", () => {
    receberEvento({ hook_event_name: "SessionStart" });
    assert.equal(snapshot().agentes.length, 0);
  });
});

describe("subagentes", () => {
  beforeEach(reiniciar);

  it("Task cria um subagente ligado a quem chamou e some ao terminar", () => {
    sessao({ hook_event_name: "PreToolUse", tool_name: "Task", tool_use_id: "t1", tool_input: { description: "Explorar o projeto", subagent_type: "Explore" } });
    const sub = agente("s1:t1");
    assert.equal(sub.sub, true);
    assert.equal(sub.pai, "s1");
    assert.equal(agente().tarefa, "Esperando o subagente: Explorar o projeto");

    sessao({ hook_event_name: "PreToolUse", tool_name: "Read", tool_input: { file_path: "/x/a.js" } });
    assert.equal(agente("s1:t1").tarefa, "Lendo a.js", "as ferramentas vão para o subagente");

    sessao({ hook_event_name: "PostToolUse", tool_name: "Task", tool_use_id: "t1" });
    assert.equal(agente("s1:t1"), undefined);
    assert.equal(agente().tarefa, "Recebeu o resultado do subagente");
  });

  it("vários subagentes ao mesmo tempo terminam na ordem certa", () => {
    sessao({ hook_event_name: "PreToolUse", tool_name: "Task", tool_use_id: "a", tool_input: { description: "A" } });
    sessao({ hook_event_name: "PreToolUse", tool_name: "Agent", tool_use_id: "b", tool_input: { description: "B" } });
    assert.equal(agente().tarefa, "Esperando 2 subagentes");
    sessao({ hook_event_name: "PostToolUse", tool_name: "Agent", tool_use_id: "b" });
    assert.ok(agente("s1:a"));
    assert.equal(agente("s1:b"), undefined);
  });

  it("Stop encerra subagentes que ficaram para trás", () => {
    sessao({ hook_event_name: "PreToolUse", tool_name: "Task", tool_use_id: "t1", tool_input: {} });
    sessao({ hook_event_name: "Stop" });
    assert.equal(snapshot().agentes.length, 1);
  });
});

describe("modo demonstração", () => {
  beforeEach(reiniciar);

  it("no modo automático, liga sem sessões e desliga quando a primeira chega", () => {
    assert.equal(snapshot().demo, true);
    sessao({ hook_event_name: "SessionStart" });
    assert.equal(snapshot().demo, false);
  });

  it("pode ser ligado ou desligado à força", () => {
    definirDemo(false);
    assert.equal(snapshot().demo, false);
    definirDemo(true);
    sessao({ hook_event_name: "SessionStart" });
    assert.equal(snapshot().demo, true);
  });
});
