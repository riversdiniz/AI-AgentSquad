/* =====================================================================
   INTERFACE
   ===================================================================== */
const $ = id => document.getElementById(id);
function log(html, kind = "") {
  const li = document.createElement("li");
  li.innerHTML = `<time>${new Date().toLocaleTimeString("pt-BR")}</time><span>${html}</span>`;
  if (kind === "alert") li.style.color = "var(--alert)";
  $("feed").prepend(li);
  while ($("feed").children.length > 60) $("feed").lastChild.remove();
}

function renderUI() {
  const ag = state.agents.filter(a => a.leaving === 0);
  const n = st => ag.filter(a => a.status === st).length;
  const precisam = n("precisa");
  $("counters").innerHTML = `
    <span class="chip"><b>${ag.length}</b> no escritório</span>
    <span class="chip"><b>${n("trabalhando") + n("shell")}</b> trabalhando</span>
    <span class="chip ${precisam ? "alert" : ""}"><b>${precisam}</b> precisam de você</span>
    <span class="chip"><b>${n("ocioso")}</b> livres</span>`;

  $("list").innerHTML = ag.length ? ag.map(a => `
    <li><button data-id="${a.id}" aria-pressed="${a.id === state.selected}">
      <span class="swatch" style="background:${a.pal.shirt}"></span>
      <span class="who">${a.nome}<small>${a.sub ? `subagente${a.pai ? " de " + a.pai.nome : ""}` : a.projeto}</small></span>
      <span class="pill s-${a.status}">${STATUS_TXT[a.status]}</span>
    </button></li>`).join("") : `<li class="empty">Ninguém por aqui. Abra o Claude Code ou ligue a demonstração.</li>`;

  const a = state.agents.find(x => x.id === state.selected);
  if (!a) {
    $("details").innerHTML = `<h2>Detalhes</h2><p class="empty">Clique em um agente na sala ou na lista para ver o que ele está fazendo.</p>`;
  } else {
    let acoes = "";
    if (a.real) acoes = a.status === "precisa" ? `<p class="empty">Responda no terminal do Claude Code.</p>` : a.status === "ocioso" ? `<p class="empty">Mande o próximo pedido pelo terminal.</p>` : "";
    else if (a.status === "precisa") acoes = `<button class="btn primary" data-act="aprovar">Aprovar</button><button class="btn" data-act="negar">Negar</button>`;
    else if (a.status === "ocioso") acoes = `<button class="btn primary" data-act="instrucao">Enviar instrução</button><button class="btn danger" data-act="encerrar">Encerrar sessão</button>`;
    else if (a.sub) acoes = "";
    else if (a.status === "trabalhando" || a.status === "shell") acoes = `<button class="btn danger" data-act="encerrar">Encerrar sessão</button>`;
    const agora = a.status === "ocioso" && a.spot ? `Foi ${ATIVIDADE_TXT[a.spot.tipo]}` : (a.status === "shell" ? `Esperando <code>${a.tarefa}</code>` : a.tarefa);
    $("details").innerHTML = `
      <h2>${a.nome}</h2>
      <p><span class="pill s-${a.status}">${STATUS_TXT[a.status]}</span></p>
      <span class="label">Projeto</span><p><code>${a.projeto}</code></p>
      <span class="label">Origem</span><p>${a.sub ? `Subagente${a.pai ? " de " + a.pai.nome : ""}${a.real ? "" : " (demonstração)"}` : a.real ? "Sessão do Claude Code" : "Demonstração"}</p>
      ${a.sub && a.descricao ? `<span class="label">Tarefa recebida</span><p>${a.descricao}</p>` : ""}
      <span class="label">Agora</span><p>${agora}</p>
      <span class="label">Jeito</span><p>${a.jeito}</p>
      <div class="actions">${acoes}</div>`;
  }

  const waiting = ag.filter(a => a.status === "precisa");
  $("toast").innerHTML = waiting.map(a => `<button data-id="${a.id}">✋ ${a.nome} precisa de você: ${a.tarefa}</button>`).join("");
  $("btnAdd").disabled = !freeDesk();
  $("btnAdd").hidden = !state.demo;
  $("btnDemo").textContent = state.demo ? "Desligar demonstração" : "Ligar demonstração";
  document.title = precisam ? `(${precisam}) ✋ AI AgentSquad` : "AI AgentSquad";
  $("btnAvisos").textContent = state.avisos ? "Avisos ligados" : "Avisos desligados";
  $("btnAvisos").setAttribute("aria-pressed", String(!!state.avisos));
  $("btnHora").textContent = `Hora: ${state.faseFixa ? FASES[state.faseFixa].nome : "automática"}`;
  const reais = ag.filter(x => x.real && !x.sub).length;
  $("sub").textContent = state.modo === "servidor"
    ? (reais ? `Conectado ao Claude Code: ${reais} ${reais > 1 ? "sessões abertas" : "sessão aberta"}.` : "Conectado. Abra o Claude Code em algum projeto para os agentes aparecerem.") + (state.demo ? " Agentes da demonstração são fictícios." : "")
    : state.modo === "reconectando" ? "Conexão com o servidor caiu. Tentando de novo…"
    : state.modo === "offline" ? "Sem servidor: só a demonstração está rodando. Use npm start para ver o Claude Code."
    : "Conectando ao servidor…";
}

$("list").addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) { state.selected = +b.dataset.id; state.uiDirty = true; } });
$("toast").addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) focarAgente(+b.dataset.id); });

/* Leva a câmera até o agente (quando ela está aproximada) e o seleciona */
function focarAgente(id) {
  const a = state.agents.find(x => x.id === id);
  if (!a) return;
  state.selected = id; state.uiDirty = true;
  if (cam.zoom > 1) { const c = P(a.px, a.py, 30); cam.cx = c.x; cam.cy = c.y; }
}

/* =====================================================================
   AVISOS: som e notificação quando um agente real precisa de você
   ===================================================================== */
let audio = null;
try { state.avisos = localStorage.getItem("aas-avisos") === "1"; } catch { state.avisos = false; }
function tocarAviso() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    [[880, 0], [1175, 0.16]].forEach(([freq, t0]) => {
      const o = audio.createOscillator(), v = audio.createGain(), t = audio.currentTime + t0;
      o.type = "square"; o.frequency.value = freq;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.06, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 0.15);
    });
  } catch { /* sem áudio, sem problema */ }
}
function avisar(a) {
  if (!a.real || !state.avisos) return;     // a demonstração não apita
  tocarAviso();
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    const n = new Notification(`${a.nome} precisa de você`, { body: `${a.tarefa}\n${a.projeto}`, tag: "aas-" + a.id });
    n.onclick = () => { window.focus(); focarAgente(a.id); n.close(); };
  }
}
$("btnAvisos").addEventListener("click", async () => {
  state.avisos = !state.avisos;
  try { localStorage.setItem("aas-avisos", state.avisos ? "1" : "0"); } catch {}
  if (state.avisos) {
    if ("Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch {} }
    tocarAviso();
  }
  state.uiDirty = true;
});
$("details").addEventListener("click", e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const a = state.agents.find(x => x.id === state.selected);
  ({ aprovar: () => responder(a, true), negar: () => responder(a, false), instrucao: () => enviarInstrucao(a), encerrar: () => encerrar(a) })[b.dataset.act]();
  state.uiDirty = true;
});
$("btnAdd").addEventListener("click", () => { const a = criarAgente(); if (a) state.selected = a.id; });
$("btnPause").addEventListener("click", () => { state.paused = !state.paused; $("btnPause").textContent = state.paused ? "Continuar" : "Pausar"; });
$("btnSpeed").addEventListener("click", () => { state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 4 : 1; $("btnSpeed").textContent = `Velocidade ${state.speed}×`; });
$("btnHora").addEventListener("click", () => {
  const ordem = [null, "dia", "entardecer", "noite"];
  state.faseFixa = ordem[(ordem.indexOf(state.faseFixa) + 1) % ordem.length];
  state.uiDirty = true;
});
const ZOOMS = [1, 1.5, 2, 3, 4];
const zoomPara = (z, foco) => {
  const k = camInfo();
  if (foco) { const a = toArt(foco.x, foco.y, k); cam.cx = a.x; cam.cy = a.y; }
  cam.zoom = z;
};
$("btnZoomIn").addEventListener("click", () => zoomPara(ZOOMS.find(z => z > cam.zoom) || cam.zoom));
$("btnZoomOut").addEventListener("click", () => zoomPara([...ZOOMS].reverse().find(z => z < cam.zoom) || 1));
$("btnFit").addEventListener("click", () => { cam.zoom = 1; cam.cx = LW / 2; cam.cy = LH / 2; });

function agentAt(px, py) {
  const k = camInfo(), p = toArt(px, py, k);
  const ordered = [...state.agents].sort((p1, q) => profundidade(q.px, q.py) - profundidade(p1.px, p1.py));
  return ordered.find(a => {
    const c = P(a.px, a.py), seat = a.sitting ? (a.seatH || 14) : 0, h = a.sitting ? 44 : 56;
    return p.x > c.x - 14 && p.x < c.x + 14 && p.y > c.y - seat - h && p.y < c.y + 8;
  });
}
const pos = ev => { const r = view.getBoundingClientRect(); const d = view.width / r.width; return { x: (ev.clientX - r.left) * d, y: (ev.clientY - r.top) * d }; };
let drag = null;
view.addEventListener("pointerdown", ev => { drag = { ...pos(ev), moved: 0 }; view.setPointerCapture(ev.pointerId); });
view.addEventListener("pointermove", ev => {
  const p = pos(ev);
  if (drag) {
    const k = camInfo(), dx = p.x - drag.x, dy = p.y - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 6) { view.classList.add("dragging"); cam.cx -= dx / k.s; cam.cy -= dy / k.s; }
    drag.x = p.x; drag.y = p.y;
  } else view.style.cursor = agentAt(p.x, p.y) ? "pointer" : "";
});
view.addEventListener("pointerup", ev => {
  const p = pos(ev);
  if (drag && drag.moved <= 6) { const a = agentAt(p.x, p.y); state.selected = a ? a.id : null; state.uiDirty = true; }
  drag = null; view.classList.remove("dragging");
});
view.addEventListener("dblclick", ev => zoomPara(cam.zoom >= 2 ? 1 : 2, pos(ev)));

function resize() {
  const dpr = window.devicePixelRatio || 1, w = $("stage").clientWidth;
  const h = Math.max(w * LH / LW, Math.min(420, w * 0.9));
  view.width = Math.round(w * dpr); view.height = Math.round(h * dpr);
  view.style.height = h + "px";
}
new ResizeObserver(resize).observe($("stage"));
resize();
