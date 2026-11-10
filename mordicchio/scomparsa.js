// =====================================================================
//  La scomparsa di Mordicchio (revisione 10/11)
//  Stati salvati in S.scomparsa.stato:
//   prevista → (di giorno, poco dopo il ritorno) Mordicchio insegue una farfalla e se ne va → via
//   via      → Anastasia: «Speriamo torni entro sera…». Si gioca normalmente, lui non c'è.
//   sera     → al tramonto non è tornato: Anastasia si preoccupa.
//   cerca    → andando a dormire non riesce a prendere sonno: di notte esce a cercarlo (tappa 10).
//   fatto    → ritrovato.
//  Se Anastasia torna dalla tappa 9 nel tardo pomeriggio o di sera, la scomparsa slitta al giorno dopo.
//  Mai una fuga di sera. Tutto si salva: chiudendo e riaprendo il gioco si riparte dallo stesso punto.
// =====================================================================
const SCOMPARSA = { daOra: 9 * 60, entroOra: 15 * 60, tramonto: 19 * 60, dopoMinuti: 40 };
const Scomparsa = {
  s(S) { return S.scomparsa || null; },
  attiva(S) { const s = S.scomparsa; return !!s && ['via', 'sera', 'cerca'].includes(s.stato); },
  // dopo la tappa 9 (e finché la 10 non è fatta) si prepara la scomparsa
  prepara(S) {
    if (!(S.completati || []).includes(9) || (S.completati || []).includes(10)) return;
    if (!S.scomparsa) S.scomparsa = { stato: 'prevista', giorno: S.giorno, ora: null };
    const s = S.scomparsa; if (s.stato !== 'prevista' || s.ora != null) return;
    if (S.ora < SCOMPARSA.entroOra && (S.giorno > s.giorno || S.ora + SCOMPARSA.dopoMinuti <= SCOMPARSA.entroOra)) s.ora = Math.round(Math.max(S.ora + SCOMPARSA.dopoMinuti, SCOMPARSA.daOra)), s.giornoOra = S.giorno;
    // altrimenti si aspetta il giorno dopo: alla mattina si fissa l'ora
  },
};
(function () {
  // la tappa 10 si fa solo come ricerca notturna (o, dopo, come tutte le altre)
  const tp = Eco.tappaPossibile;
  Eco.tappaPossibile = function (S, id) {
    if (id !== 10 && Scomparsa.attiva(S)) return { ok: false, perche: 'nonora' };   // senza Mordicchio non si parte per altre tappe
    if (id === 10 && !(S.completati || []).includes(10)) {
      if ((S.completati || []).includes(9) && !(S.scomparsa && S.scomparsa.stato === 'cerca')) return { ok: false, perche: 'nonora' };
      if (S.scomparsa && S.scomparsa.stato === 'cerca') return { ok: true };
    }
    return tp.call(this, S, id);
  };
  const ct = Eco.completaTappa;
  Eco.completaTappa = function (S, id) { const r = ct.apply(this, arguments); if (id === 10 && S.scomparsa) S.scomparsa.stato = 'fatto'; return r; };
  const notte = Eco.notte;
  Eco.notte = function (S) { const r = notte.apply(this, arguments); const s = S.scomparsa; if (s && s.stato === 'prevista' && s.ora != null && s.giornoOra !== S.giorno) s.ora = null; return r; };
})();

Object.assign(Rifugio.prototype, {
  nascondiGatto() {
    const c = this.cat; if (!c) return;
    c.assente = true; c.evento = true; c.meta = null; c.setVisible(false); c.setPosition(-60, -60);
    if (c.input) c.disableInteractive();
  },
  fugaFarfalla() {
    const S = Save.data, s = S.scomparsa, c = this.cat, hud = this.hud; if (!c || c.assente) return;
    s.stato = 'via'; s.giornoFuga = S.giorno; Save.write();
    c.evento = true; c.meta = null; c.dorme = false;
    // una farfalla gli passa davanti; lui la insegue fuori
    const f = this.add.container(c.x + 18, c.y - 16).setDepth(30000);
    const a1 = this.add.ellipse(-2, 0, 5, 4, 0xf2a7c3), a2 = this.add.ellipse(2, 0, 5, 4, 0xf9d26b), corpo = this.add.rectangle(0, 0, 1, 4, 0x504086);
    f.add([a1, a2, corpo]); this.tweens.add({ targets: [a1, a2], scaleX: 0.3, yoyo: true, repeat: -1, duration: 120 });
    const uscita = this.stanza === 'fuori' ? { x: STANZA.w + 20, y: 90 } : { x: STANZA.w / 2, y: STANZA.h + 20 };
    hud.bubble(c, '!', 1200);
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: f, x: uscita.x, y: uscita.y - 10, duration: 3200, ease: 'Sine.inOut', onUpdate: () => { f.y += Math.sin(this.time.now / 90) * 0.6; }, onComplete: () => f.destroy() });
      this.cammina(c, uscita.x, uscita.y, 2.2, () => {
        this.nascondiGatto();
        this.time.delayedCall(600, () => hud.say([
          { who: 'anastasia', text: 'Mordicchio? ...È corso dietro a una farfalla.' },
          { who: 'anastasia', text: 'Speriamo torni entro sera. Ogni tanto si allontana, ma finora è sempre tornato prima del tramonto.' },
        ]));
      });
    });
  },
  preoccupata() {
    const S = Save.data; S.scomparsa.stato = 'sera'; Save.write();
    this.hud.say([
      { who: 'narratore', text: 'Il sole è tramontato. Di Mordicchio, nessuna traccia.' },
      { who: 'anastasia', text: 'Non è ancora tornato. Non è mai successo...' },
      { who: 'anastasia', text: 'Magari arriva mentre preparo la cena. Lo aspetto ancora un po\'.' },
    ]);
  },
  // di notte non riesce a dormire ed esce a cercarlo
  svegliaNotte() {
    const S = Save.data, hud = this.hud; this.dormendo = true; hud.clearAll(); Musica.suona('ricerca');
    const c = hud.add.container(0, 0).setDepth(80); hud.layer.add(c);
    const bg = hud.add.rectangle(0, 0, UW, UH, 0x1d1828, 1).setOrigin(0).setAlpha(0); c.add(bg);
    hud.tweens.add({ targets: bg, alpha: 1, duration: 700 });
    const righe = ['Anastasia si mette a letto, ma il posto tra le sue gambe è vuoto.', 'Le due di notte. Non riesce a dormire.'];
    const t = txt(hud, UW / 2, UH * 0.38, righe.join('\n\n'), 15, COL.crema, { align: 'center', wordWrap: { width: UW - 60 }, lineSpacing: 4 }).setOrigin(0.5).setAlpha(0); c.add(t);
    hud.tweens.add({ targets: t, alpha: 1, delay: 600, duration: 800 });
    Eco.notte(S); S.ora = TEMPO.inizio; S.scomparsa.stato = 'cerca'; Save.write();
    hud.button(UW / 2 - 100, UH * 0.66, 200, 44, 'Vado a cercarlo', () => { this.dormendo = false; this.scene.start('Livello', { id: 10 }); }, { parent: c, size: 15 });
  },
});

(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    const S = Save.data; Scomparsa.prepara(S);
    const s = S.scomparsa;
    if (s && Scomparsa.attiva(S)) this.nascondiGatto();
    // chi ha chiuso il gioco a metà della ricerca riparte dalla notte
    if (s && s.stato === 'cerca') this.time.delayedCall(800, () => this.hud.say([{ who: 'anastasia', text: 'Mordicchio è ancora là fuori, da qualche parte. Lo vado a cercare: è sul sentiero, nel paese.' }]));
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    const S = Save.data, s = S && S.scomparsa; if (!s || !this.cat) return;
    if (Scomparsa.attiva(S) && (this.cat.visible || this.cat.x > -50)) this.nascondiGatto();
    const libero = this.modo === 'gioca' && !this.hud.dialog && !(this.hud.ctrl && this.hud.ctrl.frozen) && !this.dormendo && !this.uscendo && !this.turno;
    if (!libero || (this._prossimoControllo || 0) > time) return; this._prossimoControllo = time + 1000;
    if (s.stato === 'prevista') { Scomparsa.prepara(S); if (s.ora != null && S.ora >= s.ora && S.ora < SCOMPARSA.tramonto - 60 && !this.cat.assente) this.fugaFarfalla(); }
    else if (s.stato === 'via' && S.ora >= SCOMPARSA.tramonto) this.preoccupata();
  };
  // a letto, se Mordicchio non è tornato: niente sonno, si esce a cercarlo
  const dormi = Rifugio.prototype.dormi;
  Rifugio.prototype.dormi = function (forzato) {
    const S = Save.data; if (S.scomparsa && ['via', 'sera'].includes(S.scomparsa.stato)) { if (S.scomparsa.stato === 'via') S.scomparsa.stato = 'sera'; return this.svegliaNotte(); }
    return dormi.apply(this, arguments);
  };
  // il gatto assente non parla e non si tocca
  const bub = Hud.prototype.bubble;
  Hud.prototype.bubble = function (target, text, ms) { if (target && target.assente) return null; return bub.call(this, target, text, ms); };
})();
