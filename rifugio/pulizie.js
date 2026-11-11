// =====================================================================
//  Pulizie: batuffoli di pelo bianchi e neri e aspirapolvere da guidare
//  col joystick. Ogni batuffolo vale 1 seme (stessa regola di economia.js).
// =====================================================================
Object.assign(Sfx, {
  // ronzio continuo: rumore filtrato + nota bassa, finché non lo spegni
  aspiraOn() {
    if (!this.ok() || this.ronzio) return; const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 1, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 118;
    const lo = c.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = 400;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.4);
    const go = c.createGain(); go.gain.value = 0.25;
    n.connect(f); f.connect(g); o.connect(lo); lo.connect(go); go.connect(g); g.connect(c.destination);
    n.start(); o.start(); this.ronzio = { n, o, g, f };
  },
  aspiraSu() { if (this.ronzio) { const t = this.ctx.currentTime; this.ronzio.f.frequency.setValueAtTime(1500, t); this.ronzio.f.frequency.exponentialRampToValueAtTime(900, t + 0.25); } },
  aspiraOff() {
    const r = this.ronzio; if (!r) return; this.ronzio = null; const t = this.ctx.currentTime;
    r.g.gain.cancelScheduledValues(t); r.g.gain.setValueAtTime(r.g.gain.value, t); r.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    r.n.stop(t + 0.55); r.o.stop(t + 0.55);
  },
});

Object.assign(Rifugio.prototype, {
  spawnPelo(i) {
    const r = n => { const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    const x = 14 + r(1) * (STANZA.w - 28), y = STANZA.muro + 16 + r(2) * (STANZA.h - STANZA.muro - 40);
    const g = this.add.image(x, y, 'peli', i % 3).setDepth(-4).setAngle(r(3) * 40 - 20).setFlipX(r(4) > 0.5);
    this.tweens.add({ targets: g, scaleX: 1.08, scaleY: 0.94, yoyo: true, repeat: -1, duration: 1400 + r(5) * 900, ease: 'Sine.inOut' });
    g.px = x; g.py = y; this.peliSprites.push(g);
  },
  raccogliPelo(g) {
    const S = Save.data; if (g.preso) return; g.preso = true;
    this.peliSprites = this.peliSprites.filter(p => p !== g);
    this.tweens.killTweensOf(g);
    this.tweens.add({ targets: g, scaleX: 1, scaleY: 1, alpha: 0, duration: 250, onComplete: () => g.destroy() });
    Eco.raccogliPelo(S); Save.write(); Sfx.seme();
    if (this.semiTxt) this.semiTxt.setText(S.semi + ' semi');
    if (!S.peli && this.btnAspira) { this.btnAspira.destroy(); this.btnAspira = null; }
  },
  aspira() {
    if (this.aspirapolvere) return this.spegniAspira();
    if (!this.peliSprites.length) return this.hud.toast('La casa è già pulita!');
    const hud = this.hud, cat = this.cat;
    this.aspirapolvere = { presi: 0, tot: this.peliSprites.length, prossimaFuga: 0 };
    this.tubo = this.add.image(this.player.x + 7, this.player.y, 'aspirapolvere').setOrigin(0.5, 1);
    Sfx.aspiraOn();
    if (this.btnAspira) this.btnAspira.setVisible(false);
    const c = hud.add.container(0, 0).setDepth(45); hud.layer.add(c); this.pannelloAspira = c;
    c.add(pannello(hud, 12, 46, UW - 24, 44));
    this.contaPeli = txt(hud, 26, 68, '', 13, COL.titolo).setOrigin(0, 0.5); c.add(this.contaPeli);
    hud.button(UW - 104, 52, 86, 32, 'Spegni', () => this.spegniAspira(), { parent: c, size: 12 });
    this.aggiornaContaPeli();
    cat.dorme = false; cat.coccola = 0;
    this.time.delayedCall(200, () => { hud.bubble(cat, pick(FRASI_ASPIRAPOLVERE, this.recent), 3200); Sfx.miao(); });
  },
  aggiornaContaPeli() { const a = this.aspirapolvere; if (a && this.contaPeli) this.contaPeli.setText('Peli raccolti: ' + a.presi + ' / ' + a.tot); },
  aggiornaAspira(dt, time) {
    const a = this.aspirapolvere; if (!a) return;
    const p = this.player, cat = this.cat, dir = p.flipX ? -1 : 1;
    this.tubo.setPosition(p.x + 8 * dir, p.y).setFlipX(p.flipX).setDepth(p.y + 0.5);
    const bx = p.x + 9 * dir, by = p.y - 2;
    this.peliSprites.slice().forEach(g => {
      if (g.preso || Math.hypot(g.x - bx, g.y - by) > 13) return;
      g.preso = true; this.peliSprites = this.peliSprites.filter(q => q !== g); this.tweens.killTweensOf(g);
      Sfx.aspiraSu();
      this.tweens.add({ targets: g, x: bx, y: by - 2, scale: 0.1, angle: g.angle + 540, duration: 280, ease: 'Quad.in', onComplete: () => {
        g.destroy(); Eco.raccogliPelo(Save.data); Save.write(); Sfx.seme(); a.presi++; this.aggiornaContaPeli();
        if (this.semiTxt) this.semiTxt.setText(Save.data.semi + ' semi');
        if (a.presi >= a.tot) this.time.delayedCall(400, () => { if (this.aspirapolvere) { this.hud.toast('Casa pulita! +' + a.presi + ' semi'); this.spegniAspira(); } });
      } });
    });
    // Mordicchio scappa nell'angolo più lontano e da lì protesta
    if (time > a.prossimaFuga) {
      a.prossimaFuga = time + 900;
      const ang = [[18, STANZA.muro + 22], [STANZA.w - 18, STANZA.muro + 22], [18, STANZA.h - 24], [STANZA.w - 18, STANZA.h - 24]];
      const lontano = ang.sort((u, v) => Math.hypot(v[0] - p.x, v[1] - p.y) - Math.hypot(u[0] - p.x, u[1] - p.y))[0];
      cat.dorme = false; cat.meta = { x: lontano[0], y: lontano[1] }; cat.pausa = 2; cat.velocita = 1.8;
      if (Math.random() < 0.12 && !this.hud.bubbles.some(b => !b.dead)) this.hud.bubble(cat, pick(FRASI_ASPIRAPOLVERE, this.recent), 2600);
    }
  },
  spegniAspira() {
    if (!this.aspirapolvere) return; this.aspirapolvere = null; Sfx.aspiraOff();
    if (this.tubo) { this.tubo.destroy(); this.tubo = null; }
    if (this.pannelloAspira) { this.pannelloAspira.destroy(); this.pannelloAspira = null; }
    if (this.btnAspira) { if (this.peliSprites.length) this.btnAspira.setVisible(true); else { this.btnAspira.destroy(); this.btnAspira = null; } }
    if (this.cat) this.cat.velocita = 1;
    if (!this.peliSprites.length) this.time.delayedCall(600, () => this.cat && this.hud.bubble(this.cat, pick(['Il mostro è andato via? Posso uscire?', 'Ok. Faccio finta di non aver avuto paura.', 'La prossima volta avvisami. Mi nascondo prima.']), 3200));
  },
});
(function () {
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) { upd.call(this, time, delta); if (this.aspirapolvere) this.aggiornaAspira(Math.min(delta, 50) / 1000, time); };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () { this.aspirapolvere = null; this.tubo = null; this.pannelloAspira = null; this.events.once('shutdown', () => Sfx.aspiraOff()); crea.call(this); };
})();
