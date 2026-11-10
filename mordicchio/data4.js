// =====================================================================
//  Frasi in più per dare profondità ai personaggi: cambiano col momento
//  della giornata, col tempo, col posto e con gli amici del rifugio.
//  Si sentono con «Chiacchiera» e ogni tanto anche con le coccole.
//  Le frasi che nominano un animale non ancora arrivato non vengono dette.
// =====================================================================
const FRASI_EXTRA = {
  mordicchio: {
    mattina: ['Buongiorno. Io sono sveglio da ore. Ho solo fatto finta di dormire.', 'La ciotola è piena? Chiedo per un amico. L\'amico sono io.'],
    sera: ['Il lettuccio è comodo. Ma la notte il posto più bello resta tra le tue gambe.', 'È l\'ora in cui i piccioni dormono. Che noia.'],
    pioggia: ['Piove. Bene: oggi guardiamo la pioggia dalla finestra, io e te.', 'Le gocce sul vetro le inseguo con la zampa. Non le prendo mai.'],
    giardino: ['Fuori si sente l\'odore dell\'erba. E dei piccioni. Soprattutto dei piccioni.', 'Il giardino è grande, ma io so sempre dove sei. Ti sento.'],
    amici: ['Max oggi non c\'è, vero? Bene. Cioè, ciao Max.', 'Mino mi ha chiesto dove tieni i croccantini. Non gliel\'ho detto. Forse.', 'Wilma è gentile. Mi lascia le briciole più buone.'],
    altro: ['A volte ti guardo mentre cucini e penso: che fortuna, stare qui.', 'Oggi ho deciso di essere un gatto bravo. Fino a pranzo, almeno.', 'Quando parli al telefono ascolto anche io. Non capisco niente, ma ascolto.', 'Quando sei di buon umore si sente. E divento di buon umore anche io.', 'Non ho fatto niente. Qualunque cosa sia, non sono stato io.', 'Ho un piano. Non te lo dico. Ma è un ottimo piano.', 'Mi piace quando c\'è silenzio e ci sei tu.', 'Il pizzetto. Lo so che lo vuoi toccare. Vai, oggi te lo concedo.'],
  },
  wilma: {
    mattina: ['Il primo sole della mattina è la cosa più bella che conosco. Lo guardo ogni giorno come se fosse la prima volta.'],
    sera: ['Margherita è calda e non fa domande. Le voglio tanto bene.'],
    pioggia: ['Nel capannone non sentivo mai la pioggia. Adesso la ascolto e mi sembra una canzone.'],
    giardino: ['L\'erba sotto le zampe! Morbida, umida, viva. Non mi abituerò mai.', 'Razzolo un po\' qui, un po\' là. Non cerco niente. È il bello.'],
    amici: ['Fiocco mi segue ovunque. Credo che mi consideri sua zia.', 'Maky mi ha insegnato a fare il bagno nel fango. Non lo rifarò.'],
    altro: ['Sai qual è la cosa che preferisco? Scegliere io dove andare. Anche solo dieci passi più in là.'],
  },
  pisolo: { mattina: ['Mmh... già mattina? Cinque minuti ancora.'], sera: ['La sera è il mio momento. Sono più sveglio. Più o meno.'], pioggia: ['Con la pioggia si dorme benissimo. Lo dico per esperienza.'], giardino: ['Fuori ci sono tante foglie in cui nascondersi. Le ho provate tutte.'], amici: ['Ciuffo mi ha portato una mela. Ho pianto un pochino. Di gioia.'], altro: ['Sono timido, ma con te un po\' meno.'] },
  ciuffo: { mattina: ['Salto, salto, salto! È mattina!'], sera: ['La sera le carote sono più buone. Non chiedermi perché.'], pioggia: ['Odio bagnarmi le orecchie. Però le pozzanghere fanno splash.'], giardino: ['In giardino posso correre a zig zag. È il mio sport.'], amici: ['Pisolo dice che sono troppo veloce. Io dico che lui è troppo lento.'], altro: ['Una volta ho contato tutte le carote dell\'orto. Poi ne ho mangiata una e ho perso il conto.'] },
  pina: { mattina: ['Coccodè! Sono la prima sveglia del rifugio. Lo dico con orgoglio.'], sera: ['Al tramonto mi appollaio e racconto la giornata a chiunque passi.'], pioggia: ['La pioggia mi arruffa tutte le piume. Non guardarmi.'], giardino: ['Razzolo vicino all\'orto, ma giuro che non tocco niente.'], amici: ['Wilma e io parliamo di semi per ore. È una conversazione bellissima.'], altro: ['Qui nessuno mi chiede niente. Mi lasciano solo essere una gallina.'] },
  ghianda: { mattina: ['Ho controllato la mia scorta. C\'è tutto. La ricontrollo dopo.'], sera: ['Di sera nascondo le ghiande in posti nuovi. Poi me li dimentico.'], pioggia: ['La pioggia mi bagna la coda. Una coda bagnata è una tragedia. Poi si asciuga.'], giardino: ['Il melo in giardino è perfetto per arrampicarsi.'], amici: ['Birba dice che salto bene. Detto da una capretta è un gran complimento.'], altro: ['Sai giocare a nascondino? Io sono imbattibile. Tranne con te.'] },
  paperotto: { mattina: ['Qua! Buongiorno! Qua qua!'], sera: ['Mi addormento sempre vicino alla mamma. Anche se sono grande.'], pioggia: ['La pioggia! È il mio tempo preferito! Qua!'], giardino: ['Ho trovato una pozzanghera perfetta. È mia.'], amici: ['Le ochette di Ottavia vogliono giocare con me. Sono più grandi però.'], altro: ['Da grande voglio nuotare in un lago gigante.'] },
  gaia: { mattina: ['Buongiorno, cara. Hai già fatto colazione? È importante.'], sera: ['La sera conto i miei piccoli. Poi li riconto.'], pioggia: ['Noi papere con la pioggia stiamo benissimo. Le piume sono impermeabili, sai?'], giardino: ['In giardino tengo d\'occhio Paperotto. Va sempre verso le pozzanghere.'], amici: ['Ottavia e io ci scambiamo consigli da mamme.'], altro: ['Grazie di averci dato un posto tutto nostro.'] },
  thiago: { mattina: ['La mattina mi faccio la toeletta. Un gatto elegante comincia così.'], sera: ['La sera mi piace stare sul cuscino più morbido. Che è sempre quello che hai appena sistemato.'], pioggia: ['La pioggia rovina il pelo. Resto dentro, grazie.'], giardino: ['Ogni tanto esco a prendere un po\' di sole. Con dignità.'], amici: ['Mitty mi ha attaccato di nuovo. Ho vinto io. Più o meno.', 'Mino mangia tantissimo. Io no, ho un fisico da mantenere.'], altro: ['Se mi prendi in braccio faccio finta di non volerlo. È tutta scena.'] },
  mitty: { mattina: ['Sono sveglio dalle cinque. Ho già attaccato tre ombre e un calzino.'], sera: ['La sera divento ancora più pestifero. È scienza.'], pioggia: ['Con la pioggia rincorro le gocce sul vetro. Le batto tutte.'], giardino: ['Il giardino è pieno di cose da agguantare. Foglie, insetti, la coda di Thiago.'], amici: ['Thiago dice che ha vinto lui. Non è vero. Chiedilo a chiunque. Tranne a Thiago.'], altro: ['Ho gli occhi azzurri, lo so. È così che la faccio franca.'] },
  mino: { mattina: ['Colazione? Colazione. Colazione!'], sera: ['Dopo cena mi siedo sulle gambe di qualcuno. Sono bravo a scegliere.'], pioggia: ['Con la pioggia la ciotola sembra ancora più importante.'], giardino: ['In giardino ho un posto preferito al sole. E uno all\'ombra. E uno vicino alla ciotola.'], amici: ['Thiago dice che mangio troppo. Ma lui non sa quanto è buono tutto.'], altro: ['Io non sono un gatto da divano. Sono un gatto da gambe. Le tue, possibilmente.'] },
  max: { mattina: ['Il mio pelo la mattina è una nuvola. Spazzolami, ti prego.'], sera: ['La sera gioco con tutto quello che rotola.'], pioggia: ['La pioggia mi fa diventare il doppio. Di pelo, intendo.'], giardino: ['In giardino c\'è sempre qualcosa da inseguire.'], amici: ['Mordicchio mi soffia sempre. Io continuo a salutarlo. Un giorno cederà.'], altro: ['Sono grande di pelo, ma piccolo di cuore? No, grande anche di cuore.'] },
  margherita: { mattina: ['Una mucca la mattina non ha fretta. È la regola numero uno.'], sera: ['La sera rumino e penso. Penso a quanto sono fortunata.'], pioggia: ['La pioggia fa crescere l\'erba. Quindi la pioggia è mia amica.'], giardino: ['Il giardino è piccolo per me, ma l\'erba è buonissima.'], amici: ['Wilma è la mia migliore amica. Te l\'ho già detto? Te lo ridico.', 'Nuvola mi chiama zia. Mi si scioglie il cuore ogni volta.'], altro: ['Ho visto tanti umani. Pochi guardano negli occhi come fai tu.'] },
  maky: { mattina: ['Oggi sono di ottimo umore. Probabilmente. Forse.'], sera: ['La sera mi rotolo nel fieno. È come il fango, ma asciutto. Meno bello.'], pioggia: ['PIOGGIA! Vuol dire FANGO! Vuol dire FELICITÀ!'], giardino: ['Il laghetto del giardino è bello, ma troppo pulito. Ci vorrebbe un po\' di fango.'], amici: ['Tempesta mi ha dato un passaggio sulla schiena. Per tre secondi. È stato il viaggio più bello della mia vita.'], altro: ['Lo sapevi che i maiali sognano? Io sogno zucche.'] },
  birba: { mattina: ['Prima di colazione ho già saltato su tutto. Anche su Ombra. Non era contento.'], sera: ['La sera salto più piano. Solo un po\' più piano.'], pioggia: ['La pioggia rende tutto scivoloso. Che divertimento!'], giardino: ['Il tetto del van sembra perfetto per saltare. Posso? No? Va bene.'], amici: ['Fiocco ha paura di saltare. Gli insegno io, piano piano.'], altro: ['Sono una combinaguai, lo so. Ma una combinaguai simpatica.'] },
  fiocco: { mattina: ['Beee... buongiorno. Oggi mi sento coraggioso.'], sera: ['La sera ho un po\' di paura del buio. Ma qui ci sono le lucine.'], pioggia: ['La lana bagnata pesa tantissimo. Resto al riparo, beee.'], giardino: ['In giardino non mi perdo: vedo sempre il tetto della stalla.'], amici: ['Wilma mi racconta le storie la sera.', 'Birba dice che un giorno salterò anche io. Ci credo poco. Ma ci credo.'], altro: ['Non mi sono più perso, da quando sono qui.'] },
  ombra: { mattina: ['La mattina non si fa niente. Lo dico io.'], sera: ['La sera forse mi muovo. Forse.'], pioggia: ['Con la pioggia non mi muovo. Senza pioggia nemmeno, ma per motivi diversi.'], giardino: ['Sono venuto in giardino. Non chiedermi perché. Ho deciso così.'], amici: ['Birba mi salta addosso. Io faccio finta di dormire. Funziona quasi sempre.'], altro: ['Testardo? Io preferisco dire: uno che sa cosa vuole.'] },
  tempesta: { mattina: ['Che aria fresca! Mi viene voglia di galoppare.'], sera: ['La sera guardo il tramonto. Una volta non avevo il tempo di guardarlo.'], pioggia: ['La pioggia sul muso mi ricorda la libertà.'], giardino: ['Il giardino è piccolo per galoppare. Ma per fare due passi va benissimo.'], amici: ['Maky voleva un passaggio. Le ho detto di sì. Mi ha fatto ridere tutto il tempo.'], altro: ['Ho tirato carri per anni. Adesso porto solo me stesso. È più leggero.'] },
  ottavia: { mattina: ['Buongiorno, buongiorno! Hai sentito le ultime notizie? No? Te le racconto io!'], sera: ['La sera faccio il giro della guardia. Ogni oca che si rispetti lo fa.'], pioggia: ['La pioggia mi mette di buon umore. E di umore chiacchierone. Più del solito.'], giardino: ['Il giardino è il mio territorio. Lo divido volentieri, ma con ordine.'], amici: ['Rossella mi ha salutata stamattina. Ancora non mi fido del tutto. Ma le ho risposto.'], altro: ['Le mie ochette sono cresciute. Adesso fanno le chiacchierone come me. Che orgoglio.'] },
  ciro: { mattina: ['Uh... di giorno dormo. Torna stasera. Uh.'], sera: ['Finalmente sera. Il mio turno. Faccio la guardia a tutti, dormite tranquilli.'], pioggia: ['Di notte, la pioggia fa un rumore bellissimo sul tetto della stalla.'], giardino: ['In giardino ho trovato un ramo perfetto per guardare le stelle.'], amici: ['Fragola ha ancora paura del buio. Le dico che il buio è solo il giorno che si riposa.'], altro: ['Saggio? Diciamo che di notte ho molto tempo per pensare.'] },
  fragola: { mattina: ['La mattina è il momento più tranquillo. Mi piace.'], sera: ['La sera ascolto Ciro. Mi fa sentire al sicuro.'], pioggia: ['Con la pioggia il bosco profumava di terra. Qui profuma di casa.'], giardino: ['In giardino i fiori mi arrivano al naso. Starnuto, poi sorrido.'], amici: ['Ombra non parla tanto, ma quando ho paura mi si mette vicino.'], altro: ['Prima scappavo da tutto. Adesso scappo solo un po\'. È un progresso, no?'] },
  rossella: { mattina: ['Mattina, giornata da furbe. Cioè, da intelligenti con stile.'], sera: ['Al tramonto il mio pelo diventa ancora più rosso. Lo so, lo so.'], pioggia: ['Con la pioggia mi acciambello e aspetto. La pazienza è furbizia.'], giardino: ['Il giardino ha un buon odore di mele. Che coincidenza.'], amici: ['Ho fatto pace con Ottavia. Non ditelo in giro, rovinate la mia reputazione.'], altro: ['Mi chiedi perché sono rimasta? Perché qui nessuno mi chiama ladra.'] },
  teodora: { mattina: ['Buongiorno. Sono partita per la cucina un\'ora fa. Ci arriverò.'], sera: ['La sera racconto le storie di quando ero giovane. Erano i tempi delle lumache veloci.'], pioggia: ['La pioggia è un\'ottima scusa per non andare da nessuna parte. Non che io ne abbia bisogno.'], giardino: ['Il giardino? Ci arriverò. Sono quasi a metà corridoio.'], amici: ['Briciola si addormenta sempre a metà delle mie storie. Ma le racconto lo stesso.'], altro: ['Chi va piano va sano e va lontano. E soprattutto si gode il viaggio.'] },
  briciola: { mattina: ['Buongiorno, cara. Le mie ossa ci mettono un po\' a svegliarsi, ma il cuore è già sveglio.'], sera: ['La sera penso al mio vecchio box. Poi guardo questo posto: è il più bello che abbia mai avuto.'], pioggia: ['Al canile la pioggia era fredda. Qui la guardo dalla finestra, al calduccio.'], giardino: ['Faccio due passi in giardino. Lentamente. Ogni passo è un regalo.'], amici: ['Teodora mi racconta storie bellissime. Mi addormento sempre a metà. Non dirglielo.'], altro: ['Nessuno sceglie mai i vecchietti. Tu sì. Non me lo dimenticherò mai.'] },
  tubino: { mattina: ['Rruu! Il davanzale la mattina è il posto più bello del paese.'], sera: ['La sera i piccioni si raccontano la giornata. Io racconto di te.'], pioggia: ['Con la pioggia mi riparo sotto la grondaia. Mordicchio mi guarda da dentro, dal vetro. Ci salutiamo.'], giardino: ['Faccio un giro in giardino. Stando attento al gatto col pizzetto.'], amici: ['Mordicchio oggi mi ha fatto un cenno con la testa. Credo fosse un saluto. O una minaccia. Un saluto, dai.'], altro: ['Qualcuno qui dava i semini dalla finestra, una volta. Tutti i piccioni lo sanno.'] },
  hana: { mattina: ['In Giappone si dice che il mattino ha l\'oro in bocca. O forse lo dite voi. È vero ovunque.'], sera: ['La sera faccio qualche passo di danza. Tu balli bene, sai? Ti ho vista.'], pioggia: ['La pioggia sui fiori di ciliegio è bellissima. Anche qui, sull\'erba.'], giardino: ['Questo giardino mi ricorda casa. Mancano solo le lanterne.'], amici: ['Ho provato a insegnare a Fiocco a stare su una zampa. Siamo caduti tutti e due.'], altro: ['Un giorno vedrai Kyoto in fiore. Io lo so. Le gru sanno queste cose.'] },
  nuvola: { mattina: ['Muu! La mamma dice che devo fare colazione. Io voglio giocare!'], sera: ['La sera dormo attaccato alla mamma. È caldissima.'], pioggia: ['La pioggia! Posso saltare nelle pozzanghere? La mamma dice di no. Ma tu?'], giardino: ['In giardino ho trovato un fiore. L\'ho annusato. Poi l\'ho mangiato. Ops.'], amici: ['Zia Margherita mi racconta le storie del pascolo.', 'Birba salta altissimo! Da grande salterò così anch\'io.'], altro: ['Grazie per avermi riportato dalla mamma. Lo dico tutti i giorni, lo so.'] },
  viola: { mattina: ['Buongiorno. Nuvola è già sveglio da un\'ora e mi ha già chiesto di te tre volte.'], sera: ['La sera lo guardo dormire e penso a quanto sono fortunata.'], pioggia: ['Con la pioggia teniamo Nuvola all\'asciutto. Ci prova sempre a uscire.'], giardino: ['Il giardino è bello per far correre Nuvola. Io guardo da vicino.'], amici: ['Margherita è diventata una zia per Nuvola. Qui siamo tutti un po\' famiglia.'], altro: ['Nessuno ci separerà più. Lo so perché ci sei tu.'] },
  spillo: { mattina: ['Mpf. Mattina. Già.'], sera: ['La sera brontolo meno. Non dirlo in giro.'], pioggia: ['Con la pioggia mi acciambello e dormo. Che è quello che faccio anche col sole.'], giardino: ['Il melo del giardino. Le mele cadute sono mie. Per contratto.'], amici: ['Ho prestato il mio angolo vicino al calorifero a Zip. Un\'ora. Poi l\'ho rivoluto.'], altro: ['Brontolo, ma è un modo di dire grazie. Ormai lo sai.'] },
  zip: { mattina: ['Squit! Ho già riparato la maniglia del cassetto. E oliato la porta.'], sera: ['La sera progetto nuove invenzioni. Una macchina per lanciare i bastoncini a Mordicchio, per esempio.'], pioggia: ['Con la pioggia controllo che non entri acqua dalla finestra. Tutto asciutto, capo.'], giardino: ['In giardino ho trovato un bullone. Un giorno servirà.'], amici: ['Mordicchio mi guarda strano. Gli ho detto che anche io sono vegano.'], altro: ['Qui tutti hanno un posto. Anche un topolino con le chiavi inglesi.'] },
};
// Frasi di Anastasia quando chiacchiera (risposte brevi e naturali)
// risposte neutre di Anastasia: devono stare bene dopo qualsiasi frase
const RISPOSTE = ['Che bello sentirtelo dire.', 'Che tesoro.', 'Ah sì?', 'Me lo segno.', 'Grazie di avermelo detto.'];
// Anastasia risponde solo quando la risposta ha senso: a una frase affettuosa o a un gesto tenero.
// A domande, battute, lamentele o notizie non risponde con frasi fatte (meglio il silenzio che «Che bello sentirtelo dire» a «la ciotola è vuota»).
const RISPOSTE_AFFETTO = ['Che bello sentirtelo dire.', 'Che tesoro.'];
const RISPOSTE_GESTO = ['Che tesoro.', 'Che amore.'];
const AFFETTUOSE = /voglio bene|\bsei (la mia|il mio|stata la mia)|(persona|umana|zia) preferita|con te\b|vicino a te|grazie (a te|per|di)|casa vera|scelgo voi|al sicuro|mi piace (stare|quando)|non ti ho più persa|più bello che (abbia|abbiamo)|felice|sono fortunat/i;
function rispostaA(t, recent) {
  if (!t || /\?/.test(t)) return null;
  if (/^\*/.test(t.trim())) return pick(RISPOSTE_GESTO, recent);
  if (/voglio bene/i.test(t)) return 'Anch\'io ti voglio bene.';
  if (AFFETTUOSE.test(t)) return pick(RISPOSTE_AFFETTO, recent);
  return null;
}

// ---- frasi nuove (7/11), nel carattere di ciascuno; i doppioni quasi identici sono stati tolti ----
const FRASI_NUOVE = {
 "pisolo": [
  "Ho contato fino a cento prima di farmi vedere. Oggi solo fino a cinquanta.",
  "Se parli piano, io resto. Se parli forte, resto lo stesso, ma appallottolato.",
  "Ho sognato una montagna di more. Mi sono svegliato con la bocca aperta."
 ],
 "ciuffo": [
  "Ho fatto una mappa del rifugio. Nella mia testa. È bellissima, ma la vedo solo io.",
  "Ogni giorno scopro un angolo nuovo. Oggi era dietro un sasso. Stupendo.",
  "Le mie orecchie sentono tutto. Anche quello che non dovrebbero."
 ],
 "pina": [
  "Le cose importanti si fanno un chicco alla volta.",
  "Ho imparato una cosa: il sole torna sempre. Basta aspettarlo con pazienza.",
  "Mi piace guardarti lavorare. Hai le mani gentili."
 ],
 "ghianda": [
  "Ho trovato una ghianda perfetta. L'ho nascosta subito. Adesso non la trovo più. Era perfetta.",
  "Non sono stato io. Però se è sparito qualcosa, controlla nel melo.",
  "Ho la coda più bella del rifugio. Lo dico io, ma lo pensano tutti."
 ],
 "paperotto": [
  "Cip! Ho fatto tre passi da solo senza la mamma. Poi sono tornato di corsa.",
  "Quando sarò grande avrò le piume impermeabili come la mamma. Adesso sono solo un po' impermeabili.",
  "Qua! Mi sono specchiato nell'acqua. Ero io!"
 ],
 "gaia": [
  "Una mamma papera dorme con un occhio solo. L'altro guarda Paperotto.",
  "Paperotto cresce. Un giorno nuoterà lontano. Spero di no. Spero di sì.",
  "Mi piace la gente che parla piano. Tu parli piano."
 ],
 "thiago": [
  "Un gatto elegante si siede sempre nel punto giusto della stanza. Cioè dove batte il sole.",
  "Mitty pensa che io non lo veda arrivare. Lo vedo sempre. Faccio finta, per gentilezza.",
  "Le fusa non si fanno a tutti. Solo a chi se le merita."
 ],
 "mitty": [
  "Ho fatto un agguato a una foglia. La foglia ha perso.",
  "Oggi sono stato bravissimo per dieci minuti interi. Poi mi sono annoiato.",
  "Se senti un rumore strano, non ero io. Era Thiago. Probabilmente."
 ],
 "mino": [
  "Il profumo della cucina arriva fino a qui. È una tortura bellissima.",
  "Ho dormito al sole così tanto che adesso sono un gatto tiepido.",
  "Io non chiedo molto. Una carezza, un posto al sole, una ciotola. Due ciotole."
 ],
 "max": [
  "Ho rincorso la mia coda per un minuto intero. Non l'ho presa. Ma c'ero quasi.",
  "Ho lasciato un po' di pelo su ogni cuscino. Così si sa che sono passato.",
  "La cosa più bella del mondo? Una pallina che rotola sotto un mobile. La seconda? Tirarla fuori."
 ],
 "wilma": [
  "Oggi ho guardato una nuvola per tantissimo tempo. Sembrava una piuma. Forse era mia.",
  "Ogni giorno imparo una cosa nuova. Oggi: le margheritine la sera si chiudono.",
  "Mi piace il rumore dei tuoi passi. Vuol dire che sta arrivando qualcuno di buono."
 ],
 "margherita": [
  "L'erba di oggi era buona. Quella di ieri pure. Sono una mucca fortunata.",
  "Non serve correre per arrivare. Serve sapere dove andare.",
  "Quando c'è vento chiudo gli occhi e mi sembra di essere in alpeggio."
 ],
 "maky": [
  "Oggi sono felice. Anzi, felicissima. Anzi, ho fame. Anzi, felice.",
  "Ho annusato una zucca da lontano. Il mio naso non sbaglia mai.",
  "Se mi gratti dietro l'orecchio sinistro divento buonissima. Il destro funziona uguale."
 ],
 "birba": [
  "Il punto più alto della stalla è mio. L'ho conquistato tre volte stamattina.",
  "Ho assaggiato un pezzetto di corda. Era lì. Non è colpa mia.",
  "Se una cosa si può saltare, io la salto. Se non si può, ci provo lo stesso."
 ],
 "fiocco": [
  "Oggi ho detto bee a voce alta. Di solito lo dico piano.",
  "La mia lana è morbida perché qui sono tranquillo. Credo funzioni così.",
  "Se mi chiami, arrivo. Piano, ma arrivo."
 ],
 "ombra": [
  "Ho deciso di fare un passo. Poi ho deciso di non farne un altro. Giornata piena.",
  "Le mie orecchie sentono tutto. Ascoltano solo quando vogliono loro.",
  "Sono testardo anche nel volerti bene. Non cambio idea."
 ],
 "tempesta": [
  "Quando corro, il vento mi pettina la criniera. Non mi serve altro.",
  "Un tempo contavo i chilometri. Adesso conto le carezze.",
  "Mi piace l'odore del fieno nuovo. Sa di estate."
 ],
 "ottavia": [
  "Ultime notizie: Maky ha trovato una pozzanghera. Di nuovo.",
  "Io non spettegolo. Informo. È diverso.",
  "Ho contato le mie ochette due volte. Ci sono tutte. Che sollievo."
 ],
 "ciro": [
  "Il buio non fa paura. È solo la notte che fa silenzio.",
  "Uh. Ho visto una stella cadente. Ho espresso un desiderio per te. Non te lo dico.",
  "Di giorno dormo con un occhio solo. L'altro sogna."
 ],
 "fragola": [
  "Oggi un rumore mi ha fatto saltare. Poi ho visto che era una foglia. Ho riso di me.",
  "Ciro dice che le mie macchie bianche spariranno, crescendo. Mi mancheranno un po'.",
  "Mi piace stare vicino a chi è calmo. Tu sei calma."
 ],
 "rossella": [
  "Furba non vuol dire cattiva. Vuol dire che ci arrivo prima.",
  "Ho una coda bellissima e non ho paura di dirlo.",
  "Qui ho imparato a dormire con tutti e due gli occhi chiusi."
 ],
 "teodora": [
  "Oggi ho fatto quattro passi. Domani forse cinque. Non esageriamo.",
  "Il mio guscio è la mia casa. Ma questa casa qui è più grande, e c'è più compagnia.",
  "Una volta una lumaca mi ha sorpassata. Non ne parliamo."
 ],
 "briciola": [
  "Ho il naso grigio e il cuore giovane. Una bella combinazione, no?",
  "Mi piace sonnecchiare dove ti sento parlare. Mi addormento tranquilla.",
  "Ogni carezza la conservo. Ne ho una scorta bellissima."
 ],
 "tubino": [
  "Rruu. Ho fatto un giro sopra il tetto. Tutto in ordine, nessun gatto in vista.",
  "Le mie piume cambiano colore con la luce. Viola, verde, grigio. Sono un piccione arcobaleno.",
  "Io e Mordicchio abbiamo un accordo: lui fa finta di non vedermi, io faccio finta di non avere paura."
 ],
 "hana": [
  "Stare su una zampa sola è facile. Il difficile è decidere quale.",
  "Il silenzio del mattino è il mio preferito. Si sente il mondo che si sveglia.",
  "Ho piegato una foglia come una gru di carta. Non è venuta benissimo. Ma porta fortuna lo stesso."
 ],
 "nuvola": [
  "Ho corso fino al recinto e ritorno. Tre volte! La mamma si è stancata a guardarmi.",
  "Muu! Oggi ho imparato a muggire più forte. Senti? Muuu!",
  "Da grande voglio essere grande come la mamma. Anche più grande."
 ],
 "viola": [
  "Una mamma conta i passi del suo piccolo. Oggi ne ho contati mille.",
  "Nuvola ha imparato una parola nuova: «ancora». La dice a tutto.",
  "Qui posso riposare davvero. Prima dormivo sempre con un orecchio dritto."
 ],
 "spillo": [
  "Mpf. Bella giornata. Non abituarti, non lo dico spesso.",
  "Dicono «dormire come un ghiro». Come se fosse una cosa brutta.",
  "Ho trovato una mela perfetta. L'ho guardata per un'ora. Poi l'ho mangiata. Mpf, buona."
 ],
 "zip": [
  "Ho progettato un ascensore per Teodora. Lei dice che non le serve. Ha ragione, ma che progetto.",
  "Con un filo e due bottoni si costruisce quasi tutto. Il resto con la pazienza.",
  "Squit! Oggi niente invenzioni. Mi riposo. Cioè, progetto un letto più comodo."
 ]
};
const DOPPIONI_TOLTI = {
 "ghianda": "Sai giocare a nascondino? Io sono imbattibile. Tranne con te.",
 "fiocco": "Non mi sono più perso, da quando sono qui.",
 "tubino": "Qualcuno qui dava i semini dalla finestra, una volta. Tutti i piccioni lo sanno.",
 "hana": "Ho provato a insegnare a Fiocco a stare su una zampa. Siamo caduti tutti e due.",
 "nuvola": "Zia Margherita mi racconta le storie del pascolo.",
 "viola": "Margherita è diventata una zia per Nuvola. Qui siamo tutti un po' famiglia.",
 "spillo": "Brontolo, ma è un modo di dire grazie. Ormai lo sai.",
 "zip": "Mordicchio mi guarda strano. Gli ho detto che anche io sono vegano."
};
Object.entries(DOPPIONI_TOLTI).forEach(([k, t]) => { const F = FRASI_EXTRA[k]; if (F) Object.keys(F).forEach(c => { F[c] = F[c].filter(x => x !== t); }); });
Object.entries(FRASI_NUOVE).forEach(([k, l]) => { const F = FRASI_EXTRA[k] = FRASI_EXTRA[k] || {}; F.altro = (F.altro || []).concat(l); });
