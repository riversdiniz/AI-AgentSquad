/* =====================================================================
   AGENTES E SIMULAÇÃO
   ===================================================================== */
const PERSONAS = [
  { nome:"Ana",   jeito:"Movida a café", bordao:"Primeiro o café, depois o código.",          gostos:{ cafe:5, conversa:2, futebol:1, games:1, agua:1, pingpong:1, espelho:1 } },
  { nome:"Bento", jeito:"Torcedor fanático", bordao:"Hoje tem jogo!",      gostos:{ cafe:1, conversa:1, futebol:6, games:1, agua:1, pingpong:2, espelho:1 } },
  { nome:"Caio",  jeito:"Gamer de fliperama", bordao:"Só mais uma partida…",     gostos:{ cafe:1, conversa:1, futebol:2, games:6, agua:1, pingpong:2, espelho:1 } },
  { nome:"Duda",  jeito:"Fala pelos cotovelos", bordao:"Deixa eu te contar uma coisa…",   gostos:{ cafe:2, conversa:6, futebol:1, games:1, agua:1, pingpong:1, espelho:2 } },
  { nome:"Elis",  jeito:"Zen e hidratada", bordao:"Respira e hidrata.",        gostos:{ cafe:1, conversa:2, futebol:1, games:1, agua:5, pingpong:1, espelho:2 } },
  { nome:"Fábio", jeito:"Competitivo no ping-pong", bordao:"Quem encara uma partida?", gostos:{ cafe:2, conversa:1, futebol:2, games:2, agua:1, pingpong:6, espelho:1 } },
  { nome:"Gabi",  jeito:"Vaidosa", bordao:"Alguém viu meu pente?",                gostos:{ cafe:2, conversa:3, futebol:1, games:1, agua:1, pingpong:1, espelho:6 } },
  { nome:"Hugo",  jeito:"Joga de tudo", bordao:"Bora competir!",           gostos:{ cafe:1, conversa:1, futebol:3, games:4, agua:1, pingpong:4, espelho:1 } },
  { nome:"Iara",  jeito:"Equilibrada", bordao:"Tudo no equilíbrio.",            gostos:{ cafe:2, conversa:2, futebol:2, games:2, agua:2, pingpong:2, espelho:2 } },
  { nome:"Lia",   jeito:"Sempre com uma caneca", bordao:"Cadê minha caneca?",  gostos:{ cafe:5, conversa:3, futebol:1, games:1, agua:1, pingpong:1, espelho:1 } },
  { nome:"Murilo",jeito:"Fofoqueiro da cozinha", bordao:"Vocês souberam da última?",  gostos:{ cafe:3, conversa:5, futebol:1, games:1, agua:1, pingpong:2, espelho:1 } },
];
const PROJETOS = ["site-institucional", "api-pagamentos", "app-mobile", "pipeline-dados"];
const SHIRTS = ["#e3a32f", "#3a7bd5", "#d2553f", "#3e9b6e", "#8a5cc2", "#2bb3b1", "#e06b9a", "#5c6bd1", "#c7a12a", "#4f8f3a", "#ef7d3c"];
const HAIRS = ["#2b1d14", "#5a3a22", "#c58b3c", "#1a1a1a", "#8a2f1f", "#d9c27a", "#4a4a4a", "#6b3fa0"];
const SKINS = ["#f1c7a5", "#d9a37c", "#a8714d", "#7a4f33", "#f5d5bd", "#c68b62"];
const PANTS = ["#2f3b55", "#3b3b3b", "#4d5a3a", "#5b4636", "#26303d", "#6d7f99"];
const SHOES = ["#222222", "#5a3a22", "#f1f1f1", "#7a2b25"];

const TAREFAS = ["Lendo src/routes/index.ts", "Editando components/Header.tsx", "Buscando “useAuth” no projeto", "Escrevendo a migração do banco",
  "Criando testes de integração", "Ajustando o Dockerfile", "Revisando o diff antes do commit", "Atualizando o README", "Refatorando o serviço de login"];
const PEDIDOS = ["Quer permissão para rodar rm -rf dist", "Pergunta qual banco usar em produção", "Quer permissão para editar o .env",
  "Quer que você aprove o plano antes de seguir", "Pergunta se pode fazer push na main"];
const COMANDOS = ["npm run build", "pytest -q", "docker compose up -d", "npm test", "npx prisma migrate dev"];
const ATIVIDADE_TXT = { cafe:"tomar um café", agua:"beber água", conversa:"bater papo na cozinha", futebol:"ver futebol no lounge",
  games:"jogar fliperama", pingpong:"jogar ping-pong", espelho:"se arrumar no espelho" };
const ICONES = { cafe:"☕", agua:"💧", conversa:"💬", futebol:"⚽", games:"🕹️", pingpong:"🏓", espelho:"🪞", plateia:"👀" };
const PLATEIA_TXT = { pingpong:"assistir ao ping-pong", futebol:"torcer em pé no lounge", games:"assistir ao fliperama" };
const textoAtividade = spot => spot.tipo === "plateia" ? PLATEIA_TXT[spot.assiste] : ATIVIDADE_TXT[spot.tipo];

/* =====================================================================
   FALAS: o que cada um diz nos balões
   {outro} vira o nome de um colega presente, {jogador} quem está jogando,
   {projeto} o projeto de quem fala.
   ===================================================================== */
const FALAS = {
  cafe:     ["Café é vida ☕", "Só mais um gole…", "Esse tá forte, hein!", "Quem passou esse café? Tá ótimo!"],
  agua:     ["Hidratação em dia 💧", "Que calor hoje!", "Água: o melhor energético."],
  games:    ["Que lag é esse?!", "Última fase!", "Combo! 💥", "Recorde batido! 🏆", "Só mais uma ficha…"],
  pingpong: ["Toma essa! 🏓", "Essa foi na rede…", "Que saque!", "Agora é sério!", "Ponto meu!"],
  espelho:  ["Arrasando hoje ✨", "Cabelo no lugar!", "Só um retoque…", "Pronto pra reunião 😎"],
  futebol:  ["Que golaço!", "Pega, goleiro!", "Juiz, olha isso!", "Vai, vai, vai…", "Quase!"],
  plateia: {
    pingpong: ["Boa jogada!", "Uhuuu! 🏓", "Que rally!", "Vai, {jogador}!"],
    futebol:  ["Que jogo!", "Senta, senta! 😅", "Esse time não joga nada…"],
    games:    ["Vai, {jogador}!", "Pula! Pula!", "Quero a próxima!"],
  },
};
function falasDoDia() {
  const d = new Date().getDay(), h = new Date().getHours();
  const l = [];
  if (d === 5) l.push("Sextou! 🎉"); if (d === 1) l.push("Segunda de novo…");
  if (h >= 11 && h < 14) l.push("Bora almoçar?"); if (h >= 18 || h < 5) l.push("Hora extra de novo? 😴");
  return l.length ? l : ["Que dia corrido!"];
}
const CONVERSA = {
  fofoca:   () => ["Viu o commit de {outro}? 👀", "Dizem que o {projeto} vai ganhar outra fase…", "Quem deixou a caneca na pia? 👀"],
  piada:    () => ["Funcionou na minha máquina! 😂", "Tem bug? Chama de feature.", "99 bugs no código… corrige um… 127 bugs 😂"],
  trabalho: () => ["Deploy na sexta? Nem pensar 😅", "Os testes passaram de primeira!", "Quem revisa meu PR? 🙏"],
  dia:      falasDoDia,
};
const REACOES = { fofoca:["Sério?! 👀", "Não acredito!", "Conta mais!"], piada:["Hahaha 😂", "Kkkkk", "Essa foi boa!"],
  trabalho:["Verdade…", "Nem me fala.", "Bora!"], dia:["Pois é!", "Haha, verdade"] };

function preencher(txt, a) {
  const outros = state.agents.filter(o => o !== a && o.leaving === 0 && !o.sub);
  const jogadores = state.agents.filter(o => o.spot && a.spot && o.spot.tipo === a.spot.assiste && o.arrived);
  return txt.replace("{outro}", outros.length ? pick(outros).nome : "alguém")
            .replace("{jogador}", jogadores.length ? pick(jogadores).nome : "time")
            .replace("{projeto}", a.projeto);
}
function falar(a, texto, dur = 3.4, alerta = false) {
  if (!texto || a.leaving > 0) return;
  a.fala = { texto: preencher(texto, a), ate: state.time + dur, alerta };
}
function responderDepois(quem, texto, atraso = 1.3) { state.respostas.push({ quem, texto, em: state.time + atraso }); }
function saudacao() { const h = new Date().getHours(); return h < 12 ? "Bom dia! 👋" : h < 18 ? "Boa tarde! 👋" : "Boa noite! 👋"; }
const atividadeAtiva = tipo => tipo === "pingpong" ? !!state.pp : state.agents.some(o => o.spot && o.spot.tipo === tipo && o.arrived && o.status === "ocioso");

function puxarAssunto(a) {
  const tipo = a.spot.tipo;
  if (Math.random() < 0.12 && a.bordao) return falar(a, a.bordao);
  if (tipo === "plateia") return falar(a, pick(FALAS.plateia[a.spot.assiste]));
  if (tipo === "conversa") {
    const roda = state.agents.filter(o => o !== a && o.spot && o.spot.tipo === "conversa" && o.arrived && !o.fala);
    if (!roda.length) return falar(a, pick(FALAS.cafe));
    const assunto = pick(Object.keys(CONVERSA));
    falar(a, pick(CONVERSA[assunto]()));
    responderDepois(pick(roda), pick(REACOES[assunto]));
    return;
  }
  if (FALAS[tipo]) falar(a, pick(FALAS[tipo]));
}
const STATUS_TXT = { chegando:"Chegando", trabalhando:"Trabalhando", precisa:"Precisa de você", shell:"Esperando o terminal", ocioso:"Livre", saindo:"Indo embora" };

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const state = {
  agents: [], selected: null, paused: false, speed: 1, elevatorOpen: 0, gol: 0, nextId: 1, uiDirty: true, time: 0,
  faseFixa: null, luz: {}, pp: null, demo: false, modo: "conectando", respostas: [],
};
for (const z of FLOORS) state.luz[z] = 0;

function bfs(s, goal) {
  const key = p => p.x + "," + p.y;
  if (s.x === goal.x && s.y === goal.y) return [];
  const prev = new Map([[key(s), null]]), q = [s];
  while (q.length) {
    const c = q.shift();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const n = { x: c.x + dx, y: c.y + dy }, k = key(n);
      if (prev.has(k) || at(n.x, n.y) === null) continue;
      const isGoal = n.x === goal.x && n.y === goal.y;
      if (!isGoal && !walkable(n.x, n.y)) continue;
      prev.set(k, c);
      if (isGoal) { const path = []; let p = n; while (p && key(p) !== key(s)) { path.unshift(p); p = prev.get(key(p)); } return path; }
      q.push(n);
    }
  }
  return null;
}
const tileOf = a => ({ x: Math.floor(a.px), y: Math.floor(a.py) });

function goTo(a, x, y, onArrive) {
  a.sitting = false; a.arrived = false; a.atDesk = false;
  const path = bfs(tileOf(a), { x, y });
  if (!path) { a.px = x + 0.5; a.py = y + 0.5; a.path = []; onArrive && onArrive(); return; }
  a.path = path; a.onArrive = onArrive;
  if (!path.length) { a.onArrive = null; onArrive && onArrive(); }
}
function freeDesk() { return DESKS.find(d => !state.agents.some(a => a.desk && a.desk.key === d.key)); }
const hash = str => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

function criarAgente({ jaSentado = false, sid = null, projeto = null, real = false, sub = false, pai = null, descricao = null } = {}) {
  const desk = freeDesk(); if (!desk) return null;
  const usados = new Set(state.agents.filter(a => a.leaving === 0).map(a => a.nome));
  const livres = PERSONAS.filter(p => !usados.has(p.nome));
  const persona = sid ? (livres.length ? livres[hash(sid) % livres.length] : PERSONAS[hash(sid) % PERSONAS.length]) : (livres[0] || pick(PERSONAS));
  const id = state.nextId++;
  const sementes = sid ? hash(sid + "visual") : Math.floor(Math.random() * 1e9);
  const de = (arr, i) => arr[(sementes >>> (i * 3)) % arr.length];
  const a = {
    id, sid, real, sub, pai, descricao, nome: persona.nome, jeito: persona.jeito, bordao: persona.bordao, gostos: persona.gostos, projeto: projeto || pick(PROJETOS),
    pal: { shirt: de(SHIRTS, 0), hair: de(HAIRS, 1), skin: de(SKINS, 2), pants: de(PANTS, 3), shoe: de(SHOES, 4),
           cabelo: (sementes >>> 15) % 4, estilo: (sementes >>> 18) % 4, oculos: (sementes >>> 21) % 5 === 0, gravata: "#c0392b" },
    seed: Math.random() * 10, desk, px: ELEVATOR.x + 0.5, py: ELEVATOR.y + 0.5, path: [], face: "front", flip: false, walkT: 0,
    status: "chegando", tarefa: "Chegando ao escritório", timer: rand(6, 12), sitting: false, atDesk: false, spot: null, leaving: 0,
  };
  state.agents.push(a);
  if (jaSentado) {
    a.px = desk.x + 0.5; a.py = desk.y + 0.5; sentarNaMesa(a); setStatus(a, "trabalhando", pick(TAREFAS), false);
  } else {
    state.elevatorOpen = 1.4;
    log(sub && pai ? `${a.nome} chegou como subagente de ${pai.nome}: ${descricao}` : `${a.nome} chegou pelo elevador para trabalhar em <code>${a.projeto}</code>`);
    goTo(a, desk.x, desk.y, () => {
      sentarNaMesa(a);
      if (!sub) falar(a, saudacao(), 2.6);
      if (a.real) { a.status = "trabalhando"; const p = a.pendente || { status:"ocioso", tarefa:"Esperando o primeiro pedido" }; a.pendente = null; aplicarStatusReal(a, p); }
      else setStatus(a, "trabalhando", pick(TAREFAS));
    });
  }
  state.uiDirty = true;
  return a;
}
function sentarNaMesa(a) { a.px = a.desk.x + 0.5; a.py = a.desk.y + 0.82; a.sitting = true; a.seatH = 14; a.face = a.desk.face; a.flip = a.desk.flip; a.atDesk = true; a.arrived = true; }

function setStatus(a, status, tarefa, comLog = true) {
  if (status === "precisa" && a.status !== "precisa") { avisar(a); falar(a, "Preciso de você! ✋", 3, true); }
  if (a.status === "ocioso" && status !== "ocioso" && status !== "saindo" && a.spot && a.arrived) falar(a, pick(["Chegou pedido, fui! 🏃", "Opa, me chamaram!", "Volto já!"]), 2.4);
  if (status !== a.status) a.disseBuild = false;
  a.status = status; if (tarefa) a.tarefa = tarefa; a.since = state.time;
  if (comLog) {
    const msgs = {
      trabalhando: `${a.nome}: ${a.tarefa}`,
      precisa: `${a.nome} precisa de você. ${a.tarefa}`,
      shell: `${a.nome} está rodando <code>${a.tarefa}</code> e esperando terminar`,
    };
    if (msgs[status]) log(msgs[status], status === "precisa" ? "alert" : "");
  }
  state.uiDirty = true;
}
function liberarSpot(a) { a.spot = null; }
function voltarParaMesa(a, depois) { liberarSpot(a); goTo(a, a.desk.x, a.desk.y, () => { sentarNaMesa(a); depois && depois(); }); }

function escolherAtividade(a) {
  const ocupados = new Set(state.agents.filter(o => o !== a && o.spot).map(o => o.spot.key));
  const livres = SPOTS.filter(s => !ocupados.has(s.key) && (s.tipo !== "plateia" || atividadeAtiva(s.assiste)));
  if (!livres.length) return;
  const outrosLivres = state.agents.filter(o => o !== a && o.status === "ocioso").length;
  const peso = s => {
    if (s.tipo === "plateia") return (a.gostos[s.assiste] || 1) * 1.6;
    let p = (a.gostos[s.tipo] || 1) * (1 + state.agents.filter(o => o.spot && o.spot.tipo === s.tipo).length);
    if (s.tipo === "pingpong") {
      const esperando = state.agents.some(o => o.spot && o.spot.tipo === "pingpong");
      p *= esperando ? 4 : outrosLivres ? 1 : 0.1;          // alguém chamou para jogar? vai!
    }
    return p;
  };
  const total = livres.reduce((n, s) => n + peso(s), 0);
  let r = Math.random() * total, escolhido = livres[0];
  for (const s of livres) { r -= peso(s); if (r <= 0) { escolhido = s; break; } }
  a.spot = escolhido; a.arrived = false; a.activityLeft = rand(9, 16);
  goTo(a, escolhido.x, escolhido.y, () => {
    a.arrived = true; a.face = escolhido.face; a.flip = escolhido.flip; a.sitting = escolhido.sit; a.seatH = escolhido.seatH;
    const juntos = state.agents.filter(o => o !== a && o.spot && o.spot.tipo === escolhido.tipo && o.arrived);
    if (escolhido.tipo === "plateia") log(`${a.nome} parou para ${textoAtividade(escolhido)}`);
    else if (juntos.length) log(`${a.nome} se juntou a ${juntos.map(o => o.nome).join(" e ")} para ${textoAtividade(escolhido)}`);
    a.proxFala = rand(0.8, 2.5);
  });
}
function ficarLivre(a, tarefa) {
  setStatus(a, "ocioso", tarefa || "Terminou a vez e espera a próxima instrução", false);
  a.idleLeft = a.real ? Infinity : rand(25, 50);
  a.atDesk = false;
  escolherAtividade(a);
  log(`${a.nome} terminou a vez e foi ${a.spot ? textoAtividade(a.spot) : "dar uma volta"}`);
}
function sairPeloElevador(a) {
  goTo(a, ELEVATOR.x, ELEVATOR.y, () => { state.elevatorOpen = 1.4; a.leaving = 0.001; a.face = "back"; });
}
function encerrar(a, silencioso = false) {
  liberarSpot(a);
  setStatus(a, "saindo", "Entregou o trabalho", false);
  if (!silencioso) log(`${a.nome} entregou o trabalho em <code>${a.projeto}</code> e foi embora 📦`);
  sairPeloElevador(a);
}

/* Subagentes: chegam, trabalham numa mesa livre e, no fim, levam o resultado (📦) até quem os chamou */
function pertoDe(alvo) {
  const t = tileOf(alvo);
  const ocupados = new Set(state.agents.filter(o => o !== alvo).map(o => tileOf(o)).map(p => p.x + "," + p.y));
  for (const [dx, dy] of [[1,0],[1,1],[0,1],[-1,0],[0,-1],[1,-1],[-1,1]]) {
    const x = t.x + dx, y = t.y + dy, c = at(x, y);
    if (c && walkable(x, y) && !SEATS.includes(c) && !ocupados.has(x + "," + y)) return { x, y };
  }
  return null;
}
function entregar(a) {
  const pai = a.pai && state.agents.includes(a.pai) && a.pai.leaving === 0 && a.pai.status !== "saindo" ? a.pai : null;
  liberarSpot(a);
  setStatus(a, "saindo", "Levando o resultado", false);
  const alvo = pai && pertoDe(pai);
  if (!alvo) { log(`${a.nome} terminou a tarefa de subagente e foi embora 📦`); sairPeloElevador(a); return; }
  a.entregando = true;
  goTo(a, alvo.x, alvo.y, () => {
    Object.assign(a, faceDe(Math.floor(pai.px) - alvo.x, Math.floor(pai.py) - alvo.y));
    log(`${a.nome} entregou o resultado para ${pai.nome} 📦`);
    falar(a, "Tá aqui o resultado! 📦", 2.4);
    responderDepois(pai, "Valeu! 🙌", 1.2);
    a.esperaEntrega = 1.8;
  });
}
const TAREFAS_SUB = ["Explorar a estrutura do projeto", "Revisar a segurança do login", "Escrever os testes da API", "Procurar usos de useAuth", "Comparar as bibliotecas de gráficos"];
function chamarSubagenteDemo(a) {
  const descricao = pick(TAREFAS_SUB);
  const sub = criarAgente({ sub: true, pai: a, descricao, projeto: a.projeto });
  if (!sub) return false;
  sub.vida = rand(12, 20);
  setStatus(a, "trabalhando", `Esperando o subagente: ${descricao}`);
  a.timer = sub.vida + 6;
  return true;
}
function eventoDeTrabalho(a) {
  if (a._forcarLivre) { a._forcarLivre = false; ficarLivre(a); return; }
  const r = Math.random();
  const ativos = state.agents.filter(o => o.status !== "saindo" && !o.real).length;
  if (r < 0.10 && !a.sub && chamarSubagenteDemo(a)) return;
  if (r < 0.40) setStatus(a, "trabalhando", pick(TAREFAS.filter(t => t !== a.tarefa)));
  else if (r < 0.55) setStatus(a, "precisa", pick(PEDIDOS));
  else if (r < 0.70) { setStatus(a, "shell", pick(COMANDOS)); a.timer = rand(7, 16); return; }
  else if (r < 0.95 || ativos <= 3) { ficarLivre(a); return; }
  else { encerrar(a); return; }
  a.timer = rand(6, 13);
}

/* Ping-pong: quando os dois lados estão ocupados, rola uma partida */
function atualizarPingPong(dt) {
  const jogadores = state.agents.filter(a => a.spot && a.spot.tipo === "pingpong" && a.arrived && a.status === "ocioso");
  if (jogadores.length >= 2) {
    if (!state.pp) { state.pp = { inicio: state.time, a: jogadores[0], b: jogadores[1] }; log(`${jogadores[0].nome} e ${jogadores[1].nome} começaram uma partida de ping-pong 🏓`); }
    if (state.time - state.pp.inicio > 20) {
      const [v, p] = Math.random() < 0.5 ? [state.pp.a, state.pp.b] : [state.pp.b, state.pp.a];
      log(`${v.nome} ganhou de ${p.nome} no ping-pong: 5 × ${Math.floor(rand(1, 5))}`);
      falar(v, "Ganhei! 🏆", 3); responderDepois(p, pick(["Revanche depois!", "Foi sorte…", "Boa partida!"]), 1.1);
      state.pp = null;
      for (const j of jogadores) { liberarSpot(j); if (j.idleLeft > 4) escolherAtividade(j); }
    }
  } else state.pp = null;
}

function update(dt) {
  state.time += dt;
  state.elevatorOpen = Math.max(0, state.elevatorOpen - dt);
  state.gol = Math.max(0, state.gol - dt);

  for (const a of [...state.agents]) {
    if (a.path.length) {
      const n = a.path[0], tx = n.x + 0.5, ty = n.y + 0.5;
      const dx = tx - a.px, dy = ty - a.py, d = Math.hypot(dx, dy);
      const sp = 2.3 * dt * (a.status === "precisa" ? 1.9 : 1);
      a.walking = true; a.walkT += dt * (a.status === "precisa" ? 1.9 : 1);
      Object.assign(a, faceDe(dx, dy));
      if (d <= sp) { a.px = tx; a.py = ty; a.path.shift(); if (!a.path.length) { a.walking = false; const cb = a.onArrive; a.onArrive = null; cb && cb(); } }
      else { a.px += dx / d * sp; a.py += dy / d * sp; }
    } else a.walking = false;

    if (a.esperaEntrega > 0) { a.esperaEntrega -= dt; if (a.esperaEntrega <= 0) { a.entregando = false; sairPeloElevador(a); } }
    if (a.sub && !a.real && a.status === "trabalhando" && a.atDesk) { a.vida -= dt; if (a.vida <= 0) { entregar(a); continue; } }

    if (a.leaving > 0) { a.leaving += dt * 1.6; if (a.leaving >= 1) { state.agents.splice(state.agents.indexOf(a), 1); if (state.selected === a.id) state.selected = null; state.uiDirty = true; } continue; }

    switch (a.status) {
      case "trabalhando":
        if (a.atDesk && !a.real && !a.sub) { a.timer -= dt; if (a.timer <= 0) eventoDeTrabalho(a); }
        break;
      case "shell":
        if (a.real) break;
        a.timer -= dt;
        if (a.timer <= 0) {
          const ok = Math.random() < 0.75;
          log(ok ? `${a.nome}: <code>${a.tarefa}</code> terminou sem erros 🎉` : `${a.nome}: <code>${a.tarefa}</code> falhou 🌧️`, ok ? "" : "alert");
          setStatus(a, "trabalhando", ok ? pick(TAREFAS) : "Investigando a falha do comando", false); a.timer = rand(6, 12);
        }
        break;
      case "ocioso": {
        a.idleLeft -= dt;
        const emPartida = state.pp && (state.pp.a === a || state.pp.b === a);
        if (a.arrived && a.spot) {
          a.proxFala = (a.proxFala ?? rand(1, 4)) - dt;
          if (a.proxFala <= 0) { a.proxFala = rand(6, 12) / (0.7 + (a.gostos.conversa || 1) * 0.12); puxarAssunto(a); }
          if (a.spot.tipo === "plateia" && !atividadeAtiva(a.spot.assiste) && a.idleLeft > 4) { liberarSpot(a); escolherAtividade(a); }
        }
        if (a.arrived && a.spot && !emPartida) {
          a.activityLeft -= dt;
          if (a.spot.tipo === "futebol" && Math.random() < dt * 0.04 && state.gol <= 0) {
            state.gol = 2.5;
            const torcida = state.agents.filter(o => o.spot && o.spot.tipo === "futebol" && o.arrived).map(o => o.nome);
            log(`GOL! ${torcida.join(" e ")} ${torcida.length > 1 ? "comemoram" : "comemora"} no sofá ⚽`);
            for (const o of state.agents) if (o.spot && (o.spot.tipo === "futebol" || o.spot.assiste === "futebol") && o.arrived) falar(o, pick(["GOOOL! ⚽", "Golaço!", "É GOL!"]), 2.6);
          }
          if (a.activityLeft <= 0 && a.idleLeft > 4) { liberarSpot(a); escolherAtividade(a); }
        }
        if (a.idleLeft <= 0 && !a.path.length) {
          log(`${a.nome} recebeu uma nova instrução e voltou para a mesa`);
          setStatus(a, "trabalhando", pick(TAREFAS), false); a.timer = rand(6, 12);
          voltarParaMesa(a);
        }
        break;
      }
    }
  }
  atualizarPingPong(dt);
  state.respostas = state.respostas.filter(r => {
    if (state.time < r.em) return true;
    if (state.agents.includes(r.quem)) falar(r.quem, r.texto, 2.6);
    return false;
  });
  for (const a of state.agents) if (a.status === "shell" && !a.disseBuild && state.time - a.since > 8) { a.disseBuild = true; falar(a, "Esse comando não acaba… 🍿"); }

  // luz de cada cômodo acende quando tem gente (só faz diferença à noite)
  for (const z of FLOORS) {
    const ocupado = state.agents.some(a => a.leaving === 0 && floorOf(Math.floor(a.px), Math.floor(a.py)) === z);
    state.luz[z] += ((ocupado ? 1 : 0) - state.luz[z]) * Math.min(1, dt * 2.5);
  }

  if (state.demo) {
    state.spawnIn = (state.spawnIn ?? 6) - dt;
    const demos = state.agents.filter(a => !a.real && a.leaving === 0).length;
    if (state.spawnIn <= 0) { state.spawnIn = rand(25, 45); if (demos < 7) criarAgente(); }
  }
}

function responder(a, aprovado) {
  if (!a || a.status !== "precisa") return;
  log(aprovado ? `Você aprovou o pedido de ${a.nome} ✅` : `Você negou o pedido de ${a.nome}; ele vai seguir por outro caminho`);
  setStatus(a, "trabalhando", aprovado ? pick(TAREFAS) : "Procurando outra abordagem", false); a.timer = rand(6, 12);
}
function enviarInstrucao(a) {
  if (!a || a.status !== "ocioso") return;
  log(`Você mandou uma nova instrução para ${a.nome}`);
  setStatus(a, "trabalhando", pick(TAREFAS), false); a.timer = rand(6, 12);
  voltarParaMesa(a);
}
