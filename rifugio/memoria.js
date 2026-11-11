// =====================================================================
//  Memoria narrativa (passi 1 e 2): il rifugio si ricorda cosa è successo
//  e ogni tanto qualcuno ne parla il giorno dopo.
//  - S.memoria.fatti: { chiave: { g: giorno, n: volte, serie: giorni di fila } }
//  - S.memoria.detto: { idBattuta: giorno in cui è stata detta }
//  Solo testo: la memoria non cambia mai punti, semi o progressione.
// =====================================================================
const Memoria = {
  m(S) { return S.memoria || (S.memoria = { fatti: {}, detto: {} }); },
  ricorda(S, chiave) {
    const M = this.m(S), f = M.fatti[chiave] || { g: 0, n: 0, serie: 0 };
    f.serie = f.g === S.giorno ? f.serie : f.g === S.giorno - 1 ? f.serie + 1 : 1;
    f.n++; f.g = S.giorno; M.fatti[chiave] = f;
    const ks = Object.keys(M.fatti); if (ks.length > 60) ks.sort((a, b) => M.fatti[a].g - M.fatti[b].g).slice(0, ks.length - 60).forEach(k => delete M.fatti[k]);
  },
  fatto(S, chiave) { return this.m(S).fatti[chiave] || null; },
  // successo ieri o comunque tra 1 e «entro» giorni fa (mai oggi stesso: oggi l'hai appena visto)
  ieri(S, chiave, entro = 1) { const f = this.fatto(S, chiave); return !!f && S.giorno - f.g >= 1 && S.giorno - f.g <= entro; },
  detta(S, id) { this.m(S).detto[id] = S.giorno; },
  giaDetta(S, id, pausa) { const g = this.m(S).detto[id]; return g != null && (pausa == null || S.giorno - g < pausa); },
};
const coppia = (a, b) => [a, b].sort().join('+');

// ---- battute che ricordano ----
// chi: chi la dice ('*' = chiunque, con {k} = se stesso); se(S, k): quando si può dire; volta: una volta sola; pausa: giorni prima di ridirla
const BATTUTE = [
  { id: 'thiago.rivincita', chi: 'thiago', se: S => Memoria.ieri(S, 'gioco:' + coppia('thiago', 'mitty')), pausa: 4, testo: 'Ieri Mitty mi ha preso di sorpresa. Oggi non succede. Credo.' },
  { id: 'mitty.vittoria', chi: 'mitty', se: S => Memoria.ieri(S, 'gioco:' + coppia('thiago', 'mitty')), pausa: 4, testo: 'Hai visto ieri? Thiago dice che ha vinto lui. Tu c\'eri: chi ha vinto?' },
  { id: 'mordicchio.posto', chi: 'mordicchio', se: S => Memoria.ieri(S, 'posto:mordicchio'), pausa: 3, testo: 'Hai visto dove ho dormito ieri? Un posto nuovo. Il migliore, ovviamente. Non dirlo agli altri.' },
  { id: 'mordicchio.foglia', chi: 'mordicchio', se: S => Memoria.ieri(S, 'foglia'), pausa: 3, testo: 'Quella foglia di ieri... l\'avevo quasi presa. Quasi. Il vento bara.' },
  { id: 'mordicchio.lucciole', chi: 'mordicchio', se: S => Memoria.ieri(S, 'lucciole'), pausa: 5, testo: 'Ieri sera le lucciole sono arrivate fino alla porta. Ne ho contate tredici. Poi mi sono distratto.' },
  { id: 'ciro.lucciole', chi: 'ciro', se: S => Memoria.ieri(S, 'lucciole'), pausa: 5, testo: 'Uh. Ieri sera le lucciole mi hanno fatto compagnia mentre facevo la guardia.' },
  { id: 'mordicchio.scale', chi: 'mordicchio', se: S => Memoria.ieri(S, 'ricordo:scale', 2), volta: true, testo: 'Sto ancora pensando al gradino. «Buona giornata e buon lavoro!» Scusa. Non riesco a smettere di ridere.' },
  { id: 'maky.fango', chi: 'maky', se: S => meteoDelGiorno(S.giorno - 1).tipo === 'pioggia', pausa: 3, testo: 'Ieri pioveva! Hai visto che fango? Wilma non è voluta venire. Peccato per lei.' },
  { id: 'wilma.fango', chi: 'wilma', se: S => meteoDelGiorno(S.giorno - 1).tipo === 'pioggia' && !!S.animali.maky, pausa: 3, testo: 'Ieri Maky voleva portarmi nel fango. Le ho detto di no. Gentilmente.' },
  { id: 'gaia.bagno', chi: 'gaia', se: S => Memoria.ieri(S, 'bagno:paperotto'), pausa: 4, testo: 'Ieri Paperotto ha fatto il bagno nel laghetto. Ci ho messo due ore ad asciugarlo.' },
  { id: 'ottavia.bagno', chi: 'ottavia', se: S => Memoria.ieri(S, 'bagno:ottavia'), pausa: 4, testo: 'Avete visto il mio bagno di ieri nel laghetto? Elegantissimo. Lo dicono tutti. Cioè, lo dico io.' },
  { id: 'wilma.margherita', chi: 'wilma', se: S => Memoria.ieri(S, 'arrivo:margherita', 2), volta: true, testo: 'Margherita è arrivata da poco e già mi sembra di conoscerla da sempre.' },
  { id: 'wilma.fiocco', chi: 'wilma', se: S => Memoria.ieri(S, 'arrivo:fiocco', 2), volta: true, testo: 'Fiocco è arrivato da poco. Mi segue già dappertutto. Non mi dispiace.' },
  { id: 'margherita.nuvola', chi: 'margherita', se: S => Memoria.ieri(S, 'arrivo:nuvola', 2), volta: true, testo: 'Hai visto Nuvola? È arrivato con la sua mamma. Mi ha già chiamata zia.' },
  { id: 'thiago.mino', chi: 'thiago', se: S => Memoria.ieri(S, 'arrivo:mino', 2), volta: true, testo: 'Mino è arrivato da poco e ha già trovato la ciotola. Ha un talento.' },
  // dipendono da ciò che fa Anastasia
  { id: '{k}.regalo.adora', chi: '*', se: (S, k) => Memoria.ieri(S, 'regalo:' + k + ':adora', 2), pausa: 6, testo: k => pick(['Il regalo dell\'altro giorno ce l\'ho ancora qui vicino. È il mio preferito.', 'Ci penso ancora, al tuo regalo. Grazie, davvero.']) },
  { id: '{k}.regalo.sgradito', chi: '*', se: (S, k) => Memoria.ieri(S, 'regalo:' + k + ':sgradito', 2), pausa: 6, testo: k => k === 'ombra' ? 'Il regalo dell\'altro giorno te l\'ho restituito. Ma il pensiero l\'ho tenuto. Non dirlo a nessuno.' : 'Grazie del pensiero dell\'altro giorno. Te l\'ho restituito, ma il pensiero lo tengo.' },
  { id: '{k}.coccole.serie', chi: '*', se: (S, k) => { const f = Memoria.fatto(S, 'coccola:' + k); return !!f && f.serie >= 3 && f.g === S.giorno - 1; }, pausa: 7,
    testo: k => ({ ombra: 'Tre giorni di fila. Li ho contati. Non dirlo a nessuno.', mordicchio: 'Mi coccoli tutti i giorni. Lo so che il pizzetto ti piace. Puoi continuare.', spillo: 'Mpf. Coccole tutti i giorni. Non mi lamento. Strano, eh?' })[k] || 'Mi coccoli tutti i giorni. Me ne accorgo, sai? Grazie.' },
  { id: '{k}.mancata', chi: '*', se: (S, k) => { const f = Memoria.fatto(S, 'coccola:' + k); return !!f && S.giorno - f.g >= 6; }, pausa: 6,
    testo: k => ({ ombra: 'Ah. Sei tu. ...Mi eri mancata. Un pochino.', mordicchio: 'Ah, adesso ti ricordi di me? Va bene. Ti perdono. Il pizzetto è qui.' })[k] || 'Ah, sei tu! Mi eri mancata. Tutto bene?' },
];

// la battuta che un animale può dire adesso (o null): prima quelle che dipendono da ciò che è successo
function battutaPer(k) {
  const S = Save.data; if (!S || !ANIMALI[k]) return null;
  const ok = BATTUTE.filter(b => (b.chi === k || b.chi === '*')).map(b => ({ b, id: b.id.replace('{k}', k) }))
    .filter(({ b, id }) => { try { return b.se(S, k) && !Memoria.giaDetta(S, id, b.volta ? null : b.pausa); } catch (e) { return false; } });
  if (!ok.length) return null;
  const { b, id } = ok[Math.floor(Math.random() * ok.length)];
  const testo = typeof b.testo === 'function' ? b.testo(k) : b.testo;
  if (!frasiValide([testo, '·']).includes(testo)) return null;   // nomina qualcuno non ancora arrivato
  Memoria.detta(S, id); Save.write(); return testo;
}

// ---- cosa viene ricordato (agganci leggeri a funzioni che esistono già) ----
(function () {
  const regala = Eco.regala;
  Eco.regala = function (S, id, k) { const r = regala.call(this, S, id, k); if (r && ['adora', 'gradisce', 'sgradito'].includes(r.esito)) Memoria.ricorda(S, 'regalo:' + id + ':' + r.esito); return r; };
  const cocc = Eco.coccola;
  Eco.coccola = function (S, id) { const r = cocc.call(this, S, id); if (r && !r.gia) Memoria.ricorda(S, 'coccola:' + id); return r; };
  const comp = Eco.completaTappa;
  Eco.completaTappa = function (S, id, semi) { const nuovo = !S.completati.includes(id), r = comp.call(this, S, id, semi); if (nuovo) { const L = LIVELLI.find(l => l.id === id); if (L) [L.animale, L.ospite].filter(x => x && x !== 'mordicchio').forEach(a => Memoria.ricorda(S, 'arrivo:' + a)); } return r; };

  // eventi finiti davvero (non interrotti toccando l'animale)
  const libera = Rifugio.prototype.libera;
  Rifugio.prototype.libera = function (list) {
    const ev = this.eventoOggi, S = Save.data, chi = (list || []).filter(o => o && o.chiave).map(o => o.chiave);
    if (S && !this.interrottoDaTocco && chi.length) {
      if (ev === 'gioco' && chi.length === 2) Memoria.ricorda(S, 'gioco:' + coppia(chi[0], chi[1]));
      if (ev === 'mordicchio_posto' && chi[0] === 'mordicchio') Memoria.ricorda(S, 'posto:mordicchio');
      if (ev === 'foglia') Memoria.ricorda(S, 'foglia');
      Save.write();
    }
    return libera.call(this, list);
  };
  const lucc = Rifugio.prototype.accendiLucciole;
  Rifugio.prototype.accendiLucciole = function () { lucc.call(this); Memoria.ricorda(Save.data, 'lucciole'); Save.write(); };
  const lago = Rifugio.prototype.giroAlLago;
  if (lago) Rifugio.prototype.giroAlLago = function () {
    const prima = new Set(this.ospiti.filter(o => o.evento).map(o => o.chiave)); const r = lago.call(this);
    if (r) this.ospiti.filter(o => o.evento && !prima.has(o.chiave)).forEach(o => { if (PAPERE.includes(o.chiave)) { Memoria.ricorda(Save.data, 'bagno:' + o.chiave); Save.write(); } });
    return r;
  };
  if (typeof mostraRicordo === 'function') {
    const mr = mostraRicordo;
    mostraRicordo = function (hud, id, poi) { Memoria.ricorda(Save.data, 'ricordo:' + id); return mr(hud, id, poi); };
  }

  // ---- dove si sentono: Chiacchiera e le notizie col «!» ----
  const chiac = Rifugio.prototype.chiacchiera;
  Rifugio.prototype.chiacchiera = function (o) {
    const t = Math.random() < 0.7 ? battutaPer(o.chiave) : null;
    if (!t) return chiac.call(this, o);
    o.coccola = 3; o.setFlipX(this.player.x < o.x);
    const lines = [{ who: o.chiave, text: t }]; { const r = Math.random() < 0.6 ? rispostaA(lines[0].text, this.recent) : null; if (r) lines.push({ who: 'anastasia', text: r }); }
    this.hud.say(lines);
  };
  const racc = Rifugio.prototype.raccontaNotizia;
  Rifugio.prototype.raccontaNotizia = function (o) {
    if (o.ricordo) return racc.call(this, o);
    const t = battutaPer(o.chiave); if (!t) return racc.call(this, o);
    this.fineNotizia(o); this.tweens.killTweensOf(o); o.anims.stop(); o.setFrame(o.idleFrame);
    const lines = [{ who: o.chiave, text: t }]; { const r = Math.random() < 0.6 ? rispostaA(lines[0].text, this.recent) : null; if (r) lines.push({ who: 'anastasia', text: r }); }
    o.coccola = 3; this.hud.say(lines); this.pensiero(o, 'cuore', true);
  };
})();
