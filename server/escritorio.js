import { DEMO, SESSAO_EXPIRA_MIN } from "./config.js";

/** Estado do escritório: uma entrada por sessão do Claude Code. */
const sessoes = new Map();
const ouvintes = new Set();
let modoDemo = DEMO;

export function snapshot() {
  return {
    demo: modoDemo === "on" || (modoDemo === "auto" && sessoes.size === 0),
    modoDemo,
    agentes: [...sessoes.values()].map(({ id, projeto, status, tarefa, desde }) => ({ id, projeto, status, tarefa, desde })),
  };
}

export function assinar(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

function emitir() {
  const s = snapshot();
  for (const fn of ouvintes) {
    try { fn(s); } catch { /* conexão fechada */ }
  }
}

export function definirDemo(ligado) {
  modoDemo = ligado ? "on" : "off";
  emitir();
}

/** Nome da pasta do projeto, funcionando com caminhos de Linux e de Windows. */
const pasta = (cwd) => (cwd ? String(cwd).split(/[\\/]/).filter(Boolean).pop() : null) || "projeto";
const arquivo = (p) => (p ? String(p).split(/[\\/]/).filter(Boolean).pop() : "um arquivo");
const curto = (txt, n = 60) => {
  const s = String(txt || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

/** Transforma a ferramenta que o Claude vai usar numa frase curta. */
function descreverFerramenta(nome, input = {}) {
  switch (nome) {
    case "Bash": return input.description ? curto(input.description) : `Rodando ${curto(input.command, 50)}`;
    case "Read": return `Lendo ${arquivo(input.file_path)}`;
    case "Edit":
    case "MultiEdit": return `Editando ${arquivo(input.file_path)}`;
    case "Write": return `Escrevendo ${arquivo(input.file_path)}`;
    case "NotebookEdit": return `Editando o notebook ${arquivo(input.notebook_path)}`;
    case "Grep": return `Buscando “${curto(input.pattern, 30)}” no projeto`;
    case "Glob": return `Procurando arquivos ${curto(input.pattern, 30)}`;
    case "WebFetch": return "Lendo uma página da web";
    case "WebSearch": return `Pesquisando “${curto(input.query, 40)}”`;
    case "Task":
    case "Agent": return input.description ? `Chamou um subagente: ${curto(input.description, 40)}` : "Chamou um subagente";
    case "TodoWrite": return "Atualizando a lista de tarefas";
    default:
      if (nome && nome.startsWith("mcp__")) return `Usando ${nome.split("__").slice(1).join(" › ")}`;
      return nome ? `Usando ${nome}` : "Trabalhando";
  }
}

function traduzirAviso(msg = "") {
  const m = msg.match(/permission to use (.+)/i);
  if (m) return `Quer permissão para usar ${m[1].replace(/\.$/, "")}`;
  return curto(msg, 80) || "Precisa de uma resposta no terminal";
}

function mudar(s, status, tarefa) {
  if (s.status !== status) s.desde = Date.now();
  s.status = status;
  if (tarefa) s.tarefa = tarefa;
}

/** Recebe um evento dos hooks do Claude Code (o JSON que o hook recebe no stdin). */
export function receberEvento(ev) {
  const id = ev && ev.session_id;
  if (!id) return;
  const evento = ev.hook_event_name;
  let s = sessoes.get(id);

  if (evento === "SessionEnd") {
    if (s) { sessoes.delete(id); emitir(); }
    return;
  }
  if (!s) {
    s = { id, projeto: pasta(ev.cwd), status: "ocioso", tarefa: "Esperando o primeiro pedido", desde: Date.now() };
    sessoes.set(id, s);
  }
  if (ev.cwd) s.projeto = pasta(ev.cwd);
  s.visto = Date.now();

  switch (evento) {
    case "SessionStart": mudar(s, "ocioso", "Esperando o primeiro pedido"); break;
    case "UserPromptSubmit": mudar(s, "trabalhando", "Lendo o seu pedido"); break;
    case "PreToolUse": mudar(s, "trabalhando", descreverFerramenta(ev.tool_name, ev.tool_input || {})); break;
    case "PostToolUse": if (s.status === "precisa") mudar(s, "trabalhando", "Recebeu sua resposta e seguiu"); break;
    case "Notification": {
      const msg = ev.message || "";
      if (/waiting for your input/i.test(msg)) mudar(s, "ocioso", "Esperando o seu próximo pedido");
      else mudar(s, "precisa", traduzirAviso(msg));
      break;
    }
    case "Stop": mudar(s, "ocioso", "Terminou a vez e espera o próximo pedido"); break;
  }
  emitir();
}

/** Limpa sessões abandonadas. */
setInterval(() => {
  const limite = Date.now() - SESSAO_EXPIRA_MIN * 60_000;
  let mudou = false;
  for (const [id, s] of sessoes) if ((s.visto || s.desde) < limite) { sessoes.delete(id); mudou = true; }
  if (mudou) emitir();
}, 60_000).unref();
