// =====================================================================
//  Vita spontanea (ispirata ad Animal Crossing):
//  - due amici nello stesso posto ogni tanto si avvicinano e si scambiano
//    due battute in nuvolette sopra la testa;
//  - ogni tanto un animale viene da Anastasia con un «!» per dirle una cosa.
//  Nessun obbligo e nessuna penalità: se non lo tocchi, torna ai fatti suoi.
// =====================================================================
Object.assign(Rifugio.prototype, {
  liberoPerChiacchiere(o) { return o && o.active && !o.evento && !o.occupato && !o.uscendo && !o.dorme && !o.notizia && !(o.chiave === 'ciro' && Save.data.ora < 19 * 60); }, // Ciro di giorno dorme
  momentoTranquillo() {
    const h = this.hud;
    return this.modo === 'gioca' && !h.dialog && !(h.ctrl && h.ctrl.frozen) && !this.inEvento && !this.uscendo && !this.dormendo && !this.aspirapolvere && !this.inChiacchiera;
  },
  // ---- due amici che parlano tra loro ----
  avviaChiacchiera() {
    if (this.hud.quieto && this.hud.quieto()) return false;
    const qui = k => this.ospiti.find(o => o.chiave === k);
    const adatte = bb => typeof frasiAdatte === 'function' ? bb.filter(([d, r]) => frasiAdatte([d, r]).length === 2) : bb;
    const coppie = AMICIZIE.map(([a, b, battute, tipo]) => [qui(a), qui(b), adatte(battute), tipo]).filter(([a, b, bb]) => this.liberoPerChiacchiere(a) && this.liberoPerChiacchiere(b) && bb.length);
    if (!coppie.length) return false;
    const [a, b, battute, tipo] = Phaser.Utils.Array.GetRandom(coppie);
    const usate = this.battuteUsate = this.battuteUsate || [];
    const dS = Frasi.scegli(battute.map(x => x[0]), 'coppia:' + a.chiave + '+' + b.chiave); if (!dS) return false; const [d, r] = battute.find(x => x[0] === dS);
    usate.push([d, r].join()); if (usate.length > 12) usate.shift();
    this.inChiacchiera = true; a.evento = b.evento = true; a.meta = b.meta = null;
    const tok = this.chiacchieraTok = {};
    const fine = () => { if (this.chiacchieraTok !== tok) return; this.chiacchieraTok = null; [a, b].forEach(o => { if (o.active) { o.evento = false; o.pausa = 2; } }); this.inChiacchiera = false; };
    this.time.delayedCall(15000, fine);   // rete di sicurezza: una chiacchiera non può restare appesa
    const ok = () => a.active && b.active && !this.hud.dialog && !(this.hud.ctrl && this.hud.ctrl.frozen) && this.modo === 'gioca';
    const x = Phaser.Math.Clamp(b.x + (a.x < b.x ? -16 : 16), 12, STANZA.w - 12);
    this.cammina(a, x, b.y, 1.5, () => {
      if (!ok()) return fine();
      a.setFlipX(b.x < a.x); b.setFlipX(a.x < b.x);
      this.hud.bubble(a, d, 2600);
      this.time.delayedCall(2800, () => {
        if (!ok()) return fine();
        this.hud.bubble(b, r, 2600);
        this.time.delayedCall(2700, () => { if (ok() && Math.random() < 0.5) { if (!tipo) this.pensiero(a, 'cuore', true); else if (tipo === 'mitty') this.pensiero(a.chiave === 'mitty' ? a : b, 'cuore', true); } fine(); }); // cuoricini solo tra amici veri
      });
    });
    return true;
  },
  // ---- qualcuno viene a dire una cosa ----
  avviaNotizia() {
    const cand = this.ospiti.filter(o => NOTIZIE[o.chiave] && this.liberoPerChiacchiere(o) && Math.hypot(o.x - this.player.x, o.y - this.player.y) > 30);
    if (!cand.length) return false;
    const o = Phaser.Utils.Array.GetRandom(cand), p = this.player;
    o.notizia = true; o.evento = true; o.meta = null;
    o.esclamativo = txt(this, o.x, o.y - 22, '!', 14, '#d0453a', { stroke: '#fbf4dc', strokeThickness: 4, fontStyle: 'bold' }).setOrigin(0.5, 1).setDepth(20004).setResolution(Math.ceil(ZR * DPR / 1.5));
    this.tweens.add({ targets: o.esclamativo, scaleY: 1.2, yoyo: true, repeat: -1, duration: 350 });
    const x = Phaser.Math.Clamp(p.x + (o.x < p.x ? -16 : 16), 12, STANZA.w - 12), y = Phaser.Math.Clamp(p.y + 2, STANZA.muro + 14, STANZA.h - 10);
    this.cammina(o, x, y, 1.1, () => {
      if (!o.active || !o.notizia) return;
      o.setFlipX(o.x > this.player.x);
      o.attesaNotizia = this.time.delayedCall(14000, () => this.fineNotizia(o));
    });
    return true;
  },
  fineNotizia(o) {
    if (!o || !o.notizia) return; o.notizia = false;
    if (o.attesaNotizia) { o.attesaNotizia.remove(); o.attesaNotizia = null; }
    if (o.esclamativo) { o.esclamativo.destroy(); o.esclamativo = null; }
    if (o.active) { o.evento = false; o.pausa = 2; }
  },
  raccontaNotizia(o) {
    const k = o.chiave; this.fineNotizia(o); this.tweens.killTweensOf(o); o.anims.stop(); o.setFrame(o.idleFrame);
    const frasi = frasiValide(NOTIZIE[k]); if (!frasi.length) return this.menuAnimale(o);
    const t0 = Frasi.scegli(frasi, k, this.recent); if (!t0) return this.menuAnimale(o); const lines = [{ who: k, text: t0 }];
    { const r = Math.random() < 0.6 ? rispostaA(lines[0].text, this.recent) : null; if (r) lines.push({ who: 'anastasia', text: r }); }
    o.coccola = 3; this.hud.say(lines); this.pensiero(o, 'cuore', true);
  },
});

(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.inChiacchiera = false; crea.call(this);
    const t = this.time.now; this.prossimaChiacchiera = t + 18000 + Math.random() * 15000; this.prossimaNotizia = t + 40000 + Math.random() * 30000;
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta); if (!this.ospiti) return;
    this.ospiti.forEach(o => { if (o.esclamativo) o.esclamativo.setPosition(o.x, o.y - (o.displayHeight || 16) - 2); });
    if (time > this.prossimaChiacchiera) {
      if (!this.momentoTranquillo()) this.prossimaChiacchiera = time + 4000;
      else this.prossimaChiacchiera = time + (this.avviaChiacchiera() ? 40000 + Math.random() * 40000 : 15000);
    }
    if (time > this.prossimaNotizia) {
      if (!this.momentoTranquillo() || this.ospiti.some(o => o.notizia)) this.prossimaNotizia = time + 5000;
      else this.prossimaNotizia = time + (this.avviaNotizia() ? 90000 + Math.random() * 60000 : 20000);
    }
  };
  // toccando chi ha il «!» si sente la notizia invece del menu
  const menu = Rifugio.prototype.menuAnimale;
  Rifugio.prototype.menuAnimale = function (o) { if (o && o.notizia) return this.raccontaNotizia(o); return menu.call(this, o); };
})();

// ---- niente sovrapposizioni: un dialogo della storia zittisce le nuvolette, e mentre c'è un dialogo
//      o una finestra aperta nessuno dice frasi a caso ----
(function () {
  const say = Hud.prototype.say, bubble = Hud.prototype.bubble;
  Hud.prototype.say = function (lines, done) {
    if (lines && lines.length) { this.bubbles.forEach(b => { if (!b.dead) { b.dead = true; b.c.destroy(); } }); this.bubbles = []; }
    // finito un dialogo, per qualche secondo nessuno attacca a parlare da solo
    const fine = lines && lines.length ? () => { this.quietoFino = this.time.now + 7000; if (done) done(); } : done;
    return say.call(this, lines, fine);
  };
  // le frasi spontanee (battute durante il giro, chiacchiere tra amici) tacciono durante e subito dopo un dialogo,
  // e quando la storia sta per ripartire (attendiStoria)
  Hud.prototype.quieto = function () { return !!(this.dialog || (this.codaDialoghi && this.codaDialoghi.length) || (this.ctrl && this.ctrl.frozen) || this.time.now < (this.quietoFino || 0)); };
  Hud.prototype.attendiStoria = function (ms) { this.quietoFino = Math.max(this.quietoFino || 0, this.time.now + ms); };
  Hud.prototype.bubble = function (target, text, ms) {
    if (this.dialog || (this.codaDialoghi && this.codaDialoghi.length) || (this.ctrl && this.ctrl.frozen)) return null;
    return bubble.call(this, target, text, ms);
  };
})();
