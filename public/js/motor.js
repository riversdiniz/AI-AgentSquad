/* =====================================================================
   PROJEÇÃO E RASTERIZAÇÃO
   Tudo passa por P(): é o único lugar que sabe que a vista é isométrica.
   Para uma vista de cima (ex.: sprites do LimeZu), troque P e a profundidade.
   ===================================================================== */
const HW = 32, HH = 16, WALL_H = 112;
const LW = (COLS + ROWS) * HW + 96;
const LH = (COLS + ROWS) * HH + WALL_H + 56;
const OX = ROWS * HW + 48, OY = WALL_H + 24;
const P = (x, y, z = 0) => ({ x: OX + (x - y) * HW, y: OY + (x + y) * HH - z });
const profundidade = (x, y) => x + y;

const low = document.createElement("canvas"); low.width = LW; low.height = LH;
const main = low.getContext("2d");
let g = main;                 // contexto atual (troca ao gerar sprites em cache)
const lightCanvas = document.createElement("canvas"); lightCanvas.width = LW; lightCanvas.height = LH;
const lg = lightCanvas.getContext("2d");
const view = document.getElementById("view");
const vg = view.getContext("2d");

function fillPoly(pts, col) {
  g.fillStyle = col;
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
  for (let y = Math.floor(minY); y < Math.ceil(maxY); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a.y <= yc && b.y > yc) || (b.y <= yc && a.y > yc)) xs.push(a.x + (yc - a.y) * (b.x - a.x) / (b.y - a.y));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.round(xs[k]), x1 = Math.round(xs[k + 1]);
      if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1);
    }
  }
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
  return "#" + [m(r), m(gg), m(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}
function prism(x, y, w, d, z, h, col, o = {}) {
  const top = o.top || shade(col, 0.2), left = o.left || col, right = o.right || shade(col, -0.2);
  fillPoly([P(x, y+d, z), P(x+w, y+d, z), P(x+w, y+d, z+h), P(x, y+d, z+h)], left);
  fillPoly([P(x+w, y, z), P(x+w, y+d, z), P(x+w, y+d, z+h), P(x+w, y, z+h)], right);
  fillPoly([P(x, y, z+h), P(x+w, y, z+h), P(x+w, y+d, z+h), P(x, y+d, z+h)], top);
  if (o.edge !== false && h >= 4) {   // aresta clara no topo, típica de pixel art
    const a = P(x, y+d, z+h), b = P(x+w, y+d, z+h), c = P(x+w, y, z+h);
    fillPoly([a, b, { x:b.x, y:b.y+1 }, { x:a.x, y:a.y+1 }], o.hi || shade(col, 0.38));
    fillPoly([b, c, { x:c.x, y:c.y+1 }, { x:b.x, y:b.y+1 }], o.hi || shade(col, 0.3));
  }
}
const quadY = (Y, x0, x1, z0, z1, col) => fillPoly([P(x0,Y,z0), P(x1,Y,z0), P(x1,Y,z1), P(x0,Y,z1)], col);
const quadX = (X, y0, y1, z0, z1, col) => fillPoly([P(X,y0,z0), P(X,y1,z0), P(X,y1,z1), P(X,y0,z1)], col);
const quadZ = (x0, y0, x1, y1, z, col) => fillPoly([P(x0,y0,z), P(x1,y0,z), P(x1,y1,z), P(x0,y1,z)], col);
const tileDiamond = (x, y, col) => quadZ(x, y, x+1, y+1, 0, col);
function lineFloor(x0, y0, x1, y1, col, z = 0) { const a = P(x0, y0, z), b = P(x1, y1, z); fillPoly([a, b, { x:b.x, y:b.y+1 }, { x:a.x, y:a.y+1 }], col); }
const h2 = (x, y, i = 0) => { let h = Math.imul(x + 101, 374761393) ^ Math.imul(y + 37, 668265263) ^ Math.imul(i + 7, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
