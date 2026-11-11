// =====================================================================
//  Il sogno di Rocky, rivisto (7/11).
//  - La collina c'è davvero: un poggio erboso in alto a destra, visibile da subito.
//  - L'erba alta c'è dall'inizio; Rocky ci corre dentro e sparisce piano, l'erba si muove.
//  - Alla fine Anastasia si sdraia sull'erba accanto a Rocky (che le fa un cuore), si addormenta
//    nel sogno, e si risveglia nel suo letto: accanto al cuscino c'è davvero la pallina rossa.
// =====================================================================
(function () {
  const prep = Livello.prototype.preparaRocky;
  Livello.prototype.preparaRocky = function () {
    prep.call(this);
    const c = this.collina, g = this.add.graphics().setDepth(-11);
    // il poggio: tre gradini d'erba sempre più chiari, con un bordo, e qualche fiore
    g.fillStyle(0x3f6b4a, 1).fillEllipse(c.x + 6, c.y + 4, 92, 40);
    g.fillStyle(0x5e8f5a, 1).fillEllipse(c.x + 6, c.y + 1, 80, 32);
    g.fillStyle(0x79a86a, 1).fillEllipse(c.x + 6, c.y - 3, 60, 22);
    g.fillStyle(0x93c27c, 1).fillEllipse(c.x + 4, c.y - 6, 36, 12);
    g.lineStyle(1, 0x2c4a38, 0.7).strokeEllipse(c.x + 6, c.y + 4, 92, 40);
    [[-24, 2], [20, -2], [-8, -9], [30, 8], [-30, 10]].forEach(([dx, dy], i) => this.add.image(c.x + dx, c.y + dy, 'natura', i % 2 ? 'fiore_blu' : 'fiore_giallo2').setDepth(-10).setScale(0.8));
    this.add.ellipse(c.x + 6, c.y - 2, 70, 26, 0xfff2a8, 0.08).setDepth(-10);
    // l'erba alta, sparsa nel prato fin dall'inizio
    const p = this.player, posti = [];
    for (let i = 0; i < 60 && posti.length < 6; i++) { const q = this.puntoPrato(p, 40, 140); if (posti.every(o => Math.hypot(o.x - q.x, o.y - q.y) > 30) && Math.hypot(q.x - c.x, q.y - c.y) > 50) posti.push(q); }
    this.erbaAlta = posti.map(q => { const t = this.add.image(q.x, q.y, 'natura', 'cespuglio').setOrigin(0.5, 1).setTint(0x8fb070).setDepth(q.y); this.tweens.add({ targets: t, scaleX: 1.04, yoyo: true, repeat: -1, duration: 1600 + Math.random() * 600, ease: 'Sine.inOut' }); return t; });
  };
  // nascondino: Rocky corre in un ciuffo d'erba che c'era già e ci sparisce dentro piano piano
  Livello.prototype.avviaNascondinoRocky = function () {
    const st = this.st, r = this.rocky; st.rocky = 'nascondendo';
    this.tufts = this.erbaAlta.slice(); this.tufts.forEach(t => { t.giusto = false; t.scosso = false; });
    const lontani = this.tufts.slice().sort((a, b) => Math.hypot(b.x - this.player.x, b.y - this.player.y) - Math.hypot(a.x - this.player.x, a.y - this.player.y));
    const giusto = lontani[1] || lontani[0]; giusto.giusto = true;
    this.rockyCorre(giusto.x, giusto.y - 1, 100, () => {
      this.tweens.add({ targets: giusto, angle: { from: -7, to: 7 }, yoyo: true, repeat: 3, duration: 90, onComplete: () => { giusto.angle = 0; } });
      this.tweens.add({ targets: r, alpha: 0, scaleY: 0.6, duration: 450, onComplete: () => { r.setVisible(false).setAlpha(1).setScale(1); } });
      this.coda = this.add.rectangle(giusto.x + 8, giusto.y - 9, 2, 5, 0xa8673d).setDepth(giusto.y + 1).setOrigin(0.5, 1).setAlpha(0);
      this.tweens.add({ targets: this.coda, alpha: 1, duration: 400, delay: 300 });
      this.tweens.add({ targets: this.coda, angle: 30, yoyo: true, repeat: -1, duration: 160 });
      st.rocky = 'nascosto'; this.palchi = this.tufts.slice(); this.aggiornaObiettivi();
    });
  };
  // trovato: esce dall'erba saltando (l'erba resta dov'era)
  const cerca = Livello.prototype.cercaRocky;
  Livello.prototype.cercaRocky = function () {
    const p = this.player, t = this.tufts.find(t => !t.scosso && Math.hypot(t.x - p.x, t.y - 6 - p.y) < 14); if (!t) return;
    if (!t.giusto) return cerca.call(this);
    const st = this.st; st.rocky = 'trovato'; if (this.coda) { this.coda.destroy(); this.coda = null; }
    t.scosso = true; this.tweens.add({ targets: t, angle: { from: -9, to: 9 }, yoyo: true, repeat: 4, duration: 70, onComplete: () => { t.angle = 0; } });
    const r = this.rocky; r.setVisible(true).setAlpha(0).setPosition(t.x, t.y); this.palchi = [r];
    this.tweens.add({ targets: r, alpha: 1, x: t.x + 10, y: t.y + 5, duration: 300 });
    this.tweens.add({ targets: r, y: t.y - 4, yoyo: true, duration: 180, repeat: 1, delay: 300 });
    this.time.delayedCall(500, () => { this.hearts(r.x, r.y - 14); Sfx.cuore(); this.progresso(); });
    this.time.delayedCall(900, () => this.hud.say(this.L.dialoghi.trovato.concat(this.L.dialoghi.corsa), () => {
      st.rocky = 'corsa'; this.rockyCorre(this.collina.x + 10, this.collina.y - 4, 70); this.aggiornaObiettivi();
    }));
  };
  // la collina: ci si sdraia, ci si addormenta, ci si sveglia a casa
  const mr = Livello.prototype.missioneRocky;
  Livello.prototype.missioneRocky = function (time) {
    const st = this.st, p = this.player, hud = this.hud, L = this.L;
    if (st.rocky === 'nascondendo') return;
    if (st.rocky === 'corsa' && Math.hypot(this.collina.x - p.x, this.collina.y - p.y) < 26) {
      st.rocky = 'stelle'; this.frozenAll = true; hud.joyEnd(); hud.setHint(null);
      const c = this.collina, r = this.rocky;
      this.tweens.killTweensOf(r); r.anims.stop();
      // Anastasia si siede e poi si sdraia sull'erba; Rocky le si accoccola accanto
      if (p.anims) p.anims.stop(); p.setFrame(0);
      this.tweens.add({ targets: p, x: c.x - 4, y: c.y - 4, duration: 500, onComplete: () => {
        this.tweens.add({ targets: p, angle: -90, y: p.y + 4, duration: 700, ease: 'Sine.inOut' });
        r.setFlipX(true); this.tweens.add({ targets: r, x: c.x + 12, y: c.y - 1, duration: 600, onComplete: () => { r.setFrame(0); this.tweens.add({ targets: r, scaleY: 0.85, duration: 500 }); } });
        this.time.delayedCall(1300, () => { if (hud.bubble) hud.bubble(r, '♥', 2600); this.hearts(r.x, r.y - 12); });
      } });
      for (let i = 0; i < 22; i++) { const s = this.add.circle(c.x - 100 + Math.random() * 200, c.y - 130 + Math.random() * 80, 0.8 + Math.random(), 0xfff6c8).setDepth(20003).setAlpha(0); this.tweens.add({ targets: s, alpha: { from: 0, to: 1 }, yoyo: true, repeat: -1, duration: 900 + Math.random() * 900, delay: i * 120 }); }
      this.time.delayedCall(2600, () => hud.say(L.dialoghi.salvato, () => {
        // ti si chiudono gli occhi: il sogno sfuma e ti svegli nel tuo letto
        this.cameras.main.fadeOut(1800, 20, 16, 34);
        this.time.delayedCall(1900, () => { this.frozenAll = false; st.salvato = true; st.parlato = true; this.svegliaRocky = true; this.completa(); });
      }));
      return;
    }
    return mr.call(this, time);
  };
  // niente schermata di riepilogo in mezzo: dal sogno si passa dritti al risveglio
  const riep = Livello.prototype.riepilogo;
  Livello.prototype.riepilogo = function (guadagno, primaVolta) {
    if (this.svegliaRocky && this.L.id === 25) {
      this.svegliaRocky = false; const S = Save.data;
      if (!S.arredi.some(a => a.id === 'pallina_rossa')) {
        const letto = S.arredi.find(a => /^letto/.test(a.id) && (a.stanza || 'casa') === 'casa');
        S.arredi.push({ id: 'pallina_rossa', x: letto ? letto.x : 40, y: letto ? letto.y + 16 : 90, stanza: 'casa' });
      }
      S.risveglioRocky = true; Save.write();
      return this.scene.start('Rifugio', { stanza: 'casa', pos: 'letto' });
    }
    return riep.apply(this, arguments);
  };
})();

OGGETTI.pallina_rossa = { nome: 'La pallina rossa', atlas: 'ricordi', frame: 'rocky', tipo: 'pavimento' };
(function () {
  const L = LIVELLI.find(l => l.id === 25); if (!L) return;
  L.dialoghi.salvato = [
    { who: 'narratore', text: 'Sulla collina vi sdraiate a guardare le stelle. Rocky ti appoggia la testa accanto alla spalla.' },
    { who: 'narratore', text: 'Non serve dire niente. Respira piano, la coda batte ancora un po\' sull\'erba.' },
    { who: 'narratore', text: 'Le lucciole si posano intorno a voi. Piano piano, ti si chiudono gli occhi.' },
  ];
  L.dialoghi.fine = [];
  DOPO_LIVELLO[25] = [
    { who: 'narratore', text: 'Quando ti svegli sei nel tuo letto. Accanto al cuscino c\'è una pallina rossa. Come se qualcuno l\'avesse lasciata lì per te.' },
    { who: 'mordicchio', text: 'Hai dormito sorridendo, sai? E quella pallina... io non l\'avevo mai vista. Non è mia. Giuro.' },
  ];
  // al risveglio: Anastasia accanto al letto, la pallina lì vicino, e poi il ricordo nell'album
  MESSE_IN_SCENA[25] = { chi: 'mordicchio', dove: s => { const l = (s.arrediSprites || []).find(a => /^letto/.test(a.dati.id)); return l ? { x: l.x + 24, y: l.y + 8 } : { x: 60, y: 100 }; }, azione: 'risveglio' };
  const mis = Rifugio.prototype.messaInScena;
  Rifugio.prototype.messaInScena = function (id) {
    if (id !== 25) return mis.call(this, id);
    const l = (this.arrediSprites || []).find(a => /^letto/.test(a.dati.id)), p = this.player;
    if (l) { p.setPosition(l.x + 18, l.y + 6); this.cat.setPosition(l.x + 32, l.y + 10); this.cat.meta = null; this.cat.evento = true; this.time.delayedCall(9000, () => { if (this.cat) this.cat.evento = false; }); }
    const b = (this.arrediSprites || []).find(a => a.dati.id === 'pallina_rossa'); if (b) this.tweens.add({ targets: b, y: b.y - 2, yoyo: true, repeat: 3, duration: 300 });
    const mostra = () => { if (!this.sys.isActive()) return; if (this.hud.dialog) return this.time.delayedCall(400, mostra); if (typeof mostraRicordo === 'function' && !(Save.data.ricordi && Save.data.ricordi.rocky)) mostraRicordo(this.hud, 'rocky', () => this.time.delayedCall(300, () => mostraRitrattoRocky(this.hud, false, 'Il ritratto è nell\'inventario di «Arreda»: appendilo dove vuoi.'))); };
    this.time.delayedCall(1500, mostra);
  };
})();

// ---------------- dal sogno, la città giù in fondo (come nel ritratto) ----------------
// ---------------- e rifacendo il sogno: niente Rocky fermo, ma un collare sulla collina ----------------
OGGETTI.collare_rocky = { nome: 'Il collare di Rocky', tex: 'collare_rocky', tipo: 'pavimento' };
(function () {
  const prep = Livello.prototype.preparaRocky;
  Livello.prototype.preparaRocky = function () {
    prep.call(this);
    // la città vista dalla collina: tetti lontani, nella foschia
    const g = this.add.graphics().setDepth(-19), W = this.L.mappa[0].length * T;
    let s = 7; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.fillStyle(0xcfd6e6, 0.55).fillRect(-200, -120, W + 400, 116);
    for (let i = 0; i < 90; i++) { const x = -150 + r() * (W + 300), y = -100 + r() * 90, w = 5 + r() * 7; g.fillStyle([0xe8c39e, 0xf0dcb4, 0xd9a07f, 0xc9b28f][i % 4], 0.55).fillRect(x, y, w, 4 + r() * 3); g.fillStyle(0xa35b4f, 0.5).fillRect(x - 1, y - 2, w + 2, 2); }
    g.fillStyle(0xeef1f6, 0.35).fillRect(-200, -60, W + 400, 56);
    const st = this.st; if (!st.giaFatta) return;
    // rifacendo il sogno: Rocky non c'è più; sulla collina, nell'erba, c'è il suo collare
    this.rocky.setVisible(false); st.rocky = 'ricordo'; this.palchi = [];
    this.collare = this.add.image(this.collina.x + 6, this.collina.y - 2, 'collare_rocky').setDepth(this.collina.y);
    this.tweens.add({ targets: this.collare, y: this.collare.y - 1.5, yoyo: true, repeat: -1, duration: 900 });
    this.time.delayedCall(1100, () => this.hud.bubble(this.player, 'Questo posto... mi ricorda qualcosa.', 4200));
  };
  const mr = Livello.prototype.missioneRocky;
  Livello.prototype.missioneRocky = function (time) {
    const st = this.st, p = this.player;
    if (st.rocky === 'ricordo') {
      if (this.collare && Math.hypot(this.collare.x - p.x, this.collare.y - p.y) < 18) {
        st.rocky = 'fine'; const c = this.collare; this.collare = null; this.tweens.killTweensOf(c);
        this.tweens.add({ targets: c, y: p.y - 18, alpha: 0, duration: 400, onComplete: () => c.destroy() }); Sfx.cuore();
        const S = Save.data, nuovo = !S.collareRocky; S.collareRocky = true; if (nuovo) S.inventario.push('collare_rocky'); Save.write();
        this.hud.say([
          { who: 'narratore', text: 'Tra l\'erba della collina c\'è un collare marrone, consumato. Sulla medaglietta, quasi cancellato, un nome: Rocky.' },
          { who: 'anastasia', text: 'Allora non era solo un sogno.' },
        ], () => mostraRitrattoRocky(this.hud, nuovo));
      }
      return;
    }
    return mr.call(this, time);
  };
})();
function mostraRitrattoRocky(hud, nuovo, nota) {
  const w = UW - 60, h = w * 361 / 320, m = hud.modal('Anastasia e Rocky', h + 146);
  m.c.add(hud.add.image(UW / 2, m.y + 46 + h / 2, 'ritratto_rocky').setDisplaySize(w, h));
  m.c.add(txt(hud, UW / 2, m.y + 56 + h, 'Seduti in cima alla collina, a guardare il mondo.' + (nota ? '\n' + nota : nuovo ? '\nIl collare è nell\'inventario di «Arreda».' : ''), 12, COL.testo, { align: 'center', wordWrap: { width: UW - 60 } }).setOrigin(0.5, 0));
}

// ---------------- il ritratto dipinto di Anastasia e Rocky, da appendere in casa ----------------
// È il premio del sogno (prima un quadretto generico). Appeso al muro, toccandolo si vede il dipinto.
OGGETTI.quadro_rocky = { nome: 'Il ritratto di Anastasia e Rocky', tex: 'quadro_rocky', tipo: 'muro' };
(function () {
  const L = LIVELLI.find(l => l.id === 25); if (L) L.premio = 'quadro_rocky';
  const ld = Save.load;   // chi ha già fatto il sogno riceve il ritratto (una volta sola)
  Save.load = function () {
    const S = ld.apply(this, arguments); if (!S) return S;
    if ((S.completati || []).includes(25) && !S.ritrattoRocky && !(S.inventario || []).includes('quadro_rocky') && !(S.arredi || []).some(a => a.id === 'quadro_rocky')) { S.inventario = S.inventario || []; S.inventario.push('quadro_rocky'); }
    if ((S.completati || []).includes(25)) S.ritrattoRocky = true;
    return S;
  };
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.modo === 'gioca') {
      const q = (this.arrediSprites || []).find(a => a.dati.id === 'quadro_rocky' && Phaser.Geom.Rectangle.Contains(a.getBounds(), x, y));
      if (q) return mostraRitrattoRocky(this.hud, false);
    }
    return tap.call(this, x, y);
  };
})();
