// =====================================================================
//  1. Cartelli: quando ti avvicini compare al centro dello schermo il nome
//     del posto e scegli tu se andarci (come la partenza in Animal Crossing
//     o "Vuoi dormire?" in Stardew), così niente uscite per sbaglio.
//  2. Seconda richiesta: in alcune tappe, dopo il salvataggio, l'animale
//     chiede ancora una piccola cosa (raccogliere o accompagnarlo).
// =====================================================================
function schedaCartello(scena, o) {
  const hud = scena.hud; if (hud.dialog || (hud.ctrl && hud.ctrl.frozen)) return;
  const m = hud.modal(o.titolo, 150 + (o.testo ? 0 : -24), () => { scena.cartelloAperto = false; if (hud.cartello === m) hud.cartello = null; });
  hud.cartello = m; m.scena = scena; // se parte un dialogo della storia, la scelta si chiude e si riapre riavvicinandosi
  scena.cartelloAperto = true;
  if (o.testo) m.c.add(txt(hud, UW / 2, m.y + 52, o.testo, 12, COL.testo, { align: 'center', wordWrap: { width: UW - 70 }, lineSpacing: 3 }).setOrigin(0.5, 0));
  const y = m.y + m.h - 50, w = (UW - 66) / 2;
  hud.button(24, y, w, 36, o.vai, () => { m.close(); o.azione(); }, { parent: m.c, size: 13 });
  hud.button(42 + w, y, w, 36, o.resta || 'Resta qui', () => m.close(), { parent: m.c, size: 13 });
}
Rifugio.prototype.chiediCartello = function (o) { schedaCartello(this, o); };

Object.assign(Livello.prototype, {
  controllaUscita() {
    const p = this.player, u = this.uscita, st = this.st; if (!u || st.finito || this.cartelloAperto) return;
    const d = Math.hypot(u.x - p.x, u.y - p.y);
    if (d > 26) { this.vicinoUscita = false; return; }
    if (d > 12 || this.vicinoUscita) return;
    this.vicinoUscita = true;
    const A = ANIMALI[this.L.animale], nome = A && this.L.animale !== 'mordicchio' ? A.nome : null;
    const vai = (completa) => { if (completa) return this.completa(); st.finito = true; this.cameras.main.fadeOut(260, 251, 244, 220); this.time.delayedCall(280, () => this.scene.start('Mappa')); };
    if (st.giaFatta) return schedaCartello(this, { titolo: 'Il sentiero', testo: this.L.nome + ': qui è tutto tranquillo.', vai: 'Torna al sentiero', azione: () => vai(false) });
    if (st.salvato && (!this.L.dopo || st.fase2fatta) && this.portale) return schedaCartello(this, { titolo: 'Il sentiero', testo: 'Tutto fatto!' + (nome ? ' ' + nome + ' viene con te al rifugio.' : ''), vai: 'Torna al sentiero', azione: () => vai(true) });
    const testo = st.salvato ? (nome || 'Qualcuno') + ' ti aspetta per un\'ultima cosa. Se esci ora, la tappa ricomincia da capo.' : 'Non hai ancora finito qui. Puoi tornare quando vuoi: la tappa ricomincerà da capo.';
    schedaCartello(this, { titolo: 'Il sentiero', testo, vai: 'Torna al sentiero', resta: 'Resta', azione: () => vai(false) });
  },
  // ---------------- seconda richiesta ----------------
  avviaFase2() {
    const D = this.L.dopo, st = this.st; st.fase2 = { presi: 0 };
    if (!this.seguaci.includes(this.npc)) this.seguaci.push(this.npc);
    if (this.mamma && !this.seguaci.includes(this.mamma)) this.seguaci.push(this.mamma);
    this.trail = this.trail.slice(-5);
    this.hud.say(D.chiede, () => {
      this.extra = [];
      if (D.tipo === 'raccogli') D.dove.forEach(([x, y]) => {
        const it = this.add.image(x * T + 8, y * T + 10, D.atlas || 'natura', D.frame).setDepth(y * T + 10);
        this.tweens.add({ targets: it, y: it.y - 2, yoyo: true, repeat: -1, duration: 700 + Math.random() * 300 });
        this.extra.push(it);
      });
      else {
        const [x, y] = D.dove[0]; const g = this.add.ellipse(x * T + 8, y * T + 12, 22, 11, 0xfff2a8, 0.5).setStrokeStyle(1, 0xd79e61).setDepth(-11);
        this.tweens.add({ targets: g, alpha: 0.2, scaleX: 1.15, yoyo: true, repeat: -1, duration: 800 }); this.extra.push(g); this.metaFase2 = g;
      }
      this.aggiornaObiettivi(); this.ultimoProgresso = this.time.now; this.indizioDato = 0;
    });
  },
  aggiornaFase2() {
    const st = this.st, D = this.L.dopo, p = this.player; if (!st.fase2 || st.fase2fatta || !this.extra) return;
    if (D.tipo === 'raccogli') {
      this.extra.slice().forEach(it => {
        if (Math.hypot(it.x - p.x, it.y - p.y) > 11) return;
        this.extra = this.extra.filter(x => x !== it); this.tweens.killTweensOf(it);
        this.tweens.add({ targets: it, y: it.y - 10, alpha: 0, duration: 250, onComplete: () => it.destroy() });
        st.fase2.presi++; Sfx.seme(); this.progresso(); this.aggiornaObiettivi();
        if (st.fase2.presi >= D.dove.length) this.chiudiFase2(); else this.hud.toast(D.nome + ': ' + st.fase2.presi + ' su ' + D.dove.length);
      });
    } else if (this.metaFase2 && Math.hypot(this.metaFase2.x - p.x, this.metaFase2.y - p.y) < 14) {
      this.metaFase2.destroy(); this.metaFase2 = null; this.chiudiFase2();
    }
  },
  chiudiFase2() {
    const st = this.st; st.fase2fatta = true; this.hearts(this.npc.x, this.npc.y - 14); Sfx.cuore();
    this.hud.say(this.L.dopo.fatto, () => { this.aggiornaObiettivi(); apriOriginale.call(this); });
  },
});
const apriOriginale = Livello.prototype.apriPortale;
Livello.prototype.apriPortale = function (silenzioso) {
  if (!silenzioso && this.L.dopo && !this.st.fase2fatta && !this.st.giaFatta) { if (!this.st.fase2) this.avviaFase2(); return; }
  return apriOriginale.call(this, silenzioso);
};
(function () {
  const obi = Livello.prototype.obiettivoAttuale;
  Livello.prototype.obiettivoAttuale = function () {
    const st = this.st;
    if (st.fase2 && !st.fase2fatta && this.extra && this.extra.length) {
      const p = this.player, it = this.extra.slice().sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      return { k: 'dopo', x: it.x, y: it.y };
    }
    return obi.call(this);
  };
  const ago = Livello.prototype.aggiornaObiettivi;
  Livello.prototype.aggiornaObiettivi = function () {
    ago.call(this); const st = this.st, D = this.L.dopo;
    if (D && st.fase2 && this.ob && this.ob.b) this.ob.b.setText((st.fase2fatta ? '✔ ' : '○ ') + D.nome + (D.tipo === 'raccogli' ? ' ' + st.fase2.presi + '/' + D.dove.length : '')).setColor(st.fase2fatta ? COL.verde : COL.testo);
  };
  const upd = Livello.prototype.update;
  Livello.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    const h = this.hud; if (this.st && !this.st.finito && !(h && h.dialog) && !this.frozenAll) this.aggiornaFase2();
  };
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () { this.extra = null; this.metaFase2 = null; this.cartelloAperto = false; crea.call(this); };
})();

// un dialogo che parte mentre è aperta la scelta del cartello la chiude, così non si sovrappongono
(function () {
  const say = Hud.prototype.say;
  Hud.prototype.say = function (lines, done) { if (this.cartello && lines && lines.length) { const m = this.cartello; this.cartello = null; if (m.c && m.c.scene) { m.close(); if (m.scena) m.scena.vicinoUscita = false; } } return say.call(this, lines, done); };
})();
// se si apre un'altra finestra, la scelta del cartello si chiude prima (mai due finestre una sopra l'altra)
(function () {
  const modal = Hud.prototype.modal;
  Hud.prototype.modal = function (title, h, onClose) {
    const m0 = this.cartello; if (m0) { this.cartello = null; if (m0.c && m0.c.scene) { m0.close(); if (m0.scena) m0.scena.vicinoUscita = false; } }
    return modal.call(this, title, h, onClose);
  };
})();
