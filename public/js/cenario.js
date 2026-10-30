/* =====================================================================
   DIA E NOITE
   ===================================================================== */
const FASES = {
  dia:        { nome:"dia",        dark:0,    sky:["#6fbdf0", "#92cff4", "#bfe4f8"], noite:false },
  entardecer: { nome:"entardecer", dark:0.30, sky:["#4a568f", "#e2875a", "#f5c178"], noite:false, tint:"rgba(255,140,80,.10)" },
  noite:      { nome:"noite",      dark:0.64, sky:["#0b1229", "#141f45", "#22305c"], noite:true },
};
function faseAtual() {
  if (state.faseFixa) return state.faseFixa;
  const h = new Date().getHours();
  if (h >= 7 && h < 17) return "dia";
  if ((h >= 17 && h < 19) || (h >= 5 && h < 7)) return "entardecer";
  return "noite";
}

/* =====================================================================
   PISO E PAREDES (desenhados uma vez numa camada de fundo)
   ===================================================================== */
function drawFloorTile(x, y) {
  const f = floorOf(x, y), c = at(x, y);
  if (c === "E") {
    tileDiamond(x, y, "#7d878c");
    for (let i = 1; i < 4; i++) lineFloor(x + i/4, y, x + i/4, y + 1, "#6a7479");
    return;
  }
  if (f === ".") {
    tileDiamond(x, y, ["#c8955f", "#c18b56", "#cd9c68"][Math.floor(h2(x, y) * 3)]);
    for (let i = 1; i < 4; i++) lineFloor(x, y + i/4, x + 1, y + i/4, "#a87644");
    for (let i = 0; i < 4; i++) { const s = 0.15 + h2(x, y, i) * 0.7; lineFloor(x + s, y + i/4, x + s, y + (i+1)/4, "#a87644"); }
    for (let i = 0; i < 3; i++) { const p = P(x + h2(x,y,i+9), y + h2(x,y,i+19)); g.fillStyle = "#d6a876"; g.fillRect(Math.round(p.x), Math.round(p.y), 3, 1); }
  } else if (f === ",") {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
      quadZ(x + i/2, y + j/2, x + (i+1)/2, y + (j+1)/2, 0, (i + j + x + y) % 2 ? "#eef1f3" : "#cfd7dc");
  } else if (f === "_") {
    tileDiamond(x, y, "#4b8580");
    for (let i = 0; i < 18; i++) { const p = P(x + h2(x,y,i), y + h2(x,y,i+40)); g.fillStyle = i % 2 ? "#579591" : "#417571"; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 1); }
  } else if (f === ":") {
    tileDiamond(x, y, "#3c6aa3");
    for (let i = 0; i < 12; i++) { const p = P(x + h2(x,y,i), y + h2(x,y,i+40)); g.fillStyle = "#4677b2"; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 1); }
  } else if (f === ";") {
    tileDiamond(x, y, "#eef3f5");
    for (let i = 1; i < 3; i++) { lineFloor(x + i/3, y, x + i/3, y + 1, "#d0dadf"); lineFloor(x, y + i/3, x + 1, y + i/3, "#d0dadf"); }
  }
}

function janelaY(x0, x1, F) {
  quadY(0, x0 - 0.06, x1 + 0.06, 40, 100, "#56666d");
  const z0 = 44, z1 = 96;
  for (let i = 0; i < 3; i++) quadY(0, x0 + 0.04, x1 - 0.04, z1 - (i+1) * 52/3, z1 - i * 52/3, F.sky[i]);
  for (let k = 0; k < 5; k++) {
    const w = (x1 - x0 - 0.08) / 5, bx = x0 + 0.04 + k * w, h = 6 + h2(k, Math.round(x0*10)) * 18;
    quadY(0, bx, bx + w - 0.02, z0, z0 + h, F.noite ? "#1a2235" : F.dark ? "#5b5f7d" : "#8aa0ae");
    if (F.noite) for (let j = 0; j < 3; j++) if (h2(k, j, Math.round(x0*7)) > 0.5) { const p = P(bx + 0.05 + j * 0.06, 0, z0 + 3 + j * 4 % h); g.fillStyle = "#f5d76e"; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
  }
  if (F.noite) {
    g.fillStyle = "#f4f1d0";
    for (let i = 0; i < 6; i++) { const p = P(x0 + 0.1 + h2(i, 3, Math.round(x0*3)) * (x1 - x0 - 0.2), 0, 70 + h2(i, 5, Math.round(x0)) * 24); g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
    if (x0 > 6 && x0 < 8) { quadY(0, x0 + 0.25, x0 + 0.42, 82, 92, "#f4f1d0"); quadY(0, x0 + 0.32, x0 + 0.44, 84, 92, F.sky[0]); }
  } else if (!F.dark) {
    const cx = x0 + 0.2 + h2(1, Math.round(x0*5)) * (x1 - x0 - 0.7);
    quadY(0, cx, cx + 0.4, 80, 84, "#ffffff"); quadY(0, cx + 0.08, cx + 0.3, 84, 87, "#ffffff");
  }
  quadY(0, (x0 + x1)/2 - 0.02, (x0 + x1)/2 + 0.02, 44, 96, "#56666d");
  quadY(0, x0, x1, 69, 71, "#56666d");
  prism(x0 - 0.1, 0, x1 - x0 + 0.2, 0.12, 37, 3, "#eef2f3", { edge:false });
}
function janelaX(y0, y1, F) {
  quadX(0, y0 - 0.06, y1 + 0.06, 40, 100, "#4f5e65");
  for (let i = 0; i < 3; i++) quadX(0, y0 + 0.04, y1 - 0.04, 96 - (i+1) * 52/3, 96 - i * 52/3, shade(F.sky[i], -0.08));
  for (let k = 0; k < 5; k++) {
    const w = (y1 - y0 - 0.08) / 5, by = y0 + 0.04 + k * w, h = 6 + h2(k, Math.round(y0*10), 3) * 18;
    quadX(0, by, by + w - 0.02, 44, 44 + h, F.noite ? "#161d2e" : F.dark ? "#52566f" : "#7d93a1");
  }
  quadX(0, (y0 + y1)/2 - 0.02, (y0 + y1)/2 + 0.02, 44, 96, "#4f5e65");
  quadX(0, y0, y1, 69, 71, "#4f5e65");
  prism(0, y0 - 0.1, 0.12, y1 - y0 + 0.2, 37, 3, "#e3e9eb", { edge:false });
}
const JANELAS_FUNDO = [[7.0, 8.8], [9.2, 10.8], [15.0, 16.8], [19.6, 21.4]];
const JANELAS_LADO = [[1.4, 3.2], [7.2, 9.0]];

function drawWalls(F) {
  const wallA = "#d6dee2", top = "#f0f4f5";
  prism(-0.25, -0.25, 0.25, 0.25, 0, WALL_H, wallA, { top, edge:false });
  prism(0, -0.25, COLS, 0.25, 0, WALL_H, wallA, { top, left: wallA, right: shade(wallA, -0.2), edge:false });
  prism(-0.25, 0, 0.25, ROWS, 0, WALL_H, wallA, { top, right: "#c3ccd1", left: "#aeb8bd", edge:false });
  for (let x = 0.5; x < COLS; x += 0.5) quadY(0, x, x + 0.02, 42, WALL_H, "#cdd6da");
  for (let y = 0.5; y < ROWS; y += 0.5) quadX(0, y, y + 0.02, 42, WALL_H, "#b8c2c7");
  // lambri
  quadY(0, 0, COLS, 0, 38, "#a9b9bf"); quadY(0, 0, COLS, 38, 42, "#e6ecee");
  quadX(0, 0, ROWS, 0, 38, "#97a8ae"); quadX(0, 0, ROWS, 38, 42, "#d3dbde");
  for (let x = 0.25; x < COLS; x += 0.5) quadY(0, x, x + 0.015, 6, 36, "#9aabb1");
  for (let y = 0.25; y < ROWS; y += 0.5) quadX(0, y, y + 0.015, 6, 36, "#889aa0");
  quadY(0, 0, COLS, 0, 5, "#6e7e84"); quadX(0, 0, ROWS, 0, 5, "#62727a");
  // azulejo da cozinha
  quadY(0, 14, COLS, 38, 76, "#cfe7e2");
  for (let z = 47; z < 76; z += 9.5) quadY(0, 14, COLS, z, z + 1, "#b2d2cb");
  for (let x = 14; x <= COLS; x += 0.25) quadY(0, x, x + 0.015, 38, 76, "#b2d2cb");
  // cerâmica do banheiro
  quadX(0, 11, ROWS, 5, 86, "#d9edf2");
  for (let z = 14; z < 86; z += 9) quadX(0, 11, ROWS, z, z + 1, "#bcd8df");
  for (let y = 11; y <= ROWS; y += 0.25) quadX(0, y, y + 0.015, 5, 86, "#bcd8df");
  // janelas
  for (const [a, b] of JANELAS_FUNDO) janelaY(a, b, F);
  for (const [a, b] of JANELAS_LADO) janelaX(a, b, F);
  // quadro de tarefas com post-its
  quadX(0, 4.0, 6.4, 50, 96, "#7b8a90"); quadX(0, 4.06, 6.34, 53, 93, "#f7f9f9");
  const cores = ["#ffd75e", "#8ee0a8", "#ff9fb2", "#8cc8ff"];
  for (let col = 0; col < 3; col++) {
    quadX(0, 4.1 + col * 0.75, 4.12 + col * 0.75 + 0.7, 89, 90, "#c3ccd0");
    for (let r = 0; r < 4; r++) if (h2(col, r, 2) > 0.25) { const y0 = 4.18 + col * 0.75 + h2(col, r) * 0.25; quadX(0, y0, y0 + 0.28, 80 - r * 7.5, 85 - r * 7.5, cores[(col + r) % 4]); }
  }
  // quadro (paisagem) e relógio
  quadY(0, 3.1, 4.4, 56, 88, "#6b4a2f"); quadY(0, 3.16, 4.34, 59, 85, "#9fd3ee");
  quadY(0, 3.16, 4.34, 59, 68, "#5aa35e"); quadY(0, 3.6, 4.34, 59, 73, "#4b8f50"); quadY(0, 3.9, 4.05, 78, 81, "#ffe27a");
  const ex = ELEVATOR.x + 0.5;
  quadY(0, ex - 0.18, ex + 0.18, 94, 106, "#3b4448"); quadY(0, ex - 0.15, ex + 0.15, 95, 105, "#fbfbf5");
  const d = new Date(), hAng = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, mAng = d.getMinutes() / 60 * Math.PI * 2;
  const cc = P(ex, 0, 100);
  g.fillStyle = "#222";
  for (let i = 0; i < 4; i++) { g.fillRect(Math.round(cc.x + Math.sin(mAng) * i * 1.1), Math.round(cc.y - Math.cos(mAng) * i * 1.1 + Math.sin(mAng) * i * 0.5), 1, 1); }
  for (let i = 0; i < 3; i++) { g.fillRect(Math.round(cc.x + Math.sin(hAng) * i * 1.1), Math.round(cc.y - Math.cos(hAng) * i * 1.1 + Math.sin(hAng) * i * 0.5), 1, 1); }
  // placa da sala de jogos e do banheiro (nas divisórias não há parede alta; fica no lambri do fundo)
}

function drawFloorAll() {
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) drawFloorTile(x, y);
  for (let x = 0; x < COLS; x++) fillPoly([P(x,ROWS,0), P(x+1,ROWS,0), P(x+1,ROWS,-12), P(x,ROWS,-12)], x % 2 ? "#5f4e3f" : "#5a4a3c");
  for (let y = 0; y < ROWS; y++) fillPoly([P(COLS,y,0), P(COLS,y+1,0), P(COLS,y+1,-12), P(COLS,y,-12)], y % 2 ? "#4c3f33" : "#483c31");
}

/* Camada de fundo em cache: refeita quando muda a fase do dia ou o minuto do relógio */
const bg = document.createElement("canvas"); bg.width = LW; bg.height = LH;
let bgKey = "";
function atualizarFundo() {
  const fase = faseAtual(), d = new Date();
  const key = fase + d.getHours() + ":" + d.getMinutes();
  if (key === bgKey) return;
  bgKey = key;
  const bctx = bg.getContext("2d");
  bctx.clearRect(0, 0, LW, LH);
  g = bctx;
  drawFloorAll();
  drawWalls(FASES[fase]);
  g = main;
}
