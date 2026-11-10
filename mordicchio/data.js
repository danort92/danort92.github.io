// =====================================================================
//  IL RIFUGIO DI MORDICCHIO — file dei contenuti
//  Qui stanno testi, tappe, animali e oggetti. Il codice è in game.js.
// =====================================================================

const NOME = "Anastasia";
const MESSAGGIO_FINALE = "Qui andrà il messaggio di Danilo per la festa.";

// --- Chi parla nei dialoghi -------------------------------------------
const PERSONAGGI = {
  mordicchio: { nome: "Mordicchio", tex: "mordicchio", frame: 2 },
  anastasia:  { nome: "Anastasia",  tex: "girl",       frame: 0 },
  pisolo:     { nome: "Pisolo",     tex: "pisolo",     frame: 0 },
  ciuffo:     { nome: "Ciuffo",     tex: "ciuffo",     frame: 0 },
  pina:       { nome: "Pina",       tex: "gallina",    frame: 0 },
  ghianda:    { nome: "Ghianda",    tex: "ghianda",    frame: 0 },
  paperotto:  { nome: "Paperotto",  tex: "paperotto",  frame: 0 },
  gaia:       { nome: "Gaia",       tex: "papera",     frame: 0 },
  thiago:     { nome: "Thiago",     tex: "thiago",     frame: 2 },
  mitty:      { nome: "Mitty",      tex: "mitty",      frame: 2 },
  mino:       { nome: "Mino",       tex: "mino",       frame: 2 },
  max:        { nome: "Max",        tex: "max",        frame: 2 },
  narratore:  { nome: "",           tex: null },
};

// --- Regali: si trovano nelle tappe o si comprano in Bottega -------------
// Le etichette servono per i gusti degli animali.
const REGALI = {
  more:         { nome: "More",            atlas: "natura", frame: "more", prezzo: 3, tag: ["cibo", "bacche", "dolce"] },
  mela:         { nome: "Mela",            atlas: "natura", frame: "mela", prezzo: 3, tag: ["cibo", "frutto", "croccante"] },
  carota:       { nome: "Carota",          tex: "carota",       prezzo: 3, tag: ["cibo", "verdura", "arancione", "croccante"] },
  insalata:     { nome: "Insalata",        tex: "insalata",     prezzo: 3, tag: ["cibo", "verdura", "verde", "fresco"] },
  fiori:        { nome: "Mazzo di fiori",  tex: "fiori",        prezzo: 4, tag: ["profumato", "colorato"] },
  gomitolo:     { nome: "Gomitolo di cotone", tex: "gomitolo", prezzo: 6, tag: ["gioco", "cotone", "morbido"] },
  campanellino: { nome: "Campanellino",    tex: "campanellino", prezzo: 5, tag: ["gioco", "metallo", "rumoroso"] },
  cuscino:      { nome: "Cuscino",         tex: "cuscino",      prezzo: 8, tag: ["riposo", "morbido"] },
  pallina:      { nome: "Pallina che rimbalza", tex: "pallina",  prezzo: 6, tag: ["gioco", "rimbalzante"] },
};

// --- Animali del rifugio -------------------------------------------------
// gusti: l'etichetta che adora (+1 cuore), che gradisce (+½), che non sopporta
const ANIMALI = {
  mordicchio: {
    nome: "Mordicchio", specie: "gatto", carattere: "Affettuoso e curioso", tex: "mordicchio", walk: [0, 1], idle: 2,
    gusti: { adora: "rimbalzante", gradisce: "morbido", sgradito: "rumoroso" },
    soloGiochi: true,
    indizi: ["Quando una cosa rimbalza devo inseguirla. È più forte di me. Come la mia prima pallina.",
             "I campanellini no, grazie: con quel tintinnio non riesco a fare un agguato come si deve."],
    frasi: {
      0: ["Lo so che non sei tipa da coccole. Però una grattatina sotto il mento ogni tanto...",
          "Lanciami il bastoncino, dai. Te lo riporto subito.",
          "Questa casa mi piace già. Il posto più comodo però lo scelgo io."],
      1: ["Da quando sono arrivato a casa nella gabbietta, piccolo piccolo, non ti ho più persa di vista.",
          "Stasera ti aspetto sul letto. Lasciami il posto tra le gambe.",
          "Sono nato il primo aprile. Non è uno scherzo: sono proprio io."],
      2: ["Non mi coccoli tanto, ma mi prendi sempre le cose più buone. Lo so che è il tuo modo di volermi bene.",
          "Quando usciamo col guinzaglio sono il gatto più fiero del paese."],
      3: ["Ho ancora la pallina con cui giocavo quando sono arrivato. Non la presto a nessuno.",
          "Quando sono arrivato ti preoccupavi tanto per la mia salute. Sto benissimo, sai? Anche grazie a te.",
          "*ti mordicchia piano la mano* È il mio modo di dirti grazie."],
    },
  },
  pisolo: {
    nome: "Pisolo", specie: "riccio", carattere: "Timido", tex: "pisolo", walk: [0, 1], idle: 0,
    gusti: { adora: "bacche", gradisce: "morbido", sgradito: "rumoroso" },
    indizi: ["Stanotte ho sognato un cespuglio pieno di palline scure e dolci...",
             "I rumori forti mi fanno chiudere a palla. Anche quelli piccoli e tintinnanti."],
    frasi: {
      0: ["...ciao. Mi piace quest'angolo.", "Scusa se mi nascondo. È l'abitudine."],
      1: ["Oggi ho dormito dodici ore. Mi sento un riccio nuovo.", "Mordicchio dice che russo. Forse un pochino."],
      2: ["Quando mi accarezzi tengo gli aculei giù. Vuol dire che mi fido.", "Ti ho tenuto un posto sul tappeto. È il più caldo."],
      3: ["Prima avevo paura di tutto. Ora ho una casa.", "Sai una cosa? Non mi nascondo quasi più."],
    },
  },
  ciuffo: {
    nome: "Ciuffo", specie: "coniglio", carattere: "Esploratore", tex: "ciuffo", walk: [0, 1], idle: 0,
    gusti: { adora: "arancione", gradisce: "verde", sgradito: "cotone" },
    indizi: ["Tutto quello che è arancione mi mette allegria. Se poi scrocchia, ancora meglio!",
             "I fili del cotone mi fanno starnutire. Etciù! Visto?"],
    frasi: {
      0: ["Ho già fatto il giro del giardino tre volte!", "Che cosa c'è dietro quella porta? E dietro quella?"],
      1: ["Ho trovato un angolo perfetto per scavare. Tranquilla, non scavo davvero.", "Mi insegni la strada per il frutteto?"],
      2: ["Quando salto così vuol dire che sono felice. Si chiama binky!", "Con te esplorare è più bello."],
      3: ["Il posto più bello che ho scoperto? Questo rifugio.", "*fa un salto altissimo e ti atterra vicino*"],
    },
  },
  pina: {
    nome: "Pina", specie: "gallina", carattere: "Saggia", tex: "gallina", walk: [4, 5, 6, 7], idle: 0,
    gusti: { adora: "frutto", gradisce: "fresco", sgradito: "metallo" },
    indizi: ["Una volta ho assaggiato un pezzetto di frutta rossa e croccante. Non l'ho più dimenticato.",
             "Il metallo mi ricorda la gabbia. Preferisco non vederlo."],
    frasi: {
      0: ["Per tanto tempo ho visto solo sbarre. Qui vedo il cielo tutto il giorno.", "Cammino piano, ma arrivo dappertutto."],
      1: ["Ho fatto un bagno di sabbia vicino alla porta. Che meraviglia.", "Sai che le galline si ricordano chi è gentile con loro?"],
      2: ["Stamattina ho chiocciato per la gioia. Mordicchio si è spaventato.", "Grazie per avermi aperto quel cancello."],
      3: ["Una gallina libera è una gallina felice. E io lo sono.", "*si accoccola vicino ai tuoi piedi*"],
    },
  },
  ghianda: {
    nome: "Ghianda", specie: "scoiattolo", carattere: "Combinaguai", tex: "ghianda", walk: [0, 1], idle: 0,
    gusti: { adora: "croccante", gradisce: "morbido", sgradito: "profumato" },
    indizi: ["Mi piace tutto quello che fa CRUNCH quando lo mordo.",
             "I fiori profumati mi fanno girare la testa. Troppo profumo!"],
    frasi: {
      0: ["Ho spostato un cuscino. Forse due. Non ricordo dove.", "Gioca a nascondino con me! Conto io... uno... ho già finito!"],
      1: ["Ho nascosto una cosa in giardino. Non ti dico cosa.", "Mordicchio mi guarda male quando gli salto vicino alla coda."],
      2: ["Sei la mia umana preferita per giocare.", "Oggi mi sono comportato benissimo. Quasi."],
      3: ["Ti ho tenuto da parte il ramo migliore del melo.", "*ti sale sulla spalla e ti fa il solletico con la coda*"],
    },
  },
  paperotto: {
    nome: "Paperotto", specie: "anatroccolo", carattere: "Timido", tex: "paperotto", walk: [0, 1], idle: 0,
    gusti: { adora: "verde", gradisce: "colorato", sgradito: "rumoroso" },
    indizi: ["Le foglie verdi verdi sono le mie preferite. Cip!",
             "I rumori forti mi fanno nascondere sotto l'ala della mamma."],
    frasi: {
      0: ["Cip! Cip! Posso stare vicino a te?", "La mamma dice che sei gentile. Ha ragione."],
      1: ["Ho imparato a camminare in fila dietro di te!", "Cip! Oggi sono stato coraggioso."],
      2: ["Quando sarò grande voglio nuotare fino a lì. E poi tornare qui.", "Ti seguo dappertutto. Cip."],
      3: ["Sei come una seconda mamma. Cip cip!", "*ti si addormenta sulla scarpa*"],
    },
  },
  gaia: {
    nome: "Gaia", specie: "papera", carattere: "Saggia", tex: "papera", walk: [0, 1], idle: 0,
    gusti: { adora: "fresco", gradisce: "bacche", sgradito: "rumoroso" },
    indizi: ["Dopo una nuotata, niente è meglio di qualcosa di fresco da mangiare.",
             "Il chiasso disturba il mio piccolo. E quindi disturba anche me."],
    frasi: {
      0: ["Grazie per avermi riportato Paperotto. Non lo dimenticherò.", "Qui si sta tranquilli. È quello che cercavo."],
      1: ["Tengo d'occhio tutti, non solo mio figlio.", "Il laghetto è perfetto per Paperotto. Basso basso, come piace a me."],
      2: ["Hai la pazienza di una mamma papera. È un complimento.", "Paperotto parla sempre di te."],
      3: ["Questo è il nido più bello che abbiamo mai avuto.", "*ti sfiora la mano con il becco*"],
    },
  },
};

// I gatti di famiglia
Object.assign(ANIMALI, {
  thiago: {
    nome: "Thiago", specie: "gatto tigrato grigio", carattere: "Elegante e affettuoso", tex: "thiago", walk: [0, 1], idle: 2, soloGiochi: true,
    gusti: { adora: "morbido", gradisce: "gioco", sgradito: "rumoroso" },
    indizi: ["Il posto più bello del mondo? Qualcosa di morbido, in un raggio di sole.",
             "I rumori forti mi rovinano il sonnellino. E alla mia età il sonnellino è sacro."],
    frasi: {
      0: ["Ti ricordi quando ti addormentavi accanto a me? Io sì.", "Da quella finestra entra un bel sole. Mi piace.", "Un gatto elegante non ha mai fretta."],
      1: ["Sei cresciuta, ma ridi ancora nello stesso modo.", "Mitty mi salta sempre addosso per fare la lotta. Lo lascio vincere, naturalmente."],
      2: ["Sono contento di vederti felice.", "Mi piace dormire vicino alla lampada, la sera."],
      3: ["Sei stata la mia bambina preferita. E lo sei ancora.", "*fa le fusa forte forte*"],
    },
  },
  mitty: {
    nome: "Mitty", specie: "gatto tigrato bianco dagli occhi azzurri", carattere: "Pestifero", tex: "mitty", walk: [0, 1], idle: 2, soloGiochi: true,
    gusti: { adora: "rumoroso", gradisce: "morbido", sgradito: "profumato" },
    indizi: ["Quando sento un tintinnio mi viene una voglia matta di giocare!",
             "I profumi forti mi fanno starnutire. Etciù."],
    frasi: {
      0: ["Qui non ci sono motori. Solo un pavimento bello caldo.", "Dov'è Thiago? Gli devo saltare addosso."],
      1: ["Stanotte ho dormito tutta la notte senza svegliarmi.", "Mordicchio mi ha soffiato quando mi sono avvicinato alle sue crocchette. Messaggio ricevuto."],
      2: ["Oggi ho fatto la lotta con Thiago. Ho vinto io. Come sempre.", "Grazie per avermi tirato fuori da quel motore."],
      3: ["Ho una famiglia, adesso. Anzi, due.", "Lo so che ho gli occhi azzurri bellissimi. Me lo dicono tutti."],
    },
  },
  mino: {
    nome: "Mino", specie: "gatto tigrato a pelo lungo", carattere: "Buono e mangione", tex: "mino", walk: [0, 1], idle: 2, soloGiochi: true,
    gusti: { adora: "profumato", gradisce: "morbido", sgradito: "cotone" },
    indizi: ["Dormo sempre in mezzo ai fiori del giardino. Lì c'è il profumo giusto.",
             "I fili del gomitolo mi si impigliano nel pelo lungo. No, grazie."],
    frasi: {
      0: ["Il mio posto al sole è il migliore del giardino. Ma per due carezze mi alzo volentieri.", "Hai qualcosa da mangiare? No? Allora accarezzami lo stesso."],
      1: ["Il tuo papà mi lascia sempre un posto riparato per la notte.", "Quando passa Danilo mi siedo sempre sulle sue gambe. Sono le più comode."],
      2: ["Va bene, lo ammetto: mi piace stare qui.", "Se ci fosse una ciotola in più, non direi di no."],
      3: ["Forse non sono più tanto randagio.", "*ti si siede sulle gambe e non si sposta più*"],
    },
  },
});

Object.assign(ANIMALI, {
  max: {
    nome: "Max", specie: "gatto bianco e tigrato, tutto pelo", carattere: "Giocherellone", tex: "max", walk: [0, 1], idle: 2, soloGiochi: true,
    gusti: { adora: "cotone", gradisce: "rimbalzante", sgradito: "metallo" },
    indizi: ["Un gomitolo da rincorrere è la cosa più bella del mondo!",
             "I campanellini di metallo mi fanno rizzare tutto il pelo. E ne ho tanto."],
    frasi: {
      0: ["Giochiamo? Giochiamo? Giochiamo!", "Mordicchio mi ha soffiato di nuovo. Secondo me è il suo modo di dire ciao."],
      1: ["Ho tanto pelo, lo so. Se mi accarezzi un po' ne resta anche a te.", "A casa Eloisa e Michael giocano sempre con me."],
      2: ["Oggi Mordicchio non mi ha soffiato. Per me è un grande passo avanti.", "Ti faccio le fusa più forti che so fare."],
      3: ["Sei la mia zia preferita!", "*si rotola sulla schiena e ti mostra la pancia pelosa*"],
    },
  },
});

// --- Frasi di Mordicchio mentre esplora con te --------------------------
const FRASI_MORDICCHIO_GIRO = [
  "Mi piace quando usciamo insieme. Oggi niente guinzaglio, ma resto vicino.",
  "Questo posto profuma di erba bagnata. Il mio odore preferito, dopo il tuo.",
  "Se trovi un bastoncino tienilo per me. Te lo riporto, promesso.",
  "Ti ricordi quando sono arrivato a casa nella gabbietta, piccolo piccolo? Io sì.",
  "Sono nato il primo aprile. Ogni tanto qualcuno pensa che io sia uno scherzo.",
  "Cammino un passo dietro di te, così controllo che vada tutto bene.",
  "Stanotte dormo tra le tue gambe, come sempre.",
  "Ho sentito un fruscio laggiù. Andiamo a vedere?",
  "Sono un gatto da esplorazione: me lo hai insegnato tu, con il guinzaglio.",
];

// --- Arredi (si trovano come premio o si comprano in Bottega) -------------
// tipo: pavimento | tappeto (sta sotto a tutto) | muro (solo sulla parete)
const OGGETTI = {
  letto_verde:       { nome: "Letto verde",       atlas: "mobili", frame: "letto_verde",       tipo: "pavimento", prezzo: 15 },
  letto_azzurro:     { nome: "Letto azzurro",     atlas: "mobili", frame: "letto_azzurro",     tipo: "pavimento", prezzo: 15 },
  letto_rosa:        { nome: "Letto rosa",        atlas: "mobili", frame: "letto_rosa",        tipo: "pavimento", prezzo: 15 },
  tappetino_verde:   { nome: "Tappetino verde",   atlas: "mobili", frame: "tappetino_verde",   tipo: "tappeto",   prezzo: 5 },
  tappetino_rosa:    { nome: "Tappetino rosa",    atlas: "mobili", frame: "tappetino_rosa",    tipo: "tappeto",   prezzo: 5 },
  tappeto_azzurro:   { nome: "Tappeto azzurro",   atlas: "mobili", frame: "tappeto_azzurro",   tipo: "tappeto",   prezzo: 9 },
  tappeto_rosa:      { nome: "Tappeto rosa",      atlas: "mobili", frame: "tappeto_rosa",      tipo: "tappeto",   prezzo: 9 },
  lampada_verde:     { nome: "Lampada a fungo",   atlas: "mobili", frame: "lampada_verde",     tipo: "pavimento", prezzo: 7 },
  lampada_rosa:      { nome: "Lampada rosa",      atlas: "mobili", frame: "lampada_rosa",      tipo: "pavimento", prezzo: 7 },
  lampada_azzurra:   { nome: "Lampada azzurra",   atlas: "mobili", frame: "lampada_azzurra",   tipo: "pavimento", prezzo: 7 },
  pianta:            { nome: "Piantina",          atlas: "mobili", frame: "pianta",            tipo: "pavimento", prezzo: 4 },
  fiore_vaso:        { nome: "Fiore in vaso",     atlas: "mobili", frame: "fiore_vaso",        tipo: "pavimento", prezzo: 4 },
  girasole_vaso:     { nome: "Girasole in vaso",  atlas: "mobili", frame: "girasole_vaso",     tipo: "pavimento", prezzo: 6 },
  poltroncina:       { nome: "Poltroncina",       atlas: "mobili", frame: "poltroncina",       tipo: "pavimento", prezzo: 8 },
  sedia:             { nome: "Sedia",             atlas: "mobili", frame: "sedia",             tipo: "pavimento", prezzo: 5 },
  tavolino:          { nome: "Tavolino",          atlas: "mobili", frame: "tavolino",          tipo: "pavimento", prezzo: 8 },
  cassettiera:       { nome: "Cassettiera",       atlas: "mobili", frame: "cassettiera",       tipo: "pavimento", prezzo: 10 },
  pendola:           { nome: "Pendola",           atlas: "mobili", frame: "pendola",           tipo: "pavimento", prezzo: 12 },
  quadro_prato:      { nome: "Quadro del prato",  atlas: "mobili", frame: "quadro_prato",      tipo: "muro",      prezzo: 6 },
  quadro_notte:      { nome: "Quadro notturno",   atlas: "mobili", frame: "quadro_notte",      tipo: "muro",      prezzo: 8 },
  quadro_rosa:       { nome: "Quadro fiorito",    atlas: "mobili", frame: "quadro_rosa",       tipo: "muro",      prezzo: 8 },
  orologio:          { nome: "Orologio",          atlas: "mobili", frame: "orologino",         tipo: "muro",      prezzo: 6 },
  cuccia:            { nome: "Cuccia di vimini",  tex: "cuccia",                               tipo: "pavimento", prezzo: 8 },
};

// Cosa si trova in Bottega
const BOTTEGA = {
  regali: ["carota", "insalata", "more", "mela", "fiori", "gomitolo", "pallina", "campanellino", "cuscino"],
  arredi: ["tappetino_rosa", "tappeto_azzurro", "pianta", "girasole_vaso", "lampada_rosa", "sedia", "tavolino", "quadro_notte", "quadro_rosa", "letto_rosa", "pendola", "cassettiera"],
};

// Cosa c'è nel rifugio all'inizio (coordinate in pixel della stanza)
const ARREDO_INIZIALE = [
  { id: "letto_verde",     x: 24,  y: 80 },
  { id: "tappetino_verde", x: 88,  y: 136 },
  { id: "lampada_verde",   x: 48,  y: 64 },
  { id: "quadro_prato",    x: 72,  y: 20 },
];

// --- Introduzione (prima volta) ---------------------------------------
const INTRO = [
  { who: "mordicchio", text: "Eccoti, Anastasia! Ti stavo aspettando." },
  { who: "mordicchio", text: "Benvenuta nel rifugio. Per ora è un po' vuoto, ma diventerà la casa di tanti animali." },
  { who: "mordicchio", text: "Fuori dalla porta c'è un sentiero con trenta tappe. In ognuna c'è un animale che ha bisogno di una mano." },
  { who: "mordicchio", text: "Ogni amico che aiuti verrà a vivere qui. Tu arredi la casa come vuoi e scopri che cosa piace a ognuno." },
  { who: "mordicchio", text: "Per muoverti trascina il dito sullo schermo. Io ti seguo, come quando usciamo col guinzaglio." },
  { who: "mordicchio", text: "Quando sei pronta, esci dalla porta in basso." },
];

// --- Le tappe ---------------------------------------------------------
// Legenda mappa:
//  ~ acqua   . prato   T albero   M melo   a alberello   b cespuglio   B cespuglio di more
//  f fiori   u funghi   r sasso   R regalo nascosto   x tronco   n ninfea (sull'acqua)
//  P partenza   A animale   O oggetti della missione   s seme   H cuoricino segreto
//  E uscita (appare quando l'animale è salvo)
//  K chiave   F recinto   G cancello   h cespuglio-nascondiglio   D destinazione (seguimi)
//
// Tipi di missione: trova_e_porta | raccogli_n | chiave_cancello | nascondino | seguimi
const LIVELLI = [
  {
    id: 1, nome: "Il prato", animale: "pisolo",
    missione: { tipo: "trova_e_porta", oggetto: "more", nomeOggetto: "More", frame: "more" },
    regalo: "bastoncino", premio: "cuccia",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~....~~~~~~~~~~....~~~",
      "~~.....f..~~~~~...u...~~",
      "~~..T....s.~~~..T...B.~~",
      "~~.....f.......O.....~~~",
      "~~.f.....T.......f..s.~~",
      "~~...H.........f......~~",
      "~~~.....r.....T...a...~~",
      "~~~~....f..........~~~~~",
      "~~~~~.....~~~~.....~~~~~",
      "~~~~.....~~~~~~.....~~~~",
      "~~~..T...~~n~~~..f...~~~",
      "~~...f....~~~~..M..R..~~",
      "~~.s.......~~.........~~",
      "~~....a.......f..T..s.~~",
      "~~..f....u..........f.~~",
      "~~~.....q....f.....~~~~~",
      "~~~~.T.....f......~~~~~~",
      "~~~~.........T....~~~~~~",
      "~~~~~..A.b.......~~~~~~~",
      "~~~~~...f....s..~~~~~~~~",
      "~~~~~~........~~~~~~~~~~",
      "~~~~~~~..P.E.~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "mordicchio", text: "Prima tappa: il prato. Senti anche tu questo profumo d'erba?" },
        { who: "mordicchio", text: "C'è qualcuno che tira su col naso, laggiù vicino ai cespugli. Andiamo a vedere." },
      ],
      incontro: [
        { who: "pisolo", text: "Oh... ciao... scusa, mi ero nascosto." },
        { who: "pisolo", text: "Ho tanta fame, ma là fuori è tutto grande e io sono così piccolo." },
        { who: "pisolo", text: "Ho visto delle more lassù in alto, vicino a un cespuglio. Potresti portarmene un po'?" },
        { who: "mordicchio", text: "Ci pensiamo noi, Pisolo. Tu resta qui al riparo." },
      ],
      attesa: "Le more sono lassù in alto, a destra. Io ti aspetto qui, va bene?",
      salvato: [
        { who: "pisolo", text: "More! Sono per me? Grazie..." },
        { who: "pisolo", text: "Posso venire con voi? Prometto che faccio pochissimo rumore." },
        { who: "mordicchio", text: "Certo che puoi. Al rifugio c'è posto per tutti." },
      ],
      fine: [{ who: "mordicchio", text: "Pisolo è con noi. Il cartello di legno vicino a dove siamo arrivati adesso indica la strada di casa." }],
    },
    indizi: {
      animale: "Sento qualcuno tirare su col naso. Viene da un cespuglio, laggiù in basso.",
      oggetto: "Le more sono in alto a destra. Fidati del mio naso.",
      consegna: "Pisolo ti aspetta. Portagli le more.",
      uscita: "Il cartello di casa è vicino al punto da cui siamo partiti.",
    },
  },
  {
    id: 2, nome: "Il frutteto", animale: "ciuffo",
    missione: { tipo: "raccogli_n", oggetto: "carota", nomeOggetto: "Carote", tex: "carota" },
    regalo: "insalata", premio: "tappetino_rosa",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~......~~~~~.....~~~~",
      "~~~..O.M....~~...M..O.~~",
      "~~.....f..s.....f.....~~",
      "~~..M......M.....u..M.~~",
      "~~.f....O......~~.....~~",
      "~~~.......f...~~~~.H..~~",
      "~~~~..M....~~~~~~....~~~",
      "~~~~~.....~~~~~~~.M.~~~~",
      "~~~~~.....~~~~~~~...~~~~",
      "~~~~...s...~~~~~..O..~~~",
      "~~~..f....M....f.....~~~",
      "~~..M.........A....s..~~",
      "~~.....R..f.......M...~~",
      "~~~..s.......u....f..~~~",
      "~~~~.....M.......O..~~~~",
      "~~~~~~......f....~~~~~~~",
      "~~~~~~~...P.E..~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Il frutteto! Qui gli alberi sono pieni di mele. Ma c'è anche un ciuffo di orecchie che si muove..." }],
      incontro: [
        { who: "ciuffo", text: "Ciao! Sono Ciuffo! Ho seminato le mie carote qua e là e adesso non le trovo più!" },
        { who: "ciuffo", text: "Erano cinque. Me le aiuti a cercare? Io intanto controllo qui... e qui... e anche qui!" },
        { who: "mordicchio", text: "Cinque carote sparse nel frutteto. Le guardo io le spalle, tu cerca." },
      ],
      attesa: "Ne mancano ancora! Sono sparse per tutto il frutteto.",
      salvato: [
        { who: "ciuffo", text: "Tutte e cinque! Sei bravissima!" },
        { who: "ciuffo", text: "Sai cosa? Vengo a stare da voi. Così esploro una casa nuova!" },
      ],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è comparso vicino all'ingresso del frutteto. Andiamo?" }],
    },
    indizi: {
      animale: "Ho visto delle orecchie lunghe muoversi in mezzo al frutteto.",
      oggetto: "Le carote sono sparse dappertutto. Prova lassù in alto, e a destra vicino all'acqua.",
      consegna: "Hai tutte le carote: portale a Ciuffo.",
      uscita: "Il cartello di casa è vicino all'entrata.",
    },
  },
  {
    id: 3, nome: "Il vecchio recinto", animale: "pina",
    missione: { tipo: "chiave_cancello" },
    regalo: "gomitolo", premio: "fiore_vaso",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~.......~~~~~......~~~",
      "~~...T..f...~~~..T.K..~~",
      "~~.f.........~.......~~~",
      "~~....FFFFFF.......f..~~",
      "~~..s.F....F..a.......~~",
      "~~....F.A..F.....T...~~~",
      "~~..T.F....F..f.....~~~~",
      "~~....FFGFFF.......s.~~~",
      "~~~..........u........~~",
      "~~~~..f.....T....f....~~",
      "~~~~~.........R......~~~",
      "~~~~~~..s..H.....T..~~~~",
      "~~~~~~~...........~~~~~~",
      "~~~~~~~~..P.E...~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Un vecchio recinto chiuso. Dentro c'è qualcuno che chioccia piano piano." }],
      incontro: [
        { who: "pina", text: "Coccodè... ciao. Mi chiamo Pina. Mi hanno lasciata qui dentro tanto tempo fa." },
        { who: "pina", text: "Il cancello è chiuso a chiave. La chiave l'hanno appesa da qualche parte, lontano." },
        { who: "mordicchio", text: "La troviamo noi, Pina. Ti apriamo noi quel cancello." },
      ],
      attesa: "La chiave è lontana, verso l'acqua in alto a destra... Coccodè.",
      salvato: [
        { who: "pina", text: "Il cancello è aperto... Posso uscire davvero?" },
        { who: "pina", text: "Vorrei vedere un posto dove nessuno chiude più i cancelli. Mi porti al rifugio?" },
      ],
      fine: [{ who: "mordicchio", text: "Pina è libera. Il cartello di casa ci aspetta vicino all'arrivo." }],
    },
    indizi: {
      animale: "Senti quel chiocciare? Viene dal recinto in alto a sinistra.",
      oggetto: "La chiave è in alto a destra, vicino all'acqua.",
      consegna: "Hai la chiave! Il cancello è sul lato basso del recinto.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },
  {
    id: 4, nome: "Il bosco", animale: "ghianda",
    missione: { tipo: "nascondino" },
    regalo: "cuscino", premio: "poltroncina",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~..T....T~~~~T...T.~~~",
      "~~.h....u.....~...h...~~",
      "~~..T..T...f....T.....~~",
      "~~.....s.....T.....T..~~",
      "~~.T.....T........u...~~",
      "~~~...f.....h...T....~~~",
      "~~~~.T...........s..~~~~",
      "~~~...........T.....~~~~",
      "~~..T...R..T......T..~~~",
      "~~...........f.......~~~",
      "~~.u..T..H......T..h..~~",
      "~~~.......s...........~~",
      "~~~~..T.......T....~~~~~",
      "~~~~~~.....f.....~~~~~~~",
      "~~~~~~~~..P.E..~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "Una vocina dal bosco: «Scommetto che non mi trovi! Sono nascosto in uno dei cespugli!»" },
        { who: "mordicchio", text: "Uno scoiattolo che vuole giocare a nascondino. Controlliamo i cespugli uno per uno." },
      ],
      incontro: [
        { who: "ghianda", text: "Nooo, mi hai trovato! Sono Ghianda. Sei bravissima a nascondino." },
        { who: "ghianda", text: "In questo bosco non c'è nessuno con cui giocare. Posso venire a casa tua? Prometto di non nascondere troppe cose." },
        { who: "mordicchio", text: "Dice «troppe». Teniamolo d'occhio." },
      ],
      sbagliato: ["Qui non c'è.", "Niente, solo foglie.", "Un cespuglio vuoto. Ritenta!"],
      fine: [{ who: "mordicchio", text: "Ghianda viene con noi. Il cartello di casa è vicino all'ingresso del bosco." }],
    },
    indizi: {
      animale: "Annuso, annuso... L'odore di scoiattolo è più forte di là.",
      uscita: "Il cartello di casa è vicino all'ingresso del bosco.",
    },
  },
  {
    id: 5, nome: "Il ruscello", animale: "paperotto", ospite: "gaia",
    missione: { tipo: "seguimi" },
    regalo: "fiori", premio: "lampada_rosa",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~......~~~~~~..D...~~",
      "~~~..f..s..~~~~...f...~~",
      "~~...T......~~n~~...T.~~",
      "~~.......u...~~~~.....~~",
      "~~~..R...........s...~~~",
      "~~~~.....f..T........~~~",
      "~~~~~~~~.......~~~~~~~~~",
      "~~~n~~~~~.....~~~~~n~~~~",
      "~~~~~~~~...f...~~~~~~~~~",
      "~~~~.....T.....H...~~~~~",
      "~~~..s.........~~...~~~~",
      "~~..T....f..A......T.~~~",
      "~~~.......s.....f...~~~~",
      "~~~~~~..P.E.....~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Il ruscello. Sento un cip-cip disperato poco più avanti." }],
      incontro: [
        { who: "paperotto", text: "Cip! Ho perso la mamma! Si chiama Gaia ed è bianca bianca!" },
        { who: "paperotto", text: "L'ultima volta l'ho vista in alto, dall'altra parte dell'acqua. Mi porti da lei? Ti seguo!" },
        { who: "mordicchio", text: "Cammina piano, Anastasia: le zampette sono corte." },
      ],
      salvato: [
        { who: "gaia", text: "Paperotto! Eccoti, finalmente!" },
        { who: "gaia", text: "Grazie, Anastasia. Questo ruscello è diventato troppo rumoroso per noi." },
        { who: "gaia", text: "Se ci fate posto, veniamo a stare al rifugio tutti e due." },
      ],
      fine: [{ who: "mordicchio", text: "Due nuove amiche, anzi una mamma e un figlio. Il cartello di casa ci aspetta in basso." }],
    },
    indizi: {
      animale: "Il cip-cip viene da poco più su, vicino all'albero.",
      consegna: "La mamma è in alto a destra, oltre l'acqua. Passa dal ponte d'erba al centro.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },

  {
    id: 6, nome: "Il cortile di casa", animale: "thiago",
    missione: { tipo: "trova_e_porta", oggetto: "cuscino", nomeOggetto: "Cuscino", tex: "cuscino" },
    regalo: "campanellino", premio: "quadro_notte",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~.....~~~~~~.....~~~~",
      "~~~..f..T..~~~..O..T.~~~",
      "~~..T.....s......f...~~~",
      "~~.....u.....T.......~~~",
      "~~.f......f......s..~~~~",
      "~~~...T.......f.....~~~~",
      "~~~~.......~~~~...T..~~~",
      "~~~~..s...~~~~~~.....~~~",
      "~~~...T...~~n~~~..f..~~~",
      "~~..........~~...H...~~~",
      "~~..f..A........T...~~~~",
      "~~~......b..s.......~~~~",
      "~~~~~.......f..R..~~~~~~",
      "~~~~~~~..P.E....~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Questo cortile profuma di casa. C'è un gatto grigio che ti guarda come se ti conoscesse da sempre." }],
      incontro: [
        { who: "thiago", text: "Anastasia! Sei proprio tu. Ti conosco da quando eri piccola così." },
        { who: "thiago", text: "Da bambina mi portavi sempre in braccio. Io facevo finta di protestare, ma mi piaceva." },
        { who: "thiago", text: "Ho perso il mio cuscino, quello su cui dormivo al sole. Mi aiuti a ritrovarlo?" },
        { who: "mordicchio", text: "Un gatto che ti conosce da prima di me. Va bene, lo ammetto: mi è già simpatico." },
      ],
      attesa: "Il cuscino dev'essere finito in alto a destra, dove batte il sole.",
      salvato: [
        { who: "thiago", text: "Il mio cuscino! Ha ancora il profumo di casa." },
        { who: "thiago", text: "Vengo con te. Voglio vedere dove vivi adesso e chi si prende cura di te." },
        { who: "mordicchio", text: "Io, naturalmente. Ma al rifugio c'è posto anche per te." },
      ],
      fine: [{ who: "mordicchio", text: "Thiago viene con noi. Il cartello di casa è vicino a dove siamo arrivati." }],
    },
    indizi: {
      animale: "Il gatto grigio è in basso a sinistra, vicino al cespuglio.",
      oggetto: "Il cuscino è in alto a destra, al sole.",
      consegna: "Riporta il cuscino a Thiago.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },
  {
    id: 7, nome: "Il parcheggio all'alba", animale: "mitty", atmosfera: "alba",
    testoArrivo: "Mitty viene al rifugio. Poi lo aspettano Luigi e Licia",
    missione: { tipo: "nascondino", nascondiglio: "auto" },
    regalo: "cuscino", premio: "tappeto_azzurro",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~......~~~~~.......~~~",
      "~~..h....s.......h....~~",
      "~~.....f.....T........~~",
      "~~.T.........h.....s..~~",
      "~~~.....u.........T..~~~",
      "~~~~..h.....f........~~~",
      "~~~...........R..h...~~~",
      "~~..T.....H.......f..~~~",
      "~~~.....s.....T......~~~",
      "~~~~~.....f.......~~~~~~",
      "~~~~~~~..P.E....~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "È appena l'alba. Da una delle auto parcheggiate arriva un miagolio sottilissimo." },
        { who: "mordicchio", text: "C'è un gattino nascosto in un motore. Controlliamo le auto una per una, piano piano." },
      ],
      incontro: [
        { who: "mitty", text: "Miu... non mi fate male, vero?" },
        { who: "mordicchio", text: "Nessuno ti fa male, piccolo. Lei sa come si fa: con calma, una coperta e tanta pazienza." },
        { who: "mitty", text: "Vicino a voi fa caldo... Posso venire? Non so dove andare." },
        { who: "mordicchio", text: "Conosco due persone gentili, Luigi e Licia, con una casa e un giardino. Intanto vieni al rifugio con noi." },
      ],
      sbagliato: ["In questo motore non c'è nessuno.", "Solo un po' di polvere.", "Niente. Il miagolio viene da un'altra auto."],
      fine: [{ who: "mordicchio", text: "Mitty è al sicuro. Il cartello di casa ci aspetta vicino all'ingresso del parcheggio." }],
    },
    indizi: {
      animale: "Il miagolio viene da un'auto... annuso di là.",
      uscita: "Il cartello di casa è vicino all'ingresso del parcheggio.",
    },
  },
  {
    id: 8, nome: "Il giardino di Luigi", animale: "mino",
    testoArrivo: "Mino passerà spesso a trovarti al rifugio",
    missione: { tipo: "trova_e_porta", oggetto: "ciotola", nomeOggetto: "Ciotola", tex: "ciotola" },
    regalo: "fiori", premio: "girasole_vaso",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~.......~~~~~~~~~~~~",
      "~~~...f..g..f.~~~...~~~~",
      "~~..g.....s....~~..O.~~~",
      "~~.....T.....f.....T.~~~",
      "~~.f.......f.....s...~~~",
      "~~~..M.........f.....~~~",
      "~~~~....f..A......M..~~~",
      "~~~.............f....~~~",
      "~~..s..T....u.......~~~~",
      "~~.....f.......R..T.~~~~",
      "~~~~....H....f.....~~~~~",
      "~~~~~~...P.E...s.~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Il giardino di Luigi. C'è un gatto tigrato dal pelo lungo che fa la guardia vicino al melo." }],
      incontro: [
        { who: "mino", text: "Io non sono di nessuno. Vivo qui perché l'ho deciso io." },
        { who: "mino", text: "Però il signore di questa casa ogni giorno mi riempie la ciotola. E stanotte il vento me l'ha portata via." },
        { who: "mino", text: "Me la riporti? Non dire a nessuno che te l'ho chiesto." },
        { who: "mordicchio", text: "Un randagio orgoglioso. Lo capisco benissimo." },
      ],
      attesa: "La ciotola è rotolata in alto a destra, oltre l'acqua. Io resto qui a fare la guardia.",
      salvato: [
        { who: "mino", text: "La mia ciotola! Adesso posso tornare a mangiare. È la cosa che mi riesce meglio." },
        { who: "mino", text: "Il signore con la ciotola è tuo papà, vero? Gli somigli: anche tu non ti arrendi." },
        { who: "mino", text: "Ogni tanto passerò dal tuo rifugio. Ogni tanto, eh." },
      ],
      fine: [{ who: "mordicchio", text: "Mino ci accompagna fino al cartello di casa. Torniamo a casa." }],
    },
    indizi: {
      animale: "Il gatto dal pelo lungo è al centro del giardino.",
      oggetto: "La ciotola è in alto a destra, oltre l'acqua. Gira dal lato destro.",
      consegna: "Riporta la ciotola a Mino.",
      uscita: "Il cartello di casa è vicino al cancello del giardino.",
    },
  },
  {
    id: 9, nome: "Il giardino di Eloisa e Michael", animale: "max",
    testoArrivo: "Max verrà spesso a giocare al rifugio. Mordicchio fa finta di niente",
    missione: { tipo: "raccogli_n", oggetto: "gomitolo", nomeOggetto: "Gomitoli", tex: "gomitolo" },
    regalo: "cuscino", premio: "cassettiera",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~......~~~~~......~~~",
      "~~~..O..f..~~~..O..T.~~~",
      "~~..T.....s......f...~~~",
      "~~.....u.....T....O..~~~",
      "~~.f......f..........~~~",
      "~~~..O.T.......f.....~~~",
      "~~~~.......~~~~...T..~~~",
      "~~~~..s...~~~~~~..R..~~~",
      "~~~...T...~~n~~~.....~~~",
      "~~..........~~...H...~~~",
      "~~..f..A........T...~~~~",
      "~~~......f..s.......~~~~",
      "~~~~~.......f.....~~~~~~",
      "~~~~~~~..P.E....~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Questo giardino... sento odore di un altro gatto. Uno con tantissimo pelo." }],
      incontro: [
        { who: "max", text: "Ciao! Io sono Max! Giochi con me? Ti prego, ti prego!" },
        { who: "max", text: "Avevo quattro gomitoli e li ho lanciati tutti in giro. Adesso non li trovo più!" },
        { who: "mordicchio", text: "Fffff!" },
        { who: "max", text: "Il tuo gatto mi ha soffiato! Secondo me vuol dire che gli sto simpatico." },
        { who: "mordicchio", text: "No. Vuol dire no. Però va bene, cerchiamo questi gomitoli." },
      ],
      attesa: "Ne mancano ancora! Uno l'ho lanciato lontanissimo, dall'altra parte dell'acqua!",
      salvato: [
        { who: "max", text: "Tutti e quattro! Sei bravissima!" },
        { who: "max", text: "Posso venire a giocare al rifugio? Prometto che non salto addosso a Mordicchio. Quasi mai." },
        { who: "mordicchio", text: "Può venire. Ma il posto tra le tue gambe resta mio." },
      ],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino a dove siamo arrivati. Sì, Max, puoi camminare dietro di me. Dietro." }],
    },
    indizi: {
      animale: "Il gatto peloso è in basso a sinistra. Lo sento fare le fusa da qui.",
      oggetto: "I gomitoli sono sparsi verso l'alto. Uno è oltre l'acqua, a destra.",
      consegna: "Hai tutti i gomitoli: portali a Max.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },
  {
    id: 10, nome: "La notte del miagolio", animale: "mordicchio", atmosfera: "notte",
    testoArrivo: "Mordicchio è di nuovo a casa, con te",
    missione: { tipo: "ritrova" },
    regalo: "pallina", premio: "lampada_azzurra",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~......~~~~~......~~",
      "~~~..T..u...~~~..A..T.~~",
      "~~..f....T......T.....~~",
      "~~.T...s....T.....f..~~~",
      "~~....T...f....T....s~~~",
      "~~~.....T.....R.....~~~~",
      "~~~~.T......T.....T.~~~~",
      "~~~...f..T.....~~~~~~~~~",
      "~~..T.....s..T..~~~~~~~~",
      "~~.....T.....H...~~~~~~~",
      "~~~..f....T.......T.~~~~",
      "~~~~.......u.......~~~~~",
      "~~~~~~...P.E....~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "Sono le due di notte. Mordicchio non è tornato a casa." },
        { who: "anastasia", text: "Mordicchio? Mordicchio! ...Prendo la torcia ed esco a cercarlo." },
      ],
      incontro: [
        { who: "mordicchio", text: "Sei venuta a cercarmi... alle due di notte." },
        { who: "mordicchio", text: "Stavo inseguendo una cosa che rimbalzava e non ho più trovato la strada." },
        { who: "mordicchio", text: "Lo sapevo che saresti arrivata. Tu arrivi sempre." },
        { who: "anastasia", text: "Andiamo a casa, Mordicchio." },
      ],
      fine: [{ who: "mordicchio", text: "Stanotte dormo tra le tue gambe. Più vicino del solito, se non ti dispiace." }],
    },
    indizi: {
      animale: "Il miagolio arriva da lassù, in alto a destra. Mordicchio, arrivo!",
      uscita: "Il cartello di casa per tornare a casa è dove siamo partiti.",
    },
  },
];

// Dopo il ritorno da una tappa, Mordicchio commenta nel rifugio
const DOPO_LIVELLO = {
  1: [
    { who: "mordicchio", text: "Pisolo si è già scelto un angolo. I ricci fanno così." },
    { who: "mordicchio", text: "E hai trovato un bastoncino! Lanciamelo: toccami e scegli «Lancia il bastoncino»." },
    { who: "mordicchio", text: "Ti hanno anche regalato una cuccia di vimini. Dal Diario, con «Arreda», la metti dove vuoi." },
    { who: "mordicchio", text: "Ogni animale ha i suoi gusti. Ascolta cosa dicono, poi prova a fare un regalo. Toccali e vedi." },
  ],
  2: [
    { who: "mordicchio", text: "Ciuffo ha già fatto il giro del giardino tre volte. Tre. Tre." },
    { who: "mordicchio", text: "Con i semi che raccogli puoi comprare regali e mobili alla bancarella, in giardino." },
  ],
  3: [{ who: "mordicchio", text: "Pina si è messa vicino alla finestra. Dice che vuole vedere il cielo." }],
  4: [{ who: "mordicchio", text: "Ghianda ha già nascosto qualcosa. Non so cosa, ma lo sento." }],
  5: [{ who: "mordicchio", text: "Gaia e Paperotto sono arrivati. La casa comincia a riempirsi." }],
  6: [{ who: "mordicchio", text: "Thiago si è già messo al sole sotto la finestra. Sembra che abiti qui da sempre." }],
  7: [{ who: "mordicchio", text: "Mitty si è infilato sotto la cuccia. Lasciamogli il tempo di fidarsi." }],
  9: [{ who: "mordicchio", text: "Max è qui. Io gli ho soffiato, lui mi ha fatto le fusa. Non ci capiamo." }],
  10: [
    { who: "mordicchio", text: "Grazie per essere venuta a cercarmi. Alle due di notte, con la torcia." },
    { who: "mordicchio", text: "Hai trovato anche la mia pallina. Adesso la sai la cosa che mi piace più di tutte." },
  ],
  8: [{ who: "mordicchio", text: "Mino è entrato, ha controllato tutto ed è uscito. Poi è rientrato. Gli piace." }],
};

const NOMI_CAPITOLI = [
  { da: 1,  a: 10, nome: "Prato e bosco" },
  { da: 11, a: 20, nome: "Torrente e alpeggio" },
  { da: 21, a: 30, nome: "Paese e ritorno" },
];

// =====================================================================
//  RISCRITTURA: dialoghi più naturali (sostituiscono quelli sopra)
// =====================================================================
INTRO.splice(0, INTRO.length,
  { who: "mordicchio", text: "Eccoti, finalmente. Ti stavo aspettando." },
  { who: "mordicchio", text: "Questo è il nostro rifugio. Per ora è un po' vuoto, lo so." },
  { who: "mordicchio", text: "Là fuori c'è un sentiero lungo trenta tappe. In ognuna c'è un animale che ha bisogno di qualcuno." },
  { who: "mordicchio", text: "E tu in questo sei brava. Lo sei sempre stata." },
  { who: "mordicchio", text: "Ogni amico che aiuti può venire a stare qui. Tu sistemi la casa come ti piace e scopri cosa piace a ciascuno." },
  { who: "mordicchio", text: "Per camminare trascina il dito sullo schermo. Io ti sto dietro, come quando usciamo col guinzaglio." },
  { who: "mordicchio", text: "Quando sei pronta, la porta è in basso." },
);
FRASI_MORDICCHIO_GIRO.splice(0, FRASI_MORDICCHIO_GIRO.length,
  "Mi piace quando usciamo insieme. Anche solo per guardarci intorno.",
  "Mi piace il rumore delle foglie sotto le zampe.",
  "Che silenzio. Si sentono solo i tuoi passi e i miei.",
  "Non sono stanco. Cammino piano per farti compagnia.",
  "Quante cose da annusare. Non so da dove cominciare.",
  "Se ci perdiamo, la colpa è del sentiero. Non mia.",
  "Lo sai che riconosco i tuoi passi anche da lontano?",
  "Ogni volta che troviamo qualcuno, la casa diventa un po' più piena. E più bella.",
  "Al ritorno una grattatina sotto il mento me la sono meritata. Lo dico e basta.",
  "Andiamo piano. Le cose belle si vedono meglio, piano.",
  "Fuori è bello. Ma il mio cuscino mi manca già un pochino.",
  "Senti che profumo d'erba?",
  "Se vedi un bastoncino, prendilo. Poi a casa me lo tiri.",
  "Ti ricordi quando sono arrivato a casa nella gabbietta? Ero piccolissimo.",
  "Vai pure avanti, io ti tengo d'occhio.",
  "Stanotte dormo tra le tue gambe. Come sempre.",
  "Stasera fai la pizza? Io non posso mangiarla, ma il profumo mi piace un sacco.",
  "Tu controlli sempre tutto due volte. Per fortuna.",
  "Sono nato il primo aprile. E no, non sono uno scherzo.",
  "Se vedo un piccione non rispondo di me. Lo so che Danilo gli dà i semini apposta.",
  "Ti ricordi quei ragazzi con le bici che facevano casino? Li hai sgridati per me. Non me lo scordo.",
);
ANIMALI.mordicchio.frasi = {
  0: ["Lo so che non sei tipa da coccole. Però una grattatina sotto il mento ogni tanto...",
      "Tirami il bastoncino, dai.",
      "Il posto più comodo della casa è già mio. Spero non ti dispiaccia."],
  1: ["Da quando sono arrivato nella gabbietta, piccolo piccolo, non ti ho più persa di vista.",
      "Stasera ti aspetto sul letto. Tienimi il posto tra le gambe.",
      "Sono nato il primo aprile. Non è uno scherzo, sono proprio io."],
  2: ["Non mi coccoli tanto, ma mi prendi sempre le cose più buone. Lo so che è il tuo modo di volermi bene.",
      "Quando usciamo col guinzaglio mi sento il gatto più fiero del mondo.",
      "Sullo sfondo del tuo telefono ci sono io. Tante volte. Anche di quando ero piccolo piccolo. Ho visto, sai?"],
  3: ["Ho ancora la pallina con cui giocavo quando sono arrivato. Non la presto a nessuno.",
      "Quando sono arrivato ti preoccupavi tanto per la mia salute. Sto benissimo, sai? Anche grazie a te.",
      "*ti mordicchia piano la mano* Vuol dire grazie."],
};
ANIMALI.ghianda.frasi[0] = ["Ho spostato una pigna. Non ricordo dove l'ho messa.", "Giochiamo a nascondino? Conto io!"];
ANIMALI.mino.indizi = ["Dormo sempre in mezzo ai fiori del giardino. Mi piace il loro profumo.",
                       "I fili del gomitolo mi si impigliano nel pelo lungo. No, grazie."];

const RISCRITTURE = {
  1: {
    arrivo: [
      { who: "mordicchio", text: "Ecco il prato. Senti che profumo?" },
      { who: "mordicchio", text: "Laggiù, vicino ai cespugli, c'è qualcuno che tira su col naso. Andiamo a vedere." },
    ],
    incontro: [
      { who: "pisolo", text: "Oh... ciao. Scusami, mi ero nascosto." },
      { who: "pisolo", text: "È che ho tanta fame, ma qui fuori è tutto così grande..." },
      { who: "pisolo", text: "Lassù, vicino a un cespuglio, ci sono delle more. Me ne porteresti un po'?" },
      { who: "mordicchio", text: "Tranquillo, Pisolo. Ci pensiamo noi. Tu resta al riparo." },
    ],
    attesa: "Le more sono lassù, in alto a destra. Io ti aspetto qui.",
    salvato: [
      { who: "pisolo", text: "Sono per me? Grazie... davvero." },
      { who: "pisolo", text: "Posso venire con voi? Faccio pochissimo rumore, promesso." },
      { who: "mordicchio", text: "Certo. Da noi c'è posto per tutti." },
    ],
    fine: [{ who: "mordicchio", text: "Guarda, il cartello dove siamo arrivati adesso indica la strada di casa." }],
  },
  2: {
    arrivo: [{ who: "mordicchio", text: "Il frutteto. E là in mezzo c'è un paio di orecchie lunghe che non stanno ferme un attimo." }],
    incontro: [
      { who: "ciuffo", text: "Ciao! Io sono Ciuffo. Avevo nascosto cinque carote qua in giro e adesso non le trovo più!" },
      { who: "ciuffo", text: "Mi aiuti? Io resto qui, così almeno non perdo anche me." },
      { who: "mordicchio", text: "Andiamo, io ti vengo dietro. Cinque carote. Facile." },
    ],
    attesa: "Ne mancano ancora! Sono sparse per tutto il frutteto.",
    salvato: [
      { who: "ciuffo", text: "Tutte e cinque! Sei bravissima!" },
      { who: "ciuffo", text: "Senti... posso venire a vivere da voi? Una casa nuova da esplorare!" },
    ],
    fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino all'ingresso del frutteto. Andiamo?" }],
  },
  3: {
    arrivo: [{ who: "mordicchio", text: "Un vecchio recinto chiuso. Dentro c'è qualcuno che chioccia piano piano." }],
    incontro: [
      { who: "pina", text: "Ciao... io sono Pina. Mi hanno chiusa qui tanto tempo fa, e poi non è più venuto nessuno." },
      { who: "pina", text: "Il cancello è chiuso a chiave. La chiave l'hanno lasciata da qualche parte, lontano." },
      { who: "mordicchio", text: "La troviamo, Pina. Te lo apriamo noi quel cancello." },
    ],
    attesa: "La chiave dovrebbe essere verso l'acqua, in alto a destra.",
    salvato: [
      { who: "pina", text: "È aperto... posso uscire davvero?" },
      { who: "pina", text: "Vorrei stare in un posto dove i cancelli restano aperti. Mi porti con te?" },
      { who: "mordicchio", text: "Da noi nessuno chiude più niente, Pina." },
    ],
    fine: [{ who: "mordicchio", text: "Pina è libera. Il cartello di casa è vicino a dove siamo arrivati." }],
  },
  4: {
    arrivo: [
      { who: "narratore", text: "Dal bosco arriva una vocina: «Scommetto che non mi trovi! Sono in uno dei cespugli!»" },
      { who: "mordicchio", text: "Uno scoiattolo che vuole giocare a nascondino. Proviamo i cespugli uno alla volta." },
    ],
    incontro: [
      { who: "ghianda", text: "Nooo, mi hai trovato! Io sono Ghianda. Sei bravissima." },
      { who: "ghianda", text: "Qui nel bosco non ho nessuno con cui giocare. Posso venire a casa tua? Prometto che non nascondo troppe cose." },
      { who: "mordicchio", text: "«Troppe». Lo terremo d'occhio." },
    ],
    sbagliato: ["Qui non c'è.", "Solo foglie.", "Vuoto. Proviamo il prossimo."],
    fine: [{ who: "mordicchio", text: "Ghianda viene con noi. Il cartello di casa è vicino all'ingresso del bosco." }],
  },
  5: {
    arrivo: [{ who: "mordicchio", text: "Senti? C'è un cip-cip disperato poco più avanti." }],
    incontro: [
      { who: "paperotto", text: "Cip! Ho perso la mia mamma! Si chiama Gaia, è tutta bianca!" },
      { who: "paperotto", text: "L'ho vista l'ultima volta di là dall'acqua, in alto. Mi porti da lei? Io ti seguo." },
      { who: "mordicchio", text: "Vai piano, Anastasia. Ha le zampette corte." },
    ],
    salvato: [
      { who: "gaia", text: "Paperotto! Eccoti, finalmente..." },
      { who: "gaia", text: "Grazie, Anastasia. Non so cosa avrei fatto senza di te." },
      { who: "gaia", text: "Questo ruscello ormai è troppo rumoroso per noi. Se avete posto, veniamo con voi." },
    ],
    fine: [{ who: "mordicchio", text: "Una mamma e il suo piccolo, di nuovo insieme. Torniamo a casa." }],
  },
  6: {
    arrivo: [{ who: "mordicchio", text: "Questo cortile profuma di casa. C'è un gatto grigio, laggiù, che ti guarda come se ti conoscesse." }],
    incontro: [
      { who: "thiago", text: "Anastasia... sei proprio tu." },
      { who: "thiago", text: "Ti conosco da quando eri piccola così. Mi portavi in giro in braccio, e io te lo lasciavo fare." },
      { who: "thiago", text: "Ho perso il mio cuscino, quello dove dormivo al sole. Mi aiuti a cercarlo?" },
      { who: "mordicchio", text: "Un gatto che ti conosce da prima di me. Mi sta già simpatico." },
    ],
    attesa: "Il cuscino dev'essere in alto a destra, dove batte il sole.",
    salvato: [
      { who: "thiago", text: "Il mio cuscino. Sa ancora di casa." },
      { who: "thiago", text: "Vorrei venire con te. Voglio vedere dove vivi adesso, e chi si prende cura di te." },
      { who: "mordicchio", text: "Io. Però c'è posto anche per te." },
    ],
    fine: [{ who: "mordicchio", text: "Thiago viene con noi. Il cartello di casa è vicino a dove siamo arrivati." }],
  },
  7: {
    arrivo: [
      { who: "narratore", text: "È appena l'alba. Da una delle auto parcheggiate arriva un miagolio piccolissimo." },
      { who: "mordicchio", text: "C'è un gattino nascosto in un motore. Controlliamo le auto una alla volta. Piano, però." },
    ],
    incontro: [
      { who: "mitty", text: "Miu... non mi fate male, vero?" },
      { who: "mordicchio", text: "No, piccolo. Lei sa come si fa: con calma e tanta pazienza." },
      { who: "mitty", text: "Vicino a voi si sta al caldo... Posso venire? Non so dove andare." },
      { who: "mordicchio", text: "Conosco due persone gentili, Luigi e Licia, con una casa e un giardino. Intanto vieni al rifugio con noi." },
    ],
    fine: [{ who: "mordicchio", text: "Mitty è al sicuro. Il cartello di casa è vicino all'ingresso del parcheggio." }],
  },
  8: {
    arrivo: [{ who: "mordicchio", text: "Il giardino di Luigi. Vicino al melo c'è un gattone tigrato dal pelo lungo." }],
    incontro: [
      { who: "mino", text: "Ciao. Io vivo qui, in giardino. Non sono di nessuno, ma qui sto bene." },
      { who: "mino", text: "Il signore di questa casa mi riempie la ciotola tutti i giorni. Stanotte però il vento me l'ha portata via." },
      { who: "mino", text: "Me la riporteresti? Ho una certa fame." },
      { who: "mordicchio", text: "«Una certa fame», dice. Andiamo, prima che svenga." },
    ],
    attesa: "La ciotola è rotolata in alto a destra, oltre l'acqua. Io ti aspetto qui.",
    salvato: [
      { who: "mino", text: "La mia ciotola! Grazie, grazie." },
      { who: "mino", text: "Il signore della ciotola è il tuo papà, vero? Si vede: anche tu ti prendi cura di tutti." },
      { who: "mino", text: "Ogni tanto passo a trovarti al rifugio. Soprattutto all'ora di pranzo." },
    ],
    fine: [{ who: "mordicchio", text: "Mino ci accompagna fino al cartello di casa. Andiamo." }],
  },
  9: {
    arrivo: [{ who: "mordicchio", text: "Questo giardino ha l'odore di un altro gatto. Uno con tantissimo pelo." }],
    incontro: [
      { who: "max", text: "Ciao! Io sono Max! Giochi con me? Dai, dai!" },
      { who: "max", text: "Avevo quattro gomitoli, li ho lanciati in giro e adesso non li trovo più." },
      { who: "mordicchio", text: "Fffff!" },
      { who: "max", text: "Mi ha soffiato! Secondo me vuol dire che gli sto simpatico." },
      { who: "mordicchio", text: "No. Vuol dire no. Però va bene, aiutiamolo." },
    ],
    attesa: "Ne mancano ancora! Uno l'ho tirato lontanissimo, di là dall'acqua!",
    salvato: [
      { who: "max", text: "Tutti e quattro! Sei bravissima!" },
      { who: "max", text: "Posso venire a giocare al rifugio? Prometto che non salto addosso a Mordicchio. Quasi mai." },
      { who: "mordicchio", text: "Può venire. Ma il posto tra le tue gambe resta mio." },
    ],
    fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino a dove siamo arrivati. Sì, Max, puoi venire anche tu. Dietro di me." }],
  },
  10: {
    arrivo: [
      { who: "narratore", text: "Sono le due di notte. Mordicchio non è ancora tornato." },
      { who: "anastasia", text: "Mordicchio? ...Mordicchio! Prendo la torcia e vado a cercarlo." },
    ],
    incontro: [
      { who: "mordicchio", text: "Sei venuta a cercarmi. Alle due di notte." },
      { who: "mordicchio", text: "Inseguivo una cosa che rimbalzava, e poi non ritrovavo più la strada." },
      { who: "mordicchio", text: "Però lo sapevo che mi avresti trovato. Tu mi trovi sempre." },
      { who: "anastasia", text: "Dai, andiamo a casa." },
    ],
    fine: [{ who: "mordicchio", text: "Stanotte dormo tra le tue gambe. Un po' più vicino del solito, se non ti dispiace." }],
  },
};
LIVELLI.forEach(l => Object.assign(l.dialoghi, RISCRITTURE[l.id] || {}));
Object.assign(DOPO_LIVELLO, {
  1: [
    { who: "mordicchio", text: "Pisolo si è già scelto un angolo. Tipico dei ricci." },
    { who: "mordicchio", text: "E hai trovato un bastoncino! Toccami e scegli «Lancia il bastoncino»: te lo riporto." },
    { who: "mordicchio", text: "Ti hanno regalato anche una cuccia di vimini. Dal Diario, con «Arreda», puoi metterla dove vuoi." },
    { who: "mordicchio", text: "Ogni animale ha i suoi gusti. Ascolta cosa racconta mentre lo accarezzi, poi prova a fargli un regalo." },
  ],
  2: [
    { who: "mordicchio", text: "Ciuffo ha già fatto il giro del giardino tre volte. Tre." },
    { who: "mordicchio", text: "Con i semi che trovi puoi comprare regali e mobili alla bancarella, in giardino." },
  ],
  3: [{ who: "mordicchio", text: "Pina si è messa vicino all'orto. Dice che da lì si vede tutto il cielo." }],
  4: [{ who: "mordicchio", text: "Ghianda ha già nascosto qualcosa. Non so cosa, ma lo scopriremo." }],
  5: [{ who: "mordicchio", text: "Gaia e Paperotto si sono sistemati in giardino. Il rifugio comincia a riempirsi." }],
  6: [{ who: "mordicchio", text: "Thiago si è messo al sole sotto la finestra. Sembra che abiti qui da sempre." }],
  7: [{ who: "mordicchio", text: "Mitty si è nascosto sotto il letto. Diamogli tempo." }],
  8: [{ who: "mordicchio", text: "Mino ha fatto il giro del giardino e poi si è fermato davanti al van. Chissà come mai." }],
  9: [{ who: "mordicchio", text: "Max è arrivato. Io gli ho soffiato, lui mi ha fatto le fusa. Non ci capiamo." }],
  10: [
    { who: "mordicchio", text: "Grazie per essere venuta a cercarmi. Alle due di notte, con la torcia." },
    { who: "mordicchio", text: "E hai ritrovato la mia pallina. Adesso sai qual è la cosa che mi piace di più." },
  ],
});

// =====================================================================
//  CAPITOLO 2 · TORRENTE E ALPEGGIO (la stalla)
// =====================================================================
Object.assign(PERSONAGGI, {
  wilma:      { nome: "Wilma",      tex: "wilma",  frame: 0 },
  margherita: { nome: "Margherita", tex: "mucca",  frame: 0 },
  maky:       { nome: "Maky",       tex: "maky",   frame: 0 },
  birba:      { nome: "Birba",      tex: "birba",  frame: 0 },
  fiocco:     { nome: "Fiocco",     tex: "fiocco", frame: 0 },
});
REGALI.zucca = { nome: "Zucca", tex: "zucca", prezzo: 4, tag: ["cibo", "arancione", "dolce"] };
BOTTEGA.regali.push("zucca");
Object.assign(OGGETTI, {
  fieno:        { nome: "Balla di fieno", tex: "fieno",        tipo: "pavimento", prezzo: 5 },
  abbeveratoio: { nome: "Abbeveratoio",   tex: "abbeveratoio", tipo: "pavimento", prezzo: 8 },
  mangiatoia:   { nome: "Mangiatoia",     tex: "mangiatoia",   tipo: "pavimento", prezzo: 8 },
});
BOTTEGA.arredi.push("fieno", "abbeveratoio", "mangiatoia");
const ARREDO_INIZIALE_STALLA = [
  { id: "mangiatoia",   x: 40,  y: 80 },
  { id: "fieno",        x: 144, y: 88 },
  { id: "abbeveratoio", x: 88,  y: 184 },
  { id: "letto_paglia", x: 136, y: 160 },
  { id: "spazzola",     x: 24,  y: 152 },
  { id: "lanterna",     x: 88,  y: 20 },
];
Object.assign(ANIMALI, {
  wilma: {
    nome: "Wilma", specie: "tacchina", carattere: "Dolce e curiosa", tex: "wilma", walk: [0, 1], idle: 0, stanza: "stalla",
    gusti: { adora: "colorato", gradisce: "bacche", sgradito: "rumoroso" },
    indizi: ["Nel capannone era tutto grigio. Adesso voglio vedere colori, tanti colori.",
             "I rumori forti mi ricordano il capannone. Preferisco il silenzio."],
    frasi: {
      0: ["Ogni mattina apro gli occhi e il cielo è ancora lì. Che meraviglia.", "Cammino piano. Sto ancora imparando a usare tutto questo spazio."],
      1: ["Oggi ho fatto il giro della stalla tre volte. Tutto da sola.", "Margherita dice che russo. Io dico che lei rumina forte."],
      2: ["Prima avevo paura di tutto. Adesso ho paura solo dei temporali.", "Mi piace quando passi a salutarmi. Lo fai sempre."],
      3: ["Grazie per avermi aperto quella porta. Ci penso tutti i giorni.", "*ti appoggia piano la testa sulla mano*"],
    },
  },
  margherita: {
    nome: "Margherita", specie: "mucca", carattere: "Saggia", tex: "mucca", walk: [3, 4], idle: 0, stanza: "stalla",
    gusti: { adora: "verde", gradisce: "frutto", sgradito: "metallo" },
    indizi: ["Niente mi piace come l'erba fresca e verde.",
             "Il metallo freddo addosso? No, grazie. Mi basta sentire il vento."],
    frasi: {
      0: ["Qui si sta bene. Si sente solo il vento.", "Ho trovato il posto più caldo della stalla. Vicino al fieno, ovviamente."],
      1: ["Sai che le mucche hanno le migliori amiche? La mia è Wilma.", "Maky mi ha schizzato di fango. Non me la prendo, è giovane."],
      2: ["Quando ti vedo arrivare mi viene da muggire. È un complimento.", "Le cose belle vanno fatte con calma. Come fai tu quando cucini."],
      3: ["Sei una persona che si prende cura. Si vede subito.", "*ti dà una leccata sulla guancia*"],
    },
  },
  maky: {
    nome: "Maky", specie: "maialina", carattere: "Volubile", tex: "maky", walk: [0, 1], idle: 0, stanza: "stalla",
    gusti: { adora: "arancione", gradisce: "dolce", sgradito: "profumato" },
    indizi: ["Oggi mi piacciono le cose arancioni. Domani chissà. No, scherzo: sempre arancioni.",
             "I fiori profumati mi fanno starnutire. E quando starnutisco schizzo fango ovunque."],
    frasi: {
      0: ["Oggi sono di buon umore. Forse. Chiedimelo dopo.", "Ho trovato una pozzanghera perfetta. Non dirlo a Margherita."],
      1: ["Mi piacciono le carezze dietro le orecchie. E sulla pancia. E... vabbè, dappertutto.", "Lo sapevi che i maiali sono intelligentissimi? Io sì, perché sono intelligentissima."],
      2: ["Ho deciso: sei la mia persona preferita. Per oggi. Scherzo, per sempre.", "Ho sentito parlare di un posto in montagna dove i maiali vivono liberi e felici. Bello, no?"],
      3: ["Quando andrai in un rifugio vero, saluta i maiali da parte mia.", "*si sdraia ai tuoi piedi e chiude gli occhi*"],
    },
  },
  birba: {
    nome: "Birba", specie: "capretta", carattere: "Combinaguai", tex: "birba", walk: [0, 1], idle: 0, stanza: "stalla",
    gusti: { adora: "croccante", gradisce: "verde", sgradito: "morbido" },
    indizi: ["Mi piace tutto quello che fa crunch! Crunch crunch!",
             "I cuscini? Noiosi. Su un cuscino non si salta bene."],
    frasi: {
      0: ["Sono salita su tutto quello che c'è in stalla. Poi sono scesa. Poi sono risalita.", "Giochiamo? Io salto, tu guardi."],
      1: ["Ho insegnato a Ghianda a saltare. Più o meno.", "Margherita dice che sono una peste. Ha ragione."],
      2: ["Oggi mi sono comportata benissimo. Quasi tutto il giorno.", "Quando ci sei tu salto ancora più in alto."],
      3: ["Sei la mia persona preferita del mondo. E ne ho viste tante, da sopra le rocce.", "*ti dà una testatina affettuosa*"],
    },
  },
  fiocco: {
    nome: "Fiocco", specie: "pecora", carattere: "Timido", tex: "fiocco", walk: [0, 1], idle: 0, stanza: "stalla",
    gusti: { adora: "fresco", gradisce: "colorato", sgradito: "rumoroso" },
    indizi: ["Dopo una passeggiata, una bella foglia fresca è tutto quello che voglio.",
             "I rumori forti mi fanno scappare. Anche quelli piccoli e tintinnanti."],
    frasi: {
      0: ["Beee... qui c'è sempre qualcuno vicino. Mi piace.", "La nebbia non mi fa più paura, se ci sei tu."],
      1: ["Wilma e io la sera guardiamo il cielo insieme.", "Ho dormito tra Margherita e il fieno. Caldissimo."],
      2: ["Mi piace quando mi parli piano.", "Oggi ho seguito Birba fino alla porta. Poi sono tornato indietro. Coraggioso, no?"],
      3: ["Non mi perdo più. So sempre dove tornare.", "*ti si appoggia contro le gambe, morbido morbido*"],
    },
  },
});
LIVELLI.push(
  {
    id: 11, nome: "Il capannone", animale: "wilma", apreStalla: true,
    testoArrivo: "Wilma viene a vivere al rifugio, nella nuova stalla",
    missione: { tipo: "chiave_cancello" },
    regalo: "fiori", premio: "letto_rosa",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~.......~~~~~~.....~~",
      "~~~..p..f...~~~~..K.p.~~",
      "~~..WWWWWWWW.~~.......~~",
      "~~..W......W....p...~~~~",
      "~~..W..A...W.......s.~~~",
      "~~..W......W..q......~~~",
      "~~..WWWYWWWW....p...~~~~",
      "~~~.........f.........~~",
      "~~~~..p...s....H...p..~~",
      "~~~~~.......R.......~~~~",
      "~~~~~~...P.E.....~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "Al limite del pascolo c'è un capannone grigio, senza finestre." },
        { who: "mordicchio", text: "Dentro c'è qualcuno. La sento muoversi piano." },
      ],
      incontro: [
        { who: "wilma", text: "C'è qualcuno là fuori?" },
        { who: "wilma", text: "Io sono Wilma. Sono qui dentro da sempre. Non ho mai visto com'è fuori." },
        { who: "wilma", text: "La porta è chiusa a chiave. Ho sentito dire che la chiave è appesa vicino all'acqua, in alto." },
        { who: "mordicchio", text: "Aspettaci, Wilma. Torniamo subito." },
      ],
      attesa: "Siete ancora lì? La chiave dovrebbe essere in alto a destra, vicino all'acqua.",
      salvato: [
        { who: "wilma", text: "Che cos'è quella luce?" },
        { who: "mordicchio", text: "È il sole, Wilma. Vieni, non ti fa male." },
        { who: "wilma", text: "È... bellissimo. Non sapevo che il cielo fosse così grande." },
        { who: "wilma", text: "Posso stare con voi? Non ho un altro posto dove andare." },
        { who: "mordicchio", text: "Adesso ce l'hai." },
      ],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino a dove siamo arrivati. Andiamo a casa, Wilma." }],
    },
    indizi: {
      animale: "Dentro il capannone c'è qualcuno. Avviciniamoci alla porta, in basso.",
      oggetto: "La chiave è appesa in alto a destra, vicino all'acqua.",
      consegna: "Hai la chiave! Il portone è sul lato basso del capannone.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },
  {
    id: 12, nome: "Il pascolo", animale: "margherita", atmosfera: "alpeggio",
    missione: { tipo: "raccogli_n", oggetto: "fieno", nomeOggetto: "Fieno", tex: "fieno" },
    regalo: "insalata", premio: "fieno",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~......~~~~~.......~~~",
      "~~..O..p...~~~..p..O.~~~",
      "~~.p....f......q......~~",
      "~~......s..p.......p..~~",
      "~~~.q......~~~~...O...~~",
      "~~~~...p..~~~~~~.....~~~",
      "~~~...O...~~n~~~..s..~~~",
      "~~..p.....~~~~...f...~~~",
      "~~......A......p.....~~~",
      "~~~.f........H....O..~~~",
      "~~~~..p..R......p..~~~~~",
      "~~~~~~...P.E.....~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "mordicchio", text: "Il pascolo. Che silenzio, qui in alto." },
        { who: "mordicchio", text: "Laggiù c'è una mucca che guarda le montagne." },
      ],
      incontro: [
        { who: "margherita", text: "Buongiorno. Io sono Margherita." },
        { who: "margherita", text: "Il vento di stanotte ha sparso il fieno per tutto il pascolo. Cinque balle, tutte rotolate via." },
        { who: "margherita", text: "Io sono un po' lenta. Mi daresti una mano?" },
        { who: "mordicchio", text: "Volentieri. Tu resta qui a goderti la vista." },
      ],
      attesa: "Ne manca ancora qualcuna. Il vento le ha portate lontano.",
      salvato: [
        { who: "margherita", text: "Grazie, sei gentile." },
        { who: "margherita", text: "Sai, non ho mai avuto un posto tutto mio. Se nella vostra stalla c'è un angolo, mi piacerebbe tanto." },
        { who: "mordicchio", text: "C'è. E c'è anche una tacchina che non smette di guardare il cielo. Andrete d'accordo." },
      ],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino all'inizio del pascolo." }],
    },
    indizi: {
      animale: "La mucca è in basso a sinistra, vicino al pino.",
      oggetto: "Il fieno è sparso dappertutto. Prova in alto e lungo il lato destro.",
      consegna: "Hai tutto il fieno: portalo a Margherita.",
      uscita: "Il cartello di casa è vicino all'inizio del pascolo.",
    },
  },
  {
    id: 13, nome: "Lo stagno di fango", animale: "maky", atmosfera: "alpeggio",
    missione: { tipo: "trova_e_porta", oggetto: "zucca", nomeOggetto: "Zucca", tex: "zucca" },
    regalo: "zucca", premio: "mangiatoia",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~.....~~~~~~~....~~~~",
      "~~~..p.....~~~~...O..~~~",
      "~~..f...p...~~..p....~~~",
      "~~.....s........f..p.~~~",
      "~~.p......p.........~~~~",
      "~~~...~~~~~...p...s.~~~~",
      "~~~..~~nn~~~......~~~~~~",
      "~~~...~~~~~..A...~~~~~~~",
      "~~..p.......f....p..~~~~",
      "~~.....H.....q.......~~~",
      "~~~..f....R.....p...~~~~",
      "~~~~~~...P.E.....~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [{ who: "mordicchio", text: "Senti? Qualcuno si sta rotolando nel fango. E si sta divertendo un sacco." }],
      incontro: [
        { who: "maky", text: "Ehi! Io sono Maky. Sì, sono tutta sporca di fango. È il bello della vita." },
        { who: "maky", text: "Però adesso ho una fame... Vorrei una zucca. Ne ho vista una lassù, in alto a destra." },
        { who: "maky", text: "Anzi no, vorrei una mela. No, no: la zucca. Decisamente la zucca." },
        { who: "mordicchio", text: "Volubile. Mi piace." },
      ],
      attesa: "La zucca! In alto a destra. O era a sinistra? No, destra.",
      salvato: [
        { who: "maky", text: "Una zucca! Proprio quella che volevo. Credo." },
        { who: "maky", text: "Senti, mi sei simpatica. Vengo a vivere da te. In stalla c'è del fango?" },
        { who: "mordicchio", text: "Non ancora. Ma per te ne troviamo un po'." },
      ],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino a dove siamo arrivati. Maky, niente rotolate nel fango lungo la strada." }],
    },
    indizi: {
      animale: "Il rumore di fango viene dal centro, vicino all'acqua.",
      oggetto: "La zucca è in alto a destra. Fidati.",
      consegna: "Porta la zucca a Maky, prima che cambi idea.",
      uscita: "Il cartello di casa è vicino a dove siamo arrivati.",
    },
  },
  {
    id: 14, nome: "Le rocce", animale: "birba", atmosfera: "alpeggio",
    missione: { tipo: "nascondino", nascondiglio: "natura:masso" },
    regalo: "mela", premio: "quadro_rosa",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~......~~~~~......~~~",
      "~~~..h..p...~~~..h..~~~~",
      "~~..p.....s.......p..~~~",
      "~~.....q.....h.......~~~",
      "~~.p........p....q..~~~~",
      "~~~...h.........s...~~~~",
      "~~~~..p....f.....h..~~~~",
      "~~~......R....p.....~~~~",
      "~~..f.....H.......p.~~~~",
      "~~~~~..p.......f..~~~~~~",
      "~~~~~~...P.E.....~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "Tra le rocce si sente un belato, poi una risatina, poi un altro belato." },
        { who: "mordicchio", text: "Una capretta che gioca a nascondersi. Guardiamo dietro le rocce." },
      ],
      incontro: [
        { who: "birba", text: "Mi hai trovata! Io sono Birba." },
        { who: "birba", text: "Salto da una roccia all'altra tutto il giorno, ma da sola è meno divertente." },
        { who: "birba", text: "Nella tua stalla ci sono cose su cui saltare?" },
        { who: "mordicchio", text: "Ci sono le balle di fieno. E Margherita, ma su di lei meglio di no." },
      ],
      sbagliato: ["Dietro questa roccia non c'è nessuno.", "Niente, solo sassi.", "Ho sentito una risatina... ma non da qui."],
      fine: [{ who: "mordicchio", text: "Il cartello di casa è vicino all'ingresso delle rocce." }],
    },
    indizi: {
      animale: "La risatina viene da dietro una roccia... di là.",
      uscita: "Il cartello di casa è vicino all'ingresso delle rocce.",
    },
  },
  {
    id: 15, nome: "La nebbia", animale: "fiocco", atmosfera: "nebbia",
    missione: { tipo: "seguimi", meta: "Cancello" },
    regalo: "cuscino", premio: "orologio",
    mappa: [
      "~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~...D..~~~~",
      "~~~~~~~~~~~~~~.....~~~~~",
      "~~~~.....~~~~~..p..~~~~~",
      "~~~..p....s..~~.....~~~~",
      "~~..p........f.....p~~~~",
      "~~.....q.....p.......~~~",
      "~~~..p......~~~~.s...~~~",
      "~~~~.....~~~~~~~~...~~~~",
      "~~~...R.~~~~~~~~...p.~~~",
      "~~..p....~~~~.....~~~~~~",
      "~~...f...H.......~~~~~~~",
      "~~~....A...p...~~~~~~~~~",
      "~~~~~...P.E..~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
    dialoghi: {
      arrivo: [
        { who: "narratore", text: "Sull'alpeggio è scesa la nebbia. Si vede pochissimo." },
        { who: "mordicchio", text: "Restami vicina. E senti... c'è qualcuno che bela, qui vicino." },
      ],
      incontro: [
        { who: "fiocco", text: "Beee... ciao. Mi sono perso nella nebbia e non trovo più il cancello del recinto." },
        { who: "fiocco", text: "Era in alto, da qualche parte. Mi accompagni? Io ti seguo, ma non andare troppo veloce." },
        { who: "mordicchio", text: "Piano piano. Non ti perdiamo di vista." },
      ],
      salvato: [
        { who: "fiocco", text: "Eccolo, il cancello! Ce l'abbiamo fatta." },
        { who: "fiocco", text: "Però... dall'altra parte non c'è nessuno ad aspettarmi. Posso venire con voi?" },
        { who: "mordicchio", text: "Certo. Nella nostra stalla nessuno resta da solo." },
      ],
      fine: [{ who: "mordicchio", text: "La nebbia si sta alzando. Il cartello di casa è laggiù, dove siamo partiti." }],
    },
    indizi: {
      animale: "Il belato viene da poco più in là, a sinistra.",
      consegna: "Il cancello è in alto a destra. Si passa dal centro, poi a destra.",
      uscita: "Il cartello di casa è dove siamo partiti, in basso.",
    },
  },
);
Object.assign(DOPO_LIVELLO, {
  11: [
    { who: "mordicchio", text: "Per Wilma ci voleva più spazio, così abbiamo aperto la stalla. Ci arrivi dal giardino: è la casetta di legno a destra." },
    { who: "mordicchio", text: "Lei sta ancora guardando il cielo dalla porta. Lasciamola fare." },
  ],
  12: [{ who: "mordicchio", text: "Margherita e Wilma si sono già messe vicine. Lo sapevo." }],
  13: [{ who: "mordicchio", text: "Maky ha già trovato l'unico angolo umido della stalla. Non chiedermi come." }],
  14: [{ who: "mordicchio", text: "Birba è già salita sul tetto della stalla due volte. Ed è qui da cinque minuti." }],
  15: [{ who: "mordicchio", text: "Fiocco si è già sistemato tra Margherita e il fieno. Dice che lì si sente al sicuro." }],
});

// Mordicchio: altri dettagli veri
Object.assign(OGGETTI, {
  torretta:  { nome: "Torretta tiragraffi",   tex: "torretta",  tipo: "pavimento", prezzo: 12 },
  lettuccio: { nome: "Lettuccio da calorifero", tex: "lettuccio", tipo: "pavimento", prezzo: 10 },
});
BOTTEGA.arredi.unshift("torretta", "lettuccio");
// ---- arredi nuovi (7/11) ----
Object.assign(OGGETTI, {
  sgabello:          { nome: "Sgabello",            atlas: "mobili", frame: "sgabello",          tipo: "pavimento" },
  panchetta:         { nome: "Panchetta",           atlas: "mobili", frame: "panchetta",         tipo: "pavimento" },
  sedia2:            { nome: "Sedia imbottita",     atlas: "mobili", frame: "sedia2",            tipo: "pavimento" },
  tappetino_azzurro: { nome: "Tappetino azzurro",   atlas: "mobili", frame: "tappetino_azzurro", tipo: "tappeto" },
  tappeto_verde:     { nome: "Tappeto verde",       atlas: "mobili", frame: "tappeto_verde",     tipo: "tappeto" },
  orologio_grande:   { nome: "Orologio da parete",  atlas: "mobili", frame: "orologio",          tipo: "muro" },
  cuscinone:         { nome: "Cuscinone",           tex: "cuscinone",     tipo: "pavimento" },
  cesta_giochi:      { nome: "Cesta dei giochi",    tex: "cesta_giochi",  tipo: "pavimento" },
  pianta_grande:     { nome: "Pianta grande",       tex: "pianta_grande", tipo: "pavimento" },
  mensola:           { nome: "Mensola coi barattoli", tex: "mensola",     tipo: "muro" },
  lucine:            { nome: "Filo di lucine",      tex: "lucine",        tipo: "muro" },
  libreria:          { nome: "Libreria",            tex: "libreria",      tipo: "pavimento" },
  divanetto:         { nome: "Divanetto",           tex: "divanetto",     tipo: "pavimento" },
  lanterna:          { nome: "Lanterna",            tex: "lanterna",      tipo: "muro",      stanza: "stalla" },
  spazzola:          { nome: "Spazzola grattaschiena", tex: "spazzola",   tipo: "pavimento", stanza: "stalla" },
  letto_paglia:      { nome: "Letto di paglia",     tex: "letto_paglia",  tipo: "pavimento", stanza: "stalla" },
  carriola:          { nome: "Carriola",            tex: "carriola",      tipo: "pavimento", stanza: "stalla" },
});
// all'inizio la casa e la stalla non sono più quasi vuote
ARREDO_INIZIALE.push(
  { id: "poltroncina",   x: 120, y: 72 },
  { id: "pianta_grande", x: 160, y: 64 },
  { id: "cesta_giochi",  x: 136, y: 168 },
  { id: "libreria",      x: 64,  y: 56 },
  { id: "mensola",       x: 104, y: 22 },
  { id: "divanetto",     x: 40,  y: 200 },
  { id: "fiore_vaso",    x: 160, y: 200 },
);

LIVELLI.find(l => l.id === 9).premio = "torretta";
LIVELLI.find(l => l.id === 10).premio = "lettuccio";
ANIMALI.mordicchio.preferiti = ["torretta", "lettuccio"];
ANIMALI.mordicchio.frasi[0].push("Quei piccioni alla finestra mi provocano. Uno di questi giorni...");
ANIMALI.mordicchio.frasi[1].push("Dalla mia torretta vedo tutto. E dormo in alto, come piace a me.");
ANIMALI.mordicchio.frasi[2].push("D'inverno il lettuccio sul calorifero è il posto più bello del mondo. Grazie per avermelo preso.");
ANIMALI.mordicchio.frasi[2].push("Il veterinario viene a casa, così non mi spavento. Lo so che l'hai cercato apposta per me.");
ANIMALI.mordicchio.frasi[3].push("Una volta ti ho sentita dire: «Toccatemi tutto, ma non il mio Mordicchio.» Il MIO Mordicchio. Me lo sono segnato.");
DOPO_LIVELLO[9].push({ who: "mordicchio", text: "E c'è una torretta nuova. Due piani, tutta mia. Mettila vicino alla finestra, per i piccioni." });
DOPO_LIVELLO[10].push({ who: "mordicchio", text: "Hai preso anche il lettuccio da calorifero. Lo sai che d'inverno è il mio posto preferito." });

// --- Pulizie, aspirapolvere e bacini ---
const FRASI_PELI = [
  "Ci sono un po' di peli in giro. Non sono miei. Sono di Max.",
  "Hai visto quanti batuffoli sul pavimento? Li ho messi io, così hai qualcosa da raccogliere.",
  "Ogni pelo che trovi è un regalo. Da parte mia.",
  "Sì, perdo un po' di pelo. Si chiama essere bellissimi.",
];
const FRASI_PELI_TANTI = [
  "Ok, forse i peli sono un po' tanti. Ma ti prego, non quel mostro rumoroso.",
  "La casa è più bianca e nera di me. Quasi.",
  "Sento che stai pensando all'aspirapolvere. Io sto pensando di nascondermi.",
];
const FRASI_ASPIRAPOLVERE = [
  "NO! Il mostro! Io vado. Chiamami quando ha finito.",
  "Perché? Perché proprio quello? Ci vediamo dopo.",
  "Me ne vado in quell'angolo. Per sempre. O almeno cinque minuti.",
  "Quel coso mi odia. E io odio lui. È reciproco.",
];
const FRASI_BACINO = [
  "*ti dà una leccatina sulla guancia, come un bacio*",
  "*leccatina... e poi un morsetto. Delicato. Più o meno.*",
  "*ti mordicchia la guancia* Ehi, mi chiamo Mordicchio per un motivo.",
  "*ti sfiora la guancia col pizzetto e ti dà un bacino*",
];
ANIMALI.mordicchio.frasi[2].push("Quando sono arrivato ti preoccupavi tanto per la mia salute. Sto benissimo, sai? Anche grazie a te.");
ANIMALI.mordicchio.frasi[1].push("Grattami il pizzetto. Lì. Proprio lì. Non smettere.");
ANIMALI.mordicchio.frasi[3].push("Danilo mi porta sempre in braccio fino alla tua guancia. Io ti do un bacino. Ogni tanto anche un morsetto, per tenerti sveglia.");
ANIMALI.mordicchio.frasi[3].push("La pancia no, però. Il pizzetto quanto vuoi, la pancia no.");
ANIMALI.wilma.frasi[3].push("Una volta è venuta a trovarmi una ragazza. Ha ascoltato la mia storia e ha pianto. Poco dopo ha cambiato il suo modo di mangiare, per sempre. Eri tu, vero? L'ho riconosciuta, la tua gentilezza.");
ANIMALI.wilma.frasi[2].push("Lo sai che a volte basta una storia, per far fiorire qualcosa che c'era già?");
