/* =====================================================================
   DESENHO DE CADA QUADRO
   ===================================================================== */
function drawElevator() {
  const e = ELEVATOR.x, open = state.elevatorOpen > 0 ? Math.min(1, state.elevatorOpen * 3) : 0;
  quadY(0, e - 0.2, e + 1.2, 0, 92, "#6f7d84");
  quadY(0, e - 0.14, e + 1.14, 0, 88, "#8d9aa0");
  quadY(0, e + 0.04, e + 0.96, 0, 80, "#141b1e");
  if (open) quadY(0, e + 0.3, e + 0.7, 0, 80, "#f3e1a8");
  const half = 0.46 * (1 - open);
  quadY(0, e + 0.04, e + 0.04 + half, 0, 80, "#b9c4c9"); quadY(0, e + 0.96 - half, e + 0.96, 0, 80, "#aeb9be");
  if (half > 0.05) { quadY(0, e + 0.04 + half - 0.02, e + 0.04 + half, 0, 80, "#8b979c"); quadY(0, e + 0.96 - half, e + 0.98 - half, 0, 80, "#8b979c"); }
  quadY(0, e + 0.38, e + 0.62, 83, 87, "#2b3236");
  quadY(0, e + 0.42, e + 0.58, 84, 86, open ? "#57d38c" : "#e3a32f");
  prism(e + 1.18, 0, 0.08, 0.06, 40, 12, "#5d6a70", { edge:false });
}

function bolinha(t) {
  if (!state.pp) return null;
  const mesa = SPOTS.filter(s => s.tipo === "pingpong");
  if (mesa.length < 2) return null;
  const [s1, s2] = mesa.sort((p, q) => p.x - q.x);
  const u = (t * 0.9) % 2, f = u < 1 ? u : 2 - u;
  const x = s1.x + 0.9 + f * (s2.x - s1.x - 0.8), y = s1.y + 0.5;
  const z = 30 + 18 * Math.abs(Math.sin(f * Math.PI * 2));
  return { x, y, z };
}

const DIA_LUZES = [];
function luzDoDia(F) {
  if (F.noite) return;
  g.globalCompositeOperation = "lighter";
  const cor = F.dark ? "rgba(255,170,90,.10)" : "rgba(255,246,220,.09)";
  for (const [a, b] of JANELAS_FUNDO) fillPoly([P(a, 0.05), P(b, 0.05), P(b + 1.2, 3.2), P(a + 1.2, 3.2)], cor);
  for (const [a, b] of JANELAS_LADO) fillPoly([P(0.05, a), P(0.05, b), P(3.2, b + 1.2), P(3.2, a + 1.2)], cor);
  g.globalCompositeOperation = "source-over";
}

/* Lâmpadas de teto: uma a cada 4 tiles, por cômodo */
const LAMPADAS = [];
for (let y = 2; y < ROWS; y += 4) for (let x = 2; x < COLS; x += 4) {
  const c = at(x, y); if (c === "#") continue;
  LAMPADAS.push({ x: x + 0.5, y: y + 0.5, zona: floorOf(x, y), r: 190 });
}
function brilho(ctx, wx, wy, r, rgb, k, z = 24) {
  const p = P(wx, wy, z);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.62);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, `rgba(${rgb},${k})`); gr.addColorStop(0.55, `rgba(${rgb},${k * 0.55})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function aplicarLuz(t, F) {
  if (!F.dark) return;
  lg.globalCompositeOperation = "source-over";
  lg.clearRect(0, 0, LW, LH);
  lg.fillStyle = `rgba(8,12,34,${F.dark})`;
  lg.fillRect(0, 0, LW, LH);
  lg.globalCompositeOperation = "destination-out";
  const acesas = [];
  for (const L of LAMPADAS) { const k = state.luz[L.zona]; if (k > 0.02) acesas.push({ x:L.x, y:L.y, r:L.r, k, cor:"255,196,130", z:40 }); }
  for (const L of LUZES_FIXAS) {
    if (L.dinamica) { const d = L.dinamica(t); if (d) acesas.push({ ...d, z: 30 }); }
    else acesas.push({ ...L, k: Math.max(0.55, state.luz[L.zona] || 0), cor:"255,206,140" });
  }
  for (const L of acesas) brilho(lg, L.x, L.y, L.r, "0,0,0", 0.95 * L.k, L.z);
  main.drawImage(lightCanvas, 0, 0);
  main.globalCompositeOperation = "lighter";
  for (const L of acesas) brilho(main, L.x, L.y, L.r * 0.8, L.cor, 0.13 * L.k, L.z);
  main.globalCompositeOperation = "source-over";
  if (F.tint) { main.fillStyle = F.tint; main.fillRect(0, 0, LW, LH); }
}

function draw(t) {
  atualizarFundo();
  const F = FASES[faseAtual()];
  g = main;
  g.clearRect(0, 0, LW, LH);
  g.drawImage(bg, 0, 0);
  luzDoDia(F);
  drawElevator();

  const sel = state.agents.find(a => a.id === state.selected);
  if (sel) { const tl = tileOf(sel); tileDiamond(tl.x, tl.y, "rgba(227,163,47,.5)"); }

  const items = MOV.slice();
  for (const a of state.agents) items.push({ depth: profundidade(a.px, a.py), kind: 1, dyn: () => drawAgent(a, t) });
  const b = bolinha(t);
  if (b) items.push({ depth: profundidade(b.x, b.y) + 0.2, kind: 2, dyn: () => { const p = P(b.x, b.y, b.z), s = P(b.x, b.y, 25.5); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(Math.round(s.x) - 2, Math.round(s.y), 4, 1); g.fillStyle = "#fff8e8"; g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3); } });
  items.sort((p, q) => p.depth - q.depth || p.kind - q.kind);
  for (const it of items) { if (it.img) g.drawImage(it.img, it.ix, it.iy); else it.dyn(t); }

  if (F.dark) aplicarLuz(t, F);
  else if (F.tint) { g.fillStyle = F.tint; g.fillRect(0, 0, LW, LH); }

  apresentar(t);
}

/* =====================================================================
   CÂMERA: ajustar, aproximar e arrastar
   ===================================================================== */
const cam = { zoom: 1, cx: LW / 2, cy: LH / 2 };   // zoom 1 = ver tudo
let stageColor = "#28373d";
const readStage = () => { stageColor = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim() || "#28373d"; };
readStage();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readStage);

function camInfo() {
  const fit = Math.min(view.width / LW, view.height / LH);
  let s = fit * cam.zoom;
  if (s >= 1.5) s = Math.round(s);
  const hw = view.width / 2 / s, hh = view.height / 2 / s;
  let cx = cam.cx, cy = cam.cy;
  cx = hw * 2 >= LW ? LW / 2 : Math.max(hw, Math.min(LW - hw, cx));
  cy = hh * 2 >= LH ? LH / 2 : Math.max(hh, Math.min(LH - hh, cy));
  cam.cx = cx; cam.cy = cy;
  return { s, cx, cy };
}
const toScreen = (ax, ay, k) => ({ x: (ax - k.cx) * k.s + view.width / 2, y: (ay - k.cy) * k.s + view.height / 2 });
const toArt = (sx, sy, k) => ({ x: (sx - view.width / 2) / k.s + k.cx, y: (sy - view.height / 2) / k.s + k.cy });

function bubbleFor(a, t) {
  if (a.leaving > 0) return null;
  switch (a.status) {
    case "chegando": return { icon: "👋" };
    case "saindo": return a.entregando || !a.sub ? { icon: "📦" } : { icon: "👋" };
    case "trabalhando": return a.atDesk ? { icon: "⌨️" } : null;
    case "precisa": return { icon: "✋", alert: true, blink: Math.sin(t * 7) > 0 };
    case "shell": return { icon: state.time - a.since > 6 ? "🍿" : "⏳" };
    case "ocioso":
      if (!(a.spot && a.arrived)) return null;
      if (a.spot.tipo === "conversa") return { icon: Math.sin(t * 0.8 + a.seed * 3) > 0.3 ? "😂" : "💬" };
      if (a.spot.tipo === "futebol" && state.gol > 0) return { icon: "🎉" };
      return { icon: ICONES[a.spot.tipo] };
  }
  return null;
}

function apresentar(t) {
  const k = camInfo();
  vg.setTransform(1, 0, 0, 1, 0, 0);
  vg.fillStyle = stageColor; vg.fillRect(0, 0, view.width, view.height);
  vg.imageSmoothingEnabled = k.s < 1;
  vg.imageSmoothingQuality = "high";
  const o = toScreen(0, 0, k);
  vg.drawImage(low, Math.round(o.x), Math.round(o.y), Math.round(LW * k.s), Math.round(LH * k.s));

  const dpr = window.devicePixelRatio || 1;
  const u = Math.min(1.7 * dpr, Math.max(0.8 * dpr, k.s * 0.75));
  vg.textAlign = "center"; vg.textBaseline = "middle";
  const ordered = [...state.agents].sort((p, q) => profundidade(p.px, p.py) - profundidade(q.px, q.py));
  for (const a of ordered) {
    const c = P(a.px, a.py, 0);
    const seat = a.sitting ? (a.seatH || 14) : 0;
    const head = toScreen(c.x, c.y - seat - (a.sitting ? 40 : 55), k);
    const foot = toScreen(c.x, c.y + 8, k);
    const sel = a.id === state.selected;
    vg.font = `600 ${11 * u}px "Pixelify Sans", sans-serif`;
    const nw = vg.measureText(a.nome).width + 8 * u;
    vg.fillStyle = sel ? "#e3a32f" : "rgba(15,20,24,.75)";
    vg.fillRect(foot.x - nw / 2, foot.y - 7 * u, nw, 14 * u);
    vg.fillStyle = sel ? "#2a1d05" : "#ffffff";
    vg.fillText(a.nome, foot.x, foot.y + 0.5 * u);
    const b = bubbleFor(a, t);
    if (!b) continue;
    const r = 12 * u, bx = head.x, by = head.y - r - 4 * u;
    vg.fillStyle = b.alert && b.blink ? "#c9443d" : "#ffffff";
    vg.strokeStyle = b.alert ? "#c9443d" : "#1d292c"; vg.lineWidth = 2 * u;
    vg.beginPath(); vg.rect(bx - r, by - r, r * 2, r * 2); vg.fill(); vg.stroke();
    vg.beginPath(); vg.moveTo(bx - 4 * u, by + r); vg.lineTo(bx, by + r + 5 * u); vg.lineTo(bx + 4 * u, by + r); vg.closePath(); vg.fill(); vg.stroke();
    vg.fillRect(bx - 3 * u, by + r - 2 * u, 6 * u, 3 * u);
    vg.font = `${13 * u}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    vg.fillText(b.icon, bx, by + 1 * u);
  }
}
