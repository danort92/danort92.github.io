// =====================================================================
//  Il compratore di passaggio (revisione 10/11, facoltativo)
//  Ogni tanto (circa un giorno su tre, dalla tappa 4) un paesano passa dal giardino tra le 10 e le 17
//  e chiede qualche ortaggio in cambio di semi. Si può accettare o dire «non ora»: nessuna penalità.
//  Bilanciamento: paga circa il doppio di quanto costa coltivare quegli ortaggi, più 1 seme.
//  Esempio: 3 pomodorini (costano 1,5 semi di semina) → 4 semi. Un piatto del van ne vale 6-12:
//  vendere al compratore conviene meno che cucinare, ma è utile quando l'orto è pieno.
//  Si resta fino alle 18; se Anastasia non è in giardino, aspetta lì.
// =====================================================================
const COMPRATORE = { probabilita: 0.35, daTappa: 4, daOra: 10 * 60, aOra: 17 * 60, via: 18 * 60 };
const Compratore = {
  hash(n) { let h = (n * 2654435761) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return (h >>> 8) / 16777216; },
  paga(c, n) { const C = COLTURE[c]; return Math.ceil(n * C.costo / C.resa * 2) + 1; },
  // si decide al cambio di giorno: deterministico (non si «rigioca» la notte per farlo venire)
  prepara(S) {
    S.compratore = null;
    if (Eco.tappeFatte(S) < COMPRATORE.daTappa || this.hash(S.giorno * 7 + 3) > COMPRATORE.probabilita) return;
    const colture = Eco.coltureDisponibili(S); if (!colture.length) return;
    const c = colture[Math.floor(this.hash(S.giorno * 11 + 5) * colture.length)], n = COLTURE[c].resa <= 2 ? 2 : 3;
    const chi = PAESANI[Math.floor(this.hash(S.giorno * 13 + 1) * PAESANI.length)];
    S.compratore = { giorno: S.giorno, ora: COMPRATORE.daOra + Math.floor(this.hash(S.giorno * 17) * (COMPRATORE.aOra - COMPRATORE.daOra)), chi: chi.nome, frame: chi.frame, c, n, paga: this.paga(c, n), stato: 'atteso' };
  },
};
(function () {
  const notte = Eco.notte;
  Eco.notte = function (S) { const r = notte.apply(this, arguments); Compratore.prepara(S); return r; };
})();
Object.assign(Rifugio.prototype, {
  arrivaCompratore() {
    const S = Save.data, q = S.compratore; q.stato = 'qui'; Save.write();
    const s = this.add.sprite(STANZA.w / 2, STANZA.h + 10, 'paesani', q.frame).setOrigin(0.5, 1).setDepth(STANZA.h);
    this.compratore = s; s.chiave = 'compratore';
    this.tweens.add({ targets: s, y: STANZA.h - 46, duration: 2200, onUpdate: () => s.setDepth(s.y), onComplete: () => { this.hud.bubble(s, '!', 1600); } });
  },
  parlaCompratore() {
    const S = Save.data, q = S.compratore, hud = this.hud, nome = COLTURE[q.c].nome.toLowerCase(), ho = S.ing[q.c] || 0;
    q.parlato = true;
    hud.say([{ who: 'narratore', text: q.chi + ' si ferma al cancello.' }, { who: 'anastasia', text: 'Buongiorno! Posso aiutarla?' }], () => {
      const m = hud.modal(q.chi, 230);
      m.c.add(hud.add.image(48, m.y + 74, 'paesani', q.frame).setScale(3));
      m.c.add(txt(hud, 86, m.y + 50, '«Ho visto il tuo orto dalla strada. Mi daresti ' + q.n + ' ' + nome + '? In cambio ti do ' + q.paga + ' semi.»', 12, COL.testo, { wordWrap: { width: UW - 120 }, lineSpacing: 3 }));
      m.c.add(txt(hud, 86, m.y + 118, 'In dispensa: ' + ho + ' ' + nome, 11, ho >= q.n ? '#5f8a3c' : '#9d866f'));
      hud.button(28, m.y + 150, (UW - 64) / 2, 38, ho >= q.n ? 'Volentieri' : 'Non ne ho abbastanza', () => {
        if (ho < q.n) { Sfx.no(); return; }
        S.ing[q.c] -= q.n; S.semi += q.paga; q.stato = 'fatto'; Save.write(); m.close(); Sfx.seme && Sfx.seme();
        hud.say([{ who: 'paesano' + q.frame, text: 'Grazie! Stasera ci faccio una cena coi fiocchi. (+' + q.paga + ' semi)' }], () => this.vaCompratore());
      }, { parent: m.c, size: 12 });
      hud.button(36 + (UW - 64) / 2, m.y + 150, (UW - 64) / 2, 38, 'Non ora', () => {
        q.stato = 'fatto'; Save.write(); m.close();
        hud.say([{ who: 'paesano' + q.frame, text: 'Nessun problema. Magari un\'altra volta!' }], () => this.vaCompratore());
      }, { parent: m.c, size: 12 });
    });
  },
  vaCompratore() {
    const s = this.compratore; if (!s) return; this.compratore = null;
    const S = Save.data; if (S.compratore && S.compratore.stato !== 'fatto') { S.compratore.stato = 'fatto'; Save.write(); }
    this.tweens.add({ targets: s, y: STANZA.h + 14, duration: 2000, onComplete: () => s.destroy() });
  },
});
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments); this.compratore = null;
    const S = Save.data, q = S.compratore;
    if (this.stanza === 'fuori' && q && q.giorno === S.giorno && q.stato === 'qui' && S.ora < COMPRATORE.via) {   // stava già aspettando
      const s = this.add.sprite(STANZA.w / 2, STANZA.h - 46, 'paesani', q.frame).setOrigin(0.5, 1).setDepth(STANZA.h - 46); this.compratore = s;
    }
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    const S = Save.data, q = S && S.compratore; if (!q || this.stanza !== 'fuori' || q.giorno !== S.giorno) return;
    const libero = this.modo === 'gioca' && !this.hud.dialog && !(this.hud.ctrl && this.hud.ctrl.frozen) && !this.dormendo && !this.uscendo && !this.turno;
    if (q.stato === 'atteso' && libero && S.ora >= q.ora && S.ora < COMPRATORE.via) return this.arrivaCompratore();
    if (q.stato === 'qui' && this.compratore && S.ora >= COMPRATORE.via) return this.vaCompratore();
    if (q.stato === 'qui' && this.compratore && libero && !q.parlato && Math.hypot(this.player.x - this.compratore.x, this.player.y - this.compratore.y) < 18) this.parlaCompratore();
  };
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    const s = this.compratore, q = Save.data.compratore;
    if (s && q && q.stato === 'qui' && this.modo === 'gioca' && Phaser.Geom.Rectangle.Contains(s.getBounds(), x, y)) { q.parlato = false; return this.parlaCompratore(); }
    return tap.call(this, x, y);
  };
})();
