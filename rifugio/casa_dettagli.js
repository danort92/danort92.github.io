// =====================================================================
//  Dettagli della casa (revisione 10/11)
//  - Pareti più curate: carta da parati a righine, battiscopa, una mensolina, ombra lungo il muro.
//  - Il lettuccio da calorifero si aggancia al calorifero: portandolo vicino «scatta» al suo posto.
//  - La lettiera di Mordicchio: una volta al giorno si può pulire. Nessuna penalità se non lo fai:
//    pulirla regala un momento con Mordicchio e un semino. Lui ogni tanto la usa davvero.
// =====================================================================
const CALORIFERO_LETTO = () => ({ x: STANZA.w - 31, y: 40 });
let LETTIERA = () => ({ x: STANZA.w - 20, y: STANZA.h - 22, w: 22, h: 12 });
Object.assign(Rifugio.prototype, {
  decoraPareti() {
    if (this.stanza !== 'casa') return;
    const g = this.add.graphics().setDepth(-8.7), m = STANZA.muro, W = STANZA.w;
    for (let x = 4; x < W; x += 8) g.fillStyle(0xffffff, 0.06).fillRect(x, 2, 2, m - 8);          // righine della carta da parati
    g.fillStyle(0xe9d3b0, 0.55).fillRect(0, m - 11, W, 2);                                           // listello
    g.fillStyle(0x8a5a48, 1).fillRect(0, m - 4, W, 4); g.fillStyle(0xa8705a, 1).fillRect(0, m - 4, W, 1);   // battiscopa
    const o = this.add.graphics().setDepth(-9.5); o.fillStyle(0x000000, 0.08).fillRect(0, m, W, 3);   // ombra del muro sul pavimento
  },
  disegnaLettiera() {
    if (this.stanza !== 'casa') return;
    const L = LETTIERA(), g = this.add.graphics().setDepth(L.y + L.h);
    g.fillStyle(0x6b8fb3, 1).fillRoundedRect(L.x - L.w / 2, L.y, L.w, L.h, 2);
    g.fillStyle(0x86a9c9, 1).fillRect(L.x - L.w / 2 + 1, L.y + 1, L.w - 2, 2);
    g.fillStyle(0xe8dcc0, 1).fillRect(L.x - L.w / 2 + 2, L.y + 3, L.w - 4, L.h - 6);
    g.lineStyle(1, 0x504086, 0.9).strokeRoundedRect(L.x - L.w / 2, L.y, L.w, L.h, 2);
    this.lettieraG = g; this.sporco = [];
    this.aggiornaLettiera();
  },
  lettieraSporca() { const S = Save.data, l = S.lettiera || {}; return l.pulita !== S.giorno && S.ora >= 9 * 60; },
  aggiornaLettiera() {
    (this.sporco || []).forEach(s => s.destroy()); this.sporco = [];
    if (!this.lettieraG || !this.lettieraSporca()) return;
    const L = LETTIERA();
    [[-5, 5], [2, 7], [6, 4]].forEach(([dx, dy]) => this.sporco.push(this.add.circle(L.x + dx, L.y + dy, 1.2, 0xa38a68).setDepth(L.y + L.h + 0.1)));
  },
  pulisciLettiera() {
    const S = Save.data, L = LETTIERA(), hud = this.hud;
    if (!this.lettieraSporca()) return hud.toast(S.ora < 9 * 60 ? 'La lettiera è pulita.' : 'La lettiera è già pulita, per oggi.');
    S.lettiera = { pulita: S.giorno }; S.semi += 1; Save.write(); this.aggiornaLettiera();
    const p = this.player; this.tweens.add({ targets: p, x: L.x - 14, y: L.y + 14, duration: 300 });
    this.time.delayedCall(320, () => {
      for (let i = 0; i < 6; i++) { const s = this.add.image(L.x - 8 + i * 3, L.y + 2, 'scintilla').setScale(0.25).setDepth(L.y + 20); this.tweens.add({ targets: s, y: s.y - 10, alpha: 0, duration: 700, delay: i * 70, onComplete: () => s.destroy() }); }
      this.aggiornaLettiera(); Sfx.seme && Sfx.seme();
      hud.toast('Lettiera pulita (+1 seme)');
      const c = this.cat; if (c && c.visible && !c.assente && !c.dorme && Math.random() < 0.6) this.time.delayedCall(700, () => hud.bubble(c, pick(['Grazie. Adesso è perfetta.', 'Ah, che profumo di pulito.', 'Servizio impeccabile.']), 2600));
    });
  },
  // ogni tanto Mordicchio la usa davvero: ci va, raspa, torna
  usaLettiera() {
    const c = this.cat, L = LETTIERA(); if (!c || c.assente || c.dorme || c.occupato || c.evento || this.hud.dialog) return;
    c.occupato = true; c.meta = null;
    this.cammina(c, L.x, L.y + 8, 1, () => {
      this.tweens.add({ targets: c, angle: 6, yoyo: true, repeat: 3, duration: 160, onComplete: () => {
        c.setAngle(0); this.hud.bubble(c, '...', 1200);
        this.time.delayedCall(1300, () => { c.occupato = false; c.pausa = 3; this.aggiornaLettiera(); });
      } });
    });
  },
});
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    this.decoraPareti(); this.disegnaLettiera();
    if (this.stanza === 'casa') this.time.addEvent({ delay: 45000, loop: true, callback: () => { if (Math.random() < 0.25 && this.modo === 'gioca') this.usaLettiera(); this.aggiornaLettiera(); } });
  };
  // la lettiera è un posto fisso: niente mobili sopra
  const ing = Rifugio.prototype.ingombri;
  Rifugio.prototype.ingombri = function () {
    const r = ing.apply(this, arguments);
    if (this.stanza === 'casa') { const L = LETTIERA(); r.pavimento.push(new Phaser.Geom.Rectangle(L.x - L.w / 2 - 2, L.y - 2, L.w + 4, L.h + 4)); }
    return r;
  };
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.modo === 'gioca' && this.stanza === 'casa') { const L = LETTIERA(); if (Math.abs(x - L.x) < L.w / 2 + 3 && y > L.y - 6 && y < L.y + L.h + 3) return this.pulisciLettiera(); }
    return tap.call(this, x, y);
  };
  // gli animali non si fermano dentro la lettiera
  const pl = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    const L = LETTIERA();
    for (let i = 0; i < 6; i++) { const p = pl.call(this, o); if (this.stanza !== 'casa' || p.posto || !(Math.abs(p.x - L.x) < L.w / 2 + 6 && Math.abs(p.y - L.y - L.h / 2) < L.h)) return p; }
    return pl.call(this, o);
  };
  // ---------------- il lettuccio sul calorifero ----------------
  const sulCalorifero = s => s && s.dati && s.dati.id === 'lettuccio' && s.dati.calorifero;
  const sg = Rifugio.prototype.spostaGhost;
  Rifugio.prototype.spostaGhost = function (x, y) {
    const s = this.ghost && this.ghost.s;
    if (s && s.dati.id === 'lettuccio' && this.stanza === 'casa') {
      const c = CALORIFERO_LETTO();
      if (Math.hypot(x - c.x, y - c.y) < 24) { s.dati.calorifero = true; s.setPosition(c.x, c.y); this.aggiornaGhost(); return; }
      s.dati.calorifero = false;
    }
    return sg.call(this, x, y);
  };
  const mnv = Rifugio.prototype.motivoNonValido;
  Rifugio.prototype.motivoNonValido = function (s) { if (sulCalorifero(s) && this.stanza === 'casa') return null; return mnv.call(this, s); };
  Rifugio.prototype.valido = function (s) { return !this.motivoNonValido(s); };
  const dd = Rifugio.prototype.depthDi;
  Rifugio.prototype.depthDi = function (s) { return sulCalorifero(s) ? CALORIFERO_LETTO().y - 0.5 : dd.call(this, s); };
  const spawn = Rifugio.prototype.spawnArredo;
  Rifugio.prototype.spawnArredo = function (a) { const s = spawn.apply(this, arguments); if (s && sulCalorifero(s)) { const c = CALORIFERO_LETTO(); s.setPosition(c.x, c.y); s.setDepth(this.depthDi(s)); } return s; };
})();
