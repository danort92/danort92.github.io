// =====================================================================
//  (7/11, scelte di Danilo)
//  1) Ogni animale ha i suoi mobili preferiti e ogni tanto ci va: si siede, si accoccola, chi è
//     dormiglione ci dorme; alla spazzola della stalla le mucche e il cavallo si grattano.
//  2) I cuoricini segreti servono: a 5 un cuscino a cuore, a 10 un ritratto di Mordicchio,
//     con tutti e 15 una scena in più alla festa finale. Nel Diario si vede a che punto sei.
// =====================================================================
const PREFERITI = {
  pisolo: ['cuscinone', 'tappetino_verde', 'tappetino_rosa', 'tappetino_azzurro', 'cuscino_cuore'],
  thiago: ['poltroncina', 'divanetto', 'sedia2', 'cuscino_cuore'],
  mitty: ['cesta_giochi', 'tappeto_azzurro', 'tappeto_rosa', 'tappeto_verde'],
  max: ['cesta_giochi', 'divanetto', 'cuscinone'],
  teodora: ['tappeto_rosa', 'tappeto_azzurro', 'tappeto_verde', 'tappetino_verde', 'tappetino_rosa', 'tappetino_azzurro'],
  briciola: ['cuscinone', 'cuscino_cuore', 'letto_verde', 'letto_azzurro', 'letto_rosa', 'divanetto'],
  spillo: ['cuccia', 'cuscinone'],
  zip: ['libreria', 'cassettiera', 'tavolino'],
  tubino: ['pianta_grande'],
  margherita: ['spazzola', 'fieno'], tempesta: ['spazzola'], viola: ['spazzola', 'letto_paglia'],
  fiocco: ['letto_paglia', 'fieno'], nuvola: ['letto_paglia'], maky: ['letto_paglia', 'fieno'],
  birba: ['carriola', 'fieno'], ombra: ['fieno'], wilma: ['fieno', 'letto_paglia'],
  fragola: ['letto_paglia'], rossella: ['letto_paglia'], ciro: ['fieno'],
};
const DORMIGLIONI = ['briciola', 'teodora', 'pisolo', 'fiocco', 'nuvola'];
Object.entries(PREFERITI).forEach(([k, l]) => { if (ANIMALI[k]) ANIMALI[k].preferiti = l; });
ANIMALI.mordicchio.preferiti = ['torretta', 'lettuccio', 'cuscino_cuore'];

Object.assign(OGGETTI, {
  cuscino_cuore: { nome: 'Cuscino a cuore', tex: 'cuscino_cuore', tipo: 'pavimento' },
  ritratto_mordicchio: { nome: 'Ritratto di Mordicchio', tex: 'ritratto_mordicchio', tipo: 'muro' },
});

Object.assign(Rifugio.prototype, {
  // un mobile preferito libero (nessun altro ci sta andando o ci è sopra)
  postoPreferito(o) {
    const pref = (ANIMALI[o.chiave] && ANIMALI[o.chiave].preferiti) || []; if (!pref.length || !this.arrediSprites) return null;
    const punto = a => ({ x: a.x, y: a.y - (a.dati.id === 'torretta' ? 22 : a.ogg.tipo === 'tappeto' ? 3 : /^letto_(verde|rosa|azzurro)/.test(a.dati.id) ? 8 : 6), posto: a.dati.id });
    const occupato = p => (this.ospiti || []).some(x => x !== o && ((x.meta && Math.hypot(x.meta.x - p.x, x.meta.y - p.y) < 8) || Math.hypot(x.x - p.x, x.y - p.y) < 8));
    const liberi = this.arrediSprites.filter(a => pref.includes(a.dati.id)).map(punto).filter(p => !occupato(p));
    return liberi.length ? Phaser.Utils.Array.GetRandom(liberi) : null;
  },
  // il Diario: a che punto sei con i cuoricini e cosa sbloccano
  cuoricini() {
    const hud = this.hud, S = Save.data, n = cuoriTrovati(S), m = hud.modal('Cuoricini segreti', 300);
    const righe = ['Ce n\'è uno nascosto in ognuna delle prime ' + CUORI_TOTALI + ' tappe. Ne hai trovati ' + n + '.', '']
      .concat(SORPRESE_CUORI.map(sp => (n >= sp.n ? '✔ ' : '○ ') + sp.n + ' cuoricini: ' + (n >= sp.n ? (sp.premio ? OGGETTI[sp.premio].nome : 'una sorpresa alla festa') : '???')));
    m.c.add(txt(hud, 30, m.y + 52, righe.join('\n'), 13, COL.testo, { wordWrap: { width: UW - 60 }, lineSpacing: 6 }));
  },
  arrivoPosto(o, id) {
    o.pausa = 8 + Math.random() * 6;
    if (id === 'spazzola') {   // si gratta la schiena
      this.tweens.add({ targets: o, x: o.x + 1.5, yoyo: true, repeat: 5, duration: 160 });
      if (this.pensiero) this.time.delayedCall(1200, () => o.active && !o.meta && this.pensiero(o, 'cuore', true));
      return;
    }
    if (DORMIGLIONI.includes(o.chiave) && Math.random() < 0.6 && this.stanza !== 'fuori') {
      o.dorme = true; o.pausa = 12 + Math.random() * 6;
      if (this.pensiero) this.time.delayedCall(900, () => o.active && o.dorme && !o.meta && this.pensiero(o, 'zzz', true));
      return;
    }
    if (this.pensiero && Math.random() < 0.4) this.time.delayedCall(700, () => o.active && !o.meta && this.pensiero(o, 'cuore', true));
  },
});

// ---------------- cuoricini segreti ----------------
const CUORI_TOTALI = LIVELLI.filter(l => (l.mappa || []).some(r => r.includes('H'))).length;   // 15
const SORPRESE_CUORI = [
  { n: 5, premio: 'cuscino_cuore', testo: 'Sorpresa dei cuoricini: un cuscino a cuore',
    righe: [{ who: 'mordicchio', text: 'Hai trovato cinque cuoricini segreti! Li abbiamo nascosti noi, lungo i sentieri.' }, { who: 'mordicchio', text: 'Il premio è un cuscino a cuore. È per te. Cioè, per me. Cioè, per te. Lo trovi in «Arreda».' }] },
  { n: 10, premio: 'ritratto_mordicchio', testo: 'Sorpresa dei cuoricini: il ritratto di Mordicchio',
    righe: [{ who: 'mordicchio', text: 'Dieci cuoricini! Allora ti meriti un ritratto. Di me, ovviamente.' }, { who: 'mordicchio', text: 'Così mi vedi anche quando dormo da un\'altra parte. Appendilo dove vuoi, con «Arreda».' }] },
  { n: CUORI_TOTALI, premio: null, testo: 'Tutti i cuoricini! La sorpresa è alla festa',
    righe: [{ who: 'mordicchio', text: 'Quindici. Li hai trovati tutti, i cuoricini.' }, { who: 'mordicchio', text: 'Il premio di questi però non te lo dico. Lo vedrai alla festa. È una sorpresa, appunto.' }] },
];
function cuoriTrovati(S) { return new Set(S.cuoricini || []).size; }
// chiamata quando si aggiunge un cuoricino: se si è appena raggiunta una soglia, dà il premio
function sorpresaCuori(S) {
  const n = cuoriTrovati(S), sp = SORPRESE_CUORI.find(x => x.n === n); if (!sp) return null;
  S.sorpreseCuori = S.sorpreseCuori || [];
  if (S.sorpreseCuori.includes(n)) return null;
  S.sorpreseCuori.push(n); if (sp.premio) S.inventario.push(sp.premio);
  S.cuoriDaDire = n; return sp;
}
// alla festa finale, con tutti i cuori, una scena in più prima della firma
function righeFestaCuori(L, scena) {
  const r = L.dialoghi.salvato || []; const S = Save.data;
  if (L.id !== 30 || cuoriTrovati(S) < CUORI_TOTALI) return r;
  const i = r.findIndex(x => /^Firmato/.test(x.text)); const out = r.slice();
  if (scena && scena.time) scena.time.delayedCall(800, () => { for (let k = 0; k < 14; k++) scena.time.delayedCall(k * 180, () => scena.player && scena.hearts(scena.player.x + Math.sin(k) * 24, scena.player.y - 20 - Math.abs(Math.cos(k)) * 18)); });
  out.splice(i < 0 ? out.length : i, 0,
    { who: 'mordicchio', text: 'Ah, e i cuoricini segreti. Li hai trovati tutti e quindici.' },
    { who: 'mordicchio', text: 'Erano i nostri grazie: uno per ogni volta che sei venuta a cercare qualcuno di noi.' },
    { who: 'tutti', text: 'GRAZIE, ANASTASIA!' });
  return out;
}
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    const S = Save.data, n = S.cuoriDaDire, sp = n && SORPRESE_CUORI.find(x => x.n === n);
    if (sp && this.stanza === 'casa') { S.cuoriDaDire = null; Save.write(); this.time.delayedCall(1800, () => this.hud.say(sp.righe)); }
  };
})();
