// =====================================================================
//  I posti al posto dei pulsanti (come in Stardew / Animal Crossing):
//  - casa: l'angolo cucina (libro delle ricette e dispensa)
//  - giardino: la bancarella (regali, dispensa, mobili) e la bacheca dei lavori
//  - il van e il cartello del sentiero c'erano già
//  Avvicinandoti compare il nome del posto e, in basso, un pulsante «Apri…».
//  Camminarci accanto non apre mai nulla da solo; toccare il posto lo apre.
//  Restano pulsanti solo per ciò che non è un posto: il Diario (amici, album, arreda).
// =====================================================================
const LUOGHI = {
  casa: [{ id: 'cucina', nome: 'La cucina', x: 28, y: STANZA.muro + 10, r: 22, apri: 'Apri la cucina', azione: s => s.cucinaCasa ? s.cucinaCasa() : s.ricettario() }],
  fuori: [
    { id: 'bancarella', nome: 'La bancarella', x: 128, y: 198, r: 24, apri: 'Apri la bancarella', azione: s => s.bottega(), box: { x: 110, y: 184, w: 36, h: 16 } },
    { id: 'bacheca', nome: 'I lavori', x: 66, y: 70, r: 20, apri: 'Guarda la bacheca dei lavori', azione: s => s.lavori(), box: { x: 56, y: 62, w: 20, h: 10 } },
  ],
  stalla: [],
};
const PRESENTAZIONI = {
  cucina: 'Questa è la cucina: qui prepari i piatti, c\'è il libro delle ricette e vedi cosa c\'è in dispensa.',
  bancarella: 'La bancarella: con i semi ci trovi regali, arredi e ingredienti per la dispensa.',
  bacheca: 'La bacheca dei lavori: parcelle nuove per l\'orto, la stalla, il van. Si fa tutto da qui.',
};

Object.assign(Rifugio.prototype, {
  disegnaLuoghi() {
    const g = this.add.graphics();
    if (this.stanza === 'casa') {
      // angolo cucina contro la parete: bancone, fornelli, pentola che fuma
      const x = 8, y = STANZA.muro - 6, d = y + 16; g.setDepth(STANZA.muro + 2);
      g.fillStyle(0xd9b48a).fillRect(x, y, 42, 16); g.fillStyle(0xbf9466).fillRect(x, y + 12, 42, 4);
      g.fillStyle(0xf0dcc0).fillRect(x, y, 42, 3);
      g.fillStyle(0x4a4252).fillRect(x + 22, y + 1, 16, 2); g.fillStyle(0x6b6370).fillCircle(x + 26, y + 2, 2).fillCircle(x + 34, y + 2, 2);
      g.fillStyle(0x8a8fa0).fillRect(x + 23, y - 5, 7, 6); g.fillStyle(0x5c6070).fillRect(x + 22, y - 5, 9, 1);
      g.fillStyle(0xe8806f).fillCircle(x + 6, y + 1, 2).fillStyle(0x9fd38a).fillCircle(x + 11, y + 1, 2);   // pomodoro e insalata sul bancone
      g.lineStyle(1, 0x504086, 0.9).strokeRect(x, y, 42, 16); g.lineStyle(1, 0x754c60, 0.6).lineBetween(x + 14, y + 4, x + 14, y + 15);
      this.vaporeCucina = [0, 1].map(i => { const v = this.add.circle(x + 26 + i * 3, y - 7, 1.4, 0xffffff, 0.6).setDepth(d); this.tweens.add({ targets: v, y: v.y - 6, alpha: 0, duration: 1400, repeat: -1, delay: i * 700 }); return v; });
      // il calorifero sotto la finestra (quello di cui parlano Mordicchio, Nocciolo e Briciola)
      const cx = STANZA.w - 44, cy = STANZA.muro - 6, k = this.add.graphics().setDepth(cy + 12);
      k.fillStyle(0xe9e4dc).fillRect(cx, cy, 26, 12); k.lineStyle(1, 0x504086, 0.9).strokeRect(cx, cy, 26, 12);
      for (let i = 1; i < 6; i++) k.lineStyle(1, 0xb9b2a8, 1).lineBetween(cx + i * 4.4, cy + 2, cx + i * 4.4, cy + 11);
      k.fillStyle(0x8a8fa0).fillRect(cx + 2, cy + 12, 2, 2).fillRect(cx + 22, cy + 12, 2, 2);
    }
    if (this.stanza === 'fuori') {
      // bancarella con tendone a righe
      const b = LUOGHI.fuori[0].box; g.setDepth(b.y + b.h);
      g.fillStyle(0xb98a5c).fillRect(b.x + 2, b.y + 4, 2, 12).fillRect(b.x + b.w - 4, b.y + 4, 2, 12);
      g.fillStyle(0xd9b48a).fillRect(b.x, b.y + 9, b.w, 7); g.lineStyle(1, 0x504086, 0.9).strokeRect(b.x, b.y + 9, b.w, 7);
      for (let i = 0; i < 6; i++) g.fillStyle(i % 2 ? 0xfbf4dc : 0xd96f6f).fillRect(b.x - 2 + i * 6.66, b.y - 2, 6.66, 7);
      g.lineStyle(1, 0x504086, 0.9).strokeRect(b.x - 2, b.y - 2, b.w + 4, 7);
      g.fillStyle(0xe8806f).fillCircle(b.x + 8, b.y + 8, 2).fillStyle(0xf2b46a).fillCircle(b.x + 13, b.y + 8, 2).fillStyle(0x9fd38a).fillCircle(b.x + 24, b.y + 8, 2).fillStyle(0x8cbfe2).fillRect(b.x + 28, b.y + 6, 4, 3);
      // bacheca dei lavori con la cassetta degli attrezzi
      const c = LUOGHI.fuori[1].box, g2 = this.add.graphics().setDepth(c.y + c.h + 2);
      g2.fillStyle(0x9d6a4c).fillRect(c.x + 2, c.y - 6, 2, 16).fillRect(c.x + c.w - 4, c.y - 6, 2, 16);
      g2.fillStyle(0xd9b48a).fillRect(c.x, c.y - 12, c.w, 10); g2.lineStyle(1, 0x504086, 0.9).strokeRect(c.x, c.y - 12, c.w, 10);
      g2.fillStyle(0xfbf4dc).fillRect(c.x + 3, c.y - 10, 5, 6).fillRect(c.x + 10, c.y - 11, 6, 5); g2.fillStyle(0xe8806f).fillRect(c.x + 12, c.y - 10, 2, 1);
      g2.fillStyle(0xd96f6f).fillRect(c.x + c.w - 2, c.y + 4, 8, 5); g2.lineStyle(1, 0x504086, 0.9).strokeRect(c.x + c.w - 2, c.y + 4, 8, 5);
    }
  },
  luogoVicino() {
    const p = this.player; if (!p) return null;
    return (LUOGHI[this.stanza] || []).find(l => Math.hypot(p.x - l.x, p.y - l.y) < l.r) || null;
  },
  aggiornaLuogo() {
    const hud = this.hud, l = this.modo === 'gioca' && !hud.dialog && !(hud.ctrl && hud.ctrl.frozen) && !this.uscendo ? this.luogoVicino() : null;
    if (this.btnLuogo && !this.btnLuogo.scene) { this.btnLuogo = null; this.luogoOra = null; }   // l'HUD è stato ricostruito
    if ((l && l.id) === (this.luogoOra && this.luogoOra.id)) return;
    this.luogoOra = l;
    if (this.btnLuogo) { this.btnLuogo.destroy(); this.btnLuogo = null; }
    if (this.nomeLuogo) { this.nomeLuogo.destroy(); this.nomeLuogo = null; }
    if (!l) return;
    this.nomeLuogo = txt(this, l.x, l.y - 24, l.nome, 7, '#fbf4dc', { stroke: '#504086', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(20005).setResolution(Math.ceil(ZR * DPR / 1.5));
    const c = hud.add.container(0, 0).setDepth(50); hud.layer.add(c); this.btnLuogo = c;
    hud.button(UW / 2 - 110, UH - 66, 220, 42, l.apri, () => this.apriLuogo(l), { parent: c, size: 14 });
    const S = Save.data; S.consigli = S.consigli || {};
    if (!S.consigli['luogo-' + l.id]) { S.consigli['luogo-' + l.id] = true; Save.write(); this.hud.bubble(this.cat, PRESENTAZIONI[l.id], 4800); }
  },
  apriLuogo(l) {
    if (this.btnLuogo) { this.btnLuogo.destroy(); this.btnLuogo = null; } this.luogoOra = null;
    if (this.nomeLuogo) { this.nomeLuogo.destroy(); this.nomeLuogo = null; }
    l.azione(this);
  },
  // il Diario: quello che non è un posto
  diario() {
    const hud = this.hud, S = Save.data, dentro = this.stanza !== 'fuori';
    const nT = Object.keys(TESORI).filter(k => S.tesori && S.tesori[k]).length;
    const voci = [['Amici del rifugio', () => this.amici()], ['Album · tesori ' + nT + '/' + Object.keys(TESORI).length + (typeof RICORDI !== 'undefined' ? ' · ricordi ' + ricordiTrovati().length + '/' + Object.keys(RICORDI).length : ''), () => this.album()]];
    if (typeof cuoriTrovati === 'function') voci.push(['Cuoricini segreti · ' + cuoriTrovati(S) + '/' + CUORI_TOTALI, () => this.cuoricini()]);
    if (dentro) voci.push(['Arreda la ' + (this.stanza === 'casa' ? 'casa' : 'stalla'), () => this.entraArreda()]);
    const m = hud.modal('Diario', 74 + voci.length * 46);
    voci.forEach(([l, cb], i) => hud.button(28, m.y + 50 + i * 46, UW - 56, 38, l, () => { m.close(); cb(); }, { parent: m.c, size: 13 }));
  },
});

(function () {
  const creaF = Rifugio.prototype.creaFuori;
  Rifugio.prototype.creaFuori = function () { creaF.call(this); };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.btnLuogo = null; this.nomeLuogo = null; this.luogoOra = null;
    this.events.once('shutdown', () => { if (this.btnLuogo) { this.btnLuogo.destroy(); this.btnLuogo = null; } });
    crea.call(this); this.disegnaLuoghi();
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) { upd.call(this, time, delta); if (this.ospiti) this.aggiornaLuogo(); };
  // toccare il posto lo apre
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.modo === 'gioca') { const l = (LUOGHI[this.stanza] || []).find(l => Math.abs(x - l.x) < 18 && y > l.y - 22 && y < l.y + 10); if (l) return this.apriLuogo(l); }
    return tap.call(this, x, y);
  };
  // non si cammina dentro bancarella e bacheca; gli animali non ci si fermano
  const blocc = Rifugio.prototype.bloccatoFuori;
  Rifugio.prototype.bloccatoFuori = function (x, y) { return LUOGHI.fuori.some(l => l.box && x > l.box.x - 2 && x < l.box.x + l.box.w + 2 && y > l.box.y && y < l.box.y + l.box.h + 2) || blocc.call(this, x, y); };
  const punto = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    for (let i = 0; i < 8; i++) { const p = punto.call(this, o); if (this.stanza !== 'fuori' || !LUOGHI.fuori.some(l => l.box && Math.abs(p.x - (l.box.x + l.box.w / 2)) < l.box.w / 2 + 6 && Math.abs(p.y - (l.box.y + l.box.h / 2)) < l.box.h / 2 + 8)) return p; }
    return { x: STANZA.w - 40, y: STANZA.h - 60 };
  };
})();

// ---- arredo: niente sovrapposizioni con la finestra, la cucina, la porta (e tra mobili, come prima) ----
// Quadri e orologi non vanno sui vetri o sopra il bancone; mobili e tappeti non sopra la porta o la cucina.
// Le partite già salvate con un mobile in un posto impossibile lo ritrovano spostato nel posto libero più vicino.
(function () {
  const R = (x, y, w, h) => new Phaser.Geom.Rectangle(x, y, w, h);
  Rifugio.prototype.ingombri = function () {
    if (this.stanza === 'fuori') return { muro: [], pavimento: [] };
    const fin = R(STANZA.w - 47, 3, 32, 24), calor = R(STANZA.w - 46, STANZA.muro - 8, 30, 16), porta = R(STANZA.w / 2 - 17, STANZA.h - 30, 34, 30);
    const cucina = this.stanza === 'casa' ? R(7, STANZA.muro - 13, 44, 24) : null;
    return { muro: [fin, cucina, this.stanza === 'casa' ? calor : null].filter(Boolean), pavimento: [porta, cucina, this.stanza === 'casa' ? calor : null].filter(Boolean) };
  };
  Rifugio.prototype.motivoNonValido = function (s) {
    const tipo = s.ogg.tipo, b = s.getBounds(), base = q => R(q.x + 1, q.y + q.height * 0.45, q.width - 2, q.height * 0.55 - 1);
    const ing = this.ingombri(), mia = tipo === 'muro' ? R(b.x + 1, b.y + 1, b.width - 2, b.height - 2) : base(b);
    const fisso = (tipo === 'muro' ? ing.muro : ing.pavimento).find(r => Phaser.Geom.Rectangle.Overlaps(mia, r));
    if (fisso) return fisso.y > STANZA.h / 2 ? 'Qui non ci sta: blocca la porta' : fisso.x < STANZA.w / 2 ? 'Qui non ci sta: è sopra la cucina' : fisso.y >= STANZA.muro - 8 ? 'Qui non ci sta: c\'è il calorifero' : 'Qui non ci sta: copre la finestra';
    const altro = this.arrediSprites.some(o => o !== s && (o.ogg.tipo === 'tappeto') === (tipo === 'tappeto') && (o.ogg.tipo === 'muro') === (tipo === 'muro') && Phaser.Geom.Rectangle.Overlaps(tipo === 'muro' ? R(o.getBounds().x + 1, o.getBounds().y + 1, o.getBounds().width - 2, o.getBounds().height - 2) : base(o.getBounds()), mia));
    return altro ? 'Qui non ci sta: è sopra un altro mobile' : null;
  };
  Rifugio.prototype.valido = function (s) { return !this.motivoNonValido(s); };
  const conf = Rifugio.prototype.confermaGhost;
  Rifugio.prototype.confermaGhost = function () {
    const g = this.ghost; if (g && !g.ok) { this.hud.toast(this.motivoNonValido(g.s) || 'Qui non ci sta'); return; }
    return conf.call(this);
  };
  // partite vecchie: sposta i mobili che finiscono in un posto impossibile
  Rifugio.prototype.sistemaArredi = function () {
    if (this.stanza === 'fuori' || !this.arrediSprites) return;
    let mosso = false;
    this.arrediSprites.forEach(s => {
      if (this.valido(s)) return;
      const x0 = s.x, y0 = s.y, tipo = s.ogg.tipo, cand = [];
      const minY = tipo === 'muro' ? s.height + 2 : STANZA.muro + s.height * 0.4 + 4, maxY = tipo === 'muro' ? STANZA.muro - 2 : STANZA.h - 16;
      for (let y = Math.ceil(minY / 8) * 8; y <= maxY; y += 8) for (let x = Math.ceil(s.width / 2 / 8) * 8; x <= STANZA.w - s.width / 2; x += 8) cand.push([x, y]);
      cand.sort((a, b) => Math.hypot(a[0] - x0, a[1] - y0) - Math.hypot(b[0] - x0, b[1] - y0));
      const ok = cand.find(([x, y]) => { s.setPosition(x, y); return this.valido(s); });
      if (ok) { s.dati.x = ok[0]; s.dati.y = ok[1]; s.setDepth(this.depthDi(s)); mosso = true; } else s.setPosition(x0, y0);
    });
    if (mosso) Save.write();
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () { crea.apply(this, arguments); this.sistemaArredi(); };
})();
