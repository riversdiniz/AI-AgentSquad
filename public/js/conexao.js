/* =====================================================================
   DEMONSTRAÇÃO E SESSÕES REAIS (servidor)
   ===================================================================== */
function iniciarDemo() {
  if (state.agents.some(a => !a.real && a.leaving === 0 && a.status !== "saindo")) return;
  for (let i = 0; i < 5; i++) if (!criarAgente({ jaSentado: true })) break;
  const d = state.agents.filter(a => !a.real);
  // alguns ficam livres logo no começo, para a vida social aparecer
  [[1, 2.5], [2, 4], [3, 6]].forEach(([i, tm]) => { if (d[i]) { d[i].timer = tm; d[i]._forcarLivre = true; } });
  log("Demonstração ligada: estes agentes são fictícios.");
}
function pararDemo() {
  state.agents.filter(a => !a.real && a.status !== "saindo").forEach(a => encerrar(a, true));
  log("Demonstração desligada.");
}
function setDemo(on) { if (on === state.demo) return; state.demo = on; on ? iniciarDemo() : pararDemo(); state.uiDirty = true; }

function aplicarStatusReal(a, s) {
  if (a.status === "chegando") { a.pendente = s; return; }
  if (a.status === "saindo") return;
  if (s.status === a.status && s.tarefa === a.tarefa) return;
  if (s.status === "ocioso") { if (a.status !== "ocioso") ficarLivre(a, s.tarefa); else a.tarefa = s.tarefa; state.uiDirty = true; return; }
  setStatus(a, s.status, s.tarefa);
  const destino = a.path[a.path.length - 1];
  const indoPraMesa = destino && destino.x === a.desk.x && destino.y === a.desk.y;
  if (!a.atDesk && !indoPraMesa) voltarParaMesa(a);
}
function aplicarSnapshot(snap) {
  setDemo(!!snap.demo);
  const vistos = new Set();
  for (const s of snap.agentes) {
    vistos.add(s.id);
    let a = state.agents.find(x => x.sid === s.id && x.status !== "saindo");
    if (!a) {
      const pai = s.sub ? state.agents.find(x => x.sid === s.pai && x.status !== "saindo") : null;
      a = criarAgente({ sid: s.id, projeto: s.projeto, real: true, sub: !!s.sub, pai, descricao: s.descricao });
      if (a) a.pendente = s;
      continue;
    }
    a.projeto = s.projeto;
    aplicarStatusReal(a, s);
  }
  for (const a of state.agents) if (a.real && !vistos.has(a.sid) && a.status !== "saindo") a.sub ? entregar(a) : encerrar(a);
  state.uiDirty = true;
}
function conectar() {
  if (location.protocol === "file:" || !window.EventSource) { state.modo = "offline"; setDemo(true); return; }
  const es = new EventSource("/api/stream");
  es.addEventListener("snapshot", e => { state.modo = "servidor"; aplicarSnapshot(JSON.parse(e.data)); });
  es.onerror = () => {
    if (state.modo === "servidor") state.modo = "reconectando";
    else if (state.modo !== "reconectando") { state.modo = "offline"; setDemo(true); }
    state.uiDirty = true;
  };
}
$("btnDemo").addEventListener("click", () => {
  if (state.modo === "servidor") fetch("/api/demo", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ enabled: !state.demo }) });
  else setDemo(!state.demo);
});

window.escritorio = {
  adicionarAgente: criarAgente,
  agentes: () => state.agents,
  definirStatus: (id, status, texto) => { const a = state.agents.find(x => x.id === id); if (a) setStatus(a, status, texto); },
  hora: fase => { state.faseFixa = fase || null; state.uiDirty = true; },
};

prepararMoveis();
conectar();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!state.paused) update(dt * state.speed);
  draw(now / 1000);
  if (state.uiDirty) { state.uiDirty = false; renderUI(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
