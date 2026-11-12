// =====================================================================
//  Vita di tutti i giorni: orologio, giardino e orto, van della pizza,
//  ricettario, Bottega con dispensa e lavori. Usa la logica di economia.js.
// =====================================================================
function iconaCibo(scene, x, y, k) {
  if (['carota', 'insalata', 'zucca'].includes(k)) return scene.add.image(x, y, k);
  return scene.add.image(x, y, 'cibo', k);
}
function nomeIng(k) { return (COLTURE[k] || DISPENSA[k] || (typeof FRUTTI !== 'undefined' && FRUTTI[k]) || {}).nome || k; }
const FRASI_SPORCO = [
  'Ci sono peli ovunque... non riesco a rilassarmi.',
  'Prima puliamo un po\'? Mi si attaccano i peli al naso.',
  'Sono un animale elegante. Non posso vivere così.',
  'Starnutisco da stamattina. Credo sia colpa dei batuffoli.',
];
const FRASI_NOTTE = [
  'Mordicchio si accoccola tra le tue gambe, come ogni notte.',
  'Mordicchio fa il giro del letto tre volte, poi si sistema tra le tue gambe.',
  'Ronf. Mordicchio dorme già, tra le tue gambe.',
  'Mordicchio ti guarda, sbadiglia e si acciambella tra le tue gambe.',
];
const FRASI_STANCO = [
  'Per oggi basta sentiero, sono stanco morto. Domani ripartiamo, promesso.',
  'Le mie zampe dicono basta. Facciamo qualcosa a casa?',
  'Due tappe in un giorno! Adesso mi merito un pisolino.',
];
const TIPO_NOME = { pizza: 'Pizza', primo: 'Primo', secondo: 'Secondo', piatto: 'Piatto', dolce: 'Dolce', sfizio: 'Sfizio' };

// ---------------- l'esterno del rifugio: tutto in una schermata ----------------
const CASA_R = { x: 6, y: 8, w: 76, h: 50 }, STALLA_R = { x: 98, y: 10, w: 72, h: 48 };
const POSTI_FUORI = {
  casa: { x: CASA_R.x + 38, y: CASA_R.y + CASA_R.h + 12 },
  stalla: { x: STALLA_R.x + 36, y: STALLA_R.y + STALLA_R.h + 12 },
  sentiero: { x: STANZA.w / 2, y: STANZA.h - 30 },
};
const ORTO_XY = i => ({ x: 22 + (i % 3) * 22, y: 96 + Math.floor(i / 3) * 22 });
const VAN_XY = { x: 126, y: 128 };   // (11/11) un po' più al centro, sempre a destra del sentiero
const ORA_LETTO = 19 * 60;   // prima delle 19 non si va a dormire
const PORTE = { casa: { x: CASA_R.x + 38, y: CASA_R.y + CASA_R.h + 2 }, stalla: { x: STALLA_R.x + 36, y: STALLA_R.y + STALLA_R.h + 2 } };
const RES_MONDO = () => Math.ceil(ZR * DPR / 1.5);

Object.assign(Rifugio.prototype, {
  creaFuori() {
    const S = Save.data, g = this.add.graphics().setDepth(-10);
    g.fillStyle(0xb5d27a).fillRect(0, 0, STANZA.w, STANZA.h);
    g.fillStyle(0xa4c263); for (let i = 0; i < 80; i++) { const x = (i * 37) % STANZA.w, y = (i * 53) % STANZA.h; g.fillRect(x, y, 2, 1); g.fillRect(x + 1, y - 1, 1, 1); }
    // vialetti di terra
    g.fillStyle(0xe8cfa6);
    g.fillRect(PORTE.casa.x - 5, PORTE.casa.y, 10, 22);
    if (S.stallaAperta) { g.fillRect(PORTE.stalla.x - 5, PORTE.stalla.y, 10, 22); g.fillRect(PORTE.casa.x - 5, PORTE.casa.y + 18, PORTE.stalla.x - PORTE.casa.x + 10, 8); }
    else g.fillRect(PORTE.casa.x - 5, PORTE.casa.y + 18, STANZA.w / 2 + 6 - PORTE.casa.x + 5, 8);   // prima della stalla il vialetto va solo dalla casa al sentiero
    g.fillRect(STANZA.w / 2 - 6, PORTE.casa.y + 18, 12, STANZA.h - PORTE.casa.y - 18);
    // casa
    const c = CASA_R; this.add.tileSprite(c.x, c.y + 14, c.w, c.h - 14, 'muro').setOrigin(0).setDepth(c.y + c.h - 1);
    const t = this.add.graphics().setDepth(c.y + c.h);
    t.fillStyle(0xbd757e).fillTriangle(c.x - 4, c.y + 16, c.x + c.w / 2, c.y - 6, c.x + c.w + 4, c.y + 16);
    t.fillStyle(0xa35b70).fillRect(c.x - 4, c.y + 14, c.w + 8, 3); t.lineStyle(1, 0x504086).strokeTriangle(c.x - 4, c.y + 16, c.x + c.w / 2, c.y - 6, c.x + c.w + 4, c.y + 16);
    t.fillStyle(0x8cbfc2).fillRect(c.x + 10, c.y + 26, 12, 10).fillRect(c.x + c.w - 22, c.y + 26, 12, 10);
    t.lineStyle(1, 0x504086).strokeRect(c.x + 10, c.y + 26, 12, 10).strokeRect(c.x + c.w - 22, c.y + 26, 12, 10);
    t.fillStyle(0x90625d).fillRect(PORTE.casa.x - 6, c.y + c.h - 18, 12, 18); t.fillStyle(0xf2cf8c).fillRect(PORTE.casa.x + 3, c.y + c.h - 9, 2, 2);
    // Tubino vive in casa: niente secondo Tubino sul tetto
    // stalla (o il posto dove nascerà)
    const st = STALLA_R;
    if (S.stallaAperta) {
      this.add.tileSprite(st.x, st.y + 12, st.w, st.h - 12, 'travi').setOrigin(0).setDepth(st.y + st.h - 1);
      const r = this.add.graphics().setDepth(st.y + st.h);
      r.fillStyle(0x9d6a4c).fillTriangle(st.x - 4, st.y + 14, st.x + st.w / 2, st.y - 6, st.x + st.w + 4, st.y + 14);
      r.lineStyle(1, 0x504086).strokeTriangle(st.x - 4, st.y + 14, st.x + st.w / 2, st.y - 6, st.x + st.w + 4, st.y + 14);
      this.add.image(PORTE.stalla.x, st.y + st.h, 'portone_aperto').setOrigin(0.5, 1).setDepth(st.y + st.h + 1);   // la porta della stalla è sempre aperta (11/11)
    }   // prima della costruzione: terreno libero, nessun cartello né recinto (revisione 10/11)
    this.add.image(STANZA.w - 10, 92, 'natura', 'albero').setOrigin(0.5, 1).setDepth(92);
    this.add.image(10, 84, 'natura', 'cespuglio').setOrigin(0.5, 1).setDepth(84);
    this.add.image(STANZA.w - 16, STANZA.h - 20, 'natura', 'albero').setOrigin(0.5, 1).setDepth(STANZA.h - 20);
    this.add.image(70, STANZA.h - 64, 'natura', 'fiore_rosa2').setDepth(-9); this.add.image(30, STANZA.h - 24, 'natura', 'fiore_giallo2').setDepth(-9);
    // cartello del sentiero
    this.add.image(STANZA.w / 2 + 16, STANZA.h - 4, 'cartello').setOrigin(0.5, 1).setDepth(STANZA.h);
    // orto
    this.parcelle = [];
    for (let i = 0; i < 9; i++) {
      const p = ORTO_XY(i), cc = this.add.container(p.x, p.y).setDepth(p.y - 10);
      this.parcelle.push(cc); this.contenutoParcella(i);
    }
    this.vanImg = this.add.image(VAN_XY.x, VAN_XY.y, 'van', S.van >= 0 ? 0 : 1).setDepth(VAN_XY.y + 14);
    this.fuoriTrigger = 'inizio';
  },
  bloccatoFuori(x, y) {
    if (x < 6 || x > STANZA.w - 6 || y < 12 || y > STANZA.h - 2) return true;
    const dentro = r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h + 2;
    if (dentro(CASA_R) || (Save.data.stallaAperta && dentro(STALLA_R))) return true;
    if (Math.abs(x - VAN_XY.x) < 20 && y > VAN_XY.y - 4 && y < VAN_XY.y + 14) return true;
    return false;
  },
  // avvicinandoti a una porta, al van o al sentiero ci entri. Per rientrare bisogna prima allontanarsi.
  controllaFuori() {
    const p = this.player, S = Save.data, vicino = (q, r) => Math.hypot(p.x - q.x, p.y - q.y) < r;
    let qui = null;
    if (vicino(PORTE.casa, 9)) qui = 'casa';
    else if (vicino(PORTE.stalla, 9)) qui = 'stalla';
    else if (p.y > STANZA.h - 8 && Math.abs(p.x - STANZA.w / 2) < 14) qui = 'sentiero';
    else if (Math.abs(p.x - VAN_XY.x) < 24 && p.y > VAN_XY.y - 12 && p.y < VAN_XY.y + 22) qui = 'van';
    else if (p.x < 84 && p.y > 84 && p.y < 160) qui = 'orto';
    if (this.fuoriTrigger === 'inizio') { this.fuoriTrigger = qui; return; }
    if (qui === this.fuoriTrigger) return;
    this.fuoriTrigger = qui;
    if (!qui || this.uscendo || this.hud.dialog || (this.hud.ctrl && this.hud.ctrl.frozen)) return;
    if (qui === 'casa') this.vai('casa');
    else if (qui === 'stalla') { if (S.stallaAperta) this.vai('stalla'); }
    else if (qui === 'sentiero') this.chiediCartello({ titolo: 'Il sentiero', testo: 'Porta ai prati, all\'alpeggio e al paese.', vai: 'Vai al sentiero', azione: () => { this.uscendo = true; this.cameras.main.fadeOut(250); this.time.delayedCall(260, () => this.scene.start('Mappa')); } });
    else if (qui === 'van') this.van();
    else if (qui === 'orto') this.hud.toast('L\'orto: tocca una parcella per seminare o raccogliere');
  },
  vai(stanza) { if (this.uscendo) return; this.uscendo = true; this.cameras.main.fadeOut(220); const dorme = this.gattoDormiente(); this.time.delayedCall(230, () => this.scene.start('Rifugio', { stanza, gattoDorme: dorme })); },
  esci() { if (this.uscendo) return; this.uscendo = true; this.cameras.main.fadeOut(220); const da = this.stanza; const dorme = this.gattoDormiente(); this.time.delayedCall(230, () => this.scene.start('Rifugio', { stanza: 'fuori', pos: da, gattoDorme: dorme })); },
});

Object.assign(Rifugio.prototype, {
  tapGiardino(x, y) {
    const S = Save.data;
    if (Math.abs(x - VAN_XY.x) < 22 && Math.abs(y - VAN_XY.y) < 15) return this.van(), true;
    for (let i = 0; i < 9; i++) {
      const p = ORTO_XY(i); if (Math.abs(x - p.x) > 10 || Math.abs(y - p.y) > 10) continue;
      if (i < S.orto.length) this.parcella(i);
      else if (i === S.orto.length) this.lavori();
      return true;
    }
    return false;
  },
  parcella(i) {
    const S = Save.data, hud = this.hud, o = S.orto[i];
    if (o && Eco.pronta(S, i)) {
      const n = Eco.raccogli(S, i); Save.write(); Sfx.seme();
      const p = ORTO_XY(i), vola = iconaCibo(this, p.x, p.y - 3, o.c).setDepth(30000);   // il raccolto vola verso Anastasia
      this.tweens.add({ targets: vola, x: this.player.x, y: this.player.y - 14, scale: 0.6, alpha: 0.2, duration: 420, ease: 'Quad.in', onComplete: () => vola.destroy() });
      this.contenutoParcella(i);
      hud.toast('Raccolto: ' + n + ' × ' + COLTURE[o.c].nome); return;
    }
    if (o) { const C = COLTURE[o.c], r = C.notti - o.notti; hud.toast(C.nome + ': ' + (r === 1 ? 'pronto domattina' : 'ancora ' + r + ' notti')); return; }
    const lista = Eco.coltureDisponibili(S);
    const m = hud.modal('Cosa pianti?', Math.min(UH - 40, 120 + Math.ceil(lista.length / 2) * 62));
    m.c.add(txt(hud, 28, m.y + 46, 'Hai ' + S.semi + ' semi. Cresce di notte, mentre dormi.', 11, COL.testo));
    const sa = hud.scrollArea(m.c, 24, m.y + 64, UW - 48, m.h - 76), cw = (UW - 56) / 2;
    lista.forEach((k, j) => {
      const C = COLTURE[k], x = (j % 2) * (cw + 8), y = Math.floor(j / 2) * 62, cell = hud.add.container(x, y), ok = S.semi >= C.costo;
      const box = hud.add.rectangle(0, 0, cw, 56, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, ok ? 0xd79e61 : 0xc4bc93).setInteractive();
      cell.add([box, fitIcon(iconaCibo(hud, 22, 28, k), 28).setAlpha(ok ? 1 : 0.5), txt(hud, 42, 10, C.nome, 12, COL.titolo),
        txt(hud, 42, 28, C.costo + (C.costo === 1 ? ' seme' : ' semi') + ' · ' + C.notti + ' notti\nne raccogli ' + C.resa, 10, COL.testo, { lineSpacing: 1 })]);
      box.on('pointerup', () => {
        if (hud.scrollDragged) return;
        if (!Eco.pianta(S, i, k)) { Sfx.no(); hud.toast('Ti servono ' + C.costo + ' semi'); return; }
        Save.write(); Sfx.pop(); m.close(); this.contenutoParcella(i); hud.toast('Piantato: ' + C.nome);
      });
      sa.inner.add(cell); sa.contentH = y + 62;
    });
  },
  // ridisegna una parcella sul posto: raccogliere o piantare non ricostruisce più tutto il giardino
  // (prima gli animali «saltavano» in posti nuovi a ogni tocco)
  contenutoParcella(i) {
    const S = Save.data, cc = this.parcelle[i]; if (!cc) return;
    cc.list.slice().forEach(x => { this.tweens.killTweensOf(x); x.destroy(); }); cc.removeAll();
    if (i < S.orto.length) {
      cc.add(this.add.image(0, 0, 'aiuola'));
      const o = S.orto[i];
      if (o) {
        const C = COLTURE[o.c];
        if (Eco.pronta(S, i)) { const ic = iconaCibo(this, 0, -3, o.c); cc.add(ic); this.tweens.add({ targets: ic, y: -5, yoyo: true, repeat: -1, duration: 700 }); }
        else cc.add(this.add.image(0, -3, 'germogli', Math.min(2, Math.floor(o.notti / C.notti * 3))));
      }
    } else if (i === S.orto.length && Eco.prezzoParcella(S) != null) {
      const gg = this.add.graphics(); gg.lineStyle(1, 0x8a6a50, 0.8).strokeRect(-8, -7, 16, 15); cc.add(gg);
      cc.add(txt(this, 0, 0, '+', 9, '#8a6a50').setOrigin(0.5).setResolution(1));
    }
  },
  rifai() { const pos = { x: this.player.x, y: this.player.y }; this.cameras.main.fadeOut(220, 251, 244, 220); this.time.delayedCall(230, () => this.scene.restart({ stanza: this.stanza, pos })); },   // solo per i lavori grossi (stalla, van): una breve dissolvenza, non un salto
  // ---------------- orologio e giornata ----------------
  barraOra(hud) {
    const S = Save.data;
    hud.layer.add(pannello(hud, 166, 8, 84, 30));
    this.oraTxt = txt(hud, 208, 23, '', 12, COL.titolo).setOrigin(0.5); hud.layer.add(this.oraTxt);
    const z = hud.add.zone(166, 8, 84, 30).setOrigin(0).setInteractive(); hud.layer.add(z);
    z.on('pointerup', () => { if (!hud.dialog) this.giornata(); });
    this.aggiornaOra();
  },
  aggiornaOra() { const S = Save.data; if (this.oraTxt && this.oraTxt.scene && this.oraTxt.frame) this.oraTxt.setText('G' + S.giorno + ' · ' + Eco.orario(S) + ' ☾'); },
  tickOra(dt) {
    const S = Save.data, hud = this.hud;
    if (hud.dialog || (hud.ctrl && hud.ctrl.frozen) || this.modo !== 'gioca' || this.dormendo || this.uscendo) return;
    const fine = Eco.passa(S, dt * 60 / TEMPO.secPerOra);
    this.accOra = (this.accOra || 0) + dt; if (this.accOra > 1) { this.accOra = 0; this.aggiornaOra(); Save.write(); }
    if (fine) this.dormi(true);
  },
  giornata() {
    const S = Save.data, hud = this.hud;

    const righe = [
      S.van < 0 ? 'Il van è ancora da riparare.' : S.vanOggi ? 'Il van per oggi ha chiuso.' : 'Il van apre a pranzo (12–14) e a cena (19–21).',
      'Orto: ' + S.orto.filter(Boolean).length + ' parcelle piantate su ' + S.orto.length,
      'Tempo: ' + METEO_NOMI[meteoDelGiorno().tipo] + (meteoDelGiorno().tipo === 'pioggia' ? ' (tra le ' + Math.floor(meteoDelGiorno().da / 60) + ' e le ' + Math.floor(meteoDelGiorno().a / 60) + ')' : ''),
    ];
    const ob = Eco.obiettivo(S); if (ob) righe.push('Prossimo obiettivo: ' + ob.testo + ' (' + ob.prezzo + ' semi' + (S.semi < ob.prezzo ? ', ne mancano ' + (ob.prezzo - S.semi) : ': li hai!') + ')');
    const tRighe = txt(hud, 28, 0, righe.join('\n'), 12, COL.testo, { lineSpacing: 6, wordWrap: { width: UW - 56 } });
    const m = hud.modal('Giorno ' + S.giorno + ' · ' + Eco.orario(S), Math.min(UH - 30, 60 + tRighe.height + 16 + 88 + 40));
    tRighe.setY(m.y + 50); m.c.add(tRighe);
    let y = m.y + 50 + tRighe.height + 16;
    const nT = Object.keys(S.tesori || {}).length;
    hud.button(28, y, UW - 56, 36, 'Album · tesori ' + nT + '/' + Object.keys(TESORI).length + (typeof RICORDI !== 'undefined' ? ' · ricordi ' + ricordiTrovati().length + '/' + Object.keys(RICORDI).length : ''), () => { m.close(); this.album(); }, { parent: m.c, size: 13 }); y += 44;
    // a letto si va solo dalle 19: così i momenti della giornata (la fuga di Mordicchio, il tramonto, il van di sera) non si saltano
    const presto = S.ora < ORA_LETTO;
    hud.button(28, y, UW - 56, 36, presto ? 'A letto dalle ' + Math.floor(ORA_LETTO / 60) + ':00' : 'Vai a dormire (inizia un nuovo giorno)', () => {
      if (presto) { Sfx.no && Sfx.no(); m.close(); this.hud.bubble(this.cat && this.cat.visible && !this.cat.assente ? this.cat : this.player, pick(['È ancora presto per dormire. La giornata non è finita!', 'A letto adesso? Ma c\'è ancora il sole!', 'Dormire? Prima facciamo ancora qualcosa. Il letto ci aspetta stasera.']), 3200); return; }
      m.close(); this.dormi(false);
    }, { parent: m.c, size: 13, color: presto ? '#9d866f' : undefined });
    m.c.add(txt(hud, UW / 2, y + 52, 'Se fai tardi, alle 23 ci pensa Mordicchio a mandarti a letto.', 11, '#9d866f').setOrigin(0.5));
  },
  riposa() {
    const S = Save.data; this.cameras.main.fadeOut(300, 40, 30, 50);
    this.time.delayedCall(320, () => { S.ora = Math.max(S.ora, TEMPO.vanDa); Save.write(); this.cameras.main.fadeIn(300); this.aggiornaOra(); this.hud.toast('Si è fatta sera. Il van ti aspetta!'); });
  },
  dormi(forzato) {
    if (this.dormendo) return; this.dormendo = true;
    const S = Save.data, hud = this.hud; hud.clearAll(); Musica.suona('notte');
    const c = hud.add.container(0, 0).setDepth(80); hud.layer.add(c);
    const bg = hud.add.rectangle(0, 0, UW, UH, 0x2a2238, 1).setOrigin(0).setAlpha(0); c.add(bg);
    hud.tweens.add({ targets: bg, alpha: 1, duration: 600 });
    const frase = (forzato ? 'Sono le 23. Mordicchio ti spinge verso il letto col muso.\n\n' : '') + pick(FRASI_NOTTE);
    const t = txt(hud, UW / 2, UH * 0.4, frase, 15, COL.crema, { align: 'center', wordWrap: { width: UW - 60 }, lineSpacing: 4 }).setOrigin(0.5).setAlpha(0); c.add(t);
    const im = hud.add.image(UW / 2, t.y - t.height / 2 - 42, 'mordicchio', 4).setScale(4).setAlpha(0); c.add(im);   // sempre sopra la scritta, anche quando è lunga
    hud.tweens.add({ targets: [t, im], alpha: 1, delay: 500, duration: 600 });
    const rep = Eco.notte(S); Save.write();
    const testo = ['Giorno ' + S.giorno];
    if (rep.pronti.length) testo.push('Nell\'orto è pronto: ' + [...new Set(rep.pronti)].map(k => COLTURE[k].nome.toLowerCase()).join(', '));
    if (S.peli > PELI_TROPPI) testo.push('In casa ci sono tanti peli: meglio pulire!');
    const t2 = txt(hud, UW / 2, UH * 0.62, testo.join('\n'), 13, '#d6c9e8', { align: 'center', wordWrap: { width: UW - 60 }, lineSpacing: 4 }).setOrigin(0.5).setAlpha(0); c.add(t2);
    hud.tweens.add({ targets: t2, alpha: 1, delay: 1600, duration: 600 });
    hud.button(UW / 2 - 80, UH * 0.8, 160, 40, 'Buongiorno!', () => { this.dormendo = false; this.scene.start('Rifugio', { stanza: 'casa', pos: { x: STANZA.w / 2, y: STANZA.h - 40 } }); }, { parent: c, size: 15 });
  },
  // ---------------- van ----------------
  van() {
    const S = Save.data, hud = this.hud;
    if (S.van < 0) {
      const m = hud.modal('Il vecchio van', 230), t = Eco.tappeFatte(S);
      m.c.add(txt(hud, 28, m.y + 48, t < VAN.daTappa
        ? 'Un furgoncino abbandonato in fondo al cortile. Con un po\' di lavoro diventerebbe un van della pizza perfetto.\n\nSi potrà riparare dopo la tappa ' + VAN.daTappa + '.'
        : 'Un furgoncino abbandonato. Ripararlo costa ' + VAN.ripara + ' semi: poi potrai vendere pizze e piatti a pranzo e a cena.', 12, COL.testo, { wordWrap: { width: UW - 56 }, lineSpacing: 3 }));
      if (t >= VAN.daTappa) hud.button(28, m.y + 176, UW - 56, 36, 'Ripara il van (' + VAN.ripara + ' semi)', () => {
        if (!Eco.riparaVan(S)) { Sfx.no(); hud.toast('Ti servono ' + VAN.ripara + ' semi'); return; }
        Save.write(); Sfx.fanfara(); m.close(); this.rifai(); hud.toast('Il van è pronto! Apre a pranzo (12–14) e a cena (19–21).');
      }, { parent: m.c, size: 13 });
      return;
    }
    if (S.vanOggi) return hud.toast('Per oggi il van ha chiuso. Domani sera si riapre!');
    if (S.ora > TEMPO.vanA) return hud.toast('È troppo tardi per aprire il van. Domani!');
    if (!Object.keys(S.ricette).some(r => Eco.puoiCucinare(S, r) || RICETTE[r].ing.every(k => DISPENSA[k] || (S.ing[k] || 0) >= Eco.bisogno(r)[k])))
      return hud.toast('Non hai abbastanza ingredienti. Raccogli qualcosa dall\'orto!');
    // il van si apre una volta al giorno: meglio chiedere prima, così un tocco per sbaglio non lo «consuma»
    if (!this.vanConfermato && typeof schedaCartello === 'function') return schedaCartello(this, { titolo: 'Il van della pizza', testo: 'Apri il van adesso? Si apre una volta al giorno: stasera arrivano ' + Eco.clientiVan(S) + ' clienti.', vai: 'Apri il van', resta: 'Non ora', azione: () => { this.vanConfermato = true; this.van(); this.vanConfermato = false; } });
    if (!Eco.apriVan(S)) return; Save.write();
    Musica.suona('paese');
    this.turno = { n: 0, tot: Eco.clientiVan(S), incasso: 0, ospiti: Object.keys(S.animali).filter(k => ANIMALI[k] && !ANIMALI[k].soloGiochi) };  // i gatti mangiano solo le loro crocchette
    this.cliente();
  },
  cliente() {
    const S = Save.data, hud = this.hud, tr = this.turno;
    if (tr.n >= tr.tot) {
      this.turno = null;   // turno finito: prima restava «aperto» e bloccava farfalla e compratore fino al riavvio
      Eco.chiudiVan(S); Save.write(); this.aggiornaOra(); Musica.suona('casa');
      hud.say([{ who: 'mordicchio', text: 'Van chiuso! Stasera abbiamo incassato ' + tr.incasso + ' semi. ' + pick(['Il profumo di pizza mi è rimasto nel pelo.', 'Io ho fatto la guardia al bancone. Lavoro importante.', 'Domani ne facciamo ancora di più, vero?']) }]);
      this.semiTxt && this.semiTxt.setText(S.semi + ' semi'); return;
    }
    tr.n++;
    const rnd = Math.random, q = Eco.nuovaRichiesta(S, rnd), chi = pick(tr.ospiti), A = ANIMALI[chi];
    const m = hud.modal('Cliente ' + tr.n + ' di ' + tr.tot, Math.min(UH - 30, 560));
    m.c.add(hud.add.image(48, m.y + 70, A.tex, A.idle).setScale(scalaRitratto(A.tex, 3)));
    m.c.add(txt(hud, 80, m.y + 52, A.nome + ':\n«' + q.dice + '»', 13, COL.testo, { wordWrap: { width: UW - 110 }, lineSpacing: 2 }));
    const note = Object.keys(S.ricette).sort((a, b) => (q.ok(RICETTE[b]) - q.ok(RICETTE[a])) || (prezzoPiatto(b) - prezzoPiatto(a)));
    const sa = hud.scrollArea(m.c, 24, m.y + 104, UW - 48, m.h - 160);
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
        manca.forEach(k => Eco.compraIngrediente(S, k, b[k] - (S.ing[k] || 0)));
        const r = Eco.servi(S, q, id); Save.write(); m.close();
        tr.incasso += r.paga; Sfx[r.giusto ? 'cuore' : 'seme']();
        const frase = r.giusto ? pick(['Proprio quello che volevo! Tieni anche la mancia.', 'Che profumo! Torno domani, giuro.', 'Buonissimo. Dillo a Mordicchio che è il van migliore del mondo.'])
          : pick(['Mmh, non era proprio quello che avevo chiesto... ma lo mangio lo stesso.', 'Buono, eh. Però io volevo un\'altra cosa.']);
        hud.say([{ who: chi, text: frase + ' (+' + r.paga + ' semi)' }], () => this.cliente());
      });
      sa.inner.add(cell); y += h;
    });
    sa.contentH = y;
    hud.button(28, m.y + m.h - 46, UW - 56, 34, 'Non ho niente di adatto: salta', () => { m.close(); hud.say([{ who: chi, text: pick(['Va bene, sarà per la prossima volta!', 'Nessun problema, ripasso domani.']) }], () => this.cliente()); }, { parent: m.c, size: 12 });
  },
  // ---------------- ricettario ----------------
  ricettario(tab = 'ricette') {
    const S = Save.data, hud = this.hud;
    const m = hud.modal('Ricettario', Math.min(UH - 40, 580));
    // (11/11) tre schede: Prepara (la cucina per gli animali), Ricette, Dispensa
    [['prepara', 'Prepara'], ['ricette', 'Ricette'], ['dispensa', 'Dispensa']].forEach(([k, l], i) =>
      hud.button(UW / 2 - 133 + i * 90, m.y + 38, 84, 26, l, () => { m.c.destroy(); hud.scroller = null; this.ricettario(k); }, { parent: m.c, size: 12, color: tab === k ? COL.titolo : '#9d866f' }));
    const sa = hud.scrollArea(m.c, 24, m.y + 74, UW - 48, m.h - 86);
    let y = 0;
    if (tab === 'prepara' && this.listaPrepara) return this.listaPrepara(m, sa);
    if (tab === 'dispensa') {
      const ks = Object.keys(S.ing).filter(k => S.ing[k] > 0);
      if (!ks.length) sa.inner.add(txt(hud, 0, 10, 'La dispensa è vuota.\nRaccogli dall\'orto o compra alla bancarella.', 12, COL.testo, { lineSpacing: 4 }));
      ks.forEach((k, i) => {
        const x = (i % 2) * ((UW - 48) / 2), yy = Math.floor(i / 2) * 34;
        sa.inner.add([fitIcon(iconaCibo(hud, x + 14, yy + 14, k), 22), txt(hud, x + 30, yy + 14, nomeIng(k) + ' ×' + S.ing[k], 11, COL.testo).setOrigin(0, 0.5)]);
        y = yy + 34;
      });
      sa.contentH = y; return;
    }
    const note = Object.keys(RICETTE).filter(r => S.ricette[r]), altre = Object.keys(RICETTE).length - note.length;
    sa.inner.add(txt(hud, 0, 0, note.length + ' ricette nel libro' + (altre ? ', altre ' + altre + ' da scoprire lungo il sentiero' : '') + '.\n♥ = le specialità di Anastasia', 10, '#7d6a5c', { lineSpacing: 3 }));
    y = 34;
    note.forEach(id => {
      const R = RICETTE[id], cell = hud.add.container(0, y);
      const ingTxt = txt(hud, 40, 24, R.ing.map(k => nomeIng(k) + ((S.ing[k] || 0) >= Eco.bisogno(id)[k] ? ' ✓' : '')).filter((v, i, a) => a.indexOf(v) === i).join(' · '), 10, '#7d6a5c', { wordWrap: { width: UW - 120 }, lineSpacing: 1 });
      const h = Math.max(48, 32 + ingTxt.height);
      cell.add([hud.add.rectangle(0, 0, UW - 48, h - 4, Eco.puoiCucinare(S, id) ? 0xf0f6dc : 0xfbf4dc).setOrigin(0).setStrokeStyle(2, 0xd79e61),
        fitIcon(iconaCibo(hud, 20, h / 2 - 2, id), 24), txt(hud, 40, 6, (R.sua ? '♥ ' : '') + R.nome, 11, COL.titolo, { wordWrap: { width: UW - 140 } }), ingTxt,
        txt(hud, UW - 56, 6, TIPO_NOME[R.tipo] + '\n' + prezzoPiatto(id) + ' semi', 10, COL.testo, { align: 'right' }).setOrigin(1, 0)]);
      sa.inner.add(cell); y += h;
    });
    sa.contentH = y;
  },
  // ---------------- Bottega ----------------
  bottega(tab = 'regali', scroll) {
    const hud = this.hud, S = Save.data;
    const m = hud.modal('La bancarella', Math.min(UH - 40, 580), () => this.attachHud());
    m.c.add(hud.add.image(34, m.y + 50, 'seme')); m.c.add(txt(hud, 46, m.y + 50, S.semi + ' semi', 13, COL.titolo).setOrigin(0, 0.5));
    // (11/11) i lavori stanno solo nella bacheca; alla bancarella si comprano «Ingredienti» (in cucina si chiamano «Dispensa»)
    if (tab === 'lavori') tab = 'regali';
    const tabs = [['regali', 'Regali'], ['dispensa', 'Ingredienti'], ['arredi', 'Arredo']];
    tabs.forEach(([k, l], i) => hud.button(24 + i * ((UW - 48) / 3), m.y + 70, (UW - 48) / 3 - 4, 26, l, () => { m.c.destroy(); hud.scroller = null; this.bottega(k); }, { parent: m.c, size: 11, color: tab === k ? COL.titolo : '#9d866f' }));
    const sa = hud.scrollArea(m.c, 24, m.y + 104, UW - 48, m.h - 116), cw = (UW - 48 - 16) / 3;
    let voci;
    if (tab === 'regali') voci = Object.keys(PREZZI_REGALI).map(k => ({ k, nome: REGALI[k].nome, prezzo: PREZZI_REGALI[k], icona: () => iconaRegalo(hud, cw / 2, 26, k), compra: () => Eco.compraRegalo(S, k), msg: 'Comprato: ' + REGALI[k].nome }));
    else if (tab === 'dispensa') voci = Eco.dispensaDisponibile(S).map(k => ({ k, nome: DISPENSA[k].nome, prezzo: DISPENSA[k].prezzo, icona: () => iconaCibo(hud, cw / 2, 26, k), compra: () => Eco.compraIngrediente(S, k, 1), msg: 'In dispensa: ' + DISPENSA[k].nome + ' ×' + ((S.ing[k] || 0) + 1) }));
    else if (tab === 'arredi') voci = Object.keys(PREZZI_ARREDI).filter(k => (OGGETTI[k].stanza !== 'stalla' && !['fieno', 'abbeveratoio', 'mangiatoia'].includes(k)) || S.stallaAperta).map(k => ({ k, nome: OGGETTI[k].nome, prezzo: PREZZI_ARREDI[k], icona: () => iconaRegalo(hud, cw / 2, 26, k), compra: () => Eco.compraArredo(S, k), msg: OGGETTI[k].nome + ': lo trovi in Arreda' }));
    else return this.lavori(m, sa);
    voci.forEach((v, i) => {
      const x = (i % 3) * (cw + 8), y = Math.floor(i / 3) * 96, cell = hud.add.container(x, y), puoi = S.semi >= v.prezzo;
      const box = hud.add.rectangle(0, 0, cw, 88, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, puoi ? 0xd79e61 : 0xc4bc93).setInteractive();
      cell.add([box, fitIcon(v.icona(), 30).setAlpha(puoi ? 1 : 0.5), stringi(txt(hud, cw / 2, 46, v.nome, 10, COL.testo, { align: 'center', wordWrap: { width: cw - 6 } }).setOrigin(0.5, 0), cw - 4, 26)]);
      cell.add(hud.add.image(cw / 2 - 8, 78, 'seme').setScale(0.7)); cell.add(txt(hud, cw / 2, 78, String(v.prezzo), 11, puoi ? COL.titolo : '#9d866f').setOrigin(0, 0.5));
      box.on('pointerup', () => {
        if (hud.scrollDragged) return;
        if (!v.compra()) { Sfx.no(); hud.toast('Ti servono ancora ' + (v.prezzo - S.semi) + ' semi'); return; }
        Save.write(); Sfx.seme(); const sy = sa.inner.y; m.c.destroy(); hud.scroller = null; this.bottega(tab, sy); hud.toast(v.msg);
      });
      sa.inner.add(cell); sa.contentH = y + 96;
    });
    if (scroll != null) sa.inner.y = scroll;
  },
  lavori(m, sa) {
    const S = Save.data, hud = this.hud;
    if (!m) { m = hud.modal('Lavori', 420, () => this.attachHud()); sa = hud.scrollArea(m.c, 24, m.y + 50, UW - 48, m.h - 62); }
    const voci = [];
    const pp = Eco.prezzoParcella(S);
    if (pp != null) voci.push({ nome: 'Nuova parcella dell\'orto', det: 'Ne hai ' + S.orto.length + ' su 9', prezzo: pp, fai: () => Eco.compraParcella(S) });
    if (S.van < 0) voci.push({ nome: 'Riparare il van', det: Eco.tappeFatte(S) >= VAN.daTappa ? 'Vendi pizze e piatti a pranzo e a cena' : 'Dopo la tappa ' + VAN.daTappa, prezzo: VAN.ripara, fai: () => Eco.riparaVan(S) });
    else if (VAN.migliorie[S.van]) { const g = VAN.migliorie[S.van]; voci.push({ nome: 'Van: ' + g.nome, det: Math.min(4, 2 + S.van + 1) + ' clienti per apertura' + (S.van === 0 ? '. Serve prima delle tappe in paese' : ''), prezzo: g.prezzo, fai: () => Eco.miglioraVan(S) }); }
    if (!S.lavori.stalla) voci.push({ nome: 'Costruire la stalla', det: 'Serve per gli animali dell\'alpeggio (tappa 11)', prezzo: CANCELLI[11].prezzo, fai: () => { const ok = Eco.costruisci(S, 'stalla'); if (ok) { S.stallaAperta = true; ARREDO_INIZIALE_STALLA.forEach(a => S.arredi.push({ ...a, stanza: 'stalla' })); } return ok; } });
    if (!voci.length) sa.inner.add(txt(hud, 0, 10, 'Hai fatto tutti i lavori. Che rifugio!', 12, COL.testo));
    voci.forEach((v, i) => {
      const y = i * 74, cell = hud.add.container(0, y), puoi = S.semi >= v.prezzo;
      const box = hud.add.rectangle(0, 0, UW - 48, 66, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, puoi ? 0xd79e61 : 0xc4bc93).setInteractive();
      cell.add([box, txt(hud, 12, 10, v.nome, 13, COL.titolo), txt(hud, 12, 32, v.det, 10, COL.testo, { wordWrap: { width: UW - 140 } }),
        hud.add.image(UW - 92, 33, 'seme'), txt(hud, UW - 80, 33, String(v.prezzo), 13, puoi ? COL.titolo : '#9d866f').setOrigin(0, 0.5)]);
      box.on('pointerup', () => {
        if (hud.scrollDragged) return;
        if (!v.fai()) { Sfx.no(); hud.toast(v.prezzo > S.semi ? 'Ti servono ancora ' + (v.prezzo - S.semi) + ' semi' : 'Non ancora disponibile'); return; }
        Save.write(); Sfx.fanfara(); m.close(); this.rifai(); hud.toast('Fatto: ' + v.nome);
      });
      sa.inner.add(cell); sa.contentH = y + 74;
    });
  },
  vaiA() {
    const S = Save.data, hud = this.hud, luoghi = [['casa', 'Casa'], ['giardino', 'Giardino e orto']];
    if (S.stallaAperta) luoghi.push(['stalla', 'Stalla']);
    const m = hud.modal('Dove vai?', 70 + luoghi.length * 44);
    luoghi.forEach(([k, l], i) => hud.button(28, m.y + 50 + i * 44, UW - 56, 36, l + (k === this.stanza ? ' (sei qui)' : ''), () => { m.close(); if (k !== this.stanza) this.scene.start('Rifugio', { stanza: k }); }, { parent: m.c, size: 13 }));
  },
});
