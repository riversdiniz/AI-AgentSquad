/* =====================================================================
   PERSONAGENS (pixel art gerada por código, proporção chibi)
   Cabeça grande, corpo pequeno. O desenho base olha para a direita da
   tela em 3/4; flip espelha. face "front" mostra o rosto, "back" a nuca.
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

  g.fillStyle = "rgba(0,0,0,.22)";
  g.fillRect(sx - 11, sy - 1, 22, 3); g.fillRect(sx - 8, sy - 2, 16, 5);
  if (a.leaving > 0) g.globalAlpha = Math.max(0, 1 - a.leaving);

  const f = a.walking ? Math.floor(a.walkT * 9) % 4 : 0;
  const lp = [0, 1, 0, -1][f];
  const bob = a.walking && (f === 1 || f === 3) ? -1 : 0;     // o corpo sobe um pouco a cada passo
  const uo = (sit ? 8 : 0) + bob;
  const pd = shade(pal.pants, -0.25), sd = shade(pal.shirt, -0.22), sk = pal.skin, skd = shade(pal.skin, -0.14);
  const act = a.status === "ocioso" && a.spot && a.arrived ? a.spot.tipo : null;
  const falando = a.fala && state.time < a.fala.ate;
  const torcendo = (act === "plateia" || act === "futebol") && (falando || state.gol > 0);

  // pernas curtinhas
  if (!sit) {
    const la = lp > 0 ? 2 : 0, lb = lp < 0 ? 2 : 0;
    RB(-6, -8, 5, 8 - la, pal.pants); RB(1, -8, 5, 8 - lb, pd);
    RB(-6, -3 - la, 6, 3, pal.shoe); RB(1, -3 - lb, 6, 3, shade(pal.shoe, -0.2));
  } else if (front) {
    RB(-6, -3, 12, 4, pal.pants);
    if (!a.atDesk) {                      // na mesa, as canelas ficam escondidas
      RB(-6, 1, 5, seat - 3, pal.pants); RB(1, 1, 5, seat - 3, pd);
      RB(-6, seat - 3, 6, 3, pal.shoe); RB(1, seat - 3, 6, 3, shade(pal.shoe, -0.2));
    }
  }

  // tronco
  const ty = -21 + uo;
  RB(-8, ty, 16, 13, pal.shirt);
  R(4, ty, 4, 13, sd);
  if (pal.estilo === 1) R(-8, ty + 5, 16, 2, shade(pal.shirt, 0.35));
  if (front) {
    R(-2, ty, 4, 2, sk);
    if (pal.estilo === 2) { R(-1, ty + 2, 2, 7, pal.gravata); R(-2, ty + 2, 4, 2, pal.gravata); }
    if (pal.estilo === 3) { R(-4, ty + 1, 1, 5, "#f1f1f1"); R(3, ty + 1, 1, 5, "#f1f1f1"); }
  }
  R(-8, ty + 11, 16, 2, shade(pal.pants, -0.4));
  if (a.sub && front) {                   // crachá de subagente
    R(-5, ty, 1, 5, "#3a7bd5"); R(-1, ty, 1, 5, "#3a7bd5");
    RB(-6, ty + 5, 6, 5, "#ffd75e"); R(-5, ty + 7, 4, 1, "#8a6d1f");
  }

  // braços
  const sw = a.walking ? lp * 2 : 0;
  const braco = (bx, y0, len, col) => { RB(bx, y0, 4, len, col); RB(bx, y0 + len, 4, 3, sk); };
  const typing = (a.status === "trabalhando" || a.status === "shell") && a.atDesk;
  const raising = a.status === "precisa" && a.atDesk;
  if (raising) {
    const wave = Math.floor(t * 4) % 2;
    braco(-12, ty + 1, 8, pal.shirt);
    RB(8, ty - 13 - wave, 4, 14, sd); RB(8, ty - 16 - wave, 4, 3, sk);
  } else if (torcendo) {
    const w = Math.floor(t * 5 + a.seed) % 2;
    RB(-12, ty - 11 - w, 4, 12, pal.shirt); RB(-12, ty - 14 - w, 4, 3, sk);
    RB(8, ty - 11 - (1 - w), 4, 12, sd); RB(8, ty - 14 - (1 - w), 4, 3, sk);
  } else if (typing && front) {
    const k = Math.floor(t * 10 + a.seed) % 2;
    RB(-12, ty + 1, 4, 6, pal.shirt); RB(8, ty + 1, 4, 6, sd);
    RB(-8, ty + 8 - k, 5, 3, sk); RB(3, ty + 7 + k, 5, 3, sk);
  } else if (act === "pingpong") {
    const swing = Math.round(Math.sin(t * 6 + a.seed) * 3);
    braco(-12, ty + 1, 8, pal.shirt);
    RB(8, ty + 1, 4, 6, sd); RB(11, ty + 5 + swing, 3, 3, sk);
    RB(13, ty + 1 + swing, 6, 7, "#c0392b"); R(14, ty + 2 + swing, 2, 2, "#e0605a");
  } else if (act === "cafe" || act === "conversa" || act === "agua") {
    const gole = Math.sin(t * 0.9 + a.seed) > 0.75;
    braco(-12, ty + 1, 8, pal.shirt);
    RB(8, ty + 1, 4, 6, sd);
    const my = gole ? ty - 9 : ty + 4;
    RB(6, my + 3, 4, 3, sk);
    RB(8, my, 5, 6, act === "agua" ? "#bfe6fa" : "#f4f4ef");
    if (act !== "agua") R(9, my, 3, 1, "#5a3a22");
  } else if (act === "espelho") {
    const k = Math.floor(t * 3) % 2;
    braco(-12, ty + 1, 8, pal.shirt);
    RB(8, ty - 10 + k * 2, 4, 11, sd); RB(7, ty - 13 + k * 2, 4, 3, sk);
    RB(3, ty - 17 + k * 2, 8, 2, "#d9534f");
  } else if (act === "games") {
    RB(-12, ty + 1, 4, 6, pal.shirt); RB(8, ty + 1, 4, 6, sd);
  } else {
    braco(-12, ty + 1 + sw, 8, pal.shirt);
    braco(8, ty + 1 - sw, 8, sd);
  }

  // cabeça grande
  const hy = ty - 21;
  RB(-11, hy, 22, 20, sk);
  R(7, hy, 4, 20, skd);
  const hair = pal.hair, hd = shade(pal.hair, -0.25), hl = shade(pal.hair, 0.25);
  if (front) {
    R(-12, hy + 9, 2, 5, sk); R(-12, hy + 10, 1, 3, skd);
    switch (pal.cabelo) {
      case 0: RB(-12, hy - 3, 24, 8, hair); R(-12, hy + 5, 4, 5, hair); R(4, hy + 5, 8, 3, hair); break;
      case 1: RB(-12, hy - 3, 24, 8, hair); RB(-13, hy + 3, 5, 19, hair); RB(8, hy + 3, 5, 15, hd); R(-4, hy + 5, 12, 3, hair); break;
      case 2: RB(-12, hy - 3, 24, 8, hair); RB(-5, hy - 9, 10, 6, hair); R(-12, hy + 5, 4, 4, hair); break;
      case 3: RB(-13, hy - 7, 26, 13, hair); RB(-15, hy - 2, 4, 11, hair); RB(11, hy - 2, 4, 9, hd); R(-8, hy - 6, 4, 1, hl); R(2, hy - 5, 4, 1, hl); break;
    }
    if (pal.cabelo !== 3) R(-11, hy - 3, 22, 1, hl);
    const piscar = ((t * 0.6 + a.seed) % 4) < 0.12;
    if (pal.oculos) {
      R(-7, hy + 8, 6, 6, OUT); R(1, hy + 8, 6, 6, OUT); R(-1, hy + 10, 2, 1, OUT);
      R(-6, hy + 9, 4, 4, "#d6ecf6"); R(2, hy + 9, 4, 4, "#d6ecf6");
      R(-5, hy + 10, 2, piscar ? 1 : 3, "#1d1d1d"); R(3, hy + 10, 2, piscar ? 1 : 3, "#1d1d1d");
    } else {
      R(-6, hy + 9, 3, piscar ? 1 : 5, "#1d1d1d"); R(2, hy + 9, 3, piscar ? 1 : 5, "#1d1d1d");
      if (!piscar) { R(-6, hy + 9, 1, 2, "#ffffff"); R(2, hy + 9, 1, 2, "#ffffff"); }
    }
    R(-7, hy + 6, 4, 1, hd); R(2, hy + 6, 4, 1, hd);
    R(-9, hy + 15, 3, 1, "#e79a8f"); R(6, hy + 15, 3, 1, "#e79a8f");
    if (a.status === "precisa") R(-1, hy + 16, 4, 3, "#5a1f1c");
    else if (falando && Math.floor(t * 8) % 2) R(-1, hy + 16, 3, 2, "#5a1f1c");
    else if (act || torcendo) { R(-2, hy + 16, 6, 1, "#7a3b30"); R(-3, hy + 15, 1, 1, "#7a3b30"); R(4, hy + 15, 1, 1, "#7a3b30"); }
    else R(-1, hy + 16, 3, 1, "#7a3b30");
  } else {
    switch (pal.cabelo) {
      case 1: RB(-12, hy - 3, 24, 25, hair); R(6, hy, 6, 22, hd); break;
      case 2: RB(-12, hy - 3, 24, 19, hair); RB(-5, hy - 9, 10, 6, hair); R(6, hy, 6, 16, hd); break;
      case 3: RB(-13, hy - 7, 26, 24, hair); RB(-15, hy - 2, 4, 13, hair); RB(11, hy - 2, 4, 13, hd); break;
      default: RB(-12, hy - 3, 24, 19, hair); R(6, hy, 6, 16, hd);
    }
    R(-13, hy + 9, 2, 5, sk);
  }
  g.globalAlpha = 1;
}
