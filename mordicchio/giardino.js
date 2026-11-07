// =====================================================================
//  Giardino: laghetto e alberi da frutta.
//  - Il laghetto (in basso a sinistra): ogni tanto qualcuno va a bere da
//    solo, le papere e le oche ci fanno il bagno. Non si può camminarci dentro.
//  - Tre alberi (melo, pero, arancio): ogni 2-3 notti hanno frutti da
//    cogliere toccandoli. I frutti finiscono in dispensa e servono per i dolci.
// =====================================================================
const LAGO = { x: 42, y: 198, rx: 27, ry: 13 };
const NEL_LAGO = (x, y, m = 0) => ((x - LAGO.x) / (LAGO.rx + m)) ** 2 + ((y - LAGO.y) / (LAGO.ry + m)) ** 2 < 1;
const ALBERI = { arance: { x: 166, y: 92 }, pere: { x: 164, y: 178 }, mele: { x: 160, y: 220 } };
const PAPERE = ['gaia', 'paperotto', 'ottavia'];

Object.assign(Rifugio.prototype, {
  creaLago() {
    const g = this.add.graphics().setDepth(-9.6);
    g.fillStyle(0xd9c79a).fillEllipse(LAGO.x, LAGO.y + 1, LAGO.rx * 2 + 6, LAGO.ry * 2 + 6);
    g.fillStyle(0x8cc7d6).fillEllipse(LAGO.x, LAGO.y, LAGO.rx * 2, LAGO.ry * 2);
    g.fillStyle(0x6fb0c4).fillEllipse(LAGO.x + 3, LAGO.y + 3, LAGO.rx * 1.3, LAGO.ry * 1.1);
    g.lineStyle(1, 0x504086, 0.6).strokeEllipse(LAGO.x, LAGO.y, LAGO.rx * 2, LAGO.ry * 2);
    this.add.image(LAGO.x - 12, LAGO.y - 2, 'natura', 'ninfea').setDepth(-9.5);
    this.add.image(LAGO.x + 13, LAGO.y + 4, 'natura', 'ninfea_fiore').setDepth(-9.5);
    this.luccichii = [[LAGO.x + 2, LAGO.y - 5], [LAGO.x - 4, LAGO.y + 6]].map(([x, y]) => { const r = this.add.rectangle(x, y, 4, 1, 0xe8f6fa, 0.9).setDepth(-9.4); this.tweens.add({ targets: r, alpha: 0.2, yoyo: true, repeat: -1, duration: 1200 + Math.random() * 600 }); return r; });
  },
  creaAlberi() {
    const S = Save.data;
    // il pero (il melo e l'arancio ci sono già nel giardino)
    this.add.image(ALBERI.pere.x, ALBERI.pere.y, 'natura', 'albero').setOrigin(0.5, 1).setDepth(ALBERI.pere.y).setTint(0xe6f2c8);
    this.fruttiSprites = {};
    Object.keys(ALBERI).forEach(k => this.aggiornaAlbero(k));
  },
  aggiornaAlbero(k) {
    (this.fruttiSprites[k] || []).forEach(o => o.destroy()); this.fruttiSprites[k] = [];
    if (!Eco.fruttoPronto(Save.data, k)) return;
    const a = ALBERI[k];
    [[-7, -20], [5, -24], [2, -14]].forEach(([dx, dy], i) => {
      const f = this.add.image(a.x + dx, a.y + dy, 'cibo', k).setScale(0.55).setDepth(a.y + 1);
      this.tweens.add({ targets: f, y: f.y - 1.5, yoyo: true, repeat: -1, duration: 700 + i * 120 });
      this.fruttiSprites[k].push(f);
    });
    const sc = this.add.image(a.x + 9, a.y - 26, 'scintilla').setScale(0.3).setDepth(a.y + 2);
    this.tweens.add({ targets: sc, angle: 360, alpha: 0.3, yoyo: true, repeat: -1, duration: 1000 });
    this.fruttiSprites[k].push(sc);
  },
  tapAlbero(x, y) {
    const S = Save.data;
    const k = Object.keys(ALBERI).find(k => Math.abs(x - ALBERI[k].x) < 13 && y < ALBERI[k].y + 2 && y > ALBERI[k].y - 32);
    if (!k) return false;
    const F = FRUTTI[k];
    if (Eco.fruttoPronto(S, k)) {
      const n = Eco.cogli(S, k); Save.write(); Sfx.seme();
      (this.fruttiSprites[k] || []).forEach(f => this.tweens.add({ targets: f, y: this.player.y - 8, x: this.player.x, alpha: 0, duration: 350, onComplete: () => f.destroy() }));
      this.fruttiSprites[k] = [];
      this.hud.toast(F.nome + ' ×' + n + ' in dispensa');
      if (!S.oggi.primoFrutto && !(S.consigli && S.consigli.frutta)) { S.consigli = S.consigli || {}; S.consigli.frutta = true; Save.write(); this.time.delayedCall(1400, () => this.hud.bubble(this.cat, 'Con la frutta si fanno i dolci. Guarda nel libro delle ricette.', 4000)); }
    } else {
      const manca = F.ogni - ((S.alberi && S.alberi[k]) || 0);
      this.hud.toast(F.albero[0].toUpperCase() + F.albero.slice(1) + ' avrà frutti ' + (manca <= 1 ? 'domani' : 'tra ' + manca + ' giorni'));
    }
    return true;
  },
  // qualcuno va a bere, le papere fanno il bagno
  giroAlLago() {
    const liberi = this.ospiti.filter(o => o.active && !o.evento && !o.occupato && !o.uscendo && !o.dorme && !o.notizia && !(o.chiave === 'ciro' && Save.data.ora < 19 * 60));
    if (!liberi.length) return false;
    const papere = liberi.filter(o => PAPERE.includes(o.chiave));
    const o = papere.length && Math.random() < 0.45 ? Phaser.Utils.Array.GetRandom(papere) : Phaser.Utils.Array.GetRandom(liberi.filter(o => !PAPERE.includes(o.chiave)).concat(papere));
    o.evento = true; o.meta = null;
    const fine = () => { if (o.active) { o.evento = false; o.pausa = 2; o.nuota = false; } };
    if (PAPERE.includes(o.chiave)) {
      const tappe = [[LAGO.x - 10, LAGO.y], [LAGO.x + 10, LAGO.y + 3], [LAGO.x, LAGO.y - 3]];
      this.cammina(o, LAGO.x + LAGO.rx + 2, LAGO.y, 1, () => {
        if (!o.active || !o.evento) return fine(); o.nuota = true; let i = 0;
        const nuota = () => { if (!o.active || !o.nuota) return fine(); if (i >= tappe.length) return this.cammina(o, LAGO.x + LAGO.rx + 4, LAGO.y + 4, 1, fine); const [x, y] = tappe[i++]; this.cammina(o, x, y, 0.7, () => this.time.delayedCall(1500, nuota)); };
        nuota();
      });
    } else {
      const lato = Math.random() < 0.5 ? -1 : 1, x = LAGO.x + lato * (8 + Math.random() * 10), y = LAGO.y - LAGO.ry - 3;
      this.cammina(o, x, y, 1, () => {
        if (!o.active || !o.evento) return fine();
        o.setFlipX(false);
        const onda = this.add.ellipse(x, y + 5, 4, 2, 0xe8f6fa, 0).setStrokeStyle(1, 0xe8f6fa, 0.9).setDepth(-9.3);
        this.tweens.add({ targets: onda, scaleX: 3, scaleY: 3, alpha: 0, duration: 900, repeat: 2, onComplete: () => onda.destroy() });
        this.time.delayedCall(3200, fine);
      });
    }
    return true;
  },
});

(function () {
  const creaF = Rifugio.prototype.creaFuori;
  Rifugio.prototype.creaFuori = function () { creaF.call(this); this.creaLago(); this.creaAlberi(); };
  const blocc = Rifugio.prototype.bloccatoFuori;
  Rifugio.prototype.bloccatoFuori = function (x, y) { return NEL_LAGO(x, y, 2) || blocc.call(this, x, y); };
  const punto = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    for (let i = 0; i < 10; i++) { const p = punto.call(this, o); if (this.stanza !== 'fuori' || !NEL_LAGO(p.x, p.y, 4)) return p; }
    return { x: STANZA.w - 40, y: STANZA.h - 50 };
  };
  const tapG = Rifugio.prototype.tapGiardino;
  Rifugio.prototype.tapGiardino = function (x, y) { return tapG.call(this, x, y) || this.tapAlbero(x, y); };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta); if (!this.ospiti || this.stanza !== 'fuori') return;
    if (!this.prossimoLago) this.prossimoLago = time + 15000 + Math.random() * 15000;
    if (time > this.prossimoLago) {
      const h = this.hud, calmo = this.modo === 'gioca' && !h.dialog && !(h.ctrl && h.ctrl.frozen) && !this.inEvento && !this.uscendo && Save.data.ora >= 7 * 60;
      this.prossimoLago = time + (calmo && typeof meteoAdesso === 'function' && meteoAdesso().tipo !== 'pioggia' && this.giroAlLago() ? 30000 + Math.random() * 30000 : 8000);
    }
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () { this.prossimoLago = 0; this.fruttiSprites = {}; crea.call(this); };
})();
