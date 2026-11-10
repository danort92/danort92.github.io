// =====================================================================
//  Visitatori, partenze e ritorni, tappe rivisitate (revisione 10/11)
//  - Thiago, il gatto di mamma e papà, non vive al rifugio: passa a trovarci (di giorno, in casa).
//  - Quando Anastasia parte per una tappa si annota chi c'è al rifugio. Al ritorno, se un visitatore
//    nel frattempo è andato via, Anastasia lo nota: nessuno resta in due posti.
//  - Tornando in una tappa già fatta: chi ci abitava non c'è più (vive al rifugio o a casa sua),
//    Anastasia si ricorda dell'incontro e intorno ci sono farfalle e uccellini (di giorno) o lucciole (di sera).
// =====================================================================
LIBERI.thiago = { quota: 0.5, fasce: [[9 * 60, 19 * 60]], dove: 'Vive con mamma e papà di Anastasia: passa a trovarci', stanza: 'casa' };
STANZA_PREDEFINITA.thiago = 'casa';
(function () {
  const la = luogoAttuale;
  luogoAttuale = function (k) { const r = la(k); return r === 'fuori' && LIBERI[k] && LIBERI[k].stanza ? LIBERI[k].stanza : r; };
  const L6 = LIVELLI.find(l => l.id === 6);
  if (L6) {
    L6.testoArrivo = 'Thiago torna da mamma e papà: passerà a trovarti';
    const s = L6.dialoghi.salvato || [];
    s.forEach((r, i) => { if (/Vengo con te|Vorrei venire con te/.test(r.text)) s[i] = { who: 'thiago', text: 'Adesso torno a casa, da mamma e papà. Ma passerò a trovarti: voglio vedere dove vivi e chi si prende cura di te.' }; });
  }
  DOPO_LIVELLO[6] = [{ who: 'mordicchio', text: 'Thiago è tornato da mamma e papà. Ha detto che passerà a trovarci. Secondo me vuole controllare il calorifero.' }];
  if (typeof MESSE_IN_SCENA !== 'undefined') delete MESSE_IN_SCENA[6];
})();

// ---------------- partenza e ritorno ----------------
(function () {
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    const S = Save.data;
    // si annota chi c'è al rifugio solo partendo da casa (non da una tappa all'altra, non riprendendo)
    if (S && !S.partenza) S.partenza = { giorno: S.giorno, ora: S.ora, presenti: Object.keys(S.animali || {}).filter(k => LIBERI[k] && luogoAttuale(k) !== 'via') };
    return crea.apply(this, arguments);
  };
  const creaR = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    creaR.apply(this, arguments);
    const S = Save.data, p = S.partenza; if (!p) return;
    S.partenza = null; Save.write();
    const andati = (p.presenti || []).filter(k => S.animali[k] && luogoAttuale(k) === 'via');
    if (!andati.length) return;
    const femmine = ['rossella', 'ghianda'], nomi = andati.map(k => ANIMALI[k].nome);
    const frase = andati.length === 1
      ? nomi[0] + ' non c\'è più. Sarà ' + (femmine.includes(andati[0]) ? 'tornata' : 'tornato') + ' a casa sua mentre eravamo via.'
      : nomi.slice(0, -1).join(', ') + ' e ' + nomi[nomi.length - 1] + ' non ci sono più. Saranno tornati a casa loro mentre eravamo via.';
    const dì = (n) => { if (!this.sys.isActive()) return; if (this.hud.dialog || (this.hud.ctrl && this.hud.ctrl.frozen) || (this.hud.quieto && this.hud.quieto())) { if (n < 40) this.time.delayedCall(800, () => dì(n + 1)); return; } this.hud.say([{ who: 'anastasia', text: frase }]); };
    this.time.delayedCall(2600, () => dì(0));
  };
})();

// ---------------- tappe rivisitate ----------------
const RICORDO_TAPPA = {
  10: 'Qui l\'ho ritrovato, quella notte. Avevo il cuore in gola.',
  11: 'Qui Wilma ha visto il sole per la prima volta.',
  30: 'Le decorazioni della festa sono ancora qui. Che bella giornata è stata.',
};
(function () {
  const gf = Livello.prototype.giaFatta;
  Livello.prototype.giaFatta = function () {
    const r = gf.apply(this, arguments), L = this.L, S = Save.data;
    const chi = [L.animale, L.ospite].filter(a => a && a !== 'mordicchio' && ANIMALI[a]);
    // il ricordo di Anastasia
    if (L.id !== 25) {
      const nomi = chi.map(a => ANIMALI[a].nome);
      const testo = RICORDO_TAPPA[L.id] || (nomi.length ? ['Qui abbiamo conosciuto ' + nomi.join(' e ') + '. Sembra passato tanto tempo.', 'È qui che ho incontrato ' + nomi.join(' e ') + '. Me lo ricordo come fosse ieri.', 'Questo posto mi ricorda ' + nomi.join(' e ') + '. Chissà cosa starà facendo adesso, al rifugio.'][L.id % 3].replace(/, al rifugio\.$/, chi.every(a => LIBERI[a]) ? '.' : ', al rifugio.') : null);
      if (testo) this.time.delayedCall(5200, () => { if (this.sys.isActive() && !this.hud.dialog) this.hud.say([{ who: 'anastasia', text: testo }]); });
    }
    this.dettagliAmbiente();
    return r;
  };
})();
Object.assign(Livello.prototype, {
  dettagliAmbiente() {
    const L = this.L, W = L.mappa[0].length * T, H = L.mappa.length * T, S = Save.data;
    const sera = S.ora >= 19 * 60 || S.ora < 6 * 60 || L.atmosfera === 'sogno' || L.id === 10;
    if (sera) { if (L.atmosfera !== 'sogno' && L.id !== 25) this.lucciole(18, W, H, 20001); return; }
    // farfalle
    for (let i = 0; i < 5; i++) {
      const f = this.add.container(Math.random() * W, Math.random() * H).setDepth(19500);
      const c = [[0xf2a7c3, 0xf9d26b], [0xffffff, 0xd8e8f0], [0xf9d26b, 0xe8894f]][i % 3];
      const a1 = this.add.ellipse(-1.5, 0, 3.5, 3, c[0]), a2 = this.add.ellipse(1.5, 0, 3.5, 3, c[1]);
      f.add([a1, a2]); this.tweens.add({ targets: [a1, a2], scaleX: 0.3, yoyo: true, repeat: -1, duration: 110 + i * 10 });
      const vola = () => this.tweens.add({ targets: f, x: Phaser.Math.Clamp(f.x + (Math.random() - 0.5) * 80, 10, W - 10), y: Phaser.Math.Clamp(f.y + (Math.random() - 0.5) * 60, 10, H - 10), duration: 2400 + Math.random() * 1600, ease: 'Sine.inOut', onComplete: vola });
      vola();
    }
    // uccellini che attraversano il cielo ogni tanto
    this.time.addEvent({ delay: 7000, loop: true, callback: () => {
      const y = 20 + Math.random() * (H * 0.4), da = Math.random() < 0.5, g = this.add.graphics().setDepth(20000);
      g.lineStyle(1, 0x504086, 0.8).beginPath().moveTo(-3, 0).lineTo(0, 2).lineTo(3, 0).strokePath();
      g.setPosition(da ? -10 : W + 10, y);
      this.tweens.add({ targets: g, x: da ? W + 10 : -10, y: y - 20, duration: 6000, onComplete: () => g.destroy() });
      this.tweens.add({ targets: g, scaleY: 0.4, yoyo: true, repeat: -1, duration: 180 });
    } });
  },
});

// ---------------- coerenza: chi passa solo ogni tanto ----------------
// Le frasi che nominano un visitatore (Thiago, Mino, Max, Ghianda, Rossella) si dicono solo quando
// oggi è davvero al rifugio. Le frasi sull'assenza («Max oggi non c'è», «Dov'è Thiago?») restano com'erano.
(function () {
  Object.keys(LIBERI).forEach(k => {
    const nome = ANIMALI[k] && ANIMALI[k].nome; if (!nome) return;
    CONDIZIONI_FRASI.push([new RegExp('^(?!.*(non c\'è|Dov\'è)).*\\b' + nome + '\\b', 'i'), c => luogoAttuale(k) !== 'via']);
  });
  // a fine tappa i visitatori accompagnano fino al cartello, poi tornano a casa loro
  const fine = { 4: 'Ghianda ci accompagna fino al cartello di casa, vicino all\'ingresso del bosco. Poi torna tra i suoi alberi.', 6: 'Thiago ci accompagna fino al cartello di casa, qui vicino. Poi torna da mamma e papà.' };
  Object.keys(fine).forEach(id => { const L = LIVELLI.find(l => l.id === +id); if (L && L.dialoghi.fine) L.dialoghi.fine = [{ who: 'mordicchio', text: fine[id] }]; });
})();
// chi vive libero, appena incontrato torna a casa sua: Mordicchio lo racconta così (prima diceva che era già in giardino)
(function () {
  const M = (t) => [{ who: 'mordicchio', text: t }];
  Object.assign(DOPO_LIVELLO, {
    4: M('Ghianda è tornata nel bosco. Ha detto che passerà per il melo. Secondo me ha già deciso dove nascondere le ghiande.'),
    8: M('Mino è tornato in paese. Prima di andare ha guardato il van per un bel po\'. Tornerà, ne sono sicuro.'),
    9: M('Max è tornato da Eloisa e Michael. Prima di andare mi ha fatto le fusa. Io gli ho soffiato. Non ci capiamo.'),
  });
  if (typeof MESSE_IN_SCENA !== 'undefined') [4, 8, 9].forEach(id => delete MESSE_IN_SCENA[id]);
})();
// il giorno in cui lo incontri, un visitatore torna a casa sua: ripasserà dai giorni successivi
(function () {
  const ct = Eco.completaTappa;
  Eco.completaTappa = function (S, id) {
    const prima = !(S.completati || []).includes(id), r = ct.apply(this, arguments), L = LIVELLI.find(l => l.id === id);
    if (prima && L) { S.liberiVia = S.liberiVia || {}; [L.animale, L.ospite].filter(a => a && LIBERI[a]).forEach(a => { S.liberiVia[a] = S.giorno; }); }
    return r;
  };
  const la = luogoAttuale;
  luogoAttuale = function (k) { const S = Save.data; if (S && S.liberiVia && S.liberiVia[k] === S.giorno && LIBERI[k]) return 'via'; return la(k); };
})();
