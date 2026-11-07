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
    const qui = k => this.ospiti.find(o => o.chiave === k);
    const coppie = AMICIZIE.map(([a, b, battute, tipo]) => [qui(a), qui(b), battute, tipo]).filter(([a, b]) => this.liberoPerChiacchiere(a) && this.liberoPerChiacchiere(b));
    if (!coppie.length) return false;
    const [a, b, battute, tipo] = Phaser.Utils.Array.GetRandom(coppie);
    const usate = this.battuteUsate = this.battuteUsate || [];
    const scelta = battute.filter(x => !usate.includes(x)); const [d, r] = scelta.length ? Phaser.Utils.Array.GetRandom(scelta) : Phaser.Utils.Array.GetRandom(battute);
    usate.push([d, r].join()); if (usate.length > 12) usate.shift();
    this.inChiacchiera = true; a.evento = b.evento = true; a.meta = b.meta = null;
    const fine = () => { [a, b].forEach(o => { if (o.active) { o.evento = false; o.pausa = 2; } }); this.inChiacchiera = false; };
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
    const lines = [{ who: k, text: pick(frasi, this.recent) }];
    if (Math.random() < 0.4) lines.push({ who: 'anastasia', text: pick(RISPOSTE, this.recent) });
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
