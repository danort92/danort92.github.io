// =====================================================================
//  Casa più arredata (revisione 11/11, su richiesta di Danilo)
//  - cucina: il frigo accanto al piano cottura; la libreria colorata va contro la parete destra, vista di fianco
//  - soggiorno: tv e divano centrati sul tappeto, con un tavolino in mezzo e sopra la piantina
//  - tra cucina e tv: un tavolo grande con le sedie
//  - lato sinistro del soggiorno: due scaffali di libri
//  - appena entrati, a destra della porta: appendiabiti con le giacche e la scarpiera
//  - bagno: WC e bidet
//  Sono arredi fissi (non si spostano con «Arreda»). Anastasia non li attraversa.
// =====================================================================
const MOBILI_CASA = [
  { tex: 'frigo', x: 63, y: 50 },
  { tex: 'tavolo_grande', x: 46, y: 222 },
  { tex: 'scaffale_lato', x: 10, y: 268 },          // di fianco, con il dorso contro la parete sinistra
  { tex: 'scaffale_lato', x: 10, y: 302 },
  { tex: 'tavolino_salotto', x: 48, y: 352, depth: 340 },   // tra tv e divano, sul tappeto (la piantina ci sta sopra)
  { tex: 'appendiabiti', x: 140, y: 392 },          // a destra dell'ingresso, non addosso alla porta
  { tex: 'scarpiera', x: 160, y: 394 },
  { tex: 'wc_giu', x: 128, y: 254 },                // attaccati alla parete in basso del bagno
  { tex: 'bidet_giu', x: 146, y: 254 },
];
(function () {
  // la libreria colorata, se è ancora al suo posto di partenza, va contro la parete destra della cucina
  const migra = S => {
    const casa = a => (a.stanza || 'casa') === 'casa';
    if (!S.libreriaSpostata) {
      (S.arredi || []).forEach(a => { if (a.id === 'libreria' && casa(a) && a.x === 64 && a.y === 56) { a.x = 72; a.y = 88; } });
      S.libreriaSpostata = true;
    }
    // (11/11 sera) la libreria spostata la prima volta (72,88) va attaccata alla parete; tv e divano al centro del tappeto, la piantina sul tavolino
    if (!S.salottoSistemato) {
      const dy = S.casaZone ? 0 : 160;   // prima della casa a 4 stanze la metà bassa è ancora 160 più in su
      (S.arredi || []).forEach(a => {
        if (!casa(a)) return;
        if (a.id === 'tv' && a.x === 40 && a.y === 326 - dy) a.x = 48;
        if (a.id === 'divanetto' && a.x === 40 && a.y === 360 - dy) { a.x = 48; a.y = 368 - dy; }
        if (a.id === 'fiore_vaso' && a.x === 160 && a.y === 360 - dy) { a.x = 48; a.y = 345 - dy; }
      });
      S.salottoSistemato = true;
    }
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    if (this.stanza === 'casa' && Save.data && Save.data.arredi) migra(Save.data);   // prima di disegnare (e prima dell'intro, che mette Anastasia sul divano)
    const r = crea.apply(this, arguments);
    if (this.stanza !== 'casa' || STANZA.h !== CASA4.h) return r;
    // dopo la sistemazione a 4 stanze (casa4), così vale anche per le partite nuove; i mobili già disegnati si spostano
    if (Save.data) { migra(Save.data); (this.arrediSprites || []).forEach(a => { a.setPosition(a.dati.x, a.dati.y); a.setDepth(this.depthDi ? this.depthDi(a) : a.y); }); }
    // la libreria della cucina, quando è accanto alla parete destra, si vede di fianco e si appoggia al muro (solo il disegno: il posto salvato non cambia)
    (this.arrediSprites || []).forEach(a => { if (a.dati.id === 'libreria' && a.dati.x >= 68 && a.dati.x <= 80 && a.dati.y < 150 && this.textures.exists('scaffale_lato_dx')) { a.setTexture('scaffale_lato_dx'); a.x = 81; a.__latoDx = true; } });
    this.mobiliCasa = MOBILI_CASA.filter(m => this.textures.exists(m.tex)).map(m => {
      const im = this.add.image(m.x, m.y, m.tex).setOrigin(0.5, 1).setDepth(m.depth != null ? m.depth : m.y);
      return { x: m.x - im.width / 2, y: m.y - Math.min(8, im.height / 2), w: im.width, h: Math.min(8, im.height / 2) };   // ingombro alla base
    });
    return r;
  };
  // la libreria vista di fianco si controlla nel suo posto salvato e col disegno normale; se la si sposta torna normale
  const motivo = Rifugio.prototype.motivoNonValido;
  Rifugio.prototype.motivoNonValido = function (s) {
    if (!s || !s.__latoDx) return motivo.call(this, s);
    if (s.x !== 81 || !s.dati) { s.__latoDx = false; s.setTexture('libreria'); return motivo.call(this, s); }
    const x = s.x; s.setTexture('libreria'); s.x = s.dati.x;
    try { return motivo.call(this, s); } finally { s.setTexture('scaffale_lato_dx'); s.x = x; }
  };
  const mv = Rifugio.prototype.movePlayer;
  Rifugio.prototype.movePlayer = function (dt, blocked) {
    if (this.stanza !== 'casa' || !this.mobiliCasa) return mv.call(this, dt, blocked);
    const p = this.player, dentro = (q, x, y) => x > q.x - 2 && x < q.x + q.w + 2 && y > q.y && y < q.y + q.h + 3;
    const giaDentro = this.mobiliCasa.filter(q => dentro(q, p.x, p.y));   // se ci è già dentro (porta, mobile appena messo) può uscire
    return mv.call(this, dt, (x, y) => blocked(x, y) || this.mobiliCasa.some(q => !giaDentro.includes(q) && dentro(q, x, y)));
  };
})();
