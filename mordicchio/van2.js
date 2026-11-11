// =====================================================================
//  Il van, rivisto (7/11, revisione di Danilo):
//  - apre due volte al giorno: a pranzo (12–14) e a cena (19–21), mai al mattino;
//  - al massimo 4 clienti per apertura (2 con il van appena riparato, 3 col bancone, 4 col forno);
//  - i clienti sono persone del paese, non gli animali del rifugio: pizza, dolci e cioccolato non sono
//    cibo per animali (alcuni ingredienti, come il cioccolato o la cipolla, a cani e gatti fanno proprio male).
//    Gli animali, al van, al massimo passano a curiosare;
//  - i clienti cambiano: nella stessa apertura non torna nessuno, e chi è venuto l'ultima volta aspetta un turno;
//  - un piatto che non si riesce a cucinare non fa più saltare il cliente: lo dice e si può scegliere altro.
// =====================================================================
const TURNI_VAN = [{ id: 'pranzo', da: 12 * 60, a: 14 * 60, nome: 'a pranzo' }, { id: 'cena', da: 19 * 60, a: 21 * 60, nome: 'a cena' }];
const PAESANI = [
  { nome: 'Nonna Rina', frame: 0, saluti: ['Che profumino, cara!', 'Ai miei tempi il van della pizza non c\'era. Peccato.'] },
  { nome: 'Giulia, la fornaia', frame: 1, saluti: ['Io il pane lo faccio, ma la pizza la compro da te.', 'Ho finito il turno al forno. Ho una fame!'] },
  { nome: 'Marco, il postino', frame: 8, saluti: ['Ho una lettera per te. No, scherzo. Ho fame e basta.', 'Faccio il giro del paese, ma passo sempre di qui.'] },
  { nome: 'La maestra Elena', frame: 3, saluti: ['I bambini oggi erano scatenati. Mi serve una coccola da mangiare.', 'Ho detto ai bambini che qui c\'è un gatto col pizzetto. Ci credono poco.'] },
  { nome: 'Nonno Bepi', frame: 9, saluti: ['Io lo prendo sempre uguale. Cioè, dipende.', 'Il gatto col pizzetto è tuo? Ha uno sguardo da capo.'] },
  { nome: 'Sara, la fiorista', frame: 5, saluti: ['Sa di basilico appena colto! Si sente da lontano.', 'Ti ho lasciato un fiore sul bancone. Tanto per.'] },
  { nome: 'Tommaso, il ciclista', frame: 10, saluti: ['Trenta chilometri in bici. Adesso mi merito tutto.', 'Ho legato la bici al cancello. Il gatto la sta annusando.'] },
  { nome: 'Lucia, la bibliotecaria', frame: 7, saluti: ['Ho finito un libro bellissimo. Festeggio.', 'Parlo piano anche qui, è l\'abitudine. Una cosa buona, per favore.'] },
];
// (revisione 11/11) più paesani: i limiti di clienti per apertura restano uguali, cambia solo quanto spesso torna ciascuno
PAESANI.push(
  { nome: 'Anna, la ceramista', frame: 2, saluti: ['Ho le mani piene d\'argilla. Lavate, giuro.', 'Ti faccio una ciotola nuova per Mordicchio. Col suo nome.'] },
  { nome: 'Nonna Gemma', frame: 4, saluti: ['Sono uscita a fare due passi e mi sono persa nel profumo.', 'Mia nipote dice che qui si mangia benissimo. Verifico.'] },
  { nome: 'Giorgia, l\'infermiera', frame: 6, saluti: ['Smonto ora dal turno di notte. Mi serve qualcosa di buono.', 'Mangio in piedi, come in corsia. Ma qui è più bello.'] },
  { nome: 'Fatima, la farmacista', frame: 11, saluti: ['Pausa pranzo! Finalmente.', 'Ti ho portato dei cerotti con i gattini. Per ogni evenienza.'] },
  { nome: 'Signora Ada, la sarta', frame: 12, saluti: ['Ho appena orlato tre pantaloni. Ho una fame da quattro.', 'Che bel grembiule. Se si scuce, passa da me.'] },
  { nome: 'Davide, il meccanico', frame: 13, saluti: ['Il van come va? Se fa rumori strani, chiamami.', 'Mi lavo le mani e arrivo. Fatto.'] },
  { nome: 'Luca, lo studente', frame: 14, saluti: ['Domani ho l\'esame. Oggi mangio e basta.', 'Ho un budget da studente. Ma per te faccio un\'eccezione.'] },
  { nome: 'Il signor Aldo, pescatore', frame: 15, saluti: ['Io pesco e poi li ributto in acqua. Mi piace solo stare al fiume.', 'Al lago c\'era una nebbia... ora mi serve qualcosa di caldo.'] },
  { nome: 'Chiara, la veterinaria', frame: 16, saluti: ['Come stanno i tuoi animali? Si vede che stanno bene.', 'Ho visto la mucca dal cancello. Che bella salute.'] },
  { nome: 'Irene, l\'insegnante di yoga', frame: 17, saluti: ['Respiro profondo... che profumo!', 'Dopo la lezione mi merito una cosa buona. Con calma.'] },
  { nome: 'Samuel, il falegname', frame: 18, saluti: ['Se ti serve una mensola, sai dove trovarmi.', 'Ho fatto una panca per la piazza. Adesso mi siedo e mangio.'] },
  { nome: 'Ettore, il guardiaparco', frame: 19, saluti: ['Stamattina ho visto un camoscio. Te lo dico perché so che ti piace.', 'Giro del bosco finito. Tutto in ordine, anche il ruscello.'] },
  { nome: 'Martina, la guida alpina', frame: 20, saluti: ['Sono scesa dal rifugio in quota apposta. Quasi.', 'Domani porto un gruppo in cima. Oggi carico le energie.'] },
);
PAESANI.forEach(p => { p.k = 'paesano' + p.frame; PERSONAGGI[p.k] = { nome: p.nome, tex: 'paesani', frame: p.frame }; });
const vanVecchio = Rifugio.prototype.van;
(function () {
  Eco.clientiVan = S => S.van < 0 ? 0 : Math.min(4, 2 + S.van);
  Eco.turnoVanOra = S => TURNI_VAN.find(t => S.ora >= t.da && S.ora <= t.a) || null;
  Eco.turniFatti = S => { if (!S.vanTurni || S.vanTurni.g !== S.giorno) S.vanTurni = { g: S.giorno, fatti: [] }; return S.vanTurni.fatti; };
  Eco.vanAperto = S => { const t = Eco.turnoVanOra(S); return S.van >= 0 && !!t && !Eco.turniFatti(S).includes(t.id); };
  Eco.prossimoTurno = S => TURNI_VAN.find(t => S.ora < t.a && !Eco.turniFatti(S).includes(t.id)) || null;
  Eco.apriVan = S => { if (!Eco.vanAperto(S)) return false; Eco.turniFatti(S).push(Eco.turnoVanOra(S).id); S.vanOggi = TURNI_VAN.every(t => Eco.turniFatti(S).includes(t.id)); return true; };
  Eco.chiudiVan = S => { Eco.passa(S, 60); };
  const notte = Eco.notte; Eco.notte = function (S) { const r = notte.apply(this, arguments); S.vanTurni = { g: S.giorno, fatti: [] }; S.vanOggi = false; return r; };
  // clienti diversi: niente doppioni nella stessa apertura, e chi è venuto l'ultima volta salta un giro
  // richieste: niente doppioni ravvicinati (le ultime 4 aspettano), se ce ne sono altre possibili (revisione 11/11)
  Eco.nuovaRichiesta = function (S, rnd) {
    const note = Object.keys(S.ricette).map(k => RICETTE[k]);
    const valide = RICHIESTE.filter(q => note.some(q.ok)); if (!valide.length) return RICHIESTE[0];
    const ultime = S.vanRichieste || [], fresche = valide.filter(q => !ultime.includes(q.dice)), da = fresche.length ? fresche : valide;
    const q = da[Math.floor(rnd() * da.length)];
    S.vanRichieste = ultime.concat(q.dice).slice(-4); return q;
  };
  Eco.scegliClienti = (S, n) => {
    const ultimi = S.vanUltimi || [], pool = PAESANI.filter(p => !ultimi.includes(p.nome)), scelti = [];
    const src = (pool.length >= n ? pool : PAESANI).slice();
    while (scelti.length < n && src.length) scelti.push(src.splice(Math.floor(Math.random() * src.length), 1)[0]);
    S.vanUltimi = scelti.map(p => p.nome); return scelti;
  };
})();

Object.assign(Rifugio.prototype, {
  van() {
    const S = Save.data, hud = this.hud;
    if (S.van < 0) return vanVecchio.call(this);
    const t = Eco.turnoVanOra(S), fatti = Eco.turniFatti(S);
    if (!t) { const p = Eco.prossimoTurno(S); return hud.toast(p ? 'Il van apre ' + p.nome + ', dalle ' + Math.floor(p.da / 60) + '.' : 'Per oggi il van ha chiuso. Domani a pranzo si riapre!'); }
    if (fatti.includes(t.id)) { const p = Eco.prossimoTurno(S); return hud.toast(p ? 'Fatto il turno ' + t.nome + '. Si riapre ' + p.nome + ', dalle ' + Math.floor(p.da / 60) + '.' : 'Per oggi il van ha chiuso. Domani a pranzo si riapre!'); }
    if (!Object.keys(S.ricette).some(r => Eco.puoiCucinare(S, r) || RICETTE[r].ing.every(k => DISPENSA[k] || (S.ing[k] || 0) >= Eco.bisogno(r)[k])))
      return hud.toast('Non hai abbastanza ingredienti. Raccogli qualcosa dall\'orto!');
    const n = Eco.clientiVan(S);
    if (!this.vanConfermato && typeof schedaCartello === 'function') return schedaCartello(this, { titolo: 'Il van della pizza', testo: 'Apri il van ' + t.nome + '? Arrivano ' + n + ' clienti dal paese. Il van apre a pranzo e a cena.', vai: 'Apri il van', resta: 'Non ora', azione: () => { this.vanConfermato = true; this.van(); this.vanConfermato = false; } });
    if (!Eco.apriVan(S)) return; Save.write();
    Musica.suona('paese');
    this.turno = { n: 0, tot: n, incasso: 0, clienti: Eco.scegliClienti(S, n), nomeTurno: t.nome };
    Save.write(); this.cliente();
  },
  cliente() {
    const S = Save.data, hud = this.hud, tr = this.turno;
    if (tr.n >= tr.tot) {
      Eco.chiudiVan(S); Save.write(); this.aggiornaOra(); Musica.suona('casa');
      const p = Eco.prossimoTurno(S);
      hud.say([{ who: 'mordicchio', text: 'Van chiuso! ' + (tr.nomeTurno === 'a pranzo' ? 'A pranzo' : 'Stasera') + ' abbiamo incassato ' + tr.incasso + ' semi. ' + pick(['Il profumo di pizza mi è rimasto nel pelo.', 'Io ho fatto la guardia al bancone. Lavoro importante.', 'Nonna Rina mi ha chiamato «bel micione». Ha ragione.', 'Qualcuno mi ha fatto i complimenti per il pizzetto.']) + (p ? ' Si riapre ' + p.nome + '.' : '') }]);
      this.semiTxt && this.semiTxt.setText(S.semi + ' semi'); return;
    }
    const chi = tr.clienti[tr.n]; tr.n++;
    const q = Eco.nuovaRichiesta(S, Math.random);
    let gestito = false;   // chiudere la scheda col tasto «Chiudi» vale come «salta»: prima il turno restava a metà
    const salta = () => { if (gestito) return; gestito = true; hud.say([{ who: chi.k, text: pick(['Va bene, sarà per la prossima volta!', 'Nessun problema, ripasso un altro giorno.']) }], () => this.cliente()); };
    const m = hud.modal('Cliente ' + tr.n + ' di ' + tr.tot, Math.min(UH - 30, 560), () => this.time.delayedCall(0, salta));
    m.c.add(hud.add.image(48, m.y + 74, 'paesani', chi.frame).setScale(3));
    m.c.add(txt(hud, 80, m.y + 50, chi.nome + ':\n«' + (Math.random() < 0.5 ? pick(chi.saluti) + ' ' : '') + q.dice + '»', 13, COL.testo, { wordWrap: { width: UW - 110 }, lineSpacing: 2 }));
    const note = Object.keys(S.ricette).sort((a, b) => (q.ok(RICETTE[b]) - q.ok(RICETTE[a])) || (prezzoPiatto(b) - prezzoPiatto(a)));
    const sa = hud.scrollArea(m.c, 24, m.y + 112, UW - 48, m.h - 168);
    let y = 0;
    note.forEach(id => {
      const R = RICETTE[id], b = Eco.bisogno(id), manca = Object.keys(b).filter(k => (S.ing[k] || 0) < b[k]);
      const compra = manca.every(k => DISPENSA[k]), costo = manca.reduce((s, k) => s + (DISPENSA[k] ? DISPENSA[k].prezzo * (b[k] - (S.ing[k] || 0)) : 0), 0);
      const fattibile = !manca.length || (compra && S.semi >= costo);
      const info = !manca.length ? 'Pronto da cucinare' : compra ? 'Compri ' + manca.map(nomeIng).join(', ') + ': ' + costo + ' semi' : 'Manca: ' + manca.map(nomeIng).join(', ');
      const tNome = txt(hud, 40, 6, (q.ok(R) ? '★ ' : '') + R.nome, 11, fattibile ? COL.titolo : '#9d866f', { wordWrap: { width: UW - 150 } });
      const tInfo = txt(hud, 40, 10 + tNome.height, info, 10, '#7d6a5c', { wordWrap: { width: UW - 150 } });
      const cell = hud.add.container(0, y), h = Math.max(46, 18 + tNome.height + tInfo.height);
      const box = hud.add.rectangle(0, 0, UW - 48, h - 4, fattibile ? 0xfbf4dc : 0xece3c8).setOrigin(0).setStrokeStyle(2, q.ok(R) && fattibile ? 0x8db15d : 0xd79e61).setInteractive();
      cell.add([box, fitIcon(iconaCibo(hud, 20, h / 2 - 2, id), 24).setAlpha(fattibile ? 1 : 0.45), tNome, tInfo,
        txt(hud, UW - 72, h / 2 - 2, prezzoPiatto(id) + '', 12, COL.titolo).setOrigin(1, 0.5), hud.add.image(UW - 62, h / 2 - 2, 'seme').setScale(0.7)]);
      box.on('pointerup', () => {
        if (hud.scrollDragged) return;
        if (!fattibile) { Sfx.no(); hud.toast(compra ? 'Ti servono ' + costo + ' semi' : 'Mancano ingredienti dell\'orto'); return; }
        const prima = { semi: S.semi, ing: Object.assign({}, S.ing) };
        manca.forEach(k => Eco.compraIngrediente(S, k, b[k] - (S.ing[k] || 0)));
        const r = Eco.servi(S, q, id);
        if (!r) { S.semi = prima.semi; S.ing = prima.ing; Sfx.no(); hud.toast('Questo non si riesce a cucinare: scegli un altro piatto'); return; }   // prima qui il cliente restava senza piatto
        gestito = true; Save.write(); m.close();
        tr.incasso += r.paga; Sfx[r.giusto ? 'cuore' : 'seme']();
        const frase = r.giusto ? pick(['Proprio quello che volevo! Tieni anche la mancia.', 'Che profumo! Torno presto.', 'Buonissimo. Dillo a Mordicchio che è il van migliore del mondo.', 'Questo lo racconto a tutto il paese.'])
          : pick(['Mmh, non era proprio quello che avevo chiesto... ma lo mangio lo stesso.', 'Buono, eh. Però io volevo un\'altra cosa.']);
        hud.say([{ who: chi.k, text: frase + ' (+' + r.paga + ' semi)' }], () => this.cliente());
      });
      sa.inner.add(cell); y += h;
    });
    sa.contentH = y;
    hud.button(28, m.y + m.h - 46, UW - 56, 34, 'Non ho niente di adatto: salta', () => { m.close(); }, { parent: m.c, size: 12 });
  },
  riposa() {
    const S = Save.data; this.cameras.main.fadeOut(300, 40, 30, 50);
    this.time.delayedCall(320, () => { const p = Eco.prossimoTurno(S); if (p) S.ora = Math.max(S.ora, p.da); Save.write(); this.cameras.main.fadeIn(300); this.aggiornaOra(); this.hud.toast(p ? 'È ora di aprire il van ' + p.nome + '!' : 'Per oggi il van ha chiuso.'); });
  },
});

// ---------------- il forno a legna si vede: comignolo sul tetto del van, che fuma (revisione 10/11, notte) ----------------
// Con il forno (S.van >= 2) sul tetto compare un comignolo. Quando il van è aperto fuma di più; il resto della giornata un filo sottile.
// Di notte il forno è spento.
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.comignolo = null; const r = crea.apply(this, arguments);
    const S = Save.data;
    if (this.stanza !== 'fuori' || !this.vanImg || !(S.van >= 2)) return r;
    const x = VAN_XY.x + 12, y = VAN_XY.y - 15 + 5, d = this.vanImg.depth;
    const g = this.add.graphics().setDepth(d + 0.1);
    g.fillStyle(0x3e3a44, 1).fillRect(x - 2, y - 7, 5, 8);   // contorno
    g.fillStyle(0x6e6a72, 1).fillRect(x - 1, y - 6, 3, 7);
    g.fillStyle(0x3e3a44, 1).fillRect(x - 3, y - 8, 7, 2);   // cappello
    this.comignolo = { x: x + 0.5, y: y - 9 };
    const sbuffo = () => {
      if (!this.sys.isActive()) return;
      const S = Save.data, ora = S.ora, aperto = !!(Eco.turnoVanOra && Eco.turnoVanOra(S)), giorno = ora >= 7 * 60 && ora < 22 * 60;
      if (giorno) {
        const c = this.add.circle(this.comignolo.x + (Math.random() - 0.5), this.comignolo.y, 1.7, 0xc9c3cf, aperto ? 0.9 : 0.55).setDepth(d + 0.2);
        this.tweens.add({ targets: c, y: c.y - 14 - Math.random() * 6, x: c.x + 3 + Math.random() * 4, scale: 2.4, alpha: 0, duration: 2200 + Math.random() * 600, ease: 'Sine.out', onComplete: () => c.destroy() });
      }
      this.time.delayedCall(aperto ? 320 : 1300, sbuffo);
    };
    this.time.delayedCall(300, sbuffo);
    return r;
  };
})();
