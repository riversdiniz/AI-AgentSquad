/* =====================================================================
   PLANTA DO ESCRITÓRIO
   Cada caractere é um tile. Quando a planta real chegar, basta redesenhar
   esta grade (o tamanho pode mudar). As paredes do fundo são automáticas
   nas bordas de cima (y=0) e da esquerda (x=0).

   Pisos:  .  escritório (madeira)   ,  cozinha (azulejo)   _  lounge (carpete)
           :  sala de jogos (emborrachado)   ;  banheiro (cerâmica)
   Móveis: c  cadeira de mesa (o agente senta aqui)   D  mesa (fica logo abaixo da cadeira)
           #  divisória   E  elevador   P  planta   W  bebedouro   R  estante
           K  bancada   C  máquina de café   F  geladeira   t  mesa da cozinha   o  banqueta
           V  TV   S  sofá   A  fliperama   L  luminária de chão
           I  pia com espelho   Q  vaso sanitário   G  mesa de ping-pong (2 tiles lado a lado)
   ===================================================================== */
const PLANTA = [
  "PRR..E.....WP#KKKCKKF,,P",
  ".............#,,,,,,,,,,",
  "..c..c..c..c.#,,,oo,,,,,",
  "..D..D..D..D.,,,,tt,,,,,",
  ".............#,,,oo,,,,,",
  ".............#######_###",
  "..c..c..c..c.#____V__AA_",
  "..D..D..D..D.#L________L",
  ".............#__________",
  ".............#___SSS____",
  "######.......#P_________",
  ";III;#.......#####:#####",
  ";;;;;;..c..c.#::::::::::",
  ";;;;;#..D..D.#:::GG:::::",
  "Q;Q;;#.......#::::::::::",
  ";;;;P#P.....P#P::::::::P",
];

const ROWS = PLANTA.length, COLS = PLANTA[0].length;
const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS) ? null : PLANTA[y][x];
const FLOORS = ".,_:;";
const SEATS = "coS";
const walkable = (x, y) => { const c = at(x, y); return c !== null && (FLOORS.includes(c) || c === "E" || SEATS.includes(c)); };
function floorOf(x, y) {
  const c = at(x, y);
  if (c && FLOORS.includes(c)) return c;
  for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1]]) { const n = at(x+dx, y+dy); if (n && FLOORS.includes(n)) return n; }
  return ".";
}
function frontOf(x, y) {
  for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1]]) {
    const c = at(x+dx, y+dy);
    if (c && walkable(x+dx, y+dy) && !SEATS.includes(c)) return { x:x+dx, y:y+dy };
  }
  return null;
}
/* Para onde o personagem olha, a partir de uma direção na grade.
   O desenho base olha para a direita da tela; flip espelha. */
function faceDe(dx, dy) { const sdx = dx - dy, sdy = dx + dy; return { face: sdy > 0 ? "front" : "back", flip: sdx < 0 }; }

/* Lugares: mesas de trabalho e pontos da vida social */
const DESKS = [], SPOTS = [];
let ELEVATOR = { x:0, y:0 };
function addSpot(sx, sy, tx, ty, tipo, sit, seatH) {
  if (sx == null) return;
  SPOTS.push({ x:sx, y:sy, tipo, sit, seatH, key:`${sx},${sy}`, ...faceDe(tx - sx, ty - sy) });
}
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
  const c = at(x, y);
  if (c === "c") DESKS.push({ x, y, key:`${x},${y}`, ...faceDe(0, 1) });
  if (c === "E") ELEVATOR = { x, y };
  if (c === "o") {
    const n = [[0,1],[0,-1],[1,0],[-1,0]].find(([dx,dy]) => at(x+dx,y+dy) === "t") || [0,1];
    addSpot(x, y, x+n[0], y+n[1], "conversa", true, 18);
  }
  if (c === "S") addSpot(x, y, x, y-1, "futebol", true, 16);
  const tipo = { C:"cafe", F:"cafe", W:"agua", A:"games", I:"espelho" }[c];
  if (tipo) { const f = frontOf(x, y); if (f) addSpot(f.x, f.y, x, y, tipo, false, 0); }
  if (c === "G") {
    if (at(x-1, y) !== "G" && walkable(x-1, y)) addSpot(x-1, y, x, y, "pingpong", false, 0);
    if (at(x+1, y) !== "G" && walkable(x+1, y)) addSpot(x+1, y, x, y, "pingpong", false, 0);
  }
}
