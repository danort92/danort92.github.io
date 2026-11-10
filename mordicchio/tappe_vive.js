// =====================================================================
//  Tre tappe meno lineari (revisione 10/11, sera). Un po' più difficili, mai frustranti:
//  niente timer, niente penalità, gli indizi arrivano comunque da soli (dopo 30 s e 75 s).
//  10 · La notte del miagolio: Mordicchio è in uno di tre posti, diverso a ogni partita. Da lontano
//       si sente solo il miagolio e da che parte arriva; nei posti sbagliati c'è un ciuffo di pelo
//       e le impronte che indicano dove andare.
//  20 · Le trappole: cambiano posto a ogni partita e due sono nascoste nell'erba alta. Quando ti
//       avvicini a una nascosta, Fragola (o Mordicchio) ti avverte e la trappola si vede.
//  29 · La fabbrica: il nastro grande davanti all'ultimo reparto è acceso e non si passa.
//       Bisogna trovare la leva (in uno di due reparti) e fermarlo.
// =====================================================================
const POSTI_MORDICCHIO_10 = [{ x: 17, y: 2, dove: 'in alto a destra' }, { x: 7, y: 1, dove: 'in alto a sinistra' }, { x: 3, y: 10, dove: 'a sinistra, in basso' }];
const LEVE_29 = [{ x: 4, y: 2, dove: 'nel primo reparto, in alto a sinistra' }, { x: 12, y: 2, dove: 'nel reparto di mezzo, in alto' }];
const NASTRO_29 = [[18, 6], [19, 6], [14, 5]];
function direzioneA(dx, dy) {
  const v = dy < -24 ? 'in alto' : dy > 24 ? 'in basso' : '', o = dx < -24 ? 'a sinistra' : dx > 24 ? 'a destra' : '';
  return v && o ? v + ' ' + o : (v || o || 'qui vicino');
}
function direzioneDa(dx, dy) {   // «arriva dall'alto, a destra»
  const v = dy < -24 ? 'dall\'alto' : dy > 24 ? 'dal basso' : '', o = dx < -24 ? 'sinistra' : dx > 24 ? 'destra' : '';
  return v && o ? v + ', a ' + o : v ? v : o ? 'da ' + o : 'qui vicino';
}
Object.assign(Livello.prototype, {
  // ---------------- 10 ----------------
  preparaMiagolio() {
    const st = this.st; if (st.giaFatta || this.fatta) return;
    const scelto = Phaser.Utils.Array.GetRandom(POSTI_MORDICCHIO_10), cx = scelto.x * T + 8, cy = scelto.y * T + 14;
    this.animale = { x: cx, y: cy }; this.npc.setPosition(cx, cy).setDepth(cy);
    this.L = Object.assign({}, this.L, { indizi: Object.assign({}, this.L.indizi, { animale: 'Il miagolio arriva da lì, ' + scelto.dove + '. Mordicchio, arrivo!' }) });
    // nei posti sbagliati: un ciuffo di pelo bianco e nero
    this.ciuffi = POSTI_MORDICCHIO_10.filter(p => p !== scelto).map(p => {
      const x = p.x * T + 8, y = p.y * T + 12, g = this.add.graphics({ x, y }).setDepth(y);
      g.fillStyle(0xf4f1ea).fillCircle(0, 0, 2).fillCircle(2, -1, 1.6); g.fillStyle(0x3a3240).fillCircle(1, 1, 1.2);
      // impronte che partono verso il posto giusto
      const ang = Math.atan2(cy - y, cx - x);
      for (let i = 1; i <= 4; i++) { const ix = x + Math.cos(ang) * i * 9 + (i % 2 ? 2 : -2), iy = y + Math.sin(ang) * i * 9; const z = this.add.graphics({ x: ix, y: iy }).setDepth(-12).setAlpha(0.8); z.fillStyle(0x6e6458).fillCircle(0, 0, 1.2).fillCircle(-1.2, -1.6, 0.6).fillCircle(0, -2, 0.6).fillCircle(1.2, -1.6, 0.6); }
      return { x, y, visto: false, verso: direzioneA(cx - x, cy - y) };
    });
    this.prossimoMiao = 0;
  },
  miagolio(time) {
    const st = this.st, p = this.player, n = this.npc, hud = this.hud, d = Math.hypot(n.x - p.x, n.y - p.y);
    (this.ciuffi || []).forEach(c => { if (!c.visto && Math.hypot(c.x - p.x, c.y - p.y) < 20) { c.visto = true; this.progresso(); hud.say([{ who: 'anastasia', text: 'Un ciuffo di pelo bianco e nero... È passato di qui.' }, { who: 'anastasia', text: 'Le impronte vanno ' + c.verso + '. Mordicchio, aspettami!' }]); } });
    if (time > this.prossimoMiao) {
      this.prossimoMiao = time + (d < 100 ? 6000 : 9000); Sfx.miao();
      if (d < 100) hud.bubble(n, 'Miao...', 1800);
      else hud.toast('Un miagolio, ' + (d > 200 ? 'lontano' : 'più vicino') + '... arriva ' + direzioneDa(n.x - p.x, n.y - p.y) + '.');
    }
  },
  // ---------------- 20 ----------------
  preparaTrappole() {
    if (this.fatta || this.st.giaFatta) return;
    const L = this.L, rows = L.mappa, trap = this.items.filter(i => i.tipo === 'oggetto'); if (!trap.length) return;
    const lontano = (x, y) => [this.animale, this.uscita].every(q => q && Math.hypot(q.x - x, q.y - y) > 40);
    const cand = []; rows.forEach((r, y) => [...r].forEach((ch, x) => { if ('.f'.includes(ch) && lontano(x * T + 8, y * T + 14) && !this.blocchi.has(x + ',' + y)) cand.push([x, y]); }));
    Phaser.Utils.Array.Shuffle(cand);
    const scelti = []; for (const c of cand) { if (scelti.every(s => Math.hypot(s[0] - c[0], s[1] - c[1]) > 3)) scelti.push(c); if (scelti.length >= trap.length) break; }
    trap.forEach((it, i) => {
      const c = scelti[i]; if (!c) return;
      const x = c[0] * T + 8, y = c[1] * T + 14; this.tweens.killTweensOf(it);
      it.setPosition(x, y - 2); it.ombra.setPosition(x, y); it.setDepth(y);
      this.tweens.add({ targets: it, y: y - 5, yoyo: true, repeat: -1, duration: 700 + Math.random() * 200, ease: 'Sine.inOut' });
      if (i < 2) {   // nascosta nell'erba alta
        it.nascosta = true; it.setAlpha(0); it.ombra.setAlpha(0);
        const g = this.add.graphics({ x, y }).setDepth(y + 1); it.erba = g;
        for (let k = 0; k < 7; k++) { const gx = -7 + k * 2.3; g.fillStyle(k % 2 ? 0x6f9a5a : 0x5c8a4c, 1).fillTriangle(gx - 1.5, 0, gx + 1.5, 0, gx + (k % 3 - 1), -9 - (k % 3) * 2); }
      }
    });
  },
  avvisoTrappole() {
    const p = this.player;
    this.items.filter(i => i.nascosta).forEach(it => {
      if (Math.hypot(it.x - p.x, it.ombra.y - p.y) > 30) return;
      it.nascosta = false; this.tweens.add({ targets: [it, it.ombra], alpha: 1, duration: 300 });
      if (it.erba) this.tweens.add({ targets: it.erba, alpha: 0.35, duration: 300 });
      const chi = this.npc && this.npc.visible && Math.random() < 0.6 ? this.npc : this.cat;
      this.hud.bubble(chi, chi === this.npc ? 'Attenta! Lì nell\'erba ce n\'è un\'altra!' : 'Fermati! Sento odore di ferro nell\'erba.', 2600);
      Sfx.no && Sfx.no(); this.progresso();
    });
  },
  // ---------------- 29 ----------------
  preparaFabbrica() {
    if (this.fatta || this.st.giaFatta) return;
    const leva = Phaser.Utils.Array.GetRandom(LEVE_29), lx = leva.x * T + 8, ly = leva.y * T + 14;
    this.leva = { x: lx, y: ly, tirata: false, dove: leva.dove };
    const g = this.add.graphics({ x: lx, y: ly }).setDepth(ly); this.levaG = g;
    g.fillStyle(0x4f5a66, 1).fillRect(-5, -6, 10, 6); g.lineStyle(1, 0x2f3540, 1).strokeRect(-5, -6, 10, 6);
    const asta = this.add.rectangle(lx, ly - 9, 2, 9, 0xc3c9d2).setOrigin(0.5, 1).setAngle(-30).setDepth(ly + 0.1); this.levaAsta = asta;
    this.add.circle(lx + Math.sin(-0.52) * 9, ly - 6 - Math.cos(0.52) * 9, 2, 0xd96f6f).setDepth(ly + 0.2).setName('pomello');
    // il nastro acceso: blocca il passaggio
    this.nastroG = NASTRO_29.map(([x, y]) => {
      this.muri.add(x + ',' + y);
      const X = x * T, Y = y * T, g2 = this.add.graphics().setDepth(Y + 16);
      g2.fillStyle(0x3b3546, 1).fillRect(X, Y + 3, 16, 12); g2.fillStyle(0x5a5466, 1).fillRect(X + 1, Y + 5, 14, 8);
      const strisce = this.add.graphics().setDepth(Y + 16.1);
      const disegna = o => { strisce.clear(); for (let i = -1; i < 4; i++) strisce.fillStyle(i % 2 ? 0xf2cf8c : 0x3b3546, 1).fillRect(X + 1 + ((i * 5 + o) % 20 + 20) % 20 - 2, Y + 7, 3, 4); };
      let o = 0; const ev = this.time.addEvent({ delay: 90, loop: true, callback: () => { disegna(o = (o + 1) % 20); } }); disegna(0);
      return { g2, strisce, ev, x, y };
    });
    this.avvisoNastro = false;
  },
  fabbrica() {
    const p = this.player, lv = this.leva, hud = this.hud; if (!lv) return;
    if (!lv.tirata && Math.hypot(lv.x - p.x, lv.y - p.y) < 14) {
      lv.tirata = true; this.tweens.add({ targets: this.levaAsta, angle: 30, duration: 250 });
      const pom = this.children.getByName('pomello'); if (pom) this.tweens.add({ targets: pom, x: lv.x + Math.sin(0.52) * 9, duration: 250 });
      this.nastroG.forEach(n => { n.ev.remove(); this.muri.delete(n.x + ',' + n.y); n.strisce.setAlpha(0.5); });
      Sfx.fanfara && Sfx.fanfara(); hud.toast('Clac! Il nastro grande si è fermato. Adesso si passa.'); this.progresso();
      return;
    }
    // la prima volta che si arriva davanti al nastro acceso
    if (!lv.tirata && !this.avvisoNastro && NASTRO_29.some(([x, y]) => Math.hypot(x * T + 8 - p.x, y * T + 14 - p.y) < 26)) {
      this.avvisoNastro = true;
      hud.say([{ who: 'mordicchio', text: 'Il nastro è acceso, di qui non si passa. Ci schiaccerebbe come due biscotti.' }, { who: 'anastasia', text: 'Ci sarà una leva per fermarlo. Cerchiamola.' }]);
    }
  },
});
(function () {
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    const r = crea.apply(this, arguments), id = this.L.id;
    this.leva = null; this.ciuffi = null; this.__orologio = false;
    if (id === 10) this.preparaMiagolio();
    if (id === 20) this.preparaTrappole();
    if (id === 29) this.preparaFabbrica();
    return r;
  };
  const upd = Livello.prototype.update;
  Livello.prototype.update = function (time, delta) {
    const id = this.L && this.L.id, st = this.st, hud = this.hud;
    // al primo fotogramma i tempi partono da adesso: prima, entrando nella prima tappa della sessione,
    // l'orologio della scena valeva ancora 0 e la battuta di Mordicchio (o l'indizio) partiva subito,
    // sovrapponendosi alle scritte dell'arrivo
    if (!this.__orologio) { this.__orologio = true; this.ultimoProgresso = time; if (this.prossimaBattuta !== Infinity) this.prossimaBattuta = time + 20000; if (id !== 10) this.prossimoMiao = time + 3000; }
    const libero = st && !st.finito && !this.frozenAll && !hud.dialog && !(hud.ctrl && hud.ctrl.frozen);
    if (id === 10 && st && !st.parlato && !st.giaFatta && this.ciuffi) { if (libero) this.miagolio(time); const m = this.prossimoMiao; this.prossimoMiao = Infinity; upd.call(this, time, delta); this.prossimoMiao = m; return; }   // il miagolio lo gestisce miagolio(), non il vecchio fumetto
    upd.call(this, time, delta);
    if (!libero) return;
    if (id === 20 && st.parlato && !st.giaFatta) this.avvisoTrappole();
    if (id === 29 && !st.giaFatta) this.fabbrica();
  };
  // gli indizi: nella fabbrica, prima di tutto la leva
  const ob = Livello.prototype.obiettivoAttuale;
  Livello.prototype.obiettivoAttuale = function () {
    const st = this.st, lv = this.leva;
    if (this.L.id === 29 && lv && !lv.tirata && st.parlato && !st.inMano && !st.salvato) return { k: 'leva', x: lv.x, y: lv.y };
    return ob.call(this);
  };
  const L29 = LIVELLI.find(l => l.id === 29);
  if (L29) {
    L29.indizi = Object.assign({}, L29.indizi, { leva: 'Prima bisogna fermare il nastro grande: la leva è in uno dei reparti, contro il muro in alto.' });
    const inc = L29.dialoghi.incontro || [];
    if (!inc.some(r => /nastro grande/.test(r.text))) inc.splice(Math.max(0, inc.length - 1), 0, { who: 'zip', text: 'Attenta: il nastro grande davanti all\'ultimo reparto è acceso. Da qualche parte c\'è una leva per fermarlo. Io sono troppo piccolo per tirarla.' });
  }
})();

// ---------------- 7 · Il parcheggio all'alba: si fa solo all'alba ----------------
// Dopo la tappa 6 bisogna aspettare il mattino dopo, e partire presto (entro le 9).
// Di sera Mordicchio dice la frase di sempre e si va a letto; di giorno è troppo stanco per muoversi.
const ALBA = { tappa: 7, entro: 9 * 60 };
(function () {
  const ct = Eco.completaTappa;
  Eco.completaTappa = function (S, id) { const prima = !(S.completati || []).includes(id), r = ct.apply(this, arguments); if (prima) { S.giornoTappa = S.giornoTappa || {}; S.giornoTappa[id] = S.giorno; } return r; };
  const tp = Eco.tappaPossibile;
  Eco.tappaPossibile = function (S, id) {
    const r = tp.apply(this, arguments);
    if (id !== ALBA.tappa || !r.ok || r.rigioca) return r;
    const g6 = S.giornoTappa && S.giornoTappa[ALBA.tappa - 1];
    if (S.ora >= ALBA.entro || (g6 != null && S.giorno <= g6)) return { ok: false, perche: 'alba' };
    return r;
  };
  Mappa.prototype.tappaAllAlba = function (id) {
    const S = Save.data, hud = this.hud || game.scene.getScene('Hud');
    if (S.ora >= 18 * 60) {
      hud.say([{ who: 'mordicchio', text: 'È tardi per partire. Si va domattina, col sole.' }, { who: 'mordicchio', text: 'E poi Mitty si trova all\'alba, quando il parcheggio è ancora vuoto. Andiamo a dormire.' }], () => {
        this.registry.set('dormiSubito', true); this.cameras.main.fadeOut(250); this.time.delayedCall(260, () => this.scene.start('Rifugio', { stanza: 'casa' }));
      });
    } else {
      hud.say([{ who: 'mordicchio', text: 'Oggi sono stanchissimo. Non ho voglia di muovermi fino a domattina.' }, { who: 'mordicchio', text: 'E il parcheggio va visto all\'alba, quando è ancora vuoto. Partiamo presto, domani. Promesso.' }]);
    }
  };
  // arrivati a casa per andare a letto: si dorme
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    if (this.stanza === 'casa' && this.registry.get('dormiSubito')) { this.registry.set('dormiSubito', false); this.time.delayedCall(900, () => { if (this.sys.isActive() && this.modo === 'gioca') this.dormi(); }); }
  };
})();

// ---------------- 11 · Wilma: un piede di porco al posto della chiave ----------------
// Wilma chiede solo di essere liberata; Anastasia e Mordicchio cercano nei dintorni e trovano un piede di porco.
(function () {
  const L = LIVELLI.find(l => l.id === 11); if (!L) return;
  Object.assign(L.missione, { texChiave: 'piede_porco', nomeChiave: 'Piede di porco', trovataChiave: 'Un piede di porco! Con questo la porta si apre.' });
  const W = (t) => ({ who: 'wilma', text: t }), A = t => ({ who: 'anastasia', text: t }), Mo = t => ({ who: 'mordicchio', text: t });
  L.dialoghi.incontro = [W('C\'è qualcuno là fuori?'), W('Io sono Wilma. Sono qui dentro da sempre. Non ho mai visto com\'è fuori.'), W('Per favore... liberatemi.'), A('Ti tiriamo fuori, Wilma. Resisti ancora un po\'.'), Mo('La porta è sprangata. Serve qualcosa per forzarla: guardiamoci intorno.')];
  L.dialoghi.incontroChiave = [W('C\'è qualcuno là fuori?'), W('Io sono Wilma. Sono qui dentro da sempre. Non ho mai visto com\'è fuori.'), W('Per favore... liberatemi.'), A('Abbiamo un piede di porco, Wilma. Stai lontana dalla porta: la apriamo noi.')];
  L.dialoghi.attesa = 'Siete ancora lì? Non andate via, vi prego.';
  L.indizi = Object.assign({}, L.indizi, { oggetto: 'Guardiamo nei dintorni: in alto a destra, vicino all\'acqua, ci sono degli attrezzi abbandonati.', consegna: 'Con il piede di porco forziamo la porta del capannone, in basso.' });
  // lo sprite del piede di porco, disegnato al volo (16×16)
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    if (!this.textures.exists('piede_porco')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x3b2f4a, 1).fillRect(3, 2, 4, 3).fillRect(5, 3, 3, 11).fillRect(4, 12, 6, 3);
      g.fillStyle(0xc0392b, 1).fillRect(6, 4, 1, 9);                       // il manico rosso
      g.fillStyle(0x9aa1ad, 1).fillRect(4, 3, 2, 1).fillRect(5, 13, 4, 1);  // le punte di ferro
      g.generateTexture('piede_porco', 12, 16); g.destroy();
    }
    return crea.apply(this, arguments);
  };
  // la porta cede: un colpo secco
  const apri = Livello.prototype.apriCancello;
  Livello.prototype.apriCancello = function () {
    if (this.L.id === 11 && !this.cancelloAperto && !this.st.giaFatta) { this.cameras.main.shake(180, 0.006); Sfx.no && Sfx.no(); this.hud.toast('Crac! La porta cede.'); }
    return apri.apply(this, arguments);
  };
})();

// ---------------- 11 · al ritorno: davanti alla stalla nuova, in giardino ----------------
// Il discorso («ci arrivi dal giardino», «guarda fuori, il cielo») si fa fuori, davanti al portone:
// Wilma è ferma sulla soglia a guardare il cielo; finito il discorso entra nella sua stalla.
(function () {
  DOPO_LIVELLO[11] = [
    { who: 'mordicchio', text: 'Per Wilma ci voleva più spazio, così abbiamo aperto la stalla: è la casetta di legno, qui davanti.' },
    { who: 'mordicchio', text: 'Guarda Wilma: è ferma davanti al portone e guarda il cielo. Lasciamola fare.' },
  ];
  if (typeof MESSE_IN_SCENA !== 'undefined') MESSE_IN_SCENA[11] = { chi: 'wilma', dove: () => ({ x: PORTE.stalla.x + 14, y: PORTE.stalla.y + 10 }), azione: 'fermo' };
  const la = luogoAttuale;
  luogoAttuale = function (k) { const S = Save.data; if (k === 'wilma' && S && S.ultimoArrivo === 11) return 'fuori'; return la(k); };
  const sa = Rifugio.prototype.stanzaArrivo;
  Rifugio.prototype.stanzaArrivo = function (id) { if (id === 11) return this.stanza === 'fuori'; return sa.apply(this, arguments); };
  // dal riepilogo si torna in giardino, davanti alla stalla
  const riep = Livello.prototype.riepilogo;
  Livello.prototype.riepilogo = function (guadagno, primaVolta) {
    const r = riep.apply(this, arguments);
    if (this.L.id !== 11 || !primaVolta) return r;
    const hud = this.hud, b = hud.buttons.filter(b => b.active && b.label && b.label.text === 'Torna al rifugio').pop(); if (!b) return r;
    b.setVisible(false).setActive(false);
    hud.button(UW / 2 - 90, UH * 0.80, 180, 40, 'Torna al rifugio', () => this.scene.start('Rifugio', { stanza: 'fuori', pos: 'stalla' }), { size: 15, parent: b.parentContainer });
    return r;
  };
  // finito il discorso, Wilma entra nella stalla
  const mis = Rifugio.prototype.messaInScena;
  Rifugio.prototype.messaInScena = function (id) {
    const r = mis.apply(this, arguments);
    if (id !== 11 || this.stanza !== 'fuori') return r;
    const w = (this.ospiti || []).find(o => o.chiave === 'wilma'); if (!w) return r;
    this.time.delayedCall(1200, () => this.hud.bubble(w, '☀', 2000));
    const entra = () => {
      if (!this.sys.isActive() || !w.active) return;
      if (this.hud.dialog || this.hud.quieto && this.hud.quieto()) return this.time.delayedCall(700, entra);
      w.evento = true; this.cammina(w, PORTE.stalla.x, PORTE.stalla.y - 2, 1, () => { this.tweens.add({ targets: w, alpha: 0, duration: 400, onComplete: () => { w.setVisible(false); w.setPosition(-80, -80); this.ospiti = this.ospiti.filter(o => o !== w); } }); });
    };
    this.time.delayedCall(3000, entra);
    return r;
  };
})();
