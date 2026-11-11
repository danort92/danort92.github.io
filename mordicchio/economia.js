// =====================================================================
//  Economia e tempo del Rifugio di Mordicchio
//  Logica pura (niente Phaser): la usano sia il gioco sia il simulatore
//  di bilanciamento (tools/bilancio.js), così i numeri verificati sono
//  esattamente quelli che gira il gioco.
// =====================================================================

const TEMPO = {
  inizio: 7 * 60,          // la giornata comincia alle 7:00
  fine: 23 * 60,           // alle 23:00 Mordicchio ti porta a letto
  sonnoDa: 7 * 60,         // a letto si può andare quando vuoi: nessuna attesa forzata
  vanDa: 7 * 60, vanA: 21 * 60, vanDurata: 120,   // il van apre quando vuoi (una volta al giorno, entro le 21) e un turno dura 2 ore
  secPerOra: 40,           // 1 ora di gioco = 40 secondi reali (l'orologio si ferma in dialoghi e menu)
  tappeAlGiorno: 99,        // nessun limite di tappe al giorno (scelta di Danilo, 7/11)
};

// ---------------- ORTO ----------------
// notti per maturare, quanti ne raccogli, costo della semina, da quale tappa si sblocca
// (11/11) due blocchi: 2 notti le verdure semplici, 3 tutte le altre (zucca, asparagi, melanzane e carciofi erano a 4:
//  con la cucina degli animali servono anche per piatti preferiti, e arrivano tardi nel gioco)
const COLTURE = {
  pomodorini: { nome: 'Pomodorini', notti: 2, resa: 4, costo: 2, da: 0 },
  rucola:     { nome: 'Rucola',     notti: 2, resa: 3, costo: 1, da: 0 },
  basilico:   { nome: 'Basilico',   notti: 2, resa: 3, costo: 1, da: 0 },
  carota:     { nome: 'Carote',     notti: 2, resa: 3, costo: 1, da: 0 },
  insalata:   { nome: 'Insalata',   notti: 2, resa: 3, costo: 1, da: 2 },
  patate:     { nome: 'Patate',     notti: 3, resa: 4, costo: 2, da: 4 },
  spinaci:    { nome: 'Spinaci',    notti: 3, resa: 3, costo: 2, da: 7 },
  friarielli: { nome: 'Friarielli', notti: 3, resa: 3, costo: 2, da: 9 },
  zucca:      { nome: 'Zucca',      notti: 3, resa: 2, costo: 3, da: 12 },
  asparagi:   { nome: 'Asparagi',   notti: 3, resa: 3, costo: 3, da: 14 },
  zucchine:   { nome: 'Zucchine',   notti: 3, resa: 3, costo: 2, da: 17 },
  melanzane:  { nome: 'Melanzane',  notti: 3, resa: 3, costo: 3, da: 20 },
  peperoni:   { nome: 'Peperoni',   notti: 3, resa: 3, costo: 2, da: 23 },
  fagioli:    { nome: 'Fagioli',    notti: 3, resa: 3, costo: 2, da: 3 },
  cetrioli:   { nome: 'Cetrioli',   notti: 2, resa: 3, costo: 1, da: 5 },
  pomodori:   { nome: 'Pomodori',   notti: 3, resa: 3, costo: 2, da: 8 },
  carciofi:   { nome: 'Carciofi',   notti: 3, resa: 3, costo: 3, da: 15 },
};
// ---------------- ALBERI DA FRUTTA (in giardino, gratis: ogni tanto si coglie) ----------------
const FRUTTI = {
  mele:   { nome: 'Mele',   albero: 'il melo',   ogni: 2, resa: 3 },
  pere:   { nome: 'Pere',   albero: 'il pero',   ogni: 3, resa: 3 },
  arance: { nome: 'Arance', albero: 'l\'arancio', ogni: 3, resa: 3 },
};
const PARCELLE_INIZIO = 3;
const PREZZI_PARCELLE = [30, 50, 75, 100, 130, 170];   // dalla 4ª alla 9ª

// ---------------- DISPENSA (si compra in Bottega) ----------------
const DISPENSA = {
  farina:      { nome: 'Farina',               prezzo: 1, da: 0 },
  mozzarella:  { nome: 'Mozzarella vegana',    prezzo: 2, da: 0 },
  pasta:       { nome: 'Pasta',                prezzo: 2, da: 5 },
  riso:        { nome: 'Riso',                 prezzo: 2, da: 7 },
  latte_soia:  { nome: 'Latte di soia',        prezzo: 1, da: 5 },
  ceci:        { nome: 'Ceci',                 prezzo: 2, da: 6 },
  tahina:      { nome: 'Tahina',               prezzo: 3, da: 6 },
  lenticchie:  { nome: 'Lenticchie',           prezzo: 2, da: 8 },
  seitan:      { nome: 'Seitan',               prezzo: 4, da: 10 },
  secchi:      { nome: 'Pomodorini secchi',    prezzo: 3, da: 11 },
  tofu:        { nome: 'Tofu affumicato',      prezzo: 4, da: 13 },
  cioccolato:  { nome: 'Cioccolato fondente',  prezzo: 3, da: 13 },
  zucchero:    { nome: 'Zucchero di canna',    prezzo: 1, da: 13 },
  arachidi:    { nome: 'Burro di arachidi',    prezzo: 3, da: 13 },
  mais:        { nome: 'Mais da popcorn',      prezzo: 1, da: 15 },
  piadine:     { nome: 'Piadine',              prezzo: 2, da: 16 },
  cotoletta:   { nome: 'Cotoletta vegana',     prezzo: 4, da: 16 },
  maionese:    { nome: 'Maionese vegana',      prezzo: 2, da: 16 },
  olive:       { nome: 'Olive taggiasche',     prezzo: 3, da: 18 },
  sfoglie:     { nome: 'Sfoglie per lasagne',  prezzo: 2, da: 19 },
  cocco:       { nome: 'Latte di cocco',       prezzo: 3, da: 21 },
  curry:       { nome: 'Curry',                prezzo: 2, da: 21 },
  panna:       { nome: 'Panna vegana',         prezzo: 3, da: 22 },
  porcini:     { nome: 'Funghi porcini',       prezzo: 6, da: 22 },
  affettati:   { nome: 'Affettati vegetali',   prezzo: 4, da: 24 },
  formaggi:    { nome: 'Formaggi vegani',      prezzo: 4, da: 24 },
  tortillas:   { nome: 'Tortillas',            prezzo: 2, da: 25 },
  avocado:     { nome: 'Avocado',              prezzo: 3, da: 25 },
  pane:        { nome: 'Pane',                 prezzo: 1, da: 3 },
  banane:      { nome: 'Banane',               prezzo: 2, da: 10 },
  lupini:      { nome: 'Lupini',               prezzo: 2, da: 18 },
};

// ---------------- RICETTARIO ----------------
// tipo: pizza | primo | secondo | piatto | dolce | sfizio.  sua: è una ricetta che Anastasia cucina davvero.
// La ricetta si scrive da sola nel libro la prima volta che hai in casa tutti i suoi ingredienti.
const RICETTE = {
  bruschetta:   { nome: 'Bruschetta pomodorini e basilico', tipo: 'piatto', ing: ['farina', 'pomodorini', 'basilico'] },
  insalata_r:   { nome: 'Insalata ricca',                   tipo: 'piatto', ing: ['insalata', 'pomodorini', 'carota'] },
  pizza_rucola: { nome: 'Pizza pomodorini e rucola',        tipo: 'pizza',  ing: ['farina', 'mozzarella', 'pomodorini', 'rucola'], sua: true },
  pesto:        { nome: 'Pasta al pesto',                   tipo: 'primo',  ing: ['pasta', 'basilico', 'basilico'] },
  hummus:       { nome: 'Hummus con le carote',             tipo: 'piatto', ing: ['ceci', 'tahina', 'carota'] },
  ris_spinaci:  { nome: 'Risotto agli spinaci',             tipo: 'primo',  ing: ['riso', 'spinaci', 'spinaci'], sua: true },
  zuppa:        { nome: 'Zuppa di lenticchie',              tipo: 'primo',  ing: ['lenticchie', 'carota', 'patate'] },
  seitan_pat:   { nome: 'Seitan con le patate',             tipo: 'secondo', ing: ['seitan', 'patate', 'patate'], sua: true },
  pizza_friar:  { nome: 'Pizza friarielli e pomodorini secchi', tipo: 'pizza', ing: ['farina', 'mozzarella', 'friarielli', 'secchi'], sua: true },
  vellutata:    { nome: 'Vellutata di zucca',               tipo: 'primo',  ing: ['zucca', 'patate'] },
  carbonara:    { nome: 'Carbonara vegana col tofu affumicato', tipo: 'primo', ing: ['pasta', 'tofu', 'latte_soia'], sua: true },
  biscotti:     { nome: 'Biscotti gocce di cioccolato',   tipo: 'sfizio', ing: ['farina', 'cioccolato', 'arachidi'] },
  torta:        { nome: 'Torta al cioccolato',              tipo: 'dolce',  ing: ['farina', 'cioccolato', 'zucchero', 'latte_soia'] },
  ris_asparagi: { nome: 'Risotto agli asparagi',            tipo: 'primo',  ing: ['riso', 'asparagi', 'asparagi'], sua: true },
  popcorn:      { nome: 'Popcorn',                          tipo: 'sfizio', ing: ['mais'] },
  wrap:         { nome: 'Wrap con cotoletta e maionese',    tipo: 'secondo', ing: ['piadine', 'cotoletta', 'maionese', 'insalata'], sua: true },
  zucchine_rip: { nome: 'Zucchine ripiene',                 tipo: 'secondo', ing: ['zucchine', 'seitan', 'pomodorini'] },
  pizza_olive:  { nome: 'Pizza taggiasche e pomodorini secchi', tipo: 'pizza', ing: ['farina', 'mozzarella', 'olive', 'secchi'], sua: true },
  lasagne:      { nome: 'Lasagne vegetali',                 tipo: 'primo',  ing: ['sfoglie', 'latte_soia', 'farina', 'pomodorini', 'spinaci'], sua: true },
  parmigiana:   { nome: 'Parmigiana di melanzane',          tipo: 'secondo', ing: ['melanzane', 'pomodorini', 'mozzarella'] },
  curry_zucca:  { nome: 'Curry di ceci e zucca',            tipo: 'piatto', ing: ['ceci', 'zucca', 'cocco', 'curry'] },
  tagliatelle:  { nome: 'Tagliatelle ai porcini e panna',   tipo: 'primo',  ing: ['pasta', 'porcini', 'panna'], sua: true },
  peperonata:   { nome: 'Peperonata con patate',            tipo: 'secondo', ing: ['peperoni', 'patate', 'pomodorini'] },
  tagliere:     { nome: 'Tagliere di affettati e formaggi', tipo: 'sfizio', ing: ['affettati', 'formaggi'] },
  tacos:        { nome: 'Tacos con avocado',                tipo: 'piatto', ing: ['tortillas', 'avocado', 'pomodorini', 'insalata'] },
  pasta_fagioli: { nome: 'Pasta e fagioli',               tipo: 'primo',  ing: ['pasta', 'fagioli', 'pomodori'] },
  ins_cetrioli: { nome: 'Insalata di pomodori e cetrioli',  tipo: 'piatto', ing: ['pomodori', 'cetrioli', 'basilico'] },
  panino:       { nome: 'Panino con seitan e insalata',     tipo: 'secondo', ing: ['pane', 'seitan', 'insalata', 'pomodori'] },
  carciofi_pat: { nome: 'Carciofi e patate',                tipo: 'secondo', ing: ['carciofi', 'patate'] },
  lupini_olive: { nome: 'Lupini e olive',                   tipo: 'sfizio', ing: ['lupini', 'olive'] },
  torta_mele:   { nome: 'Torta di mele',                    tipo: 'dolce',  ing: ['farina', 'mele', 'zucchero', 'latte_soia'] },
  macedonia:    { nome: 'Macedonia',                        tipo: 'dolce',  ing: ['mele', 'pere', 'arance', 'banane'] },
  crostata:     { nome: 'Crostata di pere e cioccolato',    tipo: 'dolce',  ing: ['farina', 'pere', 'cioccolato', 'zucchero'] },
  pizza_casa:   { nome: 'Pizza della casa',                 tipo: 'pizza',  ing: ['farina', 'mozzarella', 'pomodorini', 'rucola', 'friarielli', 'olive'], sua: true },
};
// valore di un ortaggio quando calcoli il prezzo di un piatto
const VALORE_ORTO = 1.2;
const RICARICO = 1.6, BASE_PIATTO = 3;
function costoIngrediente(k) { return DISPENSA[k] ? DISPENSA[k].prezzo : VALORE_ORTO; }
function prezzoPiatto(id) {
  const r = RICETTE[id]; const c = r.ing.reduce((s, k) => s + costoIngrediente(k), 0);
  return Math.round(c * RICARICO + BASE_PIATTO + (r.sua ? 1 : 0));
}
const MANCIA = 3;                 // se il piatto è proprio quello che il cliente sognava
const PAGA_SBAGLIATO = 0.5;       // se non è quello che chiedeva, paga metà

// richieste dei clienti: un filtro sulle ricette + come lo dicono
const RICHIESTE = [
  { dice: 'Una pizza, per favore!', ok: r => r.tipo === 'pizza' },
  { dice: 'Ho voglia di un bel primo.', ok: r => r.tipo === 'primo' },
  { dice: 'Qualcosa di sostanzioso, un secondo.', ok: r => r.tipo === 'secondo' },
  { dice: 'Qualcosa con i pomodori.', ok: r => r.ing.includes('pomodorini') || r.ing.includes('pomodori') },
  { dice: 'Qualcosa con la frutta.', ok: r => r.ing.some(k => FRUTTI[k]) },
  { dice: 'Mi va qualcosa con le patate.', ok: r => r.ing.includes('patate') },
  { dice: 'Qualcosa di verde, tipo spinaci o rucola.', ok: r => r.ing.includes('spinaci') || r.ing.includes('rucola') || r.ing.includes('basilico') },
  { dice: 'Uno sfizio da sgranocchiare.', ok: r => r.tipo === 'sfizio' || r.tipo === 'piatto' },
  { dice: 'Qualcosa di dolce!', ok: r => r.tipo === 'dolce' || r.tipo === 'sfizio' },
  { dice: 'Una delle tue specialità.', ok: r => !!r.sua },
  { dice: 'Qualcosa di leggero.', ok: r => r.tipo === 'piatto' || (r.ing.length <= 3 && r.tipo !== 'dolce') },
  // (revisione 11/11) più richieste
  { dice: 'Qualcosa con i legumi: ceci, lenticchie, fagioli...', ok: r => r.ing.some(k => ['ceci', 'lenticchie', 'fagioli', 'lupini'].includes(k)) },
  { dice: 'Qualcosa di caldo, che scaldi.', ok: r => r.tipo === 'primo' || r.ing.includes('zucca') },
  { dice: 'Qualcosa con la zucca.', ok: r => r.ing.includes('zucca') },
  { dice: 'Ho voglia di riso.', ok: r => r.ing.includes('riso') },
  { dice: 'Una cosa da mangiare con le mani.', ok: r => r.tipo === 'pizza' || r.tipo === 'sfizio' || r.ing.some(k => ['pane', 'piadine', 'tortillas'].includes(k)) },
  { dice: 'Qualcosa col cioccolato. Non giudicarmi.', ok: r => r.ing.includes('cioccolato') },
  { dice: 'Tante verdure dell\'orto, colorate!', ok: r => r.ing.filter(k => !DISPENSA[k] && !FRUTTI[k]).length >= 2 },
  { dice: 'Qualcosa con la mozzarella che fila.', ok: r => r.ing.includes('mozzarella') },
  { dice: 'Un piatto di pasta, uno qualsiasi.', ok: r => r.ing.includes('pasta') || r.ing.includes('sfoglie') },
  { dice: 'Qualcosa con le carote.', ok: r => r.ing.includes('carota') },
  { dice: 'Qualcosa con le melanzane o i peperoni.', ok: r => r.ing.includes('melanzane') || r.ing.includes('peperoni') },
  { dice: 'Qualcosa con le olive.', ok: r => r.ing.includes('olive') },
  { dice: 'Sorprendimi!', ok: r => true },
];

// ---------------- VAN ----------------
const VAN = { ripara: 60, daTappa: 5, migliorie: [{ prezzo: 150, clienti: 4, nome: 'Bancone nuovo' }, { prezzo: 260, clienti: 5, nome: 'Forno a legna' }], clientiBase: 3 };

// ---------------- OBIETTIVI CHE APRONO I CAPITOLI ----------------
const CANCELLI = {
  11: { cosa: 'stalla', prezzo: 120, testo: 'Per accogliere gli animali dell\'alpeggio serve una stalla. Costruiscila dalla bacheca dei lavori, in giardino.' },
  21: { cosa: 'van1', testo: 'Per arrivare in paese serve il van con il bancone nuovo. Lo trovi alla bacheca dei lavori, in giardino.' },
};

// ---------------- TAPPE ----------------
function semiTappa(id) { return 14 + id; }

// ---------------- REGALI E AMICIZIA ----------------
const PUNTI_CUORE = 4, CUORI_MAX = 3;
const PUNTI = { coccola: 1, adora: 4, gradisce: 2, sgradito: -1 };
const PREZZI_REGALI = { mela: 4, more: 3, fiori: 5, gomitolo: 8, campanellino: 7, cuscino: 12, pallina: 8 };
const REGALI_DALL_ORTO = ['carota', 'insalata', 'zucca'];
const PELI_A_NOTTE = 2, PELI_MAX = 12, PELI_TROPPI = 8;

// ---------------- ARREDI ----------------
// prezzo crescente: i pezzi più belli costano di più (come le case di Animal Crossing)
const PREZZI_ARREDI = {
  pianta: 20, fiore_vaso: 20, tappetino_verde: 25, tappetino_rosa: 25, sedia: 25, orologio: 25, quadro_prato: 30,
  girasole_vaso: 30, lampada_verde: 30, lampada_rosa: 30, lampada_azzurra: 30, fieno: 30, tavolino: 40, poltroncina: 40,
  quadro_notte: 40, quadro_rosa: 40, tappeto_azzurro: 50, tappeto_rosa: 50, abbeveratoio: 50, mangiatoia: 50,
  cuccia: 55, cassettiera: 60, lettuccio: 65, letto_verde: 85, letto_azzurro: 85, letto_rosa: 85, pendola: 95, torretta: 110,
};
// arredi nuovi (7/11: Danilo trovava casa e bancarella spoglie). Prezzi nella stessa scala degli altri:
// piccoli 20-30, medi 35-50, grandi 60-90.
Object.assign(PREZZI_ARREDI, {
  sgabello: 20, panchetta: 30, sedia2: 25, tappetino_azzurro: 25, tappeto_verde: 50, orologio_grande: 45,
  cuscinone: 30, cesta_giochi: 35, pianta_grande: 35, mensola: 30, lucine: 40, libreria: 70, divanetto: 80,
  lanterna: 25, spazzola: 30, letto_paglia: 35, carriola: 40,
});

// =====================================================================
//  Funzioni (agiscono sul salvataggio S)
// =====================================================================
const Eco = {
  nuovoStato(S) {
    S.giorno = S.giorno || 1; S.ora = S.ora == null ? TEMPO.inizio : S.ora; S.tappeOggi = S.tappeOggi || 0;
    S.ing = S.ing || {}; S.conosciuti = S.conosciuti || {}; S.ricette = S.ricette || {};
    S.orto = S.orto || Array.from({ length: PARCELLE_INIZIO }, () => null);
    S.van = S.van == null ? -1 : S.van; S.vanOggi = !!S.vanOggi; S.peli = S.peli || 0;
    S.oggi = S.oggi || {}; S.venduti = S.venduti || 0; S.lavori = S.lavori || {};
    S.alberi = S.alberi || { mele: 1, pere: 1, arance: 0 };   // notti passate dall'ultimo raccolto
    this.aggiornaRicette(S); return S;
  },
  tappeFatte(S) { return S.completati.length; },
  // ---- tempo ----
  passa(S, minuti) { S.ora = Math.min(TEMPO.fine, S.ora + minuti); return S.ora >= TEMPO.fine; },
  orario(S) { const h = Math.floor(S.ora / 60), m = Math.floor(S.ora % 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; },
  puoiDormire(S) { return S.ora >= TEMPO.sonnoDa; },
  notte(S) {
    const rep = { pronti: [] };
    S.orto.forEach(p => { if (p && p.notti < COLTURE[p.c].notti) { p.notti++; if (p.notti >= COLTURE[p.c].notti) rep.pronti.push(p.c); } });
    S.peli = Math.min(PELI_MAX, (S.peli || 0) + PELI_A_NOTTE);
    S.alberi = S.alberi || {}; Object.keys(FRUTTI).forEach(k => { S.alberi[k] = Math.min(FRUTTI[k].ogni, (S.alberi[k] || 0) + 1); });
    S.giorno++; S.ora = TEMPO.inizio; S.tappeOggi = 0; S.vanOggi = false; S.oggi = {};
    return rep;
  },
  // ---- tappe ----
  tappaPossibile(S, id) {
    if (id > 1 && !S.completati.includes(id - 1)) return { ok: false, perche: 'prima' };
    if (S.completati.includes(id)) return { ok: true, rigioca: true };
    const c = CANCELLI[id];
    if (c && !S.lavori[c.cosa]) return { ok: false, perche: 'cancello', testo: c.testo };
    if (S.tappeOggi >= TEMPO.tappeAlGiorno) return { ok: false, perche: 'stanco' };
    if (S.ora >= TEMPO.fine - 60) return { ok: false, perche: 'tardi' };
    return { ok: true };
  },
  completaTappa(S, id, semiRaccolti) {
    if (S.completati.includes(id)) return 0;
    S.completati.push(id); S.tappeOggi++;
    const g = semiTappa(id) + (semiRaccolti || 0); S.semi += g; this.aggiornaRicette(S); return g;
  },
  // ---- alberi da frutta ----
  fruttoPronto(S, k) { return !!(S.alberi && S.alberi[k] >= FRUTTI[k].ogni); },
  cogli(S, k) { if (!this.fruttoPronto(S, k)) return 0; S.alberi[k] = 0; S.ing[k] = (S.ing[k] || 0) + FRUTTI[k].resa; this.aggiornaRicette(S); return FRUTTI[k].resa; },
  // ---- orto ----
  coltureDisponibili(S) { const t = this.tappeFatte(S); return Object.keys(COLTURE).filter(k => COLTURE[k].da <= t); },
  prezzoParcella(S) { const i = S.orto.length - PARCELLE_INIZIO; return i < PREZZI_PARCELLE.length ? PREZZI_PARCELLE[i] : null; },
  compraParcella(S) { const p = this.prezzoParcella(S); if (p == null || S.semi < p) return false; S.semi -= p; S.orto.push(null); return true; },
  pianta(S, i, c) {
    const C = COLTURE[c]; if (S.orto[i] || !C || S.semi < C.costo) return false;
    S.semi -= C.costo; S.orto[i] = { c, notti: 0 }; return true;
  },
  pronta(S, i) { const p = S.orto[i]; return !!p && p.notti >= COLTURE[p.c].notti; },
  raccogli(S, i) {
    if (!this.pronta(S, i)) return 0; const p = S.orto[i], n = COLTURE[p.c].resa;
    this.aggiungi(S, p.c, n); S.orto[i] = null; return n;
  },
  aggiungi(S, k, n) { S.ing[k] = (S.ing[k] || 0) + n; },
  // una ricetta entra nel libro appena tutti i suoi ingredienti sono coltivabili o in vendita
  disponibile(S, k) { const t = this.tappeFatte(S), x = COLTURE[k] || DISPENSA[k] || (FRUTTI[k] && { da: 0 }); return !!x && x.da <= t; },
  aggiornaRicette(S) {
    const nuove = Object.keys(RICETTE).filter(r => !S.ricette[r] && RICETTE[r].ing.every(x => this.disponibile(S, x)));
    nuove.forEach(r => S.ricette[r] = true); return nuove;
  },
  // ---- dispensa ----
  dispensaDisponibile(S) { const t = this.tappeFatte(S); return Object.keys(DISPENSA).filter(k => DISPENSA[k].da <= t); },
  compraIngrediente(S, k, n = 1) { const p = DISPENSA[k].prezzo * n; if (S.semi < p) return false; S.semi -= p; this.aggiungi(S, k, n); return true; },
  // ---- cucina ----
  bisogno(id) { const b = {}; RICETTE[id].ing.forEach(k => b[k] = (b[k] || 0) + 1); return b; },
  puoiCucinare(S, id) { const b = this.bisogno(id); return Object.keys(b).every(k => (S.ing[k] || 0) >= b[k]); },
  cucina(S, id) { if (!this.puoiCucinare(S, id)) return false; const b = this.bisogno(id); Object.keys(b).forEach(k => S.ing[k] -= b[k]); return true; },
  // ---- van ----
  clientiVan(S) { return S.van < 0 ? 0 : VAN.clientiBase + S.van; },
  vanAperto(S) { return S.van >= 0 && !S.vanOggi && S.ora >= TEMPO.vanDa && S.ora <= TEMPO.vanA; },
  riparaVan(S) { if (S.van >= 0 || this.tappeFatte(S) < VAN.daTappa || S.semi < VAN.ripara) return false; S.semi -= VAN.ripara; S.van = 0; return true; },
  miglioraVan(S) { const m = VAN.migliorie[S.van]; if (S.van < 0 || !m || S.semi < m.prezzo) return false; S.semi -= m.prezzo; S.van++; if (S.van >= 1) S.lavori.van1 = true; return true; },
  nuovaRichiesta(S, rnd) {
    const note = Object.keys(S.ricette).map(k => RICETTE[k]);
    const valide = RICHIESTE.filter(q => note.some(q.ok));
    return valide.length ? valide[Math.floor(rnd() * valide.length)] : RICHIESTE[0];
  },
  servi(S, richiesta, id) {
    if (!this.cucina(S, id)) return null;
    const giusto = richiesta.ok(RICETTE[id]), p = prezzoPiatto(id);
    const paga = giusto ? p + MANCIA : Math.round(p * PAGA_SBAGLIATO);
    S.semi += paga; S.venduti++; return { paga, giusto };
  },
  // il turno conta come fatto appena apri: se chiudi il gioco a metà non si può rifare
  apriVan(S) { if (!this.vanAperto(S)) return false; S.vanOggi = true; return true; },
  chiudiVan(S) { S.vanOggi = true; this.passa(S, TEMPO.vanDurata); },
  // ---- prossimo obiettivo (solo informazione, nessuna regola nuova) ----
  obiettivo(S) {
    const t = this.tappeFatte(S), next = t + 1;
    if (S.van < 0 && t >= VAN.daTappa) return { testo: 'Riparare il van', prezzo: VAN.ripara };
    const c = CANCELLI[next];
    if (c && c.cosa === 'stalla' && !S.lavori.stalla) return { testo: 'Costruire la stalla, per andare avanti', prezzo: c.prezzo };
    if (c && c.cosa === 'van1' && S.van < 1) return { testo: 'Il bancone nuovo del van, per arrivare in paese', prezzo: VAN.migliorie[0].prezzo };
    return null;
  },
  // ---- costruzioni ----
  costruisci(S, cosa) { const c = Object.values(CANCELLI).find(c => c.cosa === cosa); if (!c || S.lavori[cosa] || S.semi < c.prezzo) return false; S.semi -= c.prezzo; S.lavori[cosa] = true; return true; },
  // ---- amicizia ----
  punti(S, id) { return ((S.animali[id] || {}).punti) || 0; },
  cuori(S, id) { return Math.floor(this.punti(S, id) / PUNTI_CUORE); },
  aggiungiPunti(S, id, n) {
    const st = S.animali[id] || (S.animali[id] = {}); const prima = this.cuori(S, id);
    st.punti = Math.max(0, Math.min(PUNTI_CUORE * CUORI_MAX, (st.punti || 0) + n));
    return { cuori: this.cuori(S, id), nuovoCuore: this.cuori(S, id) > prima };
  },
  coccola(S, id) {
    const k = 'coccola-' + id; if (S.oggi[k]) return { gia: true }; S.oggi[k] = true;
    if ((S.peli || 0) > PELI_TROPPI && id !== 'mordicchio' && (typeof stanzaDi === 'function' ? stanzaDi(id) : (ANIMALI[id].stanza || 'casa')) === 'casa') return { sporco: true };
    return this.aggiungiPunti(S, id, PUNTI.coccola);
  },
  regaloOggi(S, id) { return !!S.oggi['regalo-' + id]; },
  esitoRegalo(id, k) {
    const A = ANIMALI[id], r = REGALI[k], g = A.gusti;
    if (A.soloGiochi && r.tag.includes('cibo')) return 'gatto';
    if (r.tag.includes(g.adora)) return 'adora';
    if (r.tag.includes(g.gradisce)) return 'gradisce';
    if (r.tag.includes(g.sgradito)) return 'sgradito';
    return 'neutro';
  },
  quantiRegali(S, k) { return (S.regali[k] || 0) + (REGALI_DALL_ORTO.includes(k) ? (S.ing[k] || 0) : 0); },
  togliRegalo(S, k) { if (S.regali[k] > 0) S.regali[k]--; else if (S.ing[k] > 0) S.ing[k]--; },
  regala(S, id, k) {
    const esito = this.esitoRegalo(id, k);
    if (esito === 'gatto' || esito === 'neutro') return { esito };
    S.oggi['regalo-' + id] = true;
    if (esito !== 'sgradito') this.togliRegalo(S, k);   // un regalo sgradito viene restituito
    return { esito, ...this.aggiungiPunti(S, id, PUNTI[esito]) };
  },
  compraRegalo(S, k) { const p = PREZZI_REGALI[k]; if (!p || S.semi < p) return false; S.semi -= p; S.regali[k] = (S.regali[k] || 0) + 1; return true; },
  compraArredo(S, k) { const p = PREZZI_ARREDI[k]; if (!p || S.semi < p) return false; S.semi -= p; S.inventario.push(k); return true; },
  // ---- pulizie ----
  raccogliPelo(S) { if (!S.peli) return false; S.peli--; S.semi += 1; return true; },
};
if (typeof module !== 'undefined') module.exports = { TEMPO, COLTURE, DISPENSA, RICETTE, RICHIESTE, VAN, CANCELLI, PREZZI_ARREDI, PREZZI_REGALI, PREZZI_PARCELLE, prezzoPiatto, semiTappa, Eco };
