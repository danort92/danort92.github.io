// =====================================================================
//  La cucina di casa e il piatto preferito di ogni animale (revisione 11/11)
//  - Ogni animale ha un piatto preferito. Erbivori e onnivori: una ricetta adatta (senza essere fiscali);
//    gatti, Briciola, Ciro e Rossella: le crocchette (si comprano alla bancarella).
//  - Ogni tanto un animale viene col «!» e dice che avrebbe voglia del suo piatto: così lo scopri.
//  - Toccando il bancone della cucina, Anastasia cucina un piatto (con gli ingredienti che ha) e lo tiene in mano.
//  - Toccando un animale col piatto in mano glielo può dare: se è il suo preferito, un cuore; se no, un punto.
//    Due piatti al giorno in tutto (non uno per animale: alle ultime tappe sarebbe solo cucinare). I carnivori non mangiano le ricette, gli erbivori non vogliono le crocchette.
// =====================================================================
const CROCCHETTE = 'crocchette';
// le crocchette si comprano alla bancarella, come gli altri ingredienti (scelta di Danilo, 11/11)
DISPENSA.crocchette = { nome: 'Crocchette', prezzo: 2, da: 0 };
(function () { const ic = iconaCibo; iconaCibo = function (scene, x, y, k) { if (k === CROCCHETTE && scene.textures.exists('crocchette')) return scene.add.image(x, y, 'crocchette'); return ic.apply(this, arguments); }; })();
const CARNIVORI = ['mordicchio', 'thiago', 'mitty', 'mino', 'max', 'briciola', 'ciro', 'rossella'];
const PIATTO_PREFERITO = {
  pisolo: 'macedonia', ciuffo: 'insalata_r', pina: 'zuppa', ghianda: 'macedonia', paperotto: 'popcorn', gaia: 'pasta_fagioli',
  wilma: 'vellutata', margherita: 'ris_spinaci', maky: 'lasagne', birba: 'peperonata', fiocco: 'insalata_r', ombra: 'hummus',
  tempesta: 'macedonia', ottavia: 'carciofi_pat', fragola: 'ins_cetrioli', teodora: 'zucchine_rip', tubino: 'bruschetta',
  hana: 'ris_asparagi', nuvola: 'popcorn', viola: 'vellutata', spillo: 'torta_mele', zip: 'pesto',
};
CARNIVORI.forEach(k => PIATTO_PREFERITO[k] = CROCCHETTE);
const PUNTI_PIATTO = { preferito: PUNTI_CUORE, altro: 1 };
const PIATTI_AL_GIORNO = 2;   // in tutto, non per animale (scelta di Danilo, 11/11)
const BANCONE = { x: 7, y: () => STANZA.muro - 26, w: 44, h: 40 };
const nomePiatto = id => id === CROCCHETTE ? 'Crocchette' : (RICETTE[id] || {}).nome || id;
function piattoPreferitoInfo(k) {
  const id = PIATTO_PREFERITO[k]; if (!id) return null;
  const noti = (Save.data.piattiNoti || {});
  return 'Piatto preferito: ' + (noti[k] ? nomePiatto(id).toLowerCase() : '???');
}
const FRASI_PIATTO = {
  voglia: ['Sai cosa mi andrebbe? {p}. Così, te lo dico.', 'Stanotte ho sognato {p}. Era bellissimo.', 'Se un giorno in cucina ti avanza {p}... io ci sono.'],
  vogliaCrocchette: ['Le crocchette. Quelle buone. Te lo dico e basta.', 'La ciotola mi guarda. Io guardo te. Crocchette?'],
  preferito: ['È il mio piatto preferito! Come facevi a saperlo?', 'Proprio questo! Grazie, grazie!', 'Il mio preferito. Oggi è una giornata bellissima.'],
  altro: ['Buono! Grazie.', 'Non è il mio preferito, ma è buonissimo lo stesso.', 'Grazie! Si sente che l\'hai fatto con amore.'],
  noRicetta: ['Grazie, ma io mangio solo le mie crocchette.', 'Profuma, ma non fa per me. Crocchette, piuttosto.'],
  noCrocchette: ['Crocchette? No, grazie. Quelle sono per i gatti.', 'Mmh, crocchette... le lascio a chi le apprezza.'],
};
(function () {
  // ---- la ciotolina di crocchette (disegnata qui) ----
  const prepara = scena => {
    if (scena.textures.exists('crocchette')) return;
    const g = scena.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x6a2e2a).fillRect(2, 8, 12, 6); g.fillStyle(0xd0453a).fillRect(3, 9, 10, 4); g.fillStyle(0xe8705a).fillRect(3, 9, 10, 1);
    [[4, 6], [6, 5], [8, 6], [10, 5], [5, 7], [7, 7], [9, 7], [11, 7]].forEach(([x, y]) => { g.fillStyle(0x8a5a32).fillRect(x, y, 2, 2); g.fillStyle(0xb47a46).fillRect(x, y, 1, 1); });
    g.generateTexture('crocchette', 16, 16); g.destroy();
  };
  const iconaPiatto = (scena, x, y, id) => id === CROCCHETTE ? scena.add.image(x, y, 'crocchette') : scena.add.image(x, y, 'cibo', id);

  Object.assign(Rifugio.prototype, {
    // ---- il bancone: si sceglie cosa cucinare ----
    // il bancone e il pulsante «Apri la cucina» aprono il libro della cucina sulla scheda «Prepara» (11/11)
    cucinaCasa() {
      if (Save.data.piattoSulTavolo && !Save.data.piattoInMano) return this.riprendiPiatto();
      this.ricettario('prepara');
    },
    listaPrepara(m, sa) {
      const S = Save.data, hud = this.hud;
      const avviso = S.piattoInMano ? 'Hai in mano: ' + nomePiatto(S.piattoInMano) + '. Portalo a qualcuno, poi potrai prepararne un altro.'
        : (S.oggi.piattiDati || 0) >= PIATTI_AL_GIORNO ? 'Per oggi hai già preparato due piatti. Domani si ricomincia!' : null;
      const intro = txt(hud, 0, 0, avviso || 'Due piatti al giorno: preparali e portali agli animali. Se è il loro preferito, ti regalano un cuore.', 11, avviso ? COL.titolo : '#7d6a5c', { wordWrap: { width: UW - 48 }, lineSpacing: 2 });
      sa.inner.add(intro);
      let y = intro.height + 10;
      const ricette = Object.keys(S.ricette || {}).filter(r => RICETTE[r]);
      const voci = [CROCCHETTE].concat(ricette.sort((a, b) => Eco.puoiCucinare(S, b) - Eco.puoiCucinare(S, a)));
      voci.forEach(id => {
        const pronto = id === CROCCHETTE ? (S.ing.crocchette || 0) >= 1 : Eco.puoiCucinare(S, id), si = pronto && !avviso;
        const manca = id === CROCCHETTE ? [] : RICETTE[id].ing.filter((k, i, a) => (S.ing[k] || 0) < a.filter(x => x === k).length);
        const cell = hud.add.container(0, y), h = 44;
        cell.add(hud.add.rectangle(0, 0, UW - 48, h - 4, si ? 0xf0f6dc : 0xfbf4dc).setOrigin(0).setStrokeStyle(2, 0xd79e61));
        cell.add(iconaPiatto(hud, 22, (h - 4) / 2, id).setScale(1.4));
        cell.add(stringi(txt(hud, 44, 5, nomePiatto(id), 12, COL.titolo), UW - 110));
        const det = id === CROCCHETTE ? (pronto ? 'Per gatti, Briciola, Ciro e Rossella. Ne hai ' + S.ing.crocchette + '.' : 'Finite: si comprano alla bancarella.') : pronto ? 'Pronto da cucinare' : 'Manca: ' + [...new Set(manca)].map(nomeIng).join(', ');
        cell.add(txt(hud, 44, 22, det, 10, pronto ? COL.verde : '#9d866f', { wordWrap: { width: UW - 110 } }));
        if (si) {
          const z = hud.add.rectangle(0, 0, UW - 48, h - 4, 0, 0).setOrigin(0).setInteractive();
          z.on('pointerup', () => { if (hud.scrollDragged) return; m.c.destroy(); hud.scroller = null; hud.ctrl.frozen = false; this.cucina(id); });
          cell.add(z);
        }
        sa.inner.add(cell); y += h;
      });
      sa.contentH = y;
    },
    cucina(id) {
      const S = Save.data;
      if (id === CROCCHETTE) { if (!((S.ing.crocchette || 0) >= 1)) return this.hud.toast('Le crocchette sono finite: si comprano alla bancarella.'); S.ing.crocchette--; }
      else if (!Eco.cucina(S, id)) return this.hud.toast('Mancano degli ingredienti.');
      S.piattoInMano = id; Save.write(); Sfx.seme && Sfx.seme();
      const x = BANCONE.x + 22, y = BANCONE.y() + 8;
      for (let i = 0; i < (id === CROCCHETTE ? 0 : 5); i++) {   // un po' di vapore dal fornello (le crocchette non si cuociono)
        const c = this.add.circle(x + (Math.random() - 0.5) * 8, y, 1.5, 0xf3f4e7, 0.8).setDepth(30000);
        this.tweens.add({ targets: c, y: y - 16, alpha: 0, scale: 2, delay: i * 160, duration: 900, onComplete: () => c.destroy() });
      }
      this.mostraPiattoInMano();
      this.hud.toast(id === CROCCHETTE ? 'Crocchette nella ciotola: portale a qualcuno.' : nomePiatto(id) + ': pronto! Portalo a qualcuno.');
    },
    riprendiPiatto() {
      const S = Save.data; if (!S.piattoSulTavolo || S.piattoInMano) return;
      S.piattoInMano = S.piattoSulTavolo; S.piattoSulTavolo = null; Save.write();
      if (this.piattoTavolo) { this.piattoTavolo.destroy(); this.piattoTavolo = null; }
      this.mostraPiattoInMano(); this.hud.toast('Riprendi ' + nomePiatto(S.piattoInMano).toLowerCase() + ' dal tavolo. Portalo a qualcuno!');
    },
    mostraPiattoSulTavolo() {
      if (this.piattoTavolo) { this.piattoTavolo.destroy(); this.piattoTavolo = null; }
      const id = Save.data.piattoSulTavolo; if (!id || this.stanza !== 'casa') return;
      prepara(this); this.piattoTavolo = iconaPiatto(this, 43, 105, id).setScale(0.6).setDepth(119);   // sul tavolino della cucina
    },
    mostraPiattoInMano() {
      if (this.piattoSprite) { this.piattoSprite.destroy(); this.piattoSprite = null; }
      const id = Save.data.piattoInMano; if (!id || !this.player) return;
      prepara(this);
      this.piattoSprite = iconaPiatto(this, this.player.x, this.player.y - 22, id).setScale(0.6).setDepth(20000);
    },
    // ---- dare il piatto ----
    menuPiatto(o) {
      const S = Save.data, hud = this.hud, A = ANIMALI[o.chiave], id = S.piattoInMano;
      o.meta = null; o.coccola = 99; o.anims && o.anims.stop(); o.setFrame(o.idleFrame);
      const m = hud.modal(A.nome, 150, () => { o.coccola = 1; });
      m.c.add(iconaPiatto(hud, 44, m.y + 62, id).setScale(2));
      m.c.add(txt(hud, 72, m.y + 50, 'Hai in mano: ' + nomePiatto(id), 12, COL.testo, { wordWrap: { width: UW - 110 } }));
      const chiudi = () => { m.c.destroy(); hud.scroller = null; hud.ctrl.frozen = false; };
      hud.button(28, m.y + 96, (UW - 64) / 2, 34, 'Daglielo', () => { chiudi(); this.daiPiatto(o); }, { parent: m.c, size: 14 });
      hud.button(36 + (UW - 64) / 2, m.y + 96, (UW - 64) / 2, 34, 'Altro…', () => { chiudi(); this.__menuNormale(o); }, { parent: m.c, size: 14 });
    },
    daiPiatto(o) {
      const S = Save.data, k = o.chiave, id = S.piattoInMano, hud = this.hud; if (!id) return;
      o.coccola = 3; o.setFlipX(this.player.x < o.x);
      if (S.oggi['piatto-' + k]) { hud.bubble(o, 'Oggi ho già mangiato. Domani, magari!', 3000); return; }
      const carn = CARNIVORI.includes(k);
      if (carn && id !== CROCCHETTE) return hud.bubble(o, pick(FRASI_PIATTO.noRicetta), 3200);
      if (!carn && id === CROCCHETTE) return hud.bubble(o, pick(FRASI_PIATTO.noCrocchette), 3200);
      const preferito = PIATTO_PREFERITO[k] === id;
      S.oggi['piatto-' + k] = true; S.oggi.piattiDati = (S.oggi.piattiDati || 0) + 1; S.piattoInMano = null;
      if (preferito) { S.piattiNoti = S.piattiNoti || {}; S.piattiNoti[k] = true; }
      const r = aggiungiCuori(k, preferito ? PUNTI_PIATTO.preferito : PUNTI_PIATTO.altro);
      this.mostraPiattoInMano();
      const piatto = iconaPiatto(this, this.player.x, this.player.y - 22, id).setScale(0.6).setDepth(20000);
      this.tweens.add({ targets: piatto, x: o.x, y: o.y - 6, duration: 400, onComplete: () => this.tweens.add({ targets: piatto, alpha: 0, scale: 0.2, duration: 700, delay: 300, onComplete: () => piatto.destroy() }) });
      this.time.delayedCall(450, () => {
        if (k === 'mordicchio' && Sfx.miao) Sfx.miao(); else Sfx.cuore && Sfx.cuore();
        this.hearts && this.hearts(o.x, o.y - 14); if (preferito) this.time.delayedCall(400, () => this.hearts && this.hearts(o.x, o.y - 18));
        hud.bubble(o, pick(preferito ? FRASI_PIATTO.preferito : FRASI_PIATTO.altro), 3400);
        if (r && r.nuovoCuore) this.time.delayedCall(1200, () => hud.toast(ANIMALI[k].nome + ': un cuore in più!'));
      });
      Save.write();
    },
  });

  // ---- il bancone si tocca ----
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.stanza === 'casa' && this.modo === 'gioca' && x >= BANCONE.x && x <= BANCONE.x + BANCONE.w && y >= BANCONE.y() && y <= BANCONE.y() + BANCONE.h
      && !(this.ospiti || []).some(o => o.visible && Math.abs(o.x - x) < 12 && y < o.y + 4 && y > o.y - 20)) {
      // la muovi tu: il bancone si usa quando Anastasia gli è vicina (in cucina, davanti al bancone)
      const p = this.player;
      if (zonaCasa(p.x, p.y) === 'cucina' && p.y < STANZA.muro + 40 && p.x < BANCONE.x + BANCONE.w + 14) return this.cucinaCasa();
      this.hud.toast('Avvicinati al bancone della cucina.');
      return;
    }
    if (this.stanza === 'casa' && this.modo === 'gioca' && Save.data.piattoSulTavolo && x >= 20 && x <= 66 && y >= 92 && y <= 118) {
      const p = this.player;
      if (zonaCasa(p.x, p.y) === 'cucina') return this.riprendiPiatto();
      this.hud.toast('Avvicinati al tavolo della cucina.'); return;
    }
    return tap.call(this, x, y);
  };
  // ---- prima di dare il piatto, Anastasia si avvicina (come per carezze e regali) ----
  const dai = Rifugio.prototype.daiPiatto;
  Rifugio.prototype.daiPiatto = function (o) { if (!o || !o.chiave || !o.active || this.verso || !this.avvicinati) return dai.call(this, o); return this.avvicinati(o, () => dai.call(this, o)); };
  // ---- col piatto in mano, toccando un animale si può darglielo ----
  const menu = Rifugio.prototype.menuAnimale;
  Rifugio.prototype.__menuNormale = function (o) { return menu.call(this, o); };
  Rifugio.prototype.menuAnimale = function (o) {
    if (o && !o.notizia && Save.data.piattoInMano && ANIMALI[o.chiave]) return this.menuPiatto(o);
    return menu.call(this, o);
  };
  // ---- il piatto in mano segue Anastasia ----
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.piattoSprite = null; this.piattoTavolo = null; this.__piattoPosato = false; const r = crea.apply(this, arguments); prepara(this); this.mostraPiattoInMano(); this.mostraPiattoSulTavolo();
    // la prima volta in casa, Mordicchio dice che il bancone si può usare
    const S = Save.data;
    if (this.stanza === 'casa' && !(S.consigli && S.consigli.cucina) && (S.completati || []).length >= 2) {
      const prova = (n) => {
        if (!this.sys.isActive() || n > 30) return;
        if (!this.momentoTranquillo || !this.momentoTranquillo() || (this.hud.quieto && this.hud.quieto()) || !this.cat || !this.cat.visible) return this.time.delayedCall(3000, () => prova(n + 1));
        S.consigli = S.consigli || {}; S.consigli.cucina = true; Save.write();
        this.hud.bubble(this.cat, 'Vai al bancone della cucina e toccalo: puoi preparare qualcosa per noi. Io dico solo: crocchette.', 4500);
      };
      this.time.delayedCall(6000, () => prova(0));
    }
    return r;
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (t, d) {
    upd.call(this, t, d);
    if (this.piattoSprite && this.player) this.piattoSprite.setPosition(this.player.x, this.player.y - 22 + Math.sin(t / 250) * 0.8).setVisible(this.player.visible && !this.sdraiata);
  };
  // ---- prima di dormire, il piatto in mano va sul tavolo della cucina (scelta di Danilo, 11/11) ----
  const dormi = Rifugio.prototype.dormi;
  Rifugio.prototype.dormi = function (forzato) {
    const S = Save.data;
    if (!this.dormendo && S.piattoInMano && !this.__piattoPosato) {
      this.__piattoPosato = true;
      const id = S.piattoInMano;
      return this.hud.say([{ who: 'anastasia', text: id === CROCCHETTE ? 'Le crocchette le lascio sul tavolo della cucina. Domattina le porto a qualcuno.' : 'Questo lo appoggio sul tavolo della cucina. Domattina lo porto a qualcuno.' }], () => {
        S.piattoSulTavolo = id; S.piattoInMano = null; Save.write(); this.mostraPiattoInMano(); this.mostraPiattoSulTavolo();
        dormi.call(this, forzato);
      });
    }
    return dormi.apply(this, arguments);
  };
  // ---- la voglia: col «!» un animale dice che piatto gli piacerebbe ----
  const racconta = Rifugio.prototype.raccontaNotizia;
  Rifugio.prototype.raccontaNotizia = function (o) {
    const S = Save.data, k = o && o.chiave, id = PIATTO_PREFERITO[k], noto = (S.piattiNoti || {})[k];
    if (id && (S.oggi.piattiDati || 0) < PIATTI_AL_GIORNO && !S.oggi.voglia && Math.random() < (noto ? 0.2 : 0.45)) {
      this.fineNotizia(o); this.tweens.killTweensOf(o); o.anims.stop(); o.setFrame(o.idleFrame);
      S.oggi.voglia = true; S.piattiNoti = S.piattiNoti || {}; S.piattiNoti[k] = true; Save.write();
      const t = id === CROCCHETTE ? pick(FRASI_PIATTO.vogliaCrocchette) : pick(FRASI_PIATTO.voglia).replace('{p}', '«' + nomePiatto(id) + '»');
      o.coccola = 3; this.hud.say([{ who: k, text: t[0].toUpperCase() + t.slice(1) }]); this.pensiero && this.pensiero(o, 'cuore', true);
      return;
    }
    return racconta.call(this, o);
  };
})();
