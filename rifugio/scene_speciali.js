// =====================================================================
//  Scene speciali (revisione 10/11)
//  - Wilma: il capannone è chiuso, con il tetto; lei parla da dentro e non si vede. Aperta la porta,
//    esce piano e per la prima volta vede il sole: si ferma, alza la testa, la luce la avvolge.
//  - Il sogno di Rocky: prima Rocky raggiunge Anastasia, poi si sistemano sull'erba, poi le stelle.
//    Al risveglio Anastasia è nel suo letto; finiti i dialoghi si alza e si gioca di nuovo.
//  - Tornando sulla collina di Rocky: lucciole, una targa tra i fiori, la musica del ricordo.
// =====================================================================
(function () {
  // ---------------- Wilma ----------------
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    const r = crea.apply(this, arguments);
    if (this.L.id === 11) {
      const T2 = T, g = this.add.graphics().setDepth(9000), x0 = 4 * T2 - 3, x1 = 12 * T2 + 3, y0 = 3 * T2 - 8, y1 = 7 * T2 + 1;
      g.fillStyle(0x6b6577, 1).fillRect(x0, y0, x1 - x0, y1 - y0);                      // il tetto di lamiera
      for (let y = y0 + 4; y < y1; y += 5) g.lineStyle(1, 0x585264, 1).lineBetween(x0, y, x1, y);
      for (let x = x0 + 8; x < x1; x += 10) g.lineStyle(1, 0x7d7789, 0.8).lineBetween(x, y0, x, y1);
      g.fillStyle(0x4f4a5c, 1).fillRect(x0, (y0 + y1) / 2 - 1, x1 - x0, 3);                // il colmo
      g.lineStyle(1, 0x504086, 1).strokeRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle(0x000000, 0.18).fillRect(x0, y1, x1 - x0, 3);                           // l'ombra del tetto sul muro
      this.tettoCapannone = g;
      if (!this.st.giaFatta && !this.st.salvato && this.npc) { this.npc.setVisible(false); if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; } }
    }
    return r;
  };
  const apri = Livello.prototype.apriCancello;
  Livello.prototype.apriCancello = function () {
    if (this.L.id !== 11 || this.cancelloAperto || this.st.giaFatta) return apri.call(this);
    const salva = this.salva; this.salva = () => {};          // la salvezza arriva dopo la scena del sole
    apri.call(this); this.salva = salva;
    const n = this.npc, c = this.cancelloXY, hud = this.hud; this.frozenAll = true; hud.joyEnd && hud.joyEnd();
    n.setPosition(c.x, c.y - 14).setVisible(true).setAlpha(0).setDepth(c.y - 14);
    this.tweens.add({ targets: n, alpha: 1, duration: 500, delay: 300 });
    if (n.anims && n.walkAnim) n.anims.play(n.walkAnim, true);
    this.tweens.add({ targets: n, y: c.y + 26, duration: 2200, delay: 600, ease: 'Sine.out', onUpdate: () => n.setDepth(n.y), onComplete: () => {
      if (n.anims) n.anims.stop();
      // la luce: raggi che si aprono intorno a lei
      const raggi = this.add.graphics().setDepth(n.y + 1).setAlpha(0);
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28; raggi.fillStyle(0xfff3b0, 0.35).fillTriangle(n.x, n.y - 8, n.x + Math.cos(a - 0.08) * 60, n.y - 8 + Math.sin(a - 0.08) * 60, n.x + Math.cos(a + 0.08) * 60, n.y - 8 + Math.sin(a + 0.08) * 60); }
      this.tweens.add({ targets: raggi, alpha: 1, duration: 900 });
      this.tweens.add({ targets: raggi, alpha: 0.4, yoyo: true, repeat: 3, duration: 700, delay: 900, onComplete: () => this.tweens.add({ targets: raggi, alpha: 0, duration: 800, onComplete: () => raggi.destroy() }) });
      // stupore: alza la testa, si guarda intorno
      this.time.delayedCall(300, () => hud.bubble(n, '!', 1400));
      this.tweens.add({ targets: n, y: n.y - 3, yoyo: true, duration: 220, delay: 700 });
      this.time.delayedCall(1500, () => n.setFlipX(!n.flipX)); this.time.delayedCall(2300, () => n.setFlipX(!n.flipX));
      this.time.delayedCall(2600, () => { this.hearts(n.x, n.y - 14); for (let i = 0; i < 8; i++) { const s = this.add.circle(n.x + (Math.random() - 0.5) * 30, n.y - 10 - Math.random() * 20, 1.2, 0xfff6c8).setDepth(n.y + 2); this.tweens.add({ targets: s, y: s.y - 12, alpha: 0, duration: 1200, delay: i * 90, onComplete: () => s.destroy() }); } });
      this.time.delayedCall(3600, () => { this.frozenAll = false; this.salva(); });
    } });
  };

  // ---------------- il sogno di Rocky: prima si avvicina lui, poi ci si sistema, poi le stelle ----------------
  const mr = Livello.prototype.missioneRocky;
  Livello.prototype.missioneRocky = function (time) {
    const st = this.st, p = this.player;
    if (st.rocky === 'corsa' && Math.hypot(this.collina.x - p.x, this.collina.y - p.y) < 26) {
      st.rocky = 'stelle'; this.frozenAll = true; this.hud.joyEnd(); this.hud.setHint(null);
      const c = this.collina, r = this.rocky, L = this.L;
      this.tweens.killTweensOf(r); if (p.anims) p.anims.stop(); p.setFrame(0);
      this.tweens.add({ targets: p, x: c.x - 4, y: c.y - 4, duration: 500 });
      // 1. Rocky raggiunge Anastasia, scodinzolando
      r.setFlipX(r.x > c.x); if (r.anims) r.anims.play(r.anims.currentAnim ? r.anims.currentAnim.key : undefined, true);
      this.tweens.add({ targets: r, x: c.x + 12, y: c.y - 2, duration: 900, delay: 300, onComplete: () => {
        if (r.anims) r.anims.stop(); r.setFrame(0); r.setFlipX(true);
        this.hearts(r.x, r.y - 12);
        // 2. si sistemano sull'erba: lei si sdraia, lui le si accuccia accanto
        this.tweens.add({ targets: p, angle: -90, y: p.y + 4, duration: 800, delay: 400, ease: 'Sine.inOut' });
        this.tweens.add({ targets: r, scaleY: 0.82, y: r.y + 1, duration: 600, delay: 700 });
        this.time.delayedCall(1500, () => this.hud.bubble(r, '♥', 2200));
        // le stelle si accendono
        for (let i = 0; i < 22; i++) { const s = this.add.circle(c.x - 100 + Math.random() * 200, c.y - 130 + Math.random() * 80, 0.8 + Math.random(), 0xfff6c8).setDepth(20003).setAlpha(0); this.tweens.add({ targets: s, alpha: { from: 0, to: 1 }, yoyo: true, repeat: -1, duration: 900 + Math.random() * 900, delay: 1600 + i * 120 }); }
        // 3. solo adesso, il dialogo sulle stelle; 4. ci si addormenta
        this.time.delayedCall(3400, () => this.hud.say(L.dialoghi.salvato, () => {
          this.cameras.main.fadeOut(1800, 20, 16, 34);
          this.time.delayedCall(1900, () => { this.frozenAll = false; st.salvato = true; st.parlato = true; this.svegliaRocky = true; this.completa(); });
        }));
      } });
      return;
    }
    return mr.call(this, time);
  };
  // al risveglio: nel letto, sdraiata; finito tutto si alza ed è di nuovo libera
  const mis = Rifugio.prototype.messaInScena;
  Rifugio.prototype.messaInScena = function (id) {
    const r = mis.call(this, id); if (id !== 25) return r;
    const l = (this.arrediSprites || []).find(a => /^letto/.test(a.dati.id)), p = this.player; if (!l) return r;
    p.setPosition(l.x, l.y - 4).setAngle(-90).setDepth(l.y + 1); this.sdraiata = true; if (p.anims) p.anims.stop();
    const alzati = () => {
      const h = this.hud; if (!this.sys.isActive()) return;
      if (h.dialog || (h.ctrl && h.ctrl.frozen)) return this.time.delayedCall(400, alzati);
      this.tweens.add({ targets: p, angle: 0, x: l.x + 18, y: l.y + 6, duration: 700, ease: 'Sine.inOut', onComplete: () => { this.sdraiata = false; p.setDepth(p.y); } });
    };
    this.time.delayedCall(2500, alzati);
    return r;
  };
  const mv = Rifugio.prototype.movePlayer;
  Rifugio.prototype.movePlayer = function (dt, blocked) { if (this.sdraiata) return false; return mv.call(this, dt, blocked); };
  // la scena del Rifugio si riusa: entrando in una stanza Anastasia non è mai ancora sdraiata
  const creaS = Rifugio.prototype.create;
  Rifugio.prototype.create = function () { this.sdraiata = false; return creaS.apply(this, arguments); };

  // ---------------- la collina di Rocky, dopo il sogno: lucciole, targa tra i fiori ----------------
  const prep = Livello.prototype.preparaRocky;
  Livello.prototype.preparaRocky = function () {
    prep.call(this);
    if (!this.st.giaFatta) return;
    const c = this.collina, tx = c.x - 18, ty = c.y + 2;
    const g = this.add.graphics().setDepth(ty);
    g.fillStyle(0x8f8a84, 1).fillRoundedRect(tx - 7, ty - 9, 14, 10, 2); g.lineStyle(1, 0x504086, 0.9).strokeRoundedRect(tx - 7, ty - 9, 14, 10, 2);
    g.fillStyle(0xc9c4bc, 1).fillRect(tx - 5, ty - 7, 10, 6);
    for (let i = 0; i < 3; i++) g.fillStyle(0x6e6a66, 1).fillRect(tx - 4, ty - 6 + i * 2, 8 - i * 2, 1);
    [[-11, 1, 'fiore_giallo2'], [10, 1, 'fiore_rosa2'], [-9, -8, 'fiore_blu'], [9, -8, 'fiore_giallo2'], [0, 4, 'fiore_rosa2'], [-14, -3, 'fiore_blu'], [13, -3, 'fiore_rosa2']].forEach(([dx, dy, f]) => this.add.image(tx + dx, ty + dy, 'natura', f).setDepth(ty + dy).setScale(0.75));
    this.targa = { x: tx, y: ty, letta: false };
    for (let i = 0; i < 16; i++) {   // lucciole
      const f = this.add.circle(c.x + (Math.random() - 0.5) * 140, c.y + (Math.random() - 0.5) * 90, 1.1, 0xfff59a).setDepth(20002).setAlpha(0);
      this.tweens.add({ targets: f, alpha: { from: 0.1, to: 0.95 }, yoyo: true, repeat: -1, duration: 700 + Math.random() * 900, delay: Math.random() * 1500 });
      this.tweens.add({ targets: f, x: f.x + (Math.random() - 0.5) * 30, y: f.y + (Math.random() - 0.5) * 24, yoyo: true, repeat: -1, duration: 2600 + Math.random() * 2000, ease: 'Sine.inOut' });
    }
  };
  const mr2 = Livello.prototype.missioneRocky;
  Livello.prototype.missioneRocky = function (time) {
    const t = this.targa, p = this.player;
    if (t && !t.letta && Math.hypot(t.x - p.x, t.y - p.y) < 16 && !this.hud.dialog) {
      t.letta = true;
      this.hud.say([{ who: 'narratore', text: 'Tra i fiori c\'è una piccola targa. C\'è scritto:' }, { who: 'narratore', text: '«Il tempo che abbiamo trascorso insieme è stato troppo breve. Ma il bene che ti ho voluto non finirà mai.»' }]);
      return;
    }
    return mr2.call(this, time);
  };
})();
