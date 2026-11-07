// =====================================================================
//  Meteo leggero (sereno, nuvoloso, pioggia), arcobaleno dopo la pioggia
//  e l'album dei tesori: piccole cose naturali (niente di origine animale)
//  da trovare durante gli eventi. Nessun valore in semi: solo collezione.
// =====================================================================
const TESORI = {
  quadrifoglio: ['Quadrifoglio', 'Trovato in giardino in una giornata di sole. Porta fortuna, dicono.', 'In giardino, nei giorni di sole'],
  sasso_cuore: ['Sasso a cuore', 'Un sassolino a forma di cuore, vicino all\'orto.', 'Vicino all\'orto, ogni tanto'],
  foglia_rossa: ['Foglia rossa', 'La foglia che Mordicchio inseguiva. Alla fine l\'ha lasciata a te.', 'Quando il vento porta una foglia'],
  pigna: ['Pigna', 'Caduta in giardino in una giornata grigia. Perfetta per la mensola.', 'In giardino, quando è nuvoloso'],
  rugiada: ['Goccia di rugiada', 'Sull\'erba, la mattina dopo la pioggia. Brilla come un vetrino.', 'La mattina presto, dopo una pioggia'],
  sasso_arcobaleno: ['Sasso dell\'arcobaleno', 'Dove finiva l\'arcobaleno c\'era questo. Colorato, ovviamente.', 'Dove finisce l\'arcobaleno'],
  petalo: ['Petalo di ciliegio', 'Un petalo arrivato fin qui. Hana dice che è un buon segno.', 'Quando Hana è in giardino'],
  ramoscello: ['Il ramoscello perfetto', 'Mordicchio l\'ha portato da te dopo il pisolino. È il suo regalo.', 'Dopo un pisolino speciale di Mordicchio'],
  pallina_carta: ['Pallina di carta', 'Dopo aver giocato, i gatti l\'hanno lasciata lì. Un trofeo.', 'Quando due animali giocano'],
  fiore_raro: ['Fiore raro', 'Spuntato da solo in giardino ed era già caduto: si può tenere.', 'Tra i fiori spontanei'],
  mais_dorato: ['Chicco dorato', 'Wilma l\'ha trovato razzolando e te l\'ha lasciato ai piedi.', 'Quando Wilma razzola'],
  soffione: ['Soffione', 'Trovato la sera, tra le lucciole. Si esprime un desiderio e si soffia.', 'La sera, tra le lucciole'],
};
const METEO_NOMI = { sereno: 'Sereno', nuvoloso: 'Nuvoloso', pioggia: 'Pioggia leggera' };
function meteoDelGiorno(g) {
  g = g || Save.data.giorno; let h = (g * 1597334677) >>> 0; const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
  if (g <= 1) return { tipo: 'sereno' };                                   // il primo giorno c'è il sole
  const x = r();
  if (x < 0.55) return { tipo: 'sereno' };
  if (x < 0.75) return { tipo: 'nuvoloso' };
  const da = (10 + Math.floor(r() * 6)) * 60, a = da + 120 + Math.floor(r() * 90);
  return { tipo: 'pioggia', da, a, arcobaleno: a <= 18 * 60 && r() < 0.55 ? [a, a + 90] : null };
}
function meteoAdesso() {
  const m = meteoDelGiorno(), o = Save.data.ora;
  if (m.tipo !== 'pioggia') return { tipo: m.tipo };
  if (o >= m.da && o < m.a) return { tipo: 'pioggia' };
  if (m.arcobaleno && o >= m.arcobaleno[0] && o < m.arcobaleno[1]) return { tipo: 'arcobaleno' };
  return { tipo: o < m.da ? 'nuvoloso' : 'sereno' };
}
function dopoPioggia() { return meteoDelGiorno(Save.data.giorno - 1).tipo === 'pioggia'; }

Object.assign(Sfx, {
  pioggiaOn() {
    if (!this.ok() || this.pioggia) return; const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.014, c.currentTime + 1.2);
    n.connect(f); f.connect(g); g.connect(c.destination); n.start(); this.pioggia = { n, g };
  },
  pioggiaOff() { const p = this.pioggia; if (!p) return; this.pioggia = null; const t = this.ctx.currentTime; p.g.gain.cancelScheduledValues(t); p.g.gain.setValueAtTime(p.g.gain.value, t); p.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); p.n.stop(t + 0.9); },
});

Object.assign(Rifugio.prototype, {
  // ---------------- meteo ----------------
  aggiornaMeteo() {
    const m = meteoAdesso(), fuori = this.stanza === 'fuori';
    if (m.tipo === this.meteoOra) return; this.meteoOra = m.tipo;
    (this.meteoObj || []).forEach(o => o.destroy()); this.meteoObj = []; Sfx.pioggiaOff();
    const add = o => (this.meteoObj.push(o), o);
    if (!this.veloMeteo) this.veloMeteo = this.add.rectangle(0, 0, STANZA.w, STANZA.h, 0x5a6a88, 0).setOrigin(0).setDepth(18002);
    this.veloMeteo.setFillStyle(0x5a6a88, m.tipo === 'pioggia' ? 0.16 : m.tipo === 'nuvoloso' ? 0.07 : 0);
    if (m.tipo === 'pioggia') {
      Sfx.pioggiaOn();
      // le gocce si muovono in update e restano dentro il giardino
      if (fuori) for (let i = 0; i < 56; i++) { const g = add(this.add.rectangle(Math.random() * STANZA.w, Math.random() * STANZA.h, 1, 5, 0xdcecf6, 0.75).setDepth(18003)); g.goccia = 0.16 + Math.random() * 0.06; }
      else { // in casa e in stalla si vede la pioggia sulla finestra
        for (let i = 0; i < 6; i++) { const g = add(this.add.rectangle(STANZA.w - 46 + 4 + Math.random() * 30, 6 + Math.random() * 10, 1, 3, 0xcfe6f2, 0.9).setDepth(-8)); this.tweens.add({ targets: g, y: g.y + 12, alpha: 0, duration: 800 + Math.random() * 400, repeat: -1, delay: Math.random() * 800 }); }
      }
    }
    if (m.tipo === 'nuvoloso' && fuori) for (let i = 0; i < 2; i++) {
      const n = add(this.add.ellipse(-60, 60 + i * 90, 90, 40, 0x334055, 0.08).setDepth(18002));
      this.tweens.add({ targets: n, x: STANZA.w + 60, duration: 26000 + i * 7000, repeat: -1, delay: i * 9000 });
    }
    if (m.tipo === 'arcobaleno' && fuori) {
      const g = add(this.add.graphics().setDepth(-9.5)), cx = STANZA.w * 0.5, cy = 96;
      [0xe8806f, 0xf2b46a, 0xf3e08a, 0x9fd38a, 0x8cbfe2, 0xb39ae0].forEach((c, i) => { g.lineStyle(3, c, 0.45); g.beginPath(); g.arc(cx, cy, 70 - i * 3, Math.PI, 0); g.strokePath(); });
      this.tesoroQui('sasso_arcobaleno', { x: cx + 62, y: cy + 12 }); // ai piedi dell'arcobaleno, a destra
    }
  },
  // ---------------- tesori ----------------
  tesoroQui(id, p) {
    const S = Save.data; S.tesori = S.tesori || {};
    if (S.tesori[id] || !p || (this.tesoriVisibili || []).some(t => t.id === id)) return;
    // sempre in un punto raggiungibile e dentro la stanza
    p = { x: Phaser.Math.Clamp(p.x, 12, STANZA.w - 12), y: Phaser.Math.Clamp(p.y, (this.stanza === 'fuori' ? 16 : STANZA.muro + 12), STANZA.h - 12) };
    if (this.stanza === 'fuori' && this.bloccatoFuori(p.x, p.y)) p = this.puntoLibero();
    const c = this.add.container(p.x, p.y).setDepth(p.y);
    const glow = this.add.image(0, -2, 'scintilla').setScale(0.35).setAlpha(0.8);
    const ic = this.add.image(0, 0, 'tesori', id).setScale(0.75);
    c.add([glow, ic]); this.tweens.add({ targets: glow, angle: 360, alpha: 0.3, yoyo: true, repeat: -1, duration: 1100 });
    this.tweens.add({ targets: ic, y: -2, yoyo: true, repeat: -1, duration: 800 });
    c.id = id; (this.tesoriVisibili = this.tesoriVisibili || []).push(c);
  },
  raccogliTesori() {
    const p = this.player; if (!this.tesoriVisibili || !this.tesoriVisibili.length) return;
    this.tesoriVisibili.slice().forEach(c => {
      if (Math.hypot(c.x - p.x, c.y - p.y) > 11) return;
      const S = Save.data; S.tesori = S.tesori || {}; S.tesori[c.id] = S.giorno; Save.write();
      this.tesoriVisibili = this.tesoriVisibili.filter(x => x !== c);
      this.tweens.add({ targets: c, y: c.y - 14, alpha: 0, duration: 400, onComplete: () => c.destroy() });
      Sfx.cuore(); const n = Object.keys(S.tesori).length;
      this.hud.toast('Nuovo tesoro: ' + TESORI[c.id][0] + '! (' + n + '/' + Object.keys(TESORI).length + ')');
      if (n === 1) this.time.delayedCall(1800, () => this.hud.bubble(this.cat, 'I tesori li conservi nell\'album: tocca «Diario» in alto.', 4200));
    });
  },
  // tesori che dipendono dal giorno e dal tempo, decisi in modo fisso per ogni giornata
  tesoriDelGiorno() {
    const S = Save.data, st = this.stanza, m = meteoDelGiorno(); let h = (S.giorno * 40503 + st.length * 977) >>> 0;
    const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
    if (st !== 'fuori') return;
    const libero = () => this.puntoLibero();
    if (m.tipo === 'sereno' && r() < 0.25) this.tesoroQui('quadrifoglio', libero());
    if (r() < 0.18) this.tesoroQui('sasso_cuore', { x: 90, y: 104 + r() * 40 });
    if (m.tipo === 'nuvoloso' && r() < 0.45) this.tesoroQui('pigna', { x: STANZA.w - 16, y: 100 });
    if (dopoPioggia() && S.ora < 10 * 60) this.tesoroQui('rugiada', libero());
    if (this.ospiti.some(o => o.chiave === 'hana') && r() < 0.3) this.tesoroQui('petalo', libero());
    if (this.fioriOggi >= 2 && r() < 0.35) this.tesoroQui('fiore_raro', libero());
  },
  album() {
    const S = Save.data, hud = this.hud, ids = Object.keys(TESORI), trovati = ids.filter(k => S.tesori && S.tesori[k]);
    const m = hud.modal('Album', Math.min(UH - 40, 560));
    const sa = hud.scrollArea(m.c, 24, m.y + 48, UW - 48, m.h - 60), cw = (UW - 56) / 2;
    sa.inner.add(txt(hud, 0, 0, 'Tesori · ' + trovati.length + '/' + ids.length, 14, COL.titolo));
    ids.forEach((k, i) => {
      const x = (i % 2) * (cw + 8), y = 26 + Math.floor(i / 2) * 92, ok = !!(S.tesori && S.tesori[k]), c = hud.add.container(x, y);
      c.add(hud.add.rectangle(0, 0, cw, 86, ok ? 0xfbf4dc : 0xece3c8).setOrigin(0).setStrokeStyle(2, ok ? 0xd79e61 : 0xc4bc93));
      c.add(hud.add.image(22, 24, 'tesori', k).setScale(2).setAlpha(ok ? 1 : 0.25).setTint(ok ? 0xffffff : 0x8a8080));
      c.add(txt(hud, 42, 8, ok ? TESORI[k][0] : '???', 11, ok ? COL.titolo : '#9d866f', { wordWrap: { width: cw - 48 } }));
      c.add(txt(hud, 8, 44, ok ? TESORI[k][1] : 'Indizio: ' + TESORI[k][2].toLowerCase() + '.', 10, COL.testo, { wordWrap: { width: cw - 14 }, lineSpacing: 1 }));
      sa.inner.add(c); sa.contentH = y + 92;
    });
  },
});

(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.meteoOra = null; this.meteoObj = []; this.veloMeteo = null; this.tesoriVisibili = []; this.fioriOggi = 0;
    this.events.once('shutdown', () => Sfx.pioggiaOff());
    crea.call(this); this.aggiornaMeteo(); this.tesoriDelGiorno();
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta); if (!this.ospiti) return;
    if (this.modo === 'gioca' && !this.hud.dialog) this.raccogliTesori();
    if (time > (this.prossimoMeteo || 0)) { this.prossimoMeteo = time + 2500; this.aggiornaMeteo(); }
    if (this.meteoOra === 'pioggia' && this.stanza === 'fuori') this.meteoObj.forEach(g => { if (!g.goccia) return; g.y += g.goccia * delta; g.x -= g.goccia * delta * 0.2; if (g.y > STANZA.h - 3 || g.x < 1) { g.y = 2; g.x = 4 + Math.random() * (STANZA.w + 30); if (g.x > STANZA.w - 2) g.x -= 30; } });
  };
  // tesori legati agli eventi spontanei
  const fiori = Rifugio.prototype.fioriSpontanei;
  Rifugio.prototype.fioriSpontanei = function () { const n0 = this.children.list.length; fiori.call(this); this.fioriOggi = this.children.list.length - n0; };
  const libera = Rifugio.prototype.libera;
  Rifugio.prototype.libera = function (list) {
    const ev = this.eventoOggi, o = list && list[0];
    if (o && o.active && !this.interrottoDaTocco) {
      if (ev === 'mordicchio_posto' && o === this.cat) this.tesoroQui('ramoscello', { x: this.player.x + 10, y: this.player.y + 4 });
      if (ev === 'gioco' && this.stanza !== 'fuori') this.tesoroQui('pallina_carta', { x: o.x, y: o.y + 4 });
      if (ev === 'foglia') this.tesoroQui('foglia_rossa', { x: o.x + 6, y: o.y + 2 });
    }
    this.interrottoDaTocco = false; return libera.call(this, list);
  };
  const fine = Rifugio.prototype.fineEvento;
  Rifugio.prototype.fineEvento = function (o) { this.interrottoDaTocco = true; fine.call(this, o); this.interrottoDaTocco = false; };
  const lucc = Rifugio.prototype.accendiLucciole;
  Rifugio.prototype.accendiLucciole = function () { lucc.call(this); this.tesoroQui('soffione', this.puntoLibero()); };
  const gesto = Rifugio.prototype.gestoArrivo;
  Rifugio.prototype.gestoArrivo = function (o) { gesto.call(this, o); if (o.chiave === 'wilma' && o.gesto === 'razzola' && Math.random() < 0.25) this.tesoroQui('mais_dorato', { x: o.x + 6, y: o.y + 3 }); };
})();
