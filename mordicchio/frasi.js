// =====================================================================
//  Frasi spontanee senza ripetizioni (scelta di Danilo, 7/11):
//  - le frasi "racconto" (ricordi, storia personale, confidenze) si dicono UNA volta sola;
//  - le altre si possono ripetere, ma non prima di 3 giorni, e prima si dicono tutte quelle mai dette;
//  - nello stesso giorno lo stesso animale non torna due volte sullo stesso tema (guinzaglio, piccioni…).
//  Vale per: battute di Mordicchio durante il giro, «Chiacchiera», frasi dopo le coccole, notizie, chiacchiere tra amici.
//  Si salva nella partita (S.frasi), compatibile con le partite vecchie.
// =====================================================================
const FRASE_UNA_VOLTA = /ti ricordi|quando sono arrivat|da quando sono arrivat|sono nat[oa]|sfondo del tuo telefono|ragazzi con le bici|ti preoccupavi|ho ancora la pallina|una volta|quando ero|ero (un|una|piccol|il|la)\b|prima (stavo|vivevo|di arrivare)|mi hanno (chiusa|chiuso|lasciat|abbandonat)|nel capannone|da giovane|da piccol|vengo da lontano|non me l'aveva mai detto|non lo dico a nessuno|non dirlo a nessuno|ti confesso|segreto/i;
const TEMI_FRASI = [/guinzaglio/i, /piccion/i, /bastoncin/i, /gabbietta/i, /primo aprile/i, /pizzetto/i, /ciotola|croccantin|fame/i, /tra le (tue )?gambe/i, /pallina/i, /\bmax\b/i, /lettuccio/i, /carot/i, /fango/i, /ghiand|pign/i, /soffi/i, /giappone|kyoto|ciliegi/i, /nascondino/i, /semini/i, /su una zampa/i, /storie/i, /migliore amica/i, /pozzanghera/i];
const RIPETI_DOPO_GIORNI = 3;
const GESTI_RIPIEGO = ['*ti guarda contento*', '*chiude gli occhi, tranquillo*', '*fa un versetto felice*', '*ti si appoggia vicino*'];
const Frasi = {
  h(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); },
  m(S) { S.frasi = S.frasi || { d: {}, temi: {} }; S.frasi.d = S.frasi.d || {}; S.frasi.temi = S.frasi.temi || {}; return S.frasi; },
  unaVolta: t => FRASE_UNA_VOLTA.test(t),
  tema: t => { const i = TEMI_FRASI.findIndex(r => r.test(t)); return i < 0 ? null : i; },
  // sceglie la frase migliore del mucchio per chi parla (chi serve per i temi del giorno)
  scegli(pool, chi, recent) {
    pool = (pool || []).filter(Boolean); if (!pool.length) return null;
    const S = Save.data, F = Frasi.m(S), g = S.giorno || 0, temiOggi = (F.temi[chi] && F.temi[chi].g === g) ? F.temi[chi].t : [];
    const ultima = t => F.d[Frasi.h(t)];
    const libera = t => { const u = ultima(t); if (u === undefined) return true; if (Frasi.unaVolta(t)) return false; return g - u >= RIPETI_DOPO_GIORNI; };
    const temaOk = t => { const x = Frasi.tema(t); return x === null || !temiOggi.includes(x); };
    const nonAppena = t => !(recent && recent.includes(t));
    const livelli = [
      pool.filter(t => ultima(t) === undefined && temaOk(t) && nonAppena(t)),     // mai dette
      pool.filter(t => libera(t) && temaOk(t) && nonAppena(t)),                   // ripetibili, già passati 3 giorni
    ];
    let scelta = null;
    for (const l of livelli) if (l.length) { scelta = l[Math.floor(Math.random() * l.length)]; break; }
    if (!scelta) {   // tutte dette di recente: la meno recente tra quelle ripetibili, mai un racconto già fatto
      const rip = pool.filter(t => !(Frasi.unaVolta(t) && ultima(t) !== undefined) && nonAppena(t));
      if (!rip.length) return null;
      scelta = rip.slice().sort((a, b) => (ultima(a) || 0) - (ultima(b) || 0))[0];
    }
    Frasi.detta(scelta, chi);
    if (recent) { recent.push(scelta); if (recent.length > 12) recent.shift(); }
    return scelta;
  },
  detta(t, chi) {
    const S = Save.data, F = Frasi.m(S), g = S.giorno || 0; F.d[Frasi.h(t)] = g;
    const x = Frasi.tema(t); if (x !== null && chi) { if (!F.temi[chi] || F.temi[chi].g !== g) F.temi[chi] = { g, t: [] }; if (!F.temi[chi].t.includes(x)) F.temi[chi].t.push(x); }
    Save.write();
  },
};
