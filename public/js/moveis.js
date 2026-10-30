/* =====================================================================
   MÓVEIS
   Cada móvel devolve partes estáticas (viram sprite em cache) e partes
   dinâmicas (telas, LEDs, reflexo), desenhadas a cada quadro.
   Para usar sprites prontos no futuro, troque a função do caractere
   por uma que desenhe a imagem (veja spriteDeImagem lá embaixo).
   ===================================================================== */
const donoDaMesa = (x, y) => state.agents.find(a => a.desk && a.desk.x === x && a.desk.y === y - 1 && a.atDesk);
const quemEsta = (tipo, x, y) => state.agents.find(a => a.spot && a.spot.tipo === tipo && a.arrived && (x == null || (a.spot.x === x && a.spot.y === y)));

const MOVEIS = {
  "#": (x, y) => ({ estatico: [{ d:0, draw() {
    const T = 0.3, a = x + 0.5 - T/2, b = y + 0.5 - T/2, H = 52, col = "#b7c3c6", o = { top:"#e6ecee", hi:"#f6f9fa" };
    const liga = (dx, dy) => { const c = at(x+dx, y+dy); return c === "#" || (c === null && (dx < 0 || dy < 0)); };
    if (liga(0, -1)) prism(a, y, T, b - y, 0, H, col, o);
    if (liga(-1, 0)) prism(x, b, a - x, T, 0, H, col, o);
    prism(a, b, T, T, 0, H, col, o);
    if (liga(1, 0)) prism(a + T, b, x + 1 - a - T, T, 0, H, col, o);
    if (liga(0, 1)) prism(a, b + T, T, y + 1 - b - T, 0, H, col, o);
  }}]}),

  D: (x, y) => ({
    estatico: [{ d:0, draw() {
      prism(x+0.04, y+0.02, 0.92, 0.9, 0, 26, "#a46c3f", { top:"#c58b5a" });
      const Y = y + 0.92;
      quadY(Y, x+0.62, x+0.92, 3, 23, "#93603a");
      for (const z of [8, 15]) { quadY(Y, x+0.62, x+0.92, z, z + 1, "#7b4f2f"); quadY(Y, x+0.74, x+0.8, z + 3, z + 4, "#d9b48a"); }
      for (let i = 0; i < 3; i++) lineFloor(x+0.1, y+0.25 + i*0.22, x+0.9, y+0.25 + i*0.22, "#b98050", 26);
      prism(x+0.46, y+0.24, 0.38, 0.17, 26, 2, "#dfe4e6", { edge:false });
      for (let i = 0; i < 6; i++) lineFloor(x+0.49 + i*0.055, y+0.27, x+0.49 + i*0.055, y+0.38, "#a9b2b6", 28);
      prism(x+0.88, y+0.3, 0.06, 0.08, 26, 2, "#e8ecee", { edge:false });
      prism(x+0.15, y+0.36, 0.06, 0.12, 26, 7, "#4b5459");
      prism(x+0.1, y+0.12, 0.16, 0.62, 32, 26, "#262d31", { top:"#3a4348" });
      if (h2(x, y, 5) > 0.5) { prism(x+0.7, y+0.62, 0.12, 0.12, 26, 9, "#f3f3ef"); prism(x+0.72, y+0.64, 0.08, 0.08, 34, 1, "#5a3a22", { edge:false }); }
      else { prism(x+0.6, y+0.6, 0.3, 0.22, 26, 2, "#f6f6f2", { edge:false }); prism(x+0.62, y+0.58, 0.3, 0.22, 28, 1, "#e9e9e3", { edge:false }); }
    }}],
    dinamico: [{ d:0.05, draw(t) {
      const dono = donoDaMesa(x, y), X = x + 0.26;
      let scr = "#141b1f";
      if (dono) scr = dono.status === "trabalhando" ? "#1f3e70" : dono.status === "shell" ? "#123a22" : dono.status === "precisa" ? (Math.sin(t * 8) > 0 ? "#b83b35" : "#4a1714") : "#1c2a33";
      quadX(X, y+0.16, y+0.7, 35, 55, scr);
      if (dono && (dono.status === "trabalhando" || dono.status === "shell")) {
        const lc = dono.status === "shell" ? "#7ee09d" : ["#9cc2ff", "#ffd27a", "#c79cff"];
        for (let i = 0; i < 6; i++) {
          const len = 0.06 + 0.3 * Math.abs(Math.sin(t * 1.3 + i * 1.9 + x * 3));
          const ind = (i * 7 + x) % 3 * 0.04;
          quadX(X, y+0.2 + ind, y+0.2 + ind + len, 51 - i * 2.8, 52.3 - i * 2.8, Array.isArray(lc) ? lc[i % 3] : lc);
        }
      } else if (dono && dono.status === "precisa") {
        quadX(X, y+0.38, y+0.48, 40, 52, "#ffffff"); quadX(X, y+0.38, y+0.48, 44, 46, scr);
      }
    }}],
    luz: (t) => { const d = donoDaMesa(x, y); return d && d.status !== "ocioso" ? { x:x+0.3, y:y+0.4, r:60, cor: d.status === "precisa" ? "255,80,70" : d.status === "shell" ? "90,220,140" : "90,150,255", k:0.5 } : null; },
  }),

  c: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.42, y+0.42, 0.16, 0.16, 0, 3, "#2a2f33", { edge:false });
    prism(x+0.47, y+0.47, 0.06, 0.06, 3, 8, "#4a5156", { edge:false });
    prism(x+0.26, y+0.28, 0.48, 0.46, 11, 4, "#34477d", { top:"#46609f" });
    prism(x+0.28, y+0.18, 0.44, 0.1, 15, 26, "#2e3f70", { top:"#4a62a3" });
  }}]}),

  K: (x, y) => ({ estatico: [{ d:0, draw() { balcao(x, y); } }] }),
  C: (x, y) => ({
    estatico: [{ d:0, draw() {
      balcao(x, y);
      prism(x+0.22, y+0.14, 0.56, 0.5, 36, 30, "#34383b", { top:"#4a5054" });
      prism(x+0.4, y+0.6, 0.2, 0.08, 46, 6, "#202325", { edge:false });
      prism(x+0.4, y+0.66, 0.18, 0.16, 36, 8, "#f4f4ef");
    }}],
    dinamico: [{ d:0.05, draw(t) { const p = P(x+0.68, y+0.64, 58); g.fillStyle = quemEsta("cafe", x, y+1) ? "#5cff8a" : (Math.sin(t * 2) > 0 ? "#ff5c4d" : "#7a2b25"); g.fillRect(Math.round(p.x), Math.round(p.y), 3, 2); } }],
  }),
  F: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.08, y+0.06, 0.84, 0.84, 0, 92, "#eef2f4", { left:"#d9e0e4", top:"#fafcfc" });
    quadY(y+0.9, x+0.08, x+0.92, 58, 59, "#aab6bb");
    quadY(y+0.9, x+0.14, x+0.18, 66, 84, "#9aa7ad"); quadY(y+0.9, x+0.14, x+0.18, 30, 50, "#9aa7ad");
    quadY(y+0.9, x+0.5, x+0.7, 70, 82, "#ffd75e"); quadY(y+0.9, x+0.55, x+0.75, 64, 70, "#8ee0a8");
  }}]}),
  P: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.3, y+0.3, 0.4, 0.4, 0, 18, "#b4643a", { top:"#3a2a1c" });
    const verdes = ["#3f8a46", "#4f9a52", "#62b465", "#78c77a"];
    for (let i = 0; i < 9; i++) {
      const a = h2(x, y, i) * Math.PI * 2, r = 0.08 + h2(x, y, i + 9) * 0.2, z = 18 + h2(x, y, i + 3) * 34;
      const cx = x + 0.5 + Math.cos(a) * r, cy = y + 0.5 + Math.sin(a) * r;
      prism(cx - 0.12, cy - 0.12, 0.24, 0.24, z, 10, verdes[i % 4], { edge:false });
    }
  }}]}),
  W: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.3, y+0.3, 0.4, 0.4, 0, 36, "#e3e9ec", { top:"#f5f8f9" });
    prism(x+0.33, y+0.33, 0.34, 0.34, 36, 22, "#7ec3ea", { top:"#a9dbf5", edge:false });
    quadY(y+0.7, x+0.42, x+0.5, 26, 30, "#3a7bd5"); quadY(y+0.7, x+0.54, x+0.62, 26, 30, "#d2553f");
  }}]}),
  R: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.05, y+0.06, 0.9, 0.36, 0, 86, "#8a5a36", { top:"#a5714a" });
    const Y = y + 0.42, livros = ["#c0504d", "#3a7bd5", "#e3a32f", "#3e9b6e", "#8a5cc2", "#e8e2d0"];
    for (let s = 0; s < 4; s++) {
      const z = 6 + s * 20;
      quadY(Y, x+0.08, x+0.92, z, z + 2, "#6b4428");
      let bx = x + 0.1;
      for (let i = 0; bx < x + 0.88; i++) {
        const w = 0.04 + h2(x, s, i) * 0.05, hb = 10 + h2(s, i, x) * 6;
        if (h2(i, s, y) > 0.12) quadY(Y, bx, Math.min(x + 0.9, bx + w), z + 2, z + 2 + hb, livros[(i + s) % livros.length]);
        bx += w + 0.008;
      }
    }
  }}]}),
  t: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.45, y+0.45, 0.1, 0.1, 0, 26, "#3e3e3e", { edge:false });
    prism(x+0.02, y+0.08, 0.96, 0.84, 26, 4, "#c98f5a", { top:"#d9a172" });
    prism(x+0.3, y+0.35, 0.1, 0.1, 30, 7, "#f4f4ef");
  }}]}),
  o: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.46, y+0.46, 0.08, 0.08, 0, 14, "#52585c", { edge:false });
    prism(x+0.32, y+0.32, 0.36, 0.36, 14, 4, "#cf553e", { top:"#e2735c" });
  }}]}),
  V: (x, y) => ({
    estatico: [{ d:0, draw() {
      prism(x+0.1, y+0.22, 0.8, 0.4, 0, 18, "#5a4636", { top:"#6f5643" });
      prism(x-0.1, y+0.4, 1.2, 0.1, 22, 46, "#1b2023", { top:"#2c3337" });
    }}],
    dinamico: [{ d:0.05, draw(t) {
      const Y = y + 0.5, vendo = quemEsta("futebol");
      if (vendo) {
        quadY(Y, x-0.05, x+1.05, 25, 65, "#3d9a4b");
        for (let i = 0; i < 6; i++) quadY(Y, x - 0.05 + i * 0.2, x + 0.05 + i * 0.2, 25, 65, "#45a653");
        quadY(Y, x+0.49, x+0.51, 25, 65, "#e7f6e8");
        quadY(Y, x-0.05, x+0.08, 37, 53, "#e7f6e8"); quadY(Y, x+0.92, x+1.05, 37, 53, "#e7f6e8");
        const bx = 0.05 + 0.85 * (0.5 + 0.5 * Math.sin(t * 1.4)), bz = 40 + 10 * Math.sin(t * 2.3);
        quadY(Y, x + bx, x + bx + 0.05, bz, bz + 3, "#ffffff");
        if (state.gol > 0 && Math.sin(t * 10) > 0) { quadY(Y, x+0.15, x+0.85, 38, 54, "#ffd84a"); quadY(Y, x+0.2, x+0.8, 41, 51, "#e3a32f"); }
      } else quadY(Y, x-0.05, x+1.05, 25, 65, "#111a24");
    }}],
    luz: () => quemEsta("futebol") ? { x:x+0.5, y:y+1.2, r:120, cor:"110,200,140", k:0.55 } : null,
  }),
  A: (x, y) => ({
    estatico: [{ d:0, draw() {
      prism(x+0.12, y+0.12, 0.76, 0.66, 0, 70, "#5b3592", { top:"#7a52b5" });
      prism(x+0.12, y+0.6, 0.76, 0.22, 30, 8, "#4a2a7a", { top:"#6a46a5" });
      quadY(y+0.78, x+0.2, x+0.8, 62, 68, "#ffd75e");
      for (let i = 0; i < 3; i++) quadY(y+0.78, x+0.3 + i*0.15, x+0.36 + i*0.15, 63, 67, "#e3602f");
    }}],
    dinamico: [{ d:0.05, draw(t) {
      const jogando = quemEsta("games", x, y + 1), Y = y + 0.78;
      quadY(Y, x+0.2, x+0.8, 40, 58, "#120c1e");
      if (jogando) for (let i = 0; i < 5; i++) { const px = x + 0.24 + ((t * 0.4 + i * 0.13) % 0.5); quadY(Y, px, px + 0.04, 44 + (i * 7 % 12), 46 + (i * 7 % 12), ["#ff6fb5", "#58e1ff", "#ffe066"][i % 3]); }
      else quadY(Y, x+0.4, x+0.6, 47, 51, Math.sin(t * 2) > 0 ? "#58e1ff" : "#26305a");
    }}],
    luz: () => quemEsta("games", x, y + 1) ? { x:x+0.5, y:y+1, r:60, cor:"200,90,255", k:0.5 } : null,
  }),
  S: (x, y) => {
    const esq = at(x-1, y) !== "S", dir = at(x+1, y) !== "S";
    return { estatico: [
      { d:0, draw() { prism(x, y+0.15, 1, 0.68, 0, 16, "#bf4f4b", { top:"#d0625d" }); prism(x+0.04, y+0.18, 0.92, 0.6, 16, 3, "#d4706b", { edge:false }); } },
      { d:0.6, draw() {
        prism(x, y+0.78, 1, 0.22, 0, 34, "#a94440", { top:"#c0524d" });
        if (esq) prism(x, y+0.15, 0.14, 0.65, 0, 24, "#a94440");
        if (dir) prism(x+0.86, y+0.15, 0.14, 0.65, 0, 24, "#a94440");
      } },
    ]};
  },
  L: (x, y) => ({
    estatico: [{ d:0, draw() {
      prism(x+0.38, y+0.38, 0.24, 0.24, 0, 3, "#2f3336", { edge:false });
      prism(x+0.48, y+0.48, 0.04, 0.04, 3, 70, "#3d4246", { edge:false });
      prism(x+0.3, y+0.3, 0.4, 0.4, 72, 18, "#f2e3c2", { top:"#fff6df" });
    }}],
    luzFixa: { x:x+0.5, y:y+0.5, r:110, z:80, k:1 },
  }),
  I: (x, y) => ({
    estatico: [{ d:0, draw() {
      prism(x+0.1, y+0.04, 0.8, 0.5, 0, 30, "#e9eef0", { top:"#ffffff" });
      quadZ(x+0.25, y+0.12, x+0.75, y+0.42, 30.5, "#bfd2d8");
      prism(x+0.47, y+0.06, 0.06, 0.08, 30, 8, "#a9b3b8", { edge:false });
      quadY(y+0.54, x+0.2, x+0.8, 8, 26, "#dbe3e6");
      quadY(y, x+0.12, x+0.88, 33, 51, "#8a979c"); quadY(y, x+0.15, x+0.85, 34, 50, "#bfe2ee");
      quadY(y, x+0.2, x+0.32, 40, 48, "#e3f4fa");
    }}],
    dinamico: [{ d:0.05, draw(t) {
      const a = quemEsta("espelho", x, y + 1);
      if (!a) return;
      // o reflexo do rosto no espelho
      quadY(y, x+0.4, x+0.6, 37, 45, a.pal.skin);
      quadY(y, x+0.38, x+0.62, 44, 48, a.pal.hair);
      quadY(y, x+0.44, x+0.47, 40, 42, "#1d1d1d"); quadY(y, x+0.53, x+0.56, 40, 42, "#1d1d1d");
      if (Math.sin(t * 3 + a.seed) > 0.85) { const p = P(x + 0.7, y, 48); g.fillStyle = "#fff"; g.fillRect(Math.round(p.x), Math.round(p.y) - 2, 1, 5); g.fillRect(Math.round(p.x) - 2, Math.round(p.y), 5, 1); }
    }}],
  }),
  Q: (x, y) => ({ estatico: [{ d:0, draw() {
    prism(x+0.3, y+0.1, 0.4, 0.22, 0, 40, "#f2f6f7", { top:"#ffffff" });
    prism(x+0.3, y+0.32, 0.4, 0.44, 0, 18, "#e9eef0", { top:"#ffffff" });
    quadZ(x+0.36, y+0.38, x+0.64, y+0.7, 18.5, "#c6d6db");
  }}]}),
  G: (x, y) => ({ estatico: [{ d:0, draw() {
    const primeiro = at(x+1, y) === "G";
    for (const lx of [0.1, 0.86]) for (const ly of [0.16, 0.76]) prism(x+lx, y+ly, 0.05, 0.05, 0, 22, "#2b2b2b", { edge:false });
    prism(x, y+0.1, 1, 0.8, 22, 3, "#2d6f4a", { top:"#2f7d52" });
    quadZ(x, y+0.49, x+1, y+0.51, 25.5, "#ffffff");
    quadZ(x, y+0.1, x+1, y+0.13, 25.5, "#ffffff"); quadZ(x, y+0.87, x+1, y+0.9, 25.5, "#ffffff");
    if (!at(x-1, y) || at(x-1, y) !== "G") quadZ(x, y+0.1, x+0.03, y+0.9, 25.5, "#ffffff");
    if (!primeiro) quadZ(x+0.97, y+0.1, x+1, y+0.9, 25.5, "#ffffff");
    if (primeiro) { quadX(x+1, y+0.06, y+0.94, 25, 33, "#e8ecee"); for (let i = 1; i < 8; i++) quadX(x+1, y+0.06 + i*0.11, y+0.07 + i*0.11, 25, 33, "#9aa5a9"); }
  }}]}),
};
function balcao(x, y) {
  prism(x, y+0.06, 1, 0.86, 0, 34, "#dfe5e8", { left:"#c3ccd1", top:"#cfd7db" });
  quadY(y+0.92, x+0.5, x+0.51, 3, 31, "#a8b3b8");
  quadY(y+0.92, x+0.36, x+0.42, 24, 26, "#8b979c"); quadY(y+0.92, x+0.58, x+0.64, 24, 26, "#8b979c");
  prism(x-0.01, y+0.02, 1.02, 0.94, 34, 3, "#f1f4f5", { top:"#fbfcfc" });
}

/* Gera os sprites em cache: cada parte vira um canvas pequeno do tamanho do tile */
const MOV = [];
const LUZES_FIXAS = [];
function prepararMoveis() {
  MOV.length = 0; LUZES_FIXAS.length = 0;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const fn = MOVEIS[at(x, y)];
    if (!fn) continue;
    const m = fn(x, y);
    const left = P(x, y + 1.3).x - 8, right = P(x + 1.3, y).x + 8, top = P(x, y).y - 150, bottom = P(x + 1, y + 1).y + 8;
    for (const parte of m.estatico || []) {
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(right - left); cv.height = Math.ceil(bottom - top);
      const c2 = cv.getContext("2d");
      c2.translate(-Math.floor(left), -Math.floor(top));
      g = c2; parte.draw(); g = main;
      MOV.push({ depth: profundidade(x, y) + 1 + parte.d, kind:0, img: cv, ix: Math.floor(left), iy: Math.floor(top) });
    }
    for (const parte of m.dinamico || []) MOV.push({ depth: profundidade(x, y) + 1 + parte.d, kind:0, dyn: parte.draw });
    if (m.luz) LUZES_FIXAS.push({ dinamica: m.luz });
    if (m.luzFixa) LUZES_FIXAS.push({ ...m.luzFixa, zona: floorOf(x, y) });
  }
}
/* Gancho para um tema com sprites prontos: desenha uma imagem com a âncora no centro do tile. */
function spriteDeImagem(img, ancoraX, ancoraY) {
  return (x, y) => ({ estatico: [{ d:0, draw() { const p = P(x + 0.5, y + 0.5); g.drawImage(img, Math.round(p.x - ancoraX), Math.round(p.y - ancoraY)); } }] });
}
