// =====================================================================
//  La casa a 4 zone (revisione 10/11)
//  La casa diventa più alta (la telecamera la segue) e i muri interni la dividono in:
//    cucina (in alto a sinistra, col bancone)  |  camera (in alto a destra: finestra, calorifero, letto)
//    bagno (a destra, al centro: vasca, lavandino, lettiera)  |  soggiorno (in basso: divano, TV, porta di casa)
//  Ogni zona ha la sua porta verso il soggiorno. Anastasia non passa attraverso i muri; gli animali,
//  quando cambiano zona, passano dalle porte.
//  Le partite già iniziate: i mobili della metà bassa scendono nel soggiorno, il letto va in camera,
//  e quelli che finissero su un muro vengono spostati nel posto libero più vicino.
//  Per tornare alla casa di prima basta togliere questo file da index.html (i salvataggi restano validi).
// =====================================================================
const CASA4 = {
  h: 400,
  muri: [   // dove i piedi non passano
    { x: 0, y: 146, w: 30, h: 16 }, { x: 54, y: 146, w: 38, h: 16 }, { x: 116, y: 146, w: 60, h: 16 },   // tra la fila alta e il soggiorno
    { x: 84, y: 32, w: 8, h: 122 },                                                                     // tra cucina e camera
    { x: 100, y: 160, w: 6, h: 36 }, { x: 100, y: 222, w: 6, h: 46 },                                   // parete del bagno (porta a sinistra)
    { x: 100, y: 254, w: 76, h: 14 },                                                                   // sotto il bagno
  ],
  porte: {
    cucina: { dentro: { x: 42, y: 136 }, fuori: { x: 42, y: 172 } },
    camera: { dentro: { x: 104, y: 136 }, fuori: { x: 104, y: 172 } },
    bagno: { dentro: { x: 120, y: 209 }, fuori: { x: 86, y: 209 } },
  },
  nomi: { cucina: 'Cucina', camera: 'Camera da letto', bagno: 'Bagno', soggiorno: 'Soggiorno' },
  vasca: { x: 138, y: 166, w: 34, h: 18 }, lavandino: { x: 112, y: 160, w: 16, h: 12 }, tavolo: { x: 22, y: 104, w: 42, h: 12 },
};
function zonaCasa(x, y) { if (y < 154) return x < 88 ? 'cucina' : 'camera'; if (y < 262 && x > 103) return 'bagno'; return 'soggiorno'; }
function nelMuro(x, y, m = 0) { return CASA4.muri.some(r => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m); }
// i punti intermedi per andare da (x0,y0) a (x1,y1) passando dalle porte
function percorsoCasa(x0, y0, x1, y1) {
  const za = zonaCasa(x0, y0), zb = zonaCasa(x1, y1), pts = [];
  if (za !== 'soggiorno') { pts.push(CASA4.porte[za].dentro, CASA4.porte[za].fuori); }
  if (zb !== za && zb !== 'soggiorno') { pts.push(CASA4.porte[zb].fuori, CASA4.porte[zb].dentro); }
  if (za === zb) pts.length = 0;
  // nel soggiorno, l'angolo sotto il bagno: chi va da sopra a sotto-sinistra (o viceversa) gira intorno
  const out = [], seq = [{ x: x0, y: y0 }].concat(pts, [{ x: x1, y: y1 }]);
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i], b = seq[i + 1];
    out.push(a);
    if (zonaCasa(a.x, a.y) === 'soggiorno' && zonaCasa(b.x, b.y) === 'soggiorno' && ((a.x > 96 && a.y > 262 && b.y < 270 && b.x <= 100) || (b.x > 96 && b.y > 262 && a.y < 270 && a.x <= 100))) out.push({ x: 86, y: 280 });
  }
  return out.slice(1);
}
const casa4Attiva = s => s && s.stanza === 'casa';

(function () {
  // ---------------- la stanza è più alta solo in casa ----------------
  const init = Rifugio.prototype.init;
  Rifugio.prototype.init = function (d) { init.apply(this, arguments); STANZA.h = this.stanza === 'casa' ? CASA4.h : 15 * T; };
  // ogni altra scena trova la stanza della misura normale
  [Livello, Mappa].forEach(C => { const i = C.prototype.init; C.prototype.init = function () { STANZA.h = 15 * T; if (i) return i.apply(this, arguments); }; });

  // ---------------- salvataggi: i mobili nelle nuove zone ----------------
  function migra(S) {
    if (S.casaZone) return;
    S.arredi.forEach(a => {
      if ((a.stanza || 'casa') !== 'casa') return;
      const o = OGGETTI[a.id]; if (!o || o.tipo === 'muro') return;
      if (a.y >= 120) a.y += 160;                                                           // la metà bassa diventa il soggiorno
      else if (/^letto_(verde|azzurro|rosa)$/.test(a.id) && a.x < 88) a.x = STANZA.w - a.x;   // il letto va in camera
    });
    S.casaZone = 1;
  }
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    if (this.stanza === 'casa') { migra(Save.data); }
    crea.apply(this, arguments);
    if (this.stanza !== 'casa') return;
    this.disegnaZone();
    if (this.sistemaArredi) this.sistemaArredi();
    // nessuno comincia dentro un muro
    (this.ospiti || []).forEach(o => { if (o !== this.cat && nelMuro(o.x, o.y, 4)) { const p = this.puntoLibero(o); o.setPosition(p.x, p.y); } });
    this.zonaPlayer = zonaCasa(this.player.x, this.player.y);
  };

  // ---------------- disegno ----------------
  Rifugio.prototype.disegnaZone = function () {
    const W = STANZA.w;
    // pavimento del bagno a piastrelle
    const b = this.add.graphics().setDepth(-9.6);
    for (let y = 160; y < 256; y += 8) for (let x = 104; x < 176; x += 8) b.fillStyle(((x + y) / 8) % 2 ? 0xdfe8ec : 0xc9d7de, 1).fillRect(x, y, 8, 8);
    // pavimento della cucina: piastrelle calde
    const k = this.add.graphics().setDepth(-9.6);
    for (let y = 32; y < 146; y += 8) for (let x = 0; x < 84; x += 8) k.fillStyle(((x + y) / 8) % 2 ? 0xe9c9a0 : 0xdcb88c, 1).fillRect(x, y, 8, 8);
    // muri interni: la faccia del muro (come la parete in alto) e la cima
    const faccia = (x, y, w, h) => {
      this.add.tileSprite(x, y, w, h, 'muro').setOrigin(0).setDepth(y + h);
      const g = this.add.graphics().setDepth(y + h + 0.1);
      g.fillStyle(0x754c60, 1).fillRect(x, y - 3, w, 3); g.fillStyle(0x8a5a48, 1).fillRect(x, y + h - 3, w, 3);
    };
    const cima = (x, y, w, h) => { const g = this.add.graphics().setDepth(y + h); g.fillStyle(0x754c60, 1).fillRect(x, y, w, h); g.fillStyle(0x9a6a78, 1).fillRect(x + 1, y, w - 2, h - 1); };
    faccia(0, 146, 30, 14); faccia(54, 146, 38, 14); faccia(116, 146, 60, 14);
    cima(85, 32, 6, 114);
    cima(101, 160, 4, 36); cima(101, 222, 4, 32);
    faccia(100, 254, 76, 14);
    // stipiti delle porte
    const st = this.add.graphics().setDepth(161);
    [[30, 146], [54, 146], [92, 146], [116, 146]].forEach(([x, y]) => st.fillStyle(0x8a5a48, 1).fillRect(x - 1, y - 3, 2, 17));
    // bagno: vasca e lavandino
    const v = CASA4.vasca, g = this.add.graphics().setDepth(v.y + v.h);
    g.fillStyle(0xf4f4f0, 1).fillRoundedRect(v.x, v.y, v.w, v.h, 4); g.fillStyle(0x9ad3e6, 1).fillRoundedRect(v.x + 3, v.y + 3, v.w - 6, v.h - 7, 3);
    g.lineStyle(1, 0x504086, 0.9).strokeRoundedRect(v.x, v.y, v.w, v.h, 4); g.fillStyle(0xc3c9d2, 1).fillRect(v.x + v.w - 6, v.y - 2, 3, 4);
    const l = CASA4.lavandino, g2 = this.add.graphics().setDepth(l.y + l.h);
    g2.fillStyle(0xf4f4f0, 1).fillRoundedRect(l.x, l.y, l.w, l.h, 3); g2.fillStyle(0xbfd9e3, 1).fillEllipse(l.x + l.w / 2, l.y + 5, l.w - 6, 5);
    g2.lineStyle(1, 0x504086, 0.9).strokeRoundedRect(l.x, l.y, l.w, l.h, 3); g2.fillStyle(0xc3c9d2, 1).fillRect(l.x + l.w / 2 - 1, l.y - 2, 2, 3);
    // cucina: un tavolino con due sedie
    const t = this.add.graphics().setDepth(118);
    t.fillStyle(0xb98a5c, 1).fillRect(30, 104, 26, 12); t.fillStyle(0xd9b48a, 1).fillRect(30, 104, 26, 3); t.lineStyle(1, 0x754c60, 0.9).strokeRect(30, 104, 26, 12);
    t.fillStyle(0x9d6a4c, 1).fillRect(22, 108, 6, 8).fillRect(58, 108, 6, 8);
    // un tappeto nel soggiorno, davanti al divano
    const r = this.add.graphics().setDepth(-5.5);
    r.fillStyle(0xc77d7d, 0.75).fillRoundedRect(18, 330, 60, 30, 4); r.lineStyle(1, 0xf2cf8c, 0.8).strokeRoundedRect(21, 333, 54, 24, 3);
  };

  // ---------------- Anastasia non passa nei muri ----------------
  const mv = Rifugio.prototype.movePlayer;
  Rifugio.prototype.movePlayer = function (dt, blocked) {
    if (!casa4Attiva(this)) return mv.call(this, dt, blocked);
    const v = CASA4.vasca, l = CASA4.lavandino, dentro = (r, x, y) => x > r.x - 2 && x < r.x + r.w + 2 && y > r.y + 2 && y < r.y + r.h + 4;
    return mv.call(this, dt, (x, y) => blocked(x, y) || nelMuro(x, y, 3) || dentro(v, x, y) || dentro(l, x, y) || dentro(CASA4.tavolo, x, y));
  };
  // ---------------- gli animali passano dalle porte ----------------
  const pl = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    if (!casa4Attiva(this)) return pl.call(this, o);
    for (let i = 0; i < 12; i++) { const p = pl.call(this, o); if (p.posto || !nelMuro(p.x, p.y, 6)) return p; }
    return { x: 120, y: 320 };
  };
  const wander = Rifugio.prototype.wander;
  Rifugio.prototype.wander = function (dt) {
    if (casa4Attiva(this)) (this.ospiti || []).forEach(o => {
      if (!o.active || o.occupato || o.evento || o.uscendo) return;
      if (!o.meta && o.__tappe && o.__tappe.length) { o.meta = o.__tappe.shift(); o.pausa = 0; o.dorme = false; return; }
      if (o.meta && !o.meta.__tappa && !o.__per) {   // nuova meta: se è in un'altra zona, prima le porte
        const pts = percorsoCasa(o.x, o.y, o.meta.x, o.meta.y);
        if (pts.length) { o.__tappe = pts.map(p => ({ x: p.x, y: p.y, __tappa: true })).concat([o.meta]); o.__tappe[o.__tappe.length - 1].__per = true; o.meta = o.__tappe.shift(); }
        else o.meta.__per = true;
      }
    });
    const r = wander.call(this, dt);
    if (casa4Attiva(this)) (this.ospiti || []).forEach(o => { if (o.__tappe && o.__tappe.length && !o.meta) o.pausa = 0; });
    return r;
  };
  const cammina = Rifugio.prototype.cammina;
  Rifugio.prototype.cammina = function (o, x, y, vel, poi) {
    if (!casa4Attiva(this) || !o) return cammina.apply(this, arguments);
    const pts = percorsoCasa(o.x, o.y, x, y);
    if (!pts.length) return cammina.apply(this, arguments);
    const passo = i => i < pts.length ? cammina.call(this, o, pts[i].x, pts[i].y, vel, () => passo(i + 1)) : cammina.call(this, o, x, y, vel, poi);
    return passo(0);
  };
  // avvicinarsi a un animale in un'altra zona: è lui a venire, passando dalla porta
  const avv = Rifugio.prototype.avvicinati;
  if (avv) Rifugio.prototype.avvicinati = function (o, poi) {
    const p = this.player;
    if (!casa4Attiva(this) || !o || zonaCasa(o.x, o.y) === zonaCasa(p.x, p.y)) return avv.apply(this, arguments);
    o.meta = null; o.evento = true;
    return this.cammina(o, p.x + (o.x < p.x ? -14 : 14), p.y + 1, 1.8, () => { o.evento = false; o.coccola = 99; o.setFlipX(p.x < o.x); poi(); });
  };
  // ---------------- mobili: non sui muri, non su vasca e lavandino ----------------
  const ing = Rifugio.prototype.ingombri;
  Rifugio.prototype.ingombri = function () {
    const r = ing.apply(this, arguments); if (!casa4Attiva(this)) return r;
    const R = (q, m = 0) => new Phaser.Geom.Rectangle(q.x - m, q.y - 12 - m, q.w + 2 * m, q.h + 12 + 2 * m);
    CASA4.muri.forEach(q => r.pavimento.push(R(q, 1))); r.pavimento.push(R(CASA4.vasca), R(CASA4.lavandino), R(CASA4.tavolo));
    Object.values(CASA4.porte).forEach(d => r.pavimento.push(new Phaser.Geom.Rectangle(d.fuori.x - 10, d.fuori.y - 20, 20, 22)));   // le porte restano libere
    return r;
  };
  const mnv = Rifugio.prototype.motivoNonValido;
  Rifugio.prototype.motivoNonValido = function (s) {
    if (casa4Attiva(this) && s.ogg.tipo !== 'muro') {
      const b = s.getBounds(), base = new Phaser.Geom.Rectangle(b.x + 1, b.y + b.height * 0.45, b.width - 2, b.height * 0.55 - 1);
      const R = q => new Phaser.Geom.Rectangle(q.x, q.y - 12, q.w, q.h + 12);
      if (!(s.dati && s.dati.calorifero) && CASA4.muri.some(q => Phaser.Geom.Rectangle.Overlaps(base, R(q)))) return 'Qui non ci sta: c\'è un muro';
      if ([CASA4.vasca, CASA4.lavandino].some(q => Phaser.Geom.Rectangle.Overlaps(base, R(q)))) return 'Qui non ci sta: è in mezzo al bagno';
      if (Phaser.Geom.Rectangle.Overlaps(base, R(CASA4.tavolo))) return 'Qui non ci sta: c\'è il tavolo';
      if (Object.values(CASA4.porte).some(d => Phaser.Geom.Rectangle.Overlaps(base, new Phaser.Geom.Rectangle(d.fuori.x - 10, d.fuori.y - 20, 20, 22)))) return 'Qui non ci sta: blocca una porta';
    }
    return mnv.call(this, s);
  };
  Rifugio.prototype.valido = function (s) { return !this.motivoNonValido(s); };
  // i peli non finiscono dentro i muri
  const sp = Rifugio.prototype.spawnPelo;
  Rifugio.prototype.spawnPelo = function (i) {
    const r = sp.apply(this, arguments); if (!casa4Attiva(this)) return r;
    const g = this.peliSprites[this.peliSprites.length - 1];
    if (g && nelMuro(g.px, g.py, 6)) { g.py = Math.min(STANZA.h - 30, g.py + 26); g.y = g.py; if (nelMuro(g.px, g.py, 6)) { g.px = 120; g.x = 120; } }
    return r;
  };
  // entrando in una zona, il suo nome
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    if (!casa4Attiva(this) || !this.player || this.modo !== 'gioca') return;
    const z = zonaCasa(this.player.x, this.player.y);
    if (z !== this.zonaPlayer) { this.zonaPlayer = z; if (!this.hud.dialog) this.hud.toast(CASA4.nomi[z]); }
  };
})();
// la lettiera di Mordicchio sta in bagno
LETTIERA = () => (STANZA.h === CASA4.h ? { x: 156, y: 228, w: 22, h: 12 } : { x: STANZA.w - 20, y: STANZA.h - 22, w: 22, h: 12 });
