// =====================================================================
//  Il sogno (tappa 25): Anastasia e Rocky.
//  Un prato di notte pieno di lucciole. Rocky arriva di corsa e giocano:
//  1) lanci la pallina e lui la riporta (3 volte)
//  2) si nasconde nell'erba alta e tu lo trovi
//  3) corsa fino alla collina, dove vi sdraiate a guardare le stelle.
//  Alla fine nell'album compare «La pallina di Rocky».
// =====================================================================
const LANCI_ROCKY = 3;

Object.assign(Livello.prototype, {
  preparaRocky() {
    const S = this.L, W = S.mappa[0].length * T, st = this.st;
    if (!this.anims.exists('rocky-corre')) this.anims.create({ key: 'rocky-corre', frames: this.anims.generateFrameNumbers('rocky', { frames: [0, 1] }), frameRate: 9, repeat: -1 });
    const collina = { x: this.npc.x - 16, y: this.npc.y + 4 };
    this.collina = collina;
    const g = this.add.ellipse(this.npc.x - 6, this.npc.y + 2, 44, 18, 0xfff2a8, 0.18).setDepth(-11);
    this.tweens.add({ targets: g, alpha: 0.08, yoyo: true, repeat: -1, duration: 1400 });
    this.rocky = this.add.sprite(st.giaFatta ? collina.x : W + 20, st.giaFatta ? collina.y : this.player.y - 30, 'rocky', 0).setOrigin(0.5, 1).setDepth(10);
    this.pallina = null; this.tufts = []; this.palchi = [this.rocky];   // le luci del sogno seguono anche Rocky
    st.rocky = st.giaFatta ? 'fine' : 'attesa'; st.lanci = 0;
  },
  rockyCorre(x, y, vel, poi) {
    const r = this.rocky, d = Math.hypot(x - r.x, y - r.y);
    r.setFlipX(x < r.x); r.anims.play('rocky-corre', true);
    this.tweens.killTweensOf(r);
    this.tweens.add({ targets: r, x, y, duration: Math.max(150, d / vel * 1000), onUpdate: () => r.setDepth(r.y), onComplete: () => { r.anims.stop(); r.setFrame(0); poi && poi(); } });
  },
  puntoPrato(da, min, max) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, d = min + Math.random() * (max - min), x = da.x + Math.cos(a) * d, y = da.y + Math.sin(a) * d * 0.8;
      if (!this.blocked(x, y) && !this.blocked(x, y - 8) && Math.hypot(x - this.uscita.x, y - this.uscita.y) > 30) return { x, y };
    }
    return { x: da.x + 20, y: da.y };
  },
  posaPallina(x, y) {
    if (this.pallina) this.pallina.destroy();
    this.pallina = this.add.image(x, y, 'ricordi', 'rocky').setScale(0.5).setDepth(y);
    this.palchi = [this.rocky, this.pallina];
  },
  // pulsante "Lancia la pallina" quando la tieni in mano
  bottoneLancio(mostra) {
    const hud = this.hud;
    if (this.btnLancio) { this.btnLancio.destroy(); this.btnLancio = null; }
    if (!mostra) return;
    const c = hud.add.container(0, 0).setDepth(50); hud.layer.add(c); this.btnLancio = c;
    hud.button(UW / 2 - 90, UH - 150, 180, 40, 'Lancia la pallina!', () => this.lanciaPallina(), { parent: c, size: 14 });
  },
  lanciaPallina() {
    const st = this.st, p = this.player; if (st.rocky !== 'inmano') return;
    this.bottoneLancio(false); st.rocky = 'lanciata'; Sfx.pop();
    const t = this.puntoPrato(p, 50, 80);
    this.posaPallina(p.x, p.y - 10);
    this.tweens.add({ targets: this.pallina, x: t.x, duration: 650 });
    this.tweens.add({ targets: this.pallina, y: { from: p.y - 10, to: t.y }, duration: 650, ease: 'Quad.easeIn', onComplete: () => {
      this.pallina.setDepth(t.y);
      this.rockyCorre(t.x + (this.rocky.x < t.x ? -6 : 6), t.y, 110, () => {
        if (this.pallina) { this.pallina.destroy(); this.pallina = null; }
        this.palchi = [this.rocky]; Sfx.tone(660, 0.12, 'square', 0.04);
        this.rockyCorre(p.x + 12, p.y, 110, () => {
          st.lanci++; this.hearts(this.rocky.x, this.rocky.y - 14); this.progresso();
          if (st.lanci < LANCI_ROCKY) { this.posaPallina(this.rocky.x - 8, this.rocky.y); st.rocky = 'pallina'; this.hud.toast(st.lanci === 1 ? 'Rocky te la riporta. Ancora!' : 'Ancora una volta!'); }
          else this.hud.say(this.L.dialoghi.nascondino, () => this.avviaNascondinoRocky());
          this.aggiornaObiettivi();
        });
      });
    } });
  },
  avviaNascondinoRocky() {
    const st = this.st, p = this.player; st.rocky = 'nascosto';
    const posti = []; for (let i = 0; i < 40 && posti.length < 4; i++) { const q = this.puntoPrato(p, 40, 120); if (posti.every(o => Math.hypot(o.x - q.x, o.y - q.y) > 34) && Math.hypot(q.x - this.npc.x, q.y - this.npc.y) > 30) posti.push(q); }
    this.tufts = posti.map((q, i) => { const t = this.add.image(q.x, q.y, 'natura', 'cespuglio').setOrigin(0.5, 1).setTint(0x8fb070).setDepth(q.y); t.giusto = i === 2; return t; });
    const giusto = this.tufts.find(t => t.giusto) || this.tufts[0]; giusto.giusto = true;
    this.rocky.setVisible(false); this.rocky.setPosition(giusto.x, giusto.y);
    this.coda = this.add.rectangle(giusto.x + 8, giusto.y - 9, 2, 5, 0xa8673d).setDepth(giusto.y + 1).setOrigin(0.5, 1);
    this.tweens.add({ targets: this.coda, angle: 30, yoyo: true, repeat: -1, duration: 160 });
    this.palchi = this.tufts.slice(); this.aggiornaObiettivi();
  },
  cercaRocky() {
    const p = this.player, t = this.tufts.find(t => !t.scosso && Math.hypot(t.x - p.x, t.y - 6 - p.y) < 14); if (!t) return;
    t.scosso = true; this.tweens.add({ targets: t, angle: 8, yoyo: true, repeat: 3, duration: 70, onComplete: () => { t.angle = 0; } });
    if (!t.giusto) { Sfx.blip(); this.hud.toast(pick(['Qui no... ma la coda si muove da qualche parte.', 'Solo erba. Dov\'è finito?'])); this.time.delayedCall(2500, () => { t.scosso = false; }); return; }
    const st = this.st; st.rocky = 'trovato'; this.coda.destroy(); this.coda = null;
    this.rocky.setVisible(true).setPosition(t.x + 6, t.y + 4); this.palchi = [this.rocky];
    this.tweens.add({ targets: this.rocky, y: this.rocky.y - 8, yoyo: true, duration: 180, repeat: 1 });
    this.hearts(this.rocky.x, this.rocky.y - 14); Sfx.cuore(); this.progresso();
    this.hud.say(this.L.dialoghi.trovato.concat(this.L.dialoghi.corsa), () => {
      this.tufts.forEach(x => this.tweens.add({ targets: x, alpha: 0, duration: 600, onComplete: () => x.destroy() })); this.tufts = [];
      st.rocky = 'corsa'; this.rockyCorre(this.collina.x, this.collina.y, 70); this.aggiornaObiettivi();
    });
  },
  missioneRocky(time) {
    const st = this.st, p = this.player, hud = this.hud, L = this.L;
    if (st.rocky === 'attesa' && time > (this.creatoRocky || 0) + 600) {
      st.rocky = 'arriva';
      this.rockyCorre(p.x + 14, p.y, 90, () => { this.hearts(this.rocky.x, this.rocky.y - 14); hud.say(L.dialoghi.incontro, () => { st.parlato = true; this.posaPallina(p.x + 6, p.y + 6); st.rocky = 'pallina'; this.progresso(); this.aggiornaObiettivi(); }); });
    }
    if (st.rocky === 'pallina' && this.pallina && Math.hypot(this.pallina.x - p.x, this.pallina.y - p.y) < 11) {
      this.pallina.destroy(); this.pallina = null; this.palchi = [this.rocky]; st.rocky = 'inmano'; Sfx.seme(); this.bottoneLancio(true);
      if (!st.consiglioLancio) { st.consiglioLancio = true; hud.toast('Tocca «Lancia la pallina!»'); }
    }
    if (st.rocky === 'inmano' && !this.btnLancio) this.bottoneLancio(true);
    if (st.rocky === 'nascosto') this.cercaRocky();
    if (st.rocky === 'corsa' && Math.hypot(this.collina.x - p.x, this.collina.y - p.y) < 22) {
      st.rocky = 'stelle'; this.frozenAll = true; hud.joyEnd();
      this.tweens.killTweensOf(this.rocky); this.rocky.anims.stop(); this.rocky.setFrame(0).setPosition(p.x + 11, p.y + 1).setFlipX(true).setDepth(p.y + 1); p.setFlipX(false); this.hearts(p.x + 5, p.y - 16);
      for (let i = 0; i < 18; i++) { const s = this.add.circle(this.collina.x - 90 + Math.random() * 180, this.collina.y - 120 + Math.random() * 70, 0.8 + Math.random(), 0xfff6c8).setDepth(20003).setAlpha(0); this.tweens.add({ targets: s, alpha: { from: 0, to: 1 }, yoyo: true, repeat: -1, duration: 900 + Math.random() * 900, delay: i * 120 }); }
      this.time.delayedCall(600, () => hud.say(L.dialoghi.salvato, () => {
        this.frozenAll = false; this.salva(true);
        // la scheda del ricordo arriva quando i dialoghi sono finiti
        const mostra = () => { if (!this.sys.isActive()) return; if (hud.dialog) return this.time.delayedCall(300, mostra); if (typeof mostraRicordo === 'function' && !(Save.data.ricordi && Save.data.ricordi.rocky)) mostraRicordo(hud, 'rocky', () => hud.toast('La pallina di Rocky è nell\'album')); };
        this.time.delayedCall(300, mostra);
      }));
    }
    this.controllaUscita();
    if (time - this.ultimoProgresso > 30000 && this.indizioDato < 1) { this.indizioDato = 1; }
    if (this.indizioDato >= 1 && !st.salvato) {
      const o = st.rocky === 'pallina' && this.pallina ? this.pallina : st.rocky === 'nascosto' ? (this.tufts.find(t => t.giusto) || this.rocky) : st.rocky === 'corsa' ? this.collina : this.rocky;
      hud.setHint(o.x, o.y);
    } else if (st.salvato && this.indizioDato >= 1) hud.setHint(this.uscita.x, this.uscita.y);
  },
});

(function () {
  const prep = Livello.prototype.preparaSpeciale;
  Livello.prototype.preparaSpeciale = function () {
    prep.call(this);
    if (this.L.missione.tipo === 'rocky') { this.preparaRocky(); this.creatoRocky = this.time.now; }
  };
  const ms = Livello.prototype.missioneSpeciale;
  Livello.prototype.missioneSpeciale = function (time) {
    if (this.L.missione.tipo === 'rocky') return this.missioneRocky(time);
    return ms.call(this, time);
  };
  const ob = Livello.prototype.aggiornaObiettivi;
  Livello.prototype.aggiornaObiettivi = function () {
    ob.call(this); const st = this.st; if (this.L.missione.tipo !== 'rocky' || st.giaFatta || !this.ob) return;
    const v = b => b ? '✔ ' : '○ ', c = b => b ? COL.verde : COL.testo, r = st.rocky, lanciFatti = (st.lanci || 0) >= LANCI_ROCKY;
    this.ob.a.setText(v(st.salvato) + 'Rocky').setColor(c(st.salvato));
    const mis = !lanciFatti ? 'Lanci ' + (st.lanci || 0) + '/' + LANCI_ROCKY : r === 'nascosto' ? 'Trova Rocky' : 'La collina';
    const fatto = st.salvato;
    this.ob.b.setText(v(fatto) + mis).setColor(c(fatto));
  };
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    this.rocky = null; this.pallina = null; this.tufts = []; this.coda = null; this.btnLancio = null; this.collina = null;
    this.events.once('shutdown', () => { if (this.btnLancio) { this.btnLancio.destroy(); this.btnLancio = null; } });
    crea.call(this);
  };
})();
