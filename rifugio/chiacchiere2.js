// =====================================================================
//  Chiacchiere tra amici, più varie (revisione 10/11, notte)
//  - Ogni coppia ha più scambi di battute.
//  - Un terzo elemento «true» vuol dire che parla per primo il secondo della coppia
//    (es. Nuvola che chiama «Zia!» Margherita).
//  - La scelta (in chiacchiere.js) è a mazzo: prima si dicono tutte le battute della coppia,
//    in ordine casuale; quella appena detta è sempre l'ultima a tornare.
// =====================================================================
(function () {
  const NUOVE = {
    'wilma+margherita': [
      ['Margherita, a cosa pensi quando rumini?', 'A niente. È il bello di ruminare.'],
      ['Oggi ho contato le mie piume. Sono tante.', 'Brava. Io mi sono fermata a tre.'],
      ['Secondo te Anastasia è felice qui?', 'Guardala bene. Secondo te?'],
      ['Mi presti un po\' della tua calma?', 'Prendila tutta. Ne ho in abbondanza.'],
      ['Che buon profumo di fieno.', 'Il fieno buono si sente da lontano.'],
    ],
    'wilma+fiocco': [
      ['Fiocco, hai mangiato abbastanza?', 'Sì... forse un altro ciuffetto.'],
      ['Hai la lana tutta arruffata.', 'Me la sistemi tu? Piano piano.'],
      ['Di cosa hai paura oggi, Fiocco?', 'Di niente. Però resto qui lo stesso.'],
      ['Sei stato coraggiosissimo, sai?', 'Davvero? Beee! Lo dico a Birba!'],
      ['Facciamo due passi, noi due?', 'Sì, ma piano. Pianissimo.'],
    ],
    'pina+wilma': [
      ['Wilma, qual è il seme più buono?', 'Quello che trovi tu e dividi con me.'],
      ['Le uova di oggi sono venute bellissime.', 'Come sempre, Pina. Come sempre.'],
      ['Wilma, tu hai paura dei temporali?', 'Un po\'. Ma se stiamo vicine, passa.'],
      ['Domani mi sveglio ancora prima.', 'Pina, più presto di così è ancora notte.'],
      ['Mi insegni a fare glu glu?', 'Prima tu mi insegni il coccodè.'],
    ],
    'margherita+nuvola': [
      ['Zia, perché l\'erba è verde?', 'Perché così si vede bene da lontano.', true],
      ['Zia, quando divento grande come te?', 'Con calma. Non c\'è nessuna fretta.', true],
      ['Zia, mi dici una cosa bella?', 'Che sei qui con noi. Ecco la cosa bella.', true],
      ['Zia, i grilli dormono?', 'Quando smettono di cantare, sì.', true],
      ['Zia Margherita, ho fatto una corsa!', 'L\'ho vista. Sei velocissimo.', true],
    ],
    'nuvola+viola': [
      ['Mamma, ho fame!', 'Di nuovo? Va bene, vieni qui.'],
      ['Mamma, perché muggisci così forte?', 'Così mi senti sempre, ovunque tu sia.'],
      ['Posso andare a vedere le galline?', 'Sì, ma non spaventarle. Sono delicate.'],
      ['Mamma, stai sempre con me?', 'Sempre. Questa adesso è casa nostra.'],
      ['La zia dice che sono cresciuto.', 'La zia ha ragione. Ogni giorno un po\'.'],
    ],
    'maky+tempesta': [
      ['Tempesta, oggi sono di buonissimo umore!', 'Bene. Quanto ti dura?'],
      ['Mi insegni a galoppare?', 'Prima impara a non rotolarti ogni due passi.'],
      ['Ho deciso: il fango non mi piace più.', 'Sento che durerà poco.'],
      ['Da lassù si vede tutto il rifugio?', 'Si vede tutto. Anche te, nel fango.'],
      ['Tempesta, sei arrabbiato?', 'No. Sono fiero. Ha la stessa faccia.'],
    ],
    'birba+fiocco': [
      ['Fiocco, saliamo sul fieno?', 'Tu sali. Io ti tengo il posto qui sotto.'],
      ['Facciamo a chi bela più forte?', 'Beee... ho già perso, vero?'],
      ['Ho assaggiato un pezzo di corda!', 'Birba! Si mangia l\'erba, non la corda!'],
      ['Fiocco, sei la mia pecora preferita.', 'Sono l\'unica pecora che conosci.'],
      ['Andiamo a esplorare dietro la stalla?', 'Solo se torniamo prima di sera.'],
    ],
    'birba+ombra': [
      ['Ombra, facciamo una gara?', 'Ho già vinto. Io non mi muovo.'],
      ['Mi fai salire sulla schiena?', 'Forse. Tra un anno.'],
      ['Perché non corri mai?', 'Perché arrivo lo stesso.'],
      ['Ombra, sei arrabbiato con me?', 'No. Ho questa faccia e basta.'],
      ['Se giochi con me ti porto una carota.', 'Porta la carota. Poi vediamo.'],
    ],
    'fragola+ombra': [
      ['Ombra, come fai a essere sempre calmo?', 'Se resto calmo io, stai tranquilla anche tu.'],
      ['Mi accompagni fino all\'orto?', 'Andiamo. Io davanti, tu dietro.'],
      ['Oggi ho fatto un salto altissimo!', 'L\'ho visto. Ho quasi alzato un orecchio.'],
      ['Ombra, tu hai mai paura?', 'A volte. Ma non lo do a vedere.'],
      ['Posso dormire vicino a te, stanotte?', 'Ti ho già tenuto il posto.'],
    ],
    'ghianda+birba': [
      ['Birba, ho un piano.', 'Mi piace già. Cos\'è?'],
      ['Chi arriva prima all\'albero vince!', 'Tu ti arrampichi, non vale!'],
      ['Hai visto dove ho messo la mia ghianda?', 'No. E non l\'ho mangiata. Credo.'],
      ['Facciamo uno scherzo a Ombra?', 'Ombra non se ne accorgerebbe nemmeno.'],
      ['Mi dai un passaggio sulle corna?', 'Tieniti forte. Anzi, no: scendi.'],
    ],
    'thiago+mitty': [
      ['Mitty, quella era la mia ciotola.', 'Era. Adesso è vuota. Problema risolto.'],
      ['Mitty, perché mi fissi?', 'Ti voglio bene. E voglio il tuo cuscino.'],
      ['Smettila di mordermi la coda.', 'Si muoveva da sola. Mi ha provocato.'],
      ['Mitty, ti prego, un po\' di silenzio.', 'Va bene. Miao. Ecco, finito.'],
      ['Hai rovesciato tu il vaso?', 'Quale vaso? Ah, quel vaso. No.'],
    ],
    'mino+thiago': [
      ['Thiago, secondo te è ora di cena?', 'Mino, abbiamo appena mangiato.'],
      ['Che pelo elegante, oggi.', 'Grazie. Un\'ora di toeletta, almeno.'],
      ['Facciamo un pisolino, noi due?', 'Volentieri. Ma tu non russare.'],
      ['Ho una briciola sui baffi?', 'Più d\'una. Ma ti stanno bene.'],
      ['Thiago, ti ho tenuto il posto caldo.', 'Grazie, Mino. Sei un amico vero.'],
    ],
    'mordicchio+tubino': [
      ['Piccione, quel tetto è mio.', 'Il tetto è di tutti. Rruu.'],
      ['Ti sto tenendo d\'occhio.', 'Lo so. Ti vedo benissimo, da quassù.'],
      ['Perché tubi così presto?', 'Perché tu dormi. È divertente.'],
      ['Se scendi ancora un po\'...', 'Non scendo. Ci vediamo dall\'alto, gatto.'],
      ['Oggi ti lascio stare. Solo oggi.', 'Rruu. Anch\'io ti lascio stare.'],
    ],
    'mordicchio+max': [
      ['Max, smettila di saltarmi addosso.', 'Ma è un gioco! Il gioco del salto!'],
      ['Quel topolino di pezza è mio.', 'Non c\'era scritto sopra. Lo giuro.'],
      ['Hai lasciato pelo dappertutto.', 'È un regalo. Per tutta la casa.'],
      ['Max, facciamo una tregua.', 'Va bene! Poi giochiamo?'],
      ['Via dalla mia ciotola.', 'La stavo solo annusando. Da vicino.'],
    ],
    'ottavia+rossella': [
      ['Rossella, dove sei stata?', 'In giro. Le volpi non dicono mai dove.'],
      ['Ho contato le mie ochette: ci sono tutte!', 'Ci sono tutte, Ottavia. Parola di volpe.'],
      ['Che coda lucida, oggi!', 'Grazie. Tu invece hai l\'aria di chi ha una notizia.'],
      ['Sai che Pina ha fatto un uovo enorme?', 'Lo so. Me l\'hai detto tre volte.'],
      ['Rossella, ci fidiamo l\'una dell\'altra?', 'Sto imparando. Anche tu, mi pare.'],
    ],
    'ciro+fragola': [
      ['Uh. Senti quanto silenzio, stanotte?', 'Sì. Con te vicino è un silenzio bello.'],
      ['Dormi, Fragola. Veglio io.', 'Grazie, Ciro. Buonanotte.'],
      ['Uh. La luna è tonda, stanotte.', 'Sembra una mela gigante.'],
      ['Hai fatto bei sogni, ieri?', 'Ho sognato di correre veloce come il vento.'],
      ['Uh. Chi ha paura del buio?', 'Io un po\'. Ma tu ci vedi benissimo, vero?'],
    ],
    'teodora+briciola': [
      ['Briciola, oggi andiamo piano?', 'Piano è la mia velocità preferita.'],
      ['Hai dormito bene, cara?', 'Benissimo. Ho sognato una ciotola enorme.'],
      ['Restiamo qui a guardare il cielo?', 'Volentieri. Io guardo, tu racconti.'],
      ['Che bel pelo morbido, Briciola.', 'È il pelo di una vecchietta felice.'],
      ['Lo sai che ho quasi cento anni?', 'Allora insieme siamo antichissime.'],
    ],
    'gaia+paperotto': [
      ['Paperotto, vieni sotto l\'ala.', 'Ancora un minuto, mamma!'],
      ['Mamma, perché le rane fanno cra?', 'Ognuno ha il suo verso, piccolo.', true],
      ['Mamma, sono già grande?', 'Quasi. Te lo diranno le piume.', true],
      ['Hai fatto il bravo, oggi?', 'Bravissimo! Quasi sempre.'],
      ['Mamma, ho trovato un lombrico!', 'Bravo. Adesso lascialo andare, poverino.', true],
    ],
    'ciuffo+pisolo': [
      ['Pisolo, ho scoperto un buco nella siepe!', 'Bello. Tu entra, io ti aspetto qui.'],
      ['Pisolo, sei sveglio?', 'Mmh. Dipende da cosa vuoi.'],
      ['Andiamo a vedere oltre il ruscello?', 'Oggi no. Domani... forse dopodomani.'],
      ['Guarda quanto salto in alto!', 'Bravo. Io intanto mi arrotolo.'],
      ['Pisolo, a cosa ti servono gli aculei?', 'A sembrare coraggioso. Funziona?'],
    ],
    'spillo+zip': [
      ['Zip, cos\'è questo rumore?', 'Una vite. Anzi, tre. Tutto sotto controllo.'],
      ['Non toccarmi la coda.', 'Non la tocco. La misuro. È diverso.'],
      ['Mpf. Mi hai aggiustato la cuccia?', 'Sì. Non cigola più. Prego.'],
      ['Zip, fai piano. Sto dormendo.', 'Stai parlando. Quindi sei sveglio.'],
      ['Mpf. Grazie per ieri, comunque.', 'Figurati. Lo sapevo che eri tenero.'],
    ],
    'hana+fiocco': [
      ['Fiocco, alza la testa. Così.', 'Beee... mi sento più alto!'],
      ['Danziamo un po\'?', 'Solo se nessuno guarda.'],
      ['Che bella lana morbida.', 'Grazie. Le tue piume sono più belle.'],
      ['Respira piano, Fiocco. Come il vento.', 'Così? Beee... funziona.'],
      ['Domani ti insegno un inchino.', 'Un inchino da gru? Ci provo!'],
    ],
  };
  // battute già esistenti in cui parla per primo il secondo della coppia
  const PRIMA_IL_SECONDO = ['Zia Margherita! Zia Margherita!', 'Zia, perché le nuvole si muovono?', 'Mamma, guarda come nuoto!'];
  AMICIZIE.forEach(c => {
    c[2].forEach(b => { if (PRIMA_IL_SECONDO.includes(b[0])) b[2] = true; });
    const n = NUOVE[c[0] + '+' + c[1]]; if (n) n.forEach(b => c[2].push(b));
  });
})();
