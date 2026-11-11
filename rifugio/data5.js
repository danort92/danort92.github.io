// =====================================================================
//  Amicizie fisse e chiacchiere spontanee.
//  - AMICIZIE: coppie di amici. Quando sono nello stesso posto ogni tanto
//    si avvicinano e si scambiano due battute (nuvolette sopra la testa).
//  - NOTIZIE: ogni tanto un animale viene da Anastasia con un «!» per
//    dirle una cosa. Nessun obbligo: se non lo tocchi, torna ai fatti suoi.
// =====================================================================
// Il 4° campo dice che rapporto è (se manca: amici, da entrambe le parti).
//   'rivali'     = si punzecchiano (Mordicchio non sopporta gatti e piccioni)
//   'conoscenti' = si parlano, ma amici non ancora
//   'mitty'      = amicizia a senso unico: Mitty considera Thiago un amico, Thiago no
// Nelle schede compaiono come «Amici» solo le amicizie vere (e Thiago per Mitty).
const AMICIZIE = [
  ['wilma', 'margherita', [['Margherita, hai visto che sole oggi?', 'L\'ho visto. Mi sono messa proprio sotto.'], ['Ti ricordi il giorno che sei arrivata?', 'Come potrei dimenticarlo. Mi hai fatto spazio nel fieno.']]],
  ['wilma', 'fiocco', [['Fiocco, stai vicino a me.', 'Beee. Sempre.'], ['Vuoi un\'altra storia stasera?', 'Quella delle lucciole! Ti prego.']]],
  ['pina', 'wilma', [['Wilma, ho trovato un seme nuovo!', 'Fammi vedere... è bellissimo.'], ['Domani razzoliamo insieme?', 'Vicino all\'orto. Ma senza toccare niente.']]],
  ['margherita', 'nuvola', [['Zia Margherita! Zia Margherita!', 'Piano, piccolo. Sono qui.'], ['Zia, perché le nuvole si muovono?', 'Vanno a trovare altre mucche, credo.']]],
  ['nuvola', 'viola', [['Mamma, posso giocare ancora un po\'?', 'Ancora un pochino. Poi riposino.'], ['Mamma, ti voglio bene.', 'Anch\'io, tesoro mio. Tantissimo.']]],
  ['maky', 'tempesta', [['Tempesta, mi dai un passaggio?', 'Solo fino al fieno. E non saltare.'], ['Hai visto la mia pozza?', 'L\'ho sentita. Da lontano.']]],
  ['birba', 'fiocco', [['Dai, salta! È facilissimo!', 'Beee... domani. Forse.'], ['Oggi hai saltato un sasso!', 'Era piccolo. Ma l\'ho saltato!']]],
  ['birba', 'ombra', [['Ombra, giochiamo?', 'No.'], ['Ombra, ti sei mosso!', 'Ho solo cambiato lato.']], 'conoscenti'],
  ['fragola', 'ombra', [['Ombra, posso stare qui vicino?', 'Sì. Non devi chiedere.'], ['Hai sentito quel rumore?', 'Era il vento. Tranquilla, ci sono io.']]],
  ['ghianda', 'birba', [['Birba, guarda che salto!', 'Bel salto! Ma io salto più in alto.'], ['Mi aiuti a nascondere le ghiande?', 'Se poi mi dici dove sono, no.']]],
  ['thiago', 'mitty', [['Mitty, non ci provare.', 'Provare a fare cosa? Io sono innocente.'], ['Chi ha vinto ieri?', 'Io. E non dire di no.']], 'mitty'],
  ['mino', 'thiago', [['Thiago, hai finito la tua ciotola?', 'Sì. Non guardarla così.'], ['Mi lasci un po\' del tuo posto al sole?', 'Va bene. Ma solo per un po\'.']]],
  ['mordicchio', 'tubino', [['Piccione.', 'Gatto.'], ['Non ti sto guardando.', 'Nemmeno io. Rruu.']], 'rivali'],
  ['mordicchio', 'max', [['Max. Quello è il mio cuscino.', 'Lo so. Lo stavo solo scaldando per te.'], ['Smettila di seguirmi.', 'Non ti seguo. Andiamo nella stessa direzione.']], 'rivali'],
  ['ottavia', 'rossella', [['Rossella, buongiorno. Le mie ochette ti salutano.', 'Ricambio. Da una distanza rispettosa.'], ['Ho una notizia freschissima!', 'Immagino. Racconta, dai.']], 'conoscenti'],
  ['ciro', 'fragola', [['Hai paura stanotte?', 'Un pochino. Ma se ci sei tu, no.'], ['Uh. Vedi quella stella?', 'Quella che brilla di più? Sì!']]],
  ['teodora', 'briciola', [['Ti racconto di quando ero giovane?', 'Volentieri. Ma piano, che mi addormento.'], ['Eccomi. Ci ho messo un po\'.', 'Ti aspettavo. Tanto non avevo fretta.']]],
  ['gaia', 'paperotto', [['Paperotto, lontano dalle pozzanghere.', 'Solo una! Una piccolissima!'], ['Mamma, guarda come nuoto!', 'Bravissimo. Adesso fuori dall\'acqua.']]],
  ['ciuffo', 'pisolo', [['Pisolo, corriamo?', 'Mmh... facciamo che tu corri e io guardo.'], ['Ti ho portato una carota.', 'Grazie... la mangio dopo il pisolino.']]],
  ['spillo', 'zip', [['Zip, quello è il mio angolo.', 'Lo so. Te l\'ho solo oliato.'], ['Cos\'hai costruito oggi?', 'Una sorpresa. Non per te. Forse.']]],
  ['hana', 'fiocco', [['Fiocco, proviamo di nuovo su una zampa?', 'Beee... va bene. Ma tienimi.'], ['Un giorno ti porto a vedere i ciliegi.', 'Sono come i fiori del giardino?']]],
];
// Cose che un animale viene a dire di sua iniziativa (con il «!»)
const NOTIZIE = {
  mordicchio: ['Ho visto un piccione. Volevo che lo sapessi.', 'Il pizzetto. Oggi è il giorno. Puoi toccarlo.', 'Non ho fame. Ma la ciotola è vuota. Coincidenza?'],
  wilma: ['Ho trovato un posto nuovo al sole. Vieni a vederlo, dopo?', 'Oggi Fiocco mi ha seguita per tutta la mattina. Che tenero.'],
  pisolo: ['Ho dormito benissimo. Volevo solo dirtelo.'], ciuffo: ['Ho fatto il giro dell\'orto saltando! Tre volte!'],
  pina: ['Ho una notizia importantissima: nessuna. Ma volevo salutarti.'], ghianda: ['Ho nascosto una ghianda in un posto segretissimo. Non chiedermi dove.'],
  paperotto: ['Qua! Ho visto una rana! Era verdissima!'], gaia: ['Grazie per l\'acqua fresca. Si sente che qualcuno ci vuole bene.'],
  thiago: ['Ho fatto la toeletta. Guarda che pelo. Guarda.'], mitty: ['Non ho fatto niente. Se trovi qualcosa per terra, non ero io.'],
  mino: ['Ho sentito il rumore della ciotola. Era la ciotola?'], max: ['Mi sono rotolato nell\'erba. Adesso ho tutto il giardino addosso.'],
  margherita: ['Volevo solo stare un po\' vicino a te. Va bene?'], maky: ['Ho un\'idea bellissima: fango. Ecco, era questa.'],
  birba: ['Sono salita sul tetto della stalla! Poi sono scesa. Ma ci sono salita!'], fiocco: ['Oggi non ho avuto paura di niente. Beee!'],
  ombra: ['Mi sono mosso per venire qui. Apprezzalo.'], tempesta: ['Stamattina ho galoppato in tondo. Solo per la gioia.'],
  ottavia: ['Ultime notizie dal giardino: è tutto tranquillo. Notizia straordinaria.'], ciro: ['Uh. Stanotte ho contato le stelle. Erano tante.'],
  fragola: ['Ho visto un\'ombra e non sono scappata. Era solo Ombra.'], rossella: ['Ti ho portato un saluto. Gratis. Non ci abituare.'],
  teodora: ['Sono venuta a salutarti. Ci ho messo un\'ora, ma ne valeva la pena.'], briciola: ['Oggi le zampe vanno meglio. Volevo dirtelo.'],
  tubino: ['Rruu! Dal tetto si vede tutto il rifugio. È bellissimo.'], hana: ['Ho provato un passo nuovo. Poi te lo faccio vedere.'],
  nuvola: ['Muu! Sono cresciuto? Guardami bene.'], viola: ['Grazie. Così, senza un motivo.'],
  spillo: ['Mpf. Ciao. Basta, era solo ciao.'], zip: ['Squit! Ho aggiustato il cassetto che cigolava.'],
};

// chi conta come amico nella scheda di k
function amiciDi(k) {
  return AMICIZIE.filter(c => (c[0] === k || c[1] === k) && (!c[3] || (c[3] === 'mitty' && k === 'mitty'))).map(c => c[0] === k ? c[1] : c[0]);
}
