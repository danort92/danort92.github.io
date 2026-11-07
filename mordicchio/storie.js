// =====================================================================
//  Storie riviste con la filosofia del rifugio (revisione 7/11)
//  Al rifugio arriva chi ha davvero bisogno: animali abbandonati, sfruttati, feriti, troppo deboli
//  o rimasti indietro. Gli animali selvatici sani non si «prendono»: si aiutano e restano liberi,
//  e se vogliono passano a trovarci (Rossella la volpe, Ghianda lo scoiattolo, Mino il gatto di
//  strada, Max il gatto di Eloisa e Michael).
//  Ognuno sa solo quello che può sapere: Anastasia non conosce gli animali prima di incontrarli.
// =====================================================================
const LIBERI = {   // chi vive libero e viene a trovarci: giorni e ore in cui passa
  rossella: { quota: 0.55, fasce: [[6 * 60, 10 * 60], [17 * 60, 21 * 60]], dove: 'Vive nel bosco: passa all\'alba e al tramonto' },
  ghianda: { quota: 0.6, fasce: [[8 * 60, 17 * 60]], dove: 'Vive nel bosco: passa di giorno, per il melo' },
  mino: { quota: 0.75, fasce: [[7 * 60, 21 * 60]], dove: 'Gatto di strada: passa quasi ogni giorno' },
  max: { quota: 0.45, fasce: [[10 * 60, 18 * 60]], dove: 'Vive da Eloisa e Michael: viene a giocare' },
};
function presenteOggi(k) {
  const L = LIBERI[k], S = Save.data; if (!L) return true;
  let h = (S.giorno * 2246822519 ^ [...k].reduce((a, c) => a * 33 + c.charCodeAt(0), 11)) >>> 0; h = (h * 1103515245 + 12345) >>> 0;
  if ((h >>> 8) / 16777216 > L.quota) return false;
  return L.fasce.some(([a, b]) => S.ora >= a && S.ora < b);
}
(function () {
  ['rossella', 'ghianda', 'mino', 'max'].forEach(k => { STANZA_PREDEFINITA[k] = 'fuori'; });
  const la = luogoAttuale;
  luogoAttuale = function (k) { return LIBERI[k] && !presenteOggi(k) ? 'via' : (LIBERI[k] ? 'fuori' : la(k)); };
})();

const L_ = id => LIVELLI.find(l => l.id === id);
const dl = (id, k, righe) => { const L = L_(id); if (L) L.dialoghi[k] = righe; };
const M = (who, text) => ({ who, text });

// 1 · Pisolo: un riccio piccolo, rimasto senza mamma
dl(1, 'incontro', [M('pisolo', 'Oh... ciao. Scusami, mi ero nascosto.'), M('pisolo', 'La mia mamma è uscita a cercare da mangiare e non è più tornata. Sono tre notti che aspetto.'), M('pisolo', 'Ho tanta fame. Lassù, vicino a un cespuglio, ci sono delle more. Me ne porteresti un po\'?'), M('mordicchio', 'Tranquillo, piccolo. Ci pensiamo noi. Tu resta al riparo.')]);
dl(1, 'salvato', [M('pisolo', 'Sono per me? Grazie... davvero.'), M('pisolo', 'Da solo qui fuori non ce la faccio. Posso venire con voi? Faccio pochissimo rumore, promesso.'), M('mordicchio', 'Certo. Da noi c\'è posto, e anche da mangiare.')]);
// 2 · Ciuffo: un coniglio di casa, lasciato in campagna
dl(2, 'incontro', [M('ciuffo', 'Ciao! Io sono Ciuffo. Mi hanno lasciato qui con un sacchetto di carote. Dicevano che «in campagna sta meglio».'), M('ciuffo', 'Il sacchetto si è rotto e le carote sono rotolate dappertutto. Io sono un coniglio di casa: qui fuori mi perdo.'), M('ciuffo', 'Mi aiuti? Io resto qui, così almeno non perdo anche me.'), M('mordicchio', 'Andiamo, io ti vengo dietro. Cinque carote. Facile.')]);
dl(2, 'salvato', [M('ciuffo', 'Tutte e cinque! Sei bravissima!'), M('ciuffo', 'Senti... posso venire a vivere da voi? Un coniglio di casa ha bisogno di una casa. E io ho un sacco di cose da esplorare.')]);
// 4 · Ghianda: scoiattolo libero. Non si porta via: viene a trovarci
dl(4, 'incontro', [M('ghianda', 'Nooo, mi hai trovato! Io sono Ghianda. Sei bravissima.'), M('ghianda', 'Il bosco è casa mia, ma qui nessuno gioca con me. Dicono che vicino al tuo rifugio c\'è un melo bellissimo...'), M('ghianda', 'Posso venire a trovarti, ogni tanto? Prometto che non nascondo troppe cose.'), M('mordicchio', '«Troppe». Va bene, ma il melo lo dividi.')]);
if (L_(4) && L_(4).dopo) { L_(4).dopo.chiede = [M('ghianda', 'Prima però devo raccogliere la mia scorta per l\'inverno. Quattro ghiande, sparse per il bosco. Mi aiuti?'), M('mordicchio', 'Uno scoiattolo che si chiama Ghianda e colleziona ghiande. Certo.')]; L_(4).dopo.fatto = [M('ghianda', 'Quattro! Le nascondo vicino al tuo melo. Così ho un motivo per passare.'), M('mordicchio', 'Lo sapevo. Ci ha già presi in ostaggio.')]; }
// 5 · Gaia e Paperotto: anatre di cortile, lasciate al ruscello
dl(5, 'salvato', [M('gaia', 'Paperotto! Eccoti, finalmente...'), M('gaia', 'Grazie, Anastasia. Siamo anatre di cortile: ci hanno lasciate qui quando hanno chiuso l\'aia. Non sappiamo stare nel selvatico.'), M('gaia', 'Se avete un angolo con un po\' d\'acqua, veniamo con voi.'), M('mordicchio', 'Abbiamo un laghetto. Piccolo, ma tutto vostro.')]);
// 8 · Mino resta libero: passa a trovarci
dl(8, 'salvato', [M('mino', 'La mia ciotola! Grazie, grazie.'), M('mino', 'Il signore della ciotola è il tuo papà, vero? Si vede: anche tu ti prendi cura di tutti.'), M('mino', 'Io sono un gatto di strada, non sto fermo in un posto solo. Ma passerò a trovarti al rifugio. Soprattutto all\'ora di pranzo.')]);
// 9 · Max ha già una casa: viene a giocare
dl(9, 'salvato', [M('max', 'Tutti e quattro! Sei bravissima!'), M('max', 'Io abito qui, con Eloisa e Michael. Ma posso venire a giocare al rifugio, ogni tanto? Prometto che non salto addosso a Mordicchio. Quasi mai.'), M('mordicchio', 'Ogni tanto. Molto tanto.')]);
// 12 · Margherita: una mucca che non faceva più abbastanza latte
dl(12, 'incontro', [M('margherita', 'Buongiorno. Io sono Margherita.'), M('margherita', 'Il vento di stanotte ha sparso il fieno per tutto il pascolo. Cinque balle, tutte rotolate via.'), M('margherita', 'Io sono un po\' lenta. Mi daresti una mano?'), M('mordicchio', 'Volentieri. Tu resta qui a goderti la vista.')]);
dl(12, 'salvato', [M('margherita', 'Grazie, sei gentile.'), M('margherita', 'Sai, a fine estate non torno giù con le altre. Dicono che ormai faccio poco latte, e una mucca che fa poco latte... non serve più.'), M('margherita', 'Se nella vostra stalla c\'è un angolo, mi piacerebbe tanto.'), M('mordicchio', 'C\'è. Da noi nessuno deve servire a qualcosa per restare. E c\'è una tacchina che non smette di guardare il cielo: andrete d\'accordo.')]);
// 13 · Maky: scappata da un allevamento
dl(13, 'incontro', [M('maky', 'Ehi! Io sono Maky. Sì, sono tutta sporca di fango. È il bello della vita.'), M('maky', 'Sono scappata dall\'allevamento giù a valle. Lì c\'era solo cemento. Il fango l\'ho scoperto stamattina!'), M('maky', 'Però adesso ho una fame... Vorrei una zucca. Ne ho vista una lassù, in alto a destra. Anzi no, una mela. No, no: la zucca.'), M('mordicchio', 'Volubile. Mi piace.')]);
dl(13, 'salvato', [M('maky', 'Una zucca! Proprio quella che volevo. Credo.'), M('maky', 'Se mi ritrovano, mi riportano là. Posso venire da te? In stalla c\'è del fango?'), M('mordicchio', 'Non ancora. Ma per te ne troviamo un po\'.')]);
// 14 · Birba: lasciata indietro quando hanno venduto il gregge
dl(14, 'incontro', [M('birba', 'Mi hai trovata! Io sono Birba.'), M('birba', 'Hanno venduto il mio gregge. A me non mi ha voluta nessuno: troppo piccola, e troppo birba.'), M('birba', 'Da sola salto da una roccia all\'altra tutto il giorno, ma è meno divertente. Nella tua stalla ci sono cose su cui saltare?'), M('mordicchio', 'Ci sono le balle di fieno. E Margherita, ma su di lei meglio di no.')]);
// 15 · Fiocco: rimasto indietro nella nebbia, mentre il gregge scendeva a valle
dl(15, 'incontro', [M('fiocco', 'Beee... ciao. Ieri il pastore ha portato giù il gregge. Io zoppicavo e sono rimasto indietro, poi è scesa la nebbia.'), M('fiocco', 'Forse sono tornati a prendermi al recinto. È in alto, da qualche parte. Mi accompagni? Io ti seguo, piano.'), M('mordicchio', 'Piano piano. Non ti perdiamo di vista.')]);
dl(15, 'salvato', [M('narratore', 'Il recinto è vuoto. Ci sono solo impronte, ormai vecchie, che scendono verso valle.'), M('fiocco', 'Non sono tornati... Forse non si sono neanche accorti che mancavo.'), M('anastasia', 'Allora vieni con noi. Da noi ci si accorge sempre di chi manca.'), M('fiocco', 'Beee... davvero? Anche se zoppico?'), M('mordicchio', 'Anche se zoppichi. In stalla c\'è un posto caldo tra Margherita e il fieno.')]);
// 16 · Ombra: un asino da soma lasciato sul sentiero quando non serviva più. Niente campanacci.
(function () {
  const L = L_(16); if (!L) return;
  L.missione = { tipo: 'trova_e_porta', oggetto: 'mela', nomeOggetto: 'Mele selvatiche', atlas: 'natura', frame: 'mela' };
  L.dialoghi.incontro = [M('ombra', 'Io sono Ombra. E no, non mi sposto.'), M('ombra', 'Per anni ho portato la legna su al rifugio alpino. Adesso dicono che sono troppo lento, e mi hanno lasciato qui.'), M('ombra', 'Sono due giorni che non mangio. A stomaco vuoto non faccio un passo. Lassù, in alto a destra, c\'è un melo selvatico.'), M('mordicchio', 'Testardo e affamato. Una combinazione pericolosa. Andiamo.')];
  L.dialoghi.attesa = 'Il melo è in alto a destra. Io intanto resto qui. Fermo. Ovviamente.';
  L.dialoghi.salvato = [M('ombra', 'Mele selvatiche. Aspre, ma buone. Grazie.'), M('ombra', 'Sai cosa? Mi sa che mi sposto. Verso il tuo rifugio, magari. Lì non devo portare niente?'), M('anastasia', 'Niente. Solo te stesso.'), M('mordicchio', 'Un asinello che cambia idea. Questa la racconto a tutti.')];
  if (L.indizi) L.indizi.oggetto = 'Il melo selvatico è in alto a destra, oltre il ponticello.';
})();
// 18 · Ottavia: oche di una fattoria che ha chiuso
dl(18, 'incontro', [M('ottavia', 'Finalmente qualcuno! Sono Ottavia. La fattoria del lago ha chiuso e ci hanno lasciate qui, io e le mie quattro ochette.'), M('ottavia', 'Stavamo facendo il giro del lago e puff, sparite. Sono qui intorno, ne sono sicura.'), M('mordicchio', 'Quattro ochette. Ok. Nessuno le tocca, le riportiamo e basta.')]);
dl(18, 'salvato', [M('ottavia', 'Uno, due, tre, quattro! Ci sono tutte. Che spavento, che spavento.'), M('ottavia', 'Noi siamo oche di cortile, non sappiamo cavarcela qui fuori. Veniamo con te?'), M('mordicchio', 'Cinque oche in più. Il rifugio sarà... vivace.')]);
// 19 · Ciro: un gufo con un'ala ferita
dl(19, 'incontro', [M('ciro', 'Uh-uh! Mi hai trovato. Io sono Ciro.'), M('ciro', 'Mi nascondevo perché di giorno qualcuno mi tira i sassi: dicono che porto sfortuna. Uno mi ha preso l\'ala, e adesso non volo bene.'), M('anastasia', 'Che sciocchezza, la sfortuna. Fammi vedere quell\'ala... Va curata, e serve un posto tranquillo.'), M('ciro', 'Uh. Nessuno era mai stato gentile con me. Vengo. Prometto di fare piano, di giorno.')]);
// 20 · Fragola: ferita a una zampa da una trappola
dl(20, 'incontro', [M('fragola', 'Non avvicinarti troppo... Io sono Fragola. Tutta la radura è piena di trappole.'), M('fragola', 'Una mi ha preso la zampa. Sono riuscita a liberarmi, ma adesso zoppico e ho paura a muovermi.'), M('anastasia', 'Le smonto io. Tutte. Tu resta ferma lì.'), M('mordicchio', 'Lo dice con quella voce. Quando usa quella voce, lo fa davvero.')]);
dl(20, 'salvato', [M('fragola', 'Le hai smontate tutte. Davvero tutte.'), M('fragola', 'Nessuno si era mai preso la briga di farlo. Grazie... non so cos\'altro dire.'), M('anastasia', 'Non serve dire niente. Vieni al rifugio, finché la zampa non guarisce. Poi deciderai tu.')]);
// 21 · Rossella: una volpe libera. La si aiuta, poi torna nel bosco (e passa a trovarci)
(function () {
  const L = L_(21); if (!L) return;
  L.dialoghi.salvato = [M('rossella', 'Libera! Grazie. Lo so, lo so: non dovevo entrare.'), M('rossella', 'Io sono una volpe: il bosco è casa mia, non saprei stare in una stalla.'), M('rossella', 'Però, se permetti, ogni tanto passo a trovarvi. Al tramonto. Da una distanza rispettosa dalle oche.'), M('anastasia', 'Quando vuoi. E le mele ci sono sempre.')];
  L.testoArrivo = 'Rossella torna nel bosco: passerà a trovarti';
  if (DOPO_LIVELLO) DOPO_LIVELLO[21] = [M('mordicchio', 'Rossella è tornata nel bosco. Ogni tanto, all\'alba o al tramonto, passerà dal giardino. Io la terrò d\'occhio dalla finestra.')];
})();
['ghianda', 'mino', 'max'].forEach(k => { const L = LIVELLI.find(l => l.animale === k); if (L && !L.testoArrivo) L.testoArrivo = ANIMALI[k].nome + ' passerà a trovarti al rifugio'; });
if (DOPO_LIVELLO) {
  DOPO_LIVELLO[4] = [M('mordicchio', 'Ghianda è tornato nel bosco, ma ha già nascosto la sua scorta vicino al nostro melo. Tornerà, puoi starne certa.')];
  DOPO_LIVELLO[8] = [M('mordicchio', 'Mino è tornato in strada. Ma ha già capito dove teniamo le ciotole: lo rivedremo presto.')];
  DOPO_LIVELLO[9] = [M('mordicchio', 'Max è tornato da Eloisa e Michael. Dice che verrà a giocare. Io faccio finta di non essere contento.')].concat((DOPO_LIVELLO[9] || []).filter(l => /torretta/.test(l.text)));
}
// 22 · Teodora: una tartaruga di casa, lasciata al lavatoio
dl(22, 'incontro', [M('teodora', 'Buongiorno, cara. Sono Teodora. Una volta avevo una casa. Poi i miei si sono trasferiti, e io sono rimasta qui, al lavatoio.'), M('teodora', 'Sto andando alla fontana in alto. Ci sto andando da martedì. Mi accompagni? Ma piano, eh.'), M('mordicchio', 'Da martedì. Oggi che giorno è? Lasciamo stare.')]);
// 26 · Hana: una gru ferita che il suo stormo ha dovuto lasciare
dl(26, 'incontro', [M('hana', 'Mi hai trovata. Io sono Hana. In giapponese vuol dire fiore.'), M('hana', 'Volavo verso sud con il mio stormo. Mi sono ferita una zampa e loro sono dovuti andare avanti. Mi nascondevo, in attesa di qualcuno di gentile.'), M('anastasia', 'Vieni da noi a guarire. E io vorrei tanto andare in Giappone, un giorno.'), M('hana', 'Allora un pezzetto di Giappone viene con te. Intanto. Il resto lo vedrai coi tuoi occhi.')]);
// 28 · Spillo: troppo magro per il letargo
dl(28, 'incontro', [M('spillo', 'Mpf. Sono Spillo. Sono troppo magro per il letargo: se non mangio, l\'inverno non lo passo.'), M('spillo', 'Volevo raccogliere le mele cadute, ma rotolano via. Cinque. Ne servono cinque. Non una di più, non una di meno.'), M('anastasia', 'Ci penso io. Tu riposati.')]);
dl(28, 'salvato', [M('spillo', 'Cinque. Perfetto. Mpf... grazie. Ecco, l\'ho detto.'), M('spillo', 'Senti, questo inverno... potrei passarlo da voi? Al caldo, finché non metto su un po\' di pancia.'), M('mordicchio', 'C\'è un calorifero. Il lettuccio sopra è mio, ma il posto lì accanto è libero.')]);
// 29 · Zip: la fabbrica sta per essere disinfestata
dl(29, 'incontro', [M('zip', 'Squit! Una persona! Io sono Zip. Vivo qui da sempre, tra le cerniere.'), M('zip', 'Domani arriva la disinfestazione: devo andarmene. Ma senza la mia cerniera d\'oro non parto. È finita in fondo al reparto, in alto a destra.'), M('zip', 'Lo so, sei impegnata. Ma tu sei quella che sistema sempre tutto, no?')]);
// 6 · Thiago: conosce Anastasia da sempre (unico caso in cui lei lo conosce già: è il gatto di famiglia)

// notizie che promettevano qualcosa che poi non succede
(function () {
  const rep = (k, da, a) => { const l = NOTIZIE[k]; if (!l) return; const i = l.indexOf(da); if (i >= 0) l[i] = a; };
  rep('wilma', 'Ho trovato un posto nuovo al sole. Vieni a vederlo, dopo?', 'Ho trovato un posto nuovo al sole, vicino alla porta. Si sta benissimo.');
  rep('hana', 'Ho provato un passo nuovo. Poi te lo faccio vedere.', 'Ho imparato un passo di danza nuovo. Guarda.');
  rep('mordicchio', 'Non ho fame. Ma la ciotola è vuota. Coincidenza?', 'Non ho fame. Però se cade un croccantino, io sono qui. Per caso.');
})();

// premi delle tappe speciali: una foto della festa e un quadretto del sogno (prima: una torta e un barattolo di lucciole)
Object.assign(OGGETTI, {
  foto_festa: { nome: 'Foto della festa', tex: 'foto_festa', tipo: 'muro' },
  quadro_sogno: { nome: 'Il prato delle lucciole', tex: 'quadro_sogno', tipo: 'muro' },
});
if (L_(30)) L_(30).premio = 'foto_festa';
if (L_(25)) L_(25).premio = 'quadro_sogno';
(function () {   // le partite già salvate: si sostituiscono anche lì
  const ld = Save.load;
  Save.load = function () {
    const S = ld.apply(this, arguments); if (!S) return S;
    const mappa = { sacher: 'foto_festa', lucciole: 'quadro_sogno' };
    (S.inventario || []).forEach((id, i) => { if (mappa[id]) S.inventario[i] = mappa[id]; });
    (S.arredi || []).forEach(a => { if (mappa[a.id]) { a.id = mappa[a.id]; a.y = 22; } });
    return S;
  };
})();

// chi è appena arrivato resta nel suo posto finché Mordicchio non l'ha presentato (niente pascolo o giri prima del commento)
(function () {
  const la = luogoAttuale;
  luogoAttuale = function (k) {
    const S = Save.data, L = S && S.ultimoArrivo && LIVELLI.find(l => l.id === S.ultimoArrivo);
    if (L && [L.animale, L.ospite].includes(k)) return LIBERI[k] ? 'via' : stanzaDi(k);   // i liberi sono appena tornati a casa loro
    return la(k);
  };
})();
// Tubino vive fuori, sul davanzale: il suo ricordo lo porta in giardino
if (typeof RICORDI !== 'undefined' && RICORDI.parigi) RICORDI.parigi.stanza = 'fuori';
