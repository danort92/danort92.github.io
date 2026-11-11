// =====================================================================
//  La festa, nuova versione (revisione 10/11, sera)
//  - Dopo la tappa 29 Mordicchio dice sempre che l'ultima tappa si fa domani (frase diversa secondo l'ora),
//    e fino al giorno dopo la tappa 30 non si può fare.
//  - La mattina dopo, a casa non c'è nessuno: né gli animali né Mordicchio. Un «!» sopra Anastasia,
//    poi lei decide di andare dove Mordicchio voleva andare ieri: l'ultima tappa.
//  - Lì trova Mordicchio: «Mordicchio, sei qui! Gli animali sono spariti!». Lui la manda verso il tavolo;
//    quando Anastasia ci arriva (il tavolo non si attraversa), gli animali saltano fuori da dietro i pini
//    e suona «Tanti auguri a te».
// =====================================================================
const festaDomani = S => (S.completati || []).includes(29) && !(S.completati || []).includes(30);
// (partite in cui la 29 è stata fatta prima di questa versione: niente «domani» né casa vuota, la festa si fa come prima)
const haGiorno29 = S => !!(S.giornoTappa && S.giornoTappa[29] != null);
const mattinaFesta = S => festaDomani(S) && haGiorno29(S) && S.giorno > S.giornoTappa[29];
(function () {
  // ---------------- la sera prima: l'ultima tappa è domani ----------------
  Object.defineProperty(DOPO_LIVELLO, 29, { configurable: true, enumerable: true, get() {
    const S = Save.data, ora = S ? S.ora : 12 * 60;
    const zip = { who: 'mordicchio', text: 'Zip sta già controllando le viti della cucina. Dice che una cigolava. E mi ha chiesto di non mangiarlo. Ovviamente no!' };
    const d = ora >= 18 * 60 ? 'Si è fatto tardi. All\'ultima tappa del sentiero ci andiamo domattina: stanotte dormi bene, che ti serve.'
      : ora >= 13 * 60 ? 'All\'ultima tappa ci andiamo domani. Oggi pomeriggio riposati... e niente domande.'
        : 'L\'ultima tappa? Domani. Oggi no. Non insistere, è una cosa che si fa domani e basta.';
    return [zip, { who: 'mordicchio', text: d }];
  } });
  const tp = Eco.tappaPossibile;
  Eco.tappaPossibile = function (S, id) {
    const r = tp.apply(this, arguments);
    if (id === 30 && r.ok && !r.rigioca && festaDomani(S) && haGiorno29(S) && !mattinaFesta(S)) return { ok: false, perche: 'domani' };
    return r;
  };
  Mappa.prototype.tappaDomani = function () {
    const hud = this.hud || game.scene.getScene('Hud'), S = Save.data;
    hud.say([{ who: 'mordicchio', text: S.ora >= 18 * 60 ? 'È tardi. L\'ultima tappa è domani, te l\'ho detto.' : 'L\'ultima tappa è domani. Oggi no. Fidati.' }]);
  };
  // ---------------- la mattina dopo: la casa vuota ----------------
  const la = luogoAttuale;
  luogoAttuale = function (k) { const S = Save.data; if (S && mattinaFesta(S)) return 'via'; return la(k); };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    const S = Save.data; if (!mattinaFesta(S)) return;
    this.nascondiGatto && this.nascondiGatto();
    if (S.casaVuotaVista === S.giorno) return;
    S.casaVuotaVista = S.giorno; Save.write();
    const dopo = () => {
      if (!this.sys.isActive()) return;
      if (this.hud.dialog || (this.hud.ctrl && this.hud.ctrl.frozen)) return this.time.delayedCall(500, dopo);
      this.hud.bubble(this.player, '!', 1600);
      this.time.delayedCall(1600, () => this.hud.say([
        { who: 'anastasia', text: 'Mordicchio? ...Mordicchio! Non c\'è nessuno. Dove sono finiti tutti?' },
        { who: 'anastasia', text: 'Ieri Mordicchio voleva andare all\'ultima tappa del sentiero. Proviamo ad andare lì.' },
      ]));
    };
    this.time.delayedCall(1200, dopo);
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (t, d) { upd.call(this, t, d); const S = Save.data; if (S && mattinaFesta(S) && this.cat && (this.cat.visible || this.cat.x > -50) && this.nascondiGatto) this.nascondiGatto(); };

  // ---------------- la tappa 30 ----------------
  const L30 = LIVELLI.find(l => l.id === 30);
  if (L30) {
    L30.dialoghi.arrivo = [
      { who: 'anastasia', text: 'Mordicchio, sei qui! Gli animali sono spariti! Non c\'è più nessuno, né in casa né in stalla!' },
      { who: 'mordicchio', text: 'Spariti? Ma va\'. Io stamattina non ho visto niente. Proprio niente.' },
      { who: 'mordicchio', text: 'Senti, già che siamo qui... avvicinati a quel tavolo, lassù tra i pini. Fidati di me.' },
    ];
    L30.indizi = Object.assign({}, L30.indizi, { animale: 'Il tavolo è in alto, al centro, tra i pini.' });
  }
  const creaL = Livello.prototype.create;
  Livello.prototype.create = function () {
    const r = creaL.apply(this, arguments);
    if (this.L.id !== 30) return r;
    const a = this.animale; this.tavolo30 = { x: a.x, y: a.y + 12 };
    // il tavolo non si attraversa
    for (let x = a.x - 32; x <= a.x + 32; x += 8) this.muri.add(Math.floor(x / T) + ',' + Math.floor((a.y + 12) / T));
    // i pini dietro cui si nascondono gli animali
    this.pini30 = [[-58, -4], [-80, 14], [-44, 22], [58, -4], [80, 14], [44, 22]].map(([dx, dy]) => { const x = a.x + dx, y = a.y + dy; this.add.image(x, y, 'pino').setOrigin(0.5, 1).setDepth(y); return { x, y }; });
    if (this.st.giaFatta) return r;
    // Mordicchio aspetta all'ingresso, accanto ad Anastasia
    const p = this.player; this.npc.setPosition(p.x + 16, p.y - 6).setDepth(p.y);
    return r;
  };
  const ms = Livello.prototype.missioneSpeciale;
  Livello.prototype.missioneSpeciale = function (time) {
    const M = this.L.missione, st = this.st, p = this.player, hud = this.hud;
    if (M.tipo !== 'festa' || st.giaFatta || this.L.id !== 30) return ms.apply(this, arguments);
    // dopo l'arrivo Mordicchio va verso il tavolo
    if (!this.__t30) this.__t30 = time;
    if (!st.parlato && time - this.ultimoProgresso > 30000 && this.tavolo30) hud.setHint(this.tavolo30.x, this.tavolo30.y);
    if (!this.mordicchioAlTavolo && !hud.dialog && time - this.__t30 > 1500) {
      this.mordicchioAlTavolo = true; const n = this.npc, t = this.tavolo30;
      if (n.anims && n.walkAnim) n.anims.play(n.walkAnim, true); n.setFlipX(t.x < n.x);
      this.tweens.add({ targets: n, x: t.x + 6, y: t.y - 18, duration: 2600, onUpdate: () => n.setDepth(n.y), onComplete: () => { if (n.anims) n.anims.stop(); n.setFrame(n.idleFrame); } });
    }
    if (!st.parlato && this.tavolo30 && Math.hypot(this.tavolo30.x - p.x, this.tavolo30.y + 8 - p.y) < 34) {
      st.parlato = true; this.frozenAll = true; hud.joyEnd && hud.joyEnd();
      this.sorpresa(); this.tantiAuguri();
      this.time.delayedCall(1800, () => { this.frozenAll = false; hud.say(this.L.dialoghi.incontro, () => this.ballaTutti(() => this.salva(), true)); });
    }
    this.controllaUscita();
  };
  // gli animali saltano fuori da dietro i pini
  const sorpresa = Livello.prototype.sorpresa;
  Livello.prototype.sorpresa = function () {
    const r = sorpresa.apply(this, arguments);
    if (this.L.id !== 30 || !this.pini30 || !this.festaSprites) return r;
    this.festaSprites.forEach((s, i) => {
      const pino = this.pini30[i % this.pini30.length], fx = s.x, fy = s.y;
      this.tweens.killTweensOf(s); s.scale = 1; s.setPosition(pino.x, pino.y - 3).setDepth(pino.y - 1).setAlpha(0);
      this.tweens.add({ targets: s, alpha: 1, x: fx, y: fy, duration: 500, delay: 150 + i * 70, ease: 'Back.out', onUpdate: () => s.setDepth(s.y) });
    });
    return r;
  };
  // «Tanti auguri a te»: la melodia (tradizionale), suonata a campanelli
  Livello.prototype.tantiAuguri = function () {
    const n = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 }, b = 0.36;
    const melodia = [['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2], ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
      ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2], ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]];
    const out = typeof Musica !== 'undefined' && Musica.out && Sfx.ctx ? Musica.out.gain : null, vol = Musica && Musica.on ? 0.07 : 0;
    if (out) out.setTargetAtTime(0.0001, Sfx.ctx.currentTime, 0.1);   // la musica di sottofondo si abbassa
    let t = 0.2;
    melodia.forEach(([k, d]) => { Sfx.tone(n[k], d * b * 0.9, 'triangle', 0.09, t); Sfx.tone(n[k] * 2, d * b * 0.5, 'sine', 0.025, t); t += d * b; });
    if (out) this.time.delayedCall((t + 0.4) * 1000, () => { if (Sfx.ctx) out.setTargetAtTime(vol, Sfx.ctx.currentTime, 0.5); });
    return t;
  };
})();
