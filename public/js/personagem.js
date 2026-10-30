/* =====================================================================
   PERSONAGENS (pixel art gerada por código)
   Desenho base em 3/4 olhando para a direita da tela; flip espelha.
   face "front" mostra o rosto, "back" mostra a nuca.
   ===================================================================== */
const OUT = "#2a1f1b";
function drawAgent(a, t) {
  const c = P(a.px, a.py, 0);
  const sx = Math.round(c.x), sy = Math.round(c.y);
  const sit = a.sitting, seat = sit ? (a.seatH || 14) : 0;
  const by = sy - seat;
  const fl = a.flip ? -1 : 1, front = a.face === "front", pal = a.pal;
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(fl === 1 ? sx + x : sx - x - w, by + y, w, h); };
  const RB = (x, y, w, h, col) => { R(x - 1, y - 1, w + 2, h + 2, OUT); R(x, y, w, h, col); };

  // sombra
  g.fillStyle = "rgba(0,0,0,.22)";
  g.fillRect(sx - 10, sy - 1, 20, 3); g.fillRect(sx - 7, sy - 2, 14, 5);
  if (a.leaving > 0) g.globalAlpha = Math.max(0, 1 - a.leaving);

  const f = a.walking ? Math.floor(a.walkT * 9) % 4 : 0;
  const lp = [0, 1, 0, -1][f];
  const uo = sit ? 14 : 0;                  // sentado, o tronco desce até o assento
  const pd = shade(pal.pants, -0.25), sd = shade(pal.shirt, -0.22), sk = pal.skin, skd = shade(pal.skin, -0.14);
  const act = a.status === "ocioso" && a.spot && a.arrived ? a.spot.tipo : null;

  // pernas
  if (!sit) {
    const la = lp > 0 ? 2 : 0, lb = lp < 0 ? 2 : 0;
    RB(-6, -16, 5, 16 - la, pal.pants); RB(1, -16, 5, 16 - lb, pd);
    RB(-6, -3 - la, 6, 3, pal.shoe); RB(1, -3 - lb, 6, 3, shade(pal.shoe, -0.2));
  } else if (front && a.atDesk) {
    RB(-7, -4, 14, 5, pal.pants);           // na mesa, as canelas ficam escondidas
  } else if (front) {
    RB(-7, -4, 14, 5, pal.pants);
    RB(-6, 1, 5, seat - 3, pal.pants); RB(1, 1, 5, seat - 3, pd);
    RB(-6, seat - 3, 6, 3, pal.shoe); RB(1, seat - 3, 6, 3, shade(pal.shoe, -0.2));
  }

  // tronco
  const ty = -32 + uo;
  RB(-9, ty, 18, 17, pal.shirt);
  R(5, ty, 4, 17, sd);
  if (pal.estilo === 1) R(-9, ty + 6, 18, 2, shade(pal.shirt, 0.35));
  if (front) {
    R(-2, ty, 4, 3, sk); R(-1, ty + 3, 2, 1, sk);
    if (pal.estilo === 2) { R(-1, ty + 3, 2, 9, pal.gravata); R(-2, ty + 3, 4, 2, pal.gravata); }
    if (pal.estilo === 3) { R(-4, ty + 2, 1, 6, "#f1f1f1"); R(3, ty + 2, 1, 6, "#f1f1f1"); }
  }
  R(-9, ty + 15, 18, 2, shade(pal.pants, -0.4));
  if (a.sub && front) {                     // crachá de subagente
    R(-5, ty, 1, 7, "#3a7bd5"); R(-1, ty, 1, 7, "#3a7bd5");
    RB(-6, ty + 7, 6, 6, "#ffd75e"); R(-5, ty + 9, 4, 1, "#8a6d1f"); R(-5, ty + 11, 3, 1, "#8a6d1f");
  }

  // braços
  const sw = a.walking ? lp * 2 : 0;
  const braco = (bx, y0, len, col) => { RB(bx, y0, 4, len, col); RB(bx, y0 + len, 4, 4, sk); };
  const typing = (a.status === "trabalhando" || a.status === "shell") && a.atDesk;
  const raising = a.status === "precisa" && a.atDesk;
  if (raising) {
    const wave = Math.floor(t * 4) % 2;
    braco(-13, ty + 1, 12, pal.shirt);
    RB(9, ty - 17 - wave, 4, 17, sd); RB(9, ty - 21 - wave, 4, 4, sk);
  } else if (typing && front) {
    const k = Math.floor(t * 10 + a.seed) % 2;
    RB(-13, ty + 1, 4, 9, pal.shirt); RB(9, ty + 1, 4, 9, sd);
    RB(-9, ty + 11 - k, 5, 3, sk); RB(4, ty + 10 + k, 5, 3, sk);
  } else if (act === "pingpong") {
    const swing = Math.round(Math.sin(t * 6 + a.seed) * 3);
    braco(-13, ty + 1, 12, pal.shirt);
    RB(9, ty + 1, 4, 8, sd); RB(12, ty + 6 + swing, 4, 4, sk);
    RB(15, ty + 2 + swing, 6, 7, "#c0392b"); R(16, ty + 3 + swing, 2, 2, "#e0605a");
  } else if (act === "cafe" || act === "conversa" || act === "agua") {
    const gole = Math.sin(t * 0.9 + a.seed) > 0.75;
    braco(-13, ty + 1, 12, pal.shirt);
    RB(9, ty + 1, 4, 8, sd);
    const my = gole ? ty - 9 : ty + 6;
    RB(7, my + 3, 4, 4, sk);
    RB(9, my, 5, 6, act === "agua" ? "#bfe6fa" : "#f4f4ef");
    if (act !== "agua") R(10, my, 3, 1, "#5a3a22");
  } else if (act === "espelho") {
    const k = Math.floor(t * 3) % 2;
    braco(-13, ty + 1, 12, pal.shirt);
    RB(9, ty - 12 + k * 2, 4, 13, sd); RB(8, ty - 16 + k * 2, 4, 4, sk);
    RB(4, ty - 21 + k * 2, 8, 2, "#d9534f");
  } else if (act === "games") {
    RB(-13, ty + 1, 4, 9, pal.shirt); RB(9, ty + 1, 4, 9, sd);
  } else {
    braco(-13, ty + 1 + sw, 12, pal.shirt);
    braco(9, ty + 1 - sw, 12, sd);
  }

  // cabeça
  const hy = ty - 17;
  R(-2, hy + 14, 4, 3, skd);
  RB(-8, hy, 16, 15, sk);
  R(5, hy, 3, 15, skd);
  const hair = pal.hair, hd = shade(pal.hair, -0.25);
  if (front) {
    R(-9, hy + 6, 2, 4, sk); R(-9, hy + 7, 1, 2, skd);
    switch (pal.cabelo) {
      case 0: RB(-9, hy - 3, 18, 6, hair); R(-9, hy + 3, 3, 4, hair); R(4, hy + 3, 5, 2, hair); break;
      case 1: RB(-9, hy - 3, 18, 6, hair); RB(-10, hy + 2, 4, 15, hair); RB(6, hy + 2, 4, 11, hd); R(-3, hy + 3, 9, 2, hair); break;
      case 2: RB(-9, hy - 3, 18, 6, hair); RB(-4, hy - 8, 9, 5, hair); R(-9, hy + 3, 3, 3, hair); break;
      case 3: RB(-10, hy - 6, 20, 11, hair); RB(-12, hy - 2, 3, 8, hair); RB(9, hy - 2, 3, 6, hd); R(-6, hy - 6, 3, 1, shade(hair, 0.2)); R(2, hy - 5, 3, 1, shade(hair, 0.2)); break;
    }
    R(-9, hy - 3, 18, 1, shade(hair, 0.25));
    if (pal.oculos) { R(-4, hy + 6, 5, 4, OUT); R(2, hy + 6, 5, 4, OUT); R(-3, hy + 7, 3, 2, "#cfe6f2"); R(3, hy + 7, 3, 2, "#cfe6f2"); R(1, hy + 7, 1, 1, OUT); }
    const piscar = ((t * 0.6 + a.seed) % 4) < 0.12;
    if (!pal.oculos) {
      R(-3, hy + 6, 2, piscar ? 1 : 3, "#1d1d1d"); R(3, hy + 6, 2, piscar ? 1 : 3, "#1d1d1d");
      if (!piscar) { R(-3, hy + 6, 1, 1, "#ffffff"); R(3, hy + 6, 1, 1, "#ffffff"); }
    }
    R(-4, hy + 4, 3, 1, hd); R(3, hy + 4, 3, 1, hd);
    R(-6, hy + 10, 2, 1, "#e79a8f"); R(6, hy + 10, 2, 1, "#e79a8f");
    if (a.status === "precisa") R(0, hy + 11, 3, 2, "#5a1f1c");
    else if (act) { R(-1, hy + 11, 5, 1, "#7a3b30"); R(-2, hy + 10, 1, 1, "#7a3b30"); R(4, hy + 10, 1, 1, "#7a3b30"); }
    else R(0, hy + 11, 3, 1, "#7a3b30");
  } else {
    switch (pal.cabelo) {
      case 1: RB(-9, hy - 3, 18, 22, hair); R(4, hy, 5, 19, hd); break;
      case 2: RB(-9, hy - 3, 18, 14, hair); RB(-4, hy - 8, 9, 5, hair); R(4, hy, 5, 11, hd); break;
      case 3: RB(-10, hy - 6, 20, 19, hair); RB(-12, hy - 2, 3, 10, hair); RB(9, hy - 2, 3, 10, hd); break;
      default: RB(-9, hy - 3, 18, 15, hair); R(4, hy, 5, 12, hd);
    }
    R(-10, hy + 6, 2, 4, sk);
  }
  g.globalAlpha = 1;
}
