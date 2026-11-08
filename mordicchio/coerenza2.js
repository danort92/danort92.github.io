// =====================================================================
//  Coerenza tra quello che si dice e quello che si vede (revisione 7/11)
//  Regola: un'azione al presente detta da un personaggio si deve vedere; se non si può mostrare,
//  la frase si riscrive. I piccoli ricordi al passato restano, purché non contraddicano il mondo.
//  1. Messa in scena dei commenti di Mordicchio dopo ogni arrivo: l'animale è davvero lì e fa
//     davvero quello che lui racconta (al presente: «guarda…»).
//  2. Gesti legati alle frasi: chi dice «salto», «mi rotolo», «razzolo», «danzo», «rumino»… lo fa.
//  3. Posti fissi che le frasi nominano: la pozza di fango di Maky in stalla, la trave di Ciro,
//     il davanzale esterno di Tubino (fuori, sulla finestra della casa).
//  4. Seconde richieste «accompagnami a…»: l'animale va davvero sul posto (e beve, se è acqua).
// =====================================================================
STANZA_PREDEFINITA.tubino = 'fuori';   // un piccione vive fuori, sul davanzale esterno, non in salotto
const SPOT_FISSI = {
  stalla: [{ id: 'fango', x: 30, y: 206, serve: 'maky' }, { id: 'trave', x: 40, y: 23 }],
  fuori: [{ id: 'davanzale', x: 66, y: 47 }],
};
if (ANIMALI.maky) ANIMALI.maky.preferiti = ['fango'].concat(ANIMALI.maky.preferiti || []);

// ---------------- gesti ----------------
const GESTI_DA_FRASE = [
  [/mi rotolo|rotolarmi|rotolo nel/i, 'rotola'], [/\bsalt(o|are|ella)\b|binky/i, 'saltella'], [/razzol/i, 'razzola'],
  [/\bdanz|passo di danza|inchino/i, 'danza'], [/\brumin|\bbruc|l'erba (di oggi|è buonissima)/i, 'bruca'], [/mi arrotol|arrotolo/i, 'arrotola'],
  [/agguato/i, 'agguato'], [/coccodè|chiocci/i, 'razzola'], [/nitrisce|galopp/i, 'scalpita'], [/\bfusa\b/i, 'fusa'], [/muu+!/i, 'saltella'],
];
Object.assign(Rifugio.prototype, {
  gestoForzato(o, g) {
    if (!o || !o.active || o.gesto || o.dorme) return;
    o.gesto = g; const fine = () => { if (o.active) { o.gesto = null; o.angle = 0; o.setScale(1); } };
    const tw = c => this.tweens.add(Object.assign({ targets: o, onComplete: fine }, c));
    if (g === 'razzola') tw({ angle: o.flipX ? -14 : 14, yoyo: true, repeat: 3, duration: 160 });
    else if (g === 'saltella') tw({ y: o.y - 5, yoyo: true, repeat: 2, duration: 150, ease: 'Quad.out' });
    else if (g === 'rotola') tw({ angle: o.flipX ? -360 : 360, duration: 800 });
    else if (g === 'bruca') tw({ scaleY: 0.9, yoyo: true, repeat: 3, duration: 360 });
    else if (g === 'arrotola') tw({ scaleX: 0.82, scaleY: 0.82, yoyo: true, hold: 1600, duration: 200 });
    else if (g === 'danza') tw({ angle: { from: -9, to: 9 }, yoyo: true, repeat: 3, duration: 280 });
    else if (g === 'agguato') tw({ scaleX: 1.1, scaleY: 0.85, yoyo: true, hold: 1000, duration: 250 });
    else if (g === 'scalpita') tw({ x: o.x + 2, yoyo: true, repeat: 5, duration: 90 });
    else if (g === 'fusa') { tw({ scaleY: 0.96, yoyo: true, repeat: 5, duration: 220 }); this.time.delayedCall(500, () => o.active && this.hearts && this.hearts(o.x, o.y - 12)); }
    else if (g === 'beve') tw({ y: o.y + 1.5, scaleY: 0.9, yoyo: true, repeat: 4, duration: 260 });
    else fine();
  },
  gestoDaFrase(o, testo) {
    if (!o || !testo) return; const g = (GESTI_DA_FRASE.find(([r]) => r.test(testo)) || [])[1];
    if (g) this.time.delayedCall(250, () => this.gestoForzato(o, g));
  },
  // ---------------- posti fissi ----------------
  spotFissi() { const S = Save.data; return (SPOT_FISSI[this.stanza] || []).filter(p => !p.serve || (S.animali && S.animali[p.serve])); },
  disegnaSpot() {
    const S = Save.data;
    if (this.stanza === 'stalla' && S.animali && S.animali.maky) {
      const g = this.add.graphics().setDepth(-6);
      g.fillStyle(0x7a5a3f, 1).fillEllipse(30, 206, 30, 13); g.fillStyle(0x93704f, 1).fillEllipse(28, 204, 20, 7);
      g.fillStyle(0xb08a63, 0.8).fillEllipse(24, 203, 5, 2).fillEllipse(36, 208, 4, 2);
    }
  },
});
// le pozze e i davanzali non sono posti per i mobili
(function () {
  const ing = Rifugio.prototype.ingombri;
  if (ing) Rifugio.prototype.ingombri = function () {
    const r = ing.call(this), S = Save.data;
    if (this.stanza === 'stalla' && S.animali && S.animali.maky) r.pavimento.push(new Phaser.Geom.Rectangle(14, 198, 33, 16));
    return r;
  };
  // i posti fissi entrano tra i posti preferiti (Maky e il fango)
  const pp = Rifugio.prototype.postoPreferito;
  Rifugio.prototype.postoPreferito = function (o) {
    const pref = (ANIMALI[o.chiave] && ANIMALI[o.chiave].preferiti) || [];
    const fissi = this.spotFissi().filter(s => pref.includes(s.id) && !(this.ospiti || []).some(x => x !== o && Math.hypot(x.x - s.x, x.y - s.y) < 10));
    if (fissi.length && Math.random() < 0.5) { const s = Phaser.Utils.Array.GetRandom(fissi); return { x: s.x, y: s.y, posto: s.id }; }
    return pp ? pp.call(this, o) : null;
  };
  const arr = Rifugio.prototype.arrivoPosto;
  Rifugio.prototype.arrivoPosto = function (o, id) {
    if (id === 'fango') {   // Maky si rotola davvero nel fango, e per un po' resta sporchina
      o.pausa = 9 + Math.random() * 5; this.gestoForzato(o, 'rotola');
      this.time.delayedCall(900, () => { if (!o.active) return; o.setTint(0xc9a07a); this.gestoForzato(o, 'rotola'); this.pensiero && this.pensiero(o, 'cuore', true); });
      this.time.delayedCall(25000, () => o.active && o.clearTint());
      return;
    }
    return arr ? arr.call(this, o, id) : undefined;
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments); this.disegnaSpot();
    // Ciro di giorno è già sulla sua trave quando entri; Tubino spesso è sul davanzale
    const S = Save.data, giorno = S.ora >= 7 * 60 && S.ora < 19 * 60;
    (this.ospiti || []).forEach(o => {
      if (o.chiave === 'ciro' && this.stanza === 'stalla' && giorno) { o.setPosition(40, 23).setDepth(23); o.dorme = true; o.meta = null; o.pausa = 30; o.inAlto = true; }
      if (o.chiave === 'tubino' && this.stanza === 'fuori' && Math.random() < 0.7) { o.setPosition(66, 47).setDepth(48); o.meta = null; o.pausa = 8; o.inAlto = true; }
    });
  };
  // volare: Ciro sale e scende dalla trave, Tubino dal davanzale. Niente passeggiate sui muri.
  const vola = (scena, o, x, y, poi) => {
    o.evento = true; o.meta = null; o.dorme = false; o.setFlipX(x < o.x);
    const d = Math.hypot(x - o.x, y - o.y), up = Math.min(o.y, y) - 14;
    scena.tweens.add({ targets: o, x, duration: Math.max(500, d * 9), ease: 'Sine.inOut' });
    scena.tweens.add({ targets: o, y: { from: o.y, to: up }, duration: Math.max(250, d * 4.5), ease: 'Quad.out', yoyo: false, onComplete: () => scena.tweens.add({ targets: o, y, duration: Math.max(250, d * 4.5), ease: 'Quad.in', onComplete: () => { o.setDepth(y); o.evento = false; poi && poi(); } }) });
    scena.tweens.add({ targets: o, scaleY: 0.85, yoyo: true, repeat: Math.ceil(d / 12), duration: 90 });
  };
  const wander = Rifugio.prototype.wander;
  Rifugio.prototype.wander = function (dt) {
    const S = Save.data, giorno = S.ora >= 7 * 60 && S.ora < 19 * 60;
    (this.ospiti || []).forEach(o => {
      if (o.evento || o.occupato || o.uscendo || o.coccola > 0 || o.gesto || o.ricordo || o.notizia) return;
      if (o.chiave === 'ciro' && this.stanza === 'stalla') {
        if (giorno && !o.inAlto) { o.inAlto = true; vola(this, o, 40, 23, () => { o.dorme = true; o.pausa = 30; }); }
        else if (giorno && o.inAlto) { o.meta = null; o.dorme = true; o.pausa = 30; }
        else if (!giorno && o.inAlto && (o.pausa || 0) <= 0) { o.inAlto = false; const p = this.puntoLibero(o); vola(this, o, p.x, p.y, () => { o.pausa = 4; }); }
      }
      if (o.chiave === 'tubino' && this.stanza === 'fuori' && (o.pausa || 0) <= 0 && !o.meta) {
        if (o.inAlto) { o.inAlto = false; const p = this.puntoLibero(o); vola(this, o, p.x, p.y, () => { o.pausa = 5; }); }
        else if (Math.random() < 0.5) { o.inAlto = true; vola(this, o, 66, 47, () => { o.pausa = 10 + Math.random() * 8; if (Math.random() < 0.5) this.gestoForzato(o, 'saltella'); }); }
      }
    });
    return wander.call(this, dt);
  };
})();

// ---------------- gesti quando parlano ----------------
(function () {
  const scena = () => { const r = game.scene.getScene('Rifugio'); return r && r.sys.isActive() ? r : null; };
  const animale = (r, k) => r && (r.ospiti || []).find(o => o.chiave === k && o.active);
  const say = Hud.prototype.say;
  Hud.prototype.say = function (lines, done) {
    const r = scena(); if (r && lines && lines[0]) { const o = animale(r, lines[0].who); if (o) r.gestoDaFrase(o, lines[0].text); }
    return say.call(this, lines, done);
  };
  const bubble = Hud.prototype.bubble;
  Hud.prototype.bubble = function (target, text, ms) {
    const b = bubble.call(this, target, text, ms);
    const r = scena(); if (b && r && target && target.chiave && r.ospiti && r.ospiti.includes(target)) r.gestoDaFrase(target, text);
    return b;
  };
})();

// ---------------- seconde richieste «accompagnami»: l'animale arriva davvero sul posto ----------------
(function () {
  const chiudi = Livello.prototype.chiudiFase2;
  Livello.prototype.chiudiFase2 = function () {
    const D = this.L.dopo, n = this.npc;
    if (!D || D.tipo !== 'visita' || !n || this._visitaFatta) return chiudi.call(this);
    this._visitaFatta = true;
    const [gx, gy] = D.dove[0], x = gx * T + 8, y = gy * T + 12, acqua = /acqua|fontana|bere|sete/i.test(D.nome + ' ' + (D.chiede || []).map(l => l.text).join(' '));
    this.seguaci = this.seguaci.filter(o => o !== n);
    const d = Math.hypot(x - n.x, y - n.y); n.setFlipX(x < n.x); if (n.anims && n.walkAnim) n.anims.play(n.walkAnim, true);
    this.tweens.add({ targets: n, x, y: y - 2, duration: Math.max(300, d * 16), onComplete: () => {
      if (n.anims) n.anims.stop();
      if (acqua) this.tweens.add({ targets: n, y: n.y + 1.5, scaleY: 0.9, yoyo: true, repeat: 4, duration: 260 });
      this.time.delayedCall(acqua ? 2300 : 700, () => { chiudi.call(this); this.seguaci.push(n); });
    } });
  };
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () { this._visitaFatta = false; return crea.apply(this, arguments); };
})();

// ---------------- commenti dopo gli arrivi: al presente, e messi in scena ----------------
const MESSE_IN_SCENA = {
  1: { chi: 'pisolo', dove: s => ({ x: 18, y: STANZA.h - 30 }), azione: 'dorme' },
  2: { chi: 'ciuffo', azione: 'giro' },
  3: { chi: 'pina', dove: s => ({ x: 42, y: 128 }), azione: 'razzola' },
  4: { chi: 'ghianda', dove: s => ({ x: 140, y: 120 }), azione: 'scava' },
  5: { chi: ['gaia', 'paperotto'], dove: s => ({ x: 70, y: 200 }), azione: 'vicini' },
  6: { chi: 'thiago', dove: s => ({ x: STANZA.w - 30, y: STANZA.muro + 14 }), azione: 'dorme' },
  7: { chi: 'mitty', dove: s => { const l = (s.arrediSprites || []).find(a => /^letto/.test(a.dati.id)); return l ? { x: l.x, y: l.y - 4, sotto: l } : { x: 20, y: STANZA.muro + 30 }; }, azione: 'nascosto' },
  8: { chi: 'mino', dove: s => ({ x: VAN_XY.x - 10, y: VAN_XY.y + 22 }), azione: 'siede' },
  9: { chi: 'max', dove: s => ({ x: s.cat.x + 14, y: s.cat.y + 2 }), azione: 'fusa' },
  11: { chi: 'wilma', dove: s => ({ x: STANZA.w / 2 + 10, y: STANZA.h - 26 }), azione: 'fermo' },
  12: { chi: ['margherita', 'wilma'], dove: s => ({ x: 60, y: 110 }), azione: 'vicini' },
  13: { chi: 'maky', dove: s => ({ x: 30, y: 206 }), azione: 'fango' },
  14: { chi: 'birba', dove: s => { const f = (s.arrediSprites || []).find(a => a.dati.id === 'fieno'); return f ? { x: f.x, y: f.y - 10, su: true } : { x: 120, y: 100 }; }, azione: 'salti' },
  15: { chi: 'fiocco', dove: s => { const f = (s.arrediSprites || []).find(a => a.dati.id === 'fieno'); return f ? { x: f.x - 16, y: f.y + 2 } : { x: 120, y: 100 }; }, azione: 'dorme', vicino: 'margherita' },
  16: { chi: 'ombra', dove: s => ({ x: STANZA.w / 2, y: 130 }), azione: 'fermo' },
  17: { chi: 'tempesta', azione: 'giro' },
  18: { chi: 'ottavia', dove: s => ({ x: s.player.x + 18, y: s.player.y - 6 }), azione: 'chiacchiera' },
  19: { chi: 'ciro', dove: s => ({ x: 40, y: 23 }), azione: 'dorme' },
  20: { chi: 'fragola', dove: s => ({ x: STANZA.w - 22, y: 70 }), azione: 'trema' },
  22: { chi: 'teodora', dove: s => ({ x: STANZA.w / 2, y: 140 }), azione: 'lenta' },
  23: { chi: 'briciola', dove: s => { const p = (s.arrediSprites || []).find(a => ['cuscinone', 'cuscino_cuore', 'letto_verde', 'letto_rosa', 'letto_azzurro', 'divanetto'].includes(a.dati.id)); return p ? { x: p.x, y: p.y - 6 } : { x: 40, y: 150 }; }, azione: 'dorme' },
  24: { chi: 'tubino', dove: s => ({ x: 66, y: 47 }), azione: 'saluta' },
  26: { chi: 'hana', dove: s => ({ x: 70, y: 196 }), azione: 'danza' },
  27: { chi: ['viola', 'nuvola'], dove: s => ({ x: 100, y: 150 }), azione: 'vicini' },
  28: { chi: 'spillo', dove: s => ({ x: STANZA.w - 50, y: STANZA.muro + 14 }), azione: 'arrotola' },
  29: { chi: 'zip', dove: s => ({ x: 40, y: STANZA.muro + 16 }), azione: 'lavora' },
};
Object.assign(DOPO_LIVELLO, {
  2: [{ who: 'mordicchio', text: 'Guarda Ciuffo: sta facendo il giro del giardino. Di corsa. Non so quante volte lo farà.' }, DOPO_LIVELLO[2][1]].filter(Boolean),
  3: [{ who: 'mordicchio', text: 'Pina si è messa vicino all\'orto e razzola. Dice che da lì si vede tutto il cielo.' }],
  4: [{ who: 'mordicchio', text: 'Guarda Ghianda: sta già nascondendo qualcosa. Non so cosa, ma lo scopriremo.' }],
  5: [{ who: 'mordicchio', text: 'Gaia e Paperotto si sono sistemati vicino al laghetto. Il rifugio comincia a riempirsi.' }],
  6: [{ who: 'mordicchio', text: 'Thiago si è messo sotto la finestra, dove batte il sole. Sembra che abiti qui da sempre.' }],
  7: [{ who: 'mordicchio', text: 'Mitty si è infilato sotto il letto. Si vedono solo gli occhi. Diamogli tempo.' }],
  8: [{ who: 'mordicchio', text: 'Mino si è seduto davanti al van. Chissà come mai.' }],
  9: [{ who: 'mordicchio', text: 'Max è arrivato. Io gli soffio, lui mi fa le fusa. Non ci capiamo.' }].concat((DOPO_LIVELLO[9] || []).slice(1)),
  11: [DOPO_LIVELLO[11][0], { who: 'mordicchio', text: 'Guarda Wilma: è ferma vicino alla porta e guarda fuori, il cielo. Lasciamola fare.' }],
  12: [{ who: 'mordicchio', text: 'Margherita e Wilma si sono già messe vicine. Lo sapevo.' }],
  13: [{ who: 'mordicchio', text: 'Maky ha trovato la pozza di fango in fondo alla stalla. Guarda come si rotola. Felicità pura.' }],
  14: [{ who: 'mordicchio', text: 'Birba è salita sul fieno. Poi è scesa. Poi è risalita. È qui da cinque minuti.' }],
  15: [{ who: 'mordicchio', text: 'Fiocco si è sistemato tra Margherita e il fieno. Dice che lì si sente al sicuro.' }],
  16: [{ who: 'mordicchio', text: 'Ombra si è fermato in mezzo alla stalla. Dice che ci sta pensando. Su cosa, non si sa.' }],
  17: [{ who: 'mordicchio', text: 'Tempesta non sta ferma un attimo: guarda come gira per la stalla. Io resto qui, al sicuro.' }],
  18: [{ who: 'mordicchio', text: 'Ottavia mi sta raccontando tutta la sua vita. E quella delle ochette. E delle cugine.' }],
  19: [{ who: 'mordicchio', text: 'Ciro si è scelto la trave più alta della stalla. Guarda lassù: di giorno dorme, di notte fa la guardia.' }],
  20: [{ who: 'mordicchio', text: 'Fragola è ancora un po\' spaventata: guarda come tiene le orecchie dritte. Qui le passerà.' }],
  22: [{ who: 'mordicchio', text: 'Teodora si è messa in cammino verso la cucina. Ci arriverà per Natale.' }],
  23: [{ who: 'mordicchio', text: 'Briciola si è già presa il posto più morbido e si è addormentata. Le voglio già bene, ma non dirglielo.' }],
  24: [{ who: 'mordicchio', text: 'Tubino si è sistemato sul davanzale, fuori dalla finestra. Guarda: mi saluta. Che situazione strana.' }],
  26: [{ who: 'mordicchio', text: 'Hana ha trovato l\'angolo del laghetto. Dice che le ricorda casa, e ci fa un passo di danza.' }],
  27: [{ who: 'mordicchio', text: 'Viola e Nuvola stanno sempre vicine vicine. Anche io sto sempre vicino a te. È la stessa cosa.' }],
  28: [{ who: 'mordicchio', text: 'Spillo si è preso il posto vicino al calorifero e si è appallottolato. Il secondo posto migliore. Il primo è mio.' }],
  29: [{ who: 'mordicchio', text: 'Zip sta già controllando le viti della cucina. Dice che una cigolava. E mi ha chiesto di non mangiarlo. Ovviamente no!' }],
});
Rifugio.prototype.messaInScena = function (id) {
  const M = MESSE_IN_SCENA[id]; if (!M) return;
  const chi = [].concat(M.chi), anim = chi.map(k => (this.ospiti || []).find(o => o.chiave === k)).filter(Boolean);
  if (!anim.length) return;
  const tieni = (o, ms) => { o.evento = true; o.meta = null; o.dorme = false; this.time.delayedCall(ms, () => { if (o.active) { o.evento = false; o.pausa = 3; } }); };
  const p = M.dove ? M.dove(this) : null;
  anim.forEach((o, i) => {
    tieni(o, 22000);
    if (p) o.setPosition(Phaser.Math.Clamp(p.x + i * 14, 10, STANZA.w - 10), p.y + (i ? 3 : 0)).setDepth(p.y);
    o.setFlipX(i === 1);
  });
  const o = anim[0];
  if (M.vicino) { const v = (this.ospiti || []).find(x => x.chiave === M.vicino); if (v) { tieni(v, 22000); v.setPosition(o.x - 16, o.y).setDepth(o.y); } }
  const tw = c => this.tweens.add(Object.assign({ targets: o }, c));
  switch (M.azione) {
    case 'dorme': o.dorme = true; this.time.delayedCall(600, () => this.pensiero && this.pensiero(o, 'zzz', true)); break;
    case 'razzola': case 'danza': case 'arrotola': case 'fusa': this.time.delayedCall(700, () => this.gestoForzato(o, M.azione)); this.time.delayedCall(5000, () => this.gestoForzato(o, M.azione)); break;
    case 'siede': case 'fermo': o.anims && o.anims.stop(); break;
    case 'nascosto': if (p && p.sotto) { o.setDepth(p.sotto.depth - 1); o.setAlpha(0.85); this.time.delayedCall(22000, () => o.active && o.setAlpha(1)); } break;
    case 'scava': tw({ angle: { from: -12, to: 12 }, yoyo: true, repeat: 8, duration: 120, onComplete: () => { o.angle = 0; } }); break;
    case 'fango': this.time.delayedCall(500, () => this.arrivoPosto(o, 'fango')); break;
    case 'salti': { const y0 = o.y; tw({ y: y0 - 8, yoyo: true, repeat: 4, hold: 700, duration: 220, ease: 'Quad.out' }); break; }
    case 'trema': tw({ x: o.x + 1, yoyo: true, repeat: 12, duration: 70 }); break;
    case 'lenta': { o.evento = true; const cx = 40; if (o.anims && o.walkAnim) o.anims.play(o.walkAnim, true); o.setFlipX(true); tw({ x: cx + 30, y: STANZA.muro + 40, duration: 22000, onComplete: () => { o.anims && o.anims.stop(); o.evento = false; } }); break; }
    case 'saluta': this.time.delayedCall(800, () => this.gestoForzato(o, 'saltella')); break;
    case 'chiacchiera': for (let i = 0; i < 4; i++) this.time.delayedCall(400 + i * 2600, () => this.pensiero && this.pensiero(o, 'nota', true)); break;
    case 'lavora': tw({ angle: { from: -6, to: 6 }, yoyo: true, repeat: 10, duration: 140, onComplete: () => { o.angle = 0; } }); break;
    case 'vicini': anim.forEach(a => this.pensiero && this.time.delayedCall(900, () => this.pensiero(a, 'cuore', true))); break;
    case 'giro': {   // un giro di corsa lungo i bordi
      const pts = [[30, 120], [STANZA.w - 30, 120], [STANZA.w - 30, STANZA.h - 40], [30, STANZA.h - 40], [30, 120]];
      if (this.stanza === 'stalla') pts.forEach(q => { q[1] = Math.max(q[1], 80); });
      let i = 0; const vai = () => { if (!o.active || i >= pts.length) { if (o.active) o.anims && o.anims.stop(); return; } const [x, y] = pts[i++]; this.cammina(o, x, y, 3, vai); };
      vai(); break;
    }
  }
};

// ---------------- l'aspirapolvere: ognuno reagisce a modo suo ----------------
// scappa: si allontana il più possibile · osserva: si tiene a distanza e guarda · curioso: segue il tubo a qualche passo
// palla: si appallottola dov'è · guscio: si ritira e aspetta · dorme: non sente niente (Briciola, con l'età)
const REAZIONE_ASPIRA = { thiago: 'osserva', mitty: 'curioso', max: 'curioso', zip: 'curioso', pisolo: 'palla', spillo: 'palla', teodora: 'guscio', briciola: 'dorme', mino: 'scappa', ghianda: 'scappa', ciuffo: 'scappa', rossella: 'scappa' };
const FRASI_REAZIONE = {
  curioso: { mitty: ['Che cos\'è quel serpente? Lo attacco!', 'Fa rumore ma non morde. Credo.'], max: ['Si gioca? Che gioco è?', 'Mi mangia il pelo! Ne ho tanto, va bene.'], zip: ['Motore da duecento watt. Spazzola rotante. Bello.', 'Squit! Posso smontarlo dopo?'] },
  osserva: { thiago: ['Un gatto elegante osserva da lontano. Molto da lontano.'] },
  palla: { pisolo: ['*si appallottola e trema un pochino*'], spillo: ['Mpf. Avvisatemi quando ha finito.'] },
  guscio: { teodora: ['*ritira la testa nel guscio e aspetta*'] },
  dorme: { briciola: ['*dorme beata. Con l\'età, certi rumori non si sentono più*'] },
};
(function () {
  const agg = Rifugio.prototype.aggiornaAspira;
  Rifugio.prototype.aggiornaAspira = function (dt, time) {
    agg.call(this, dt, time);
    const a = this.aspirapolvere; if (!a || time < (a.prossimaReazione || 0)) return;
    a.prossimaReazione = time + 1000; a.dette = a.dette || {};
    const p = this.player, angoli = [[18, STANZA.muro + 22], [STANZA.w - 18, STANZA.muro + 22], [18, STANZA.h - 24], [STANZA.w - 18, STANZA.h - 24]];
    (this.ospiti || []).forEach(o => {
      if (o === this.cat || o.uscendo || !o.active) return;
      const r = REAZIONE_ASPIRA[o.chiave] || 'osserva', d = Math.hypot(o.x - p.x, o.y - p.y);
      o.evento = true; o.coccola = 0;
      if (r === 'scappa') { const l = angoli.slice().sort((u, v) => Math.hypot(v[0] - p.x, v[1] - p.y) - Math.hypot(u[0] - p.x, u[1] - p.y))[o.chiave.length % 2]; o.dorme = false; o.meta = { x: l[0], y: l[1] }; o.velocita = 1.6; o.evento = false; o.pausa = 2; }
      else if (r === 'osserva') { if (d < 60) { const ang = Math.atan2(o.y - p.y, o.x - p.x); o.dorme = false; o.meta = { x: Phaser.Math.Clamp(p.x + Math.cos(ang) * 75, 14, STANZA.w - 14), y: Phaser.Math.Clamp(p.y + Math.sin(ang) * 75, STANZA.muro + 18, STANZA.h - 20) }; o.evento = false; o.pausa = 2; } else { o.meta = null; o.setFlipX(p.x < o.x); } }
      else if (r === 'curioso') { const tx = p.x + (p.flipX ? -1 : 1) * 30, ty = p.y + 4; if (Math.hypot(o.x - tx, o.y - ty) > 14) { o.dorme = false; o.meta = { x: Phaser.Math.Clamp(tx, 14, STANZA.w - 14), y: ty }; o.evento = false; o.pausa = 1; } else { o.setFlipX(p.x < o.x); if (Math.random() < 0.3) this.gestoForzato(o, 'agguato'); } }
      else if (r === 'palla') { o.meta = null; if (!o.gesto) this.gestoForzato(o, 'arrotola'); }
      else if (r === 'guscio') { o.meta = null; o.setScale(0.85, 0.8); }
      else if (r === 'dorme') { o.meta = null; o.dorme = true; }
      const F = FRASI_REAZIONE[r] && FRASI_REAZIONE[r][o.chiave];
      if (F && !a.dette[o.chiave] && d < 110 && !this.hud.bubbles.some(b => !b.dead) && Math.random() < 0.35) { a.dette[o.chiave] = true; this.hud.bubble(o, pick(F), 2600); }
    });
  };
  const spegni = Rifugio.prototype.spegniAspira;
  Rifugio.prototype.spegniAspira = function () {
    const c = !!this.aspirapolvere; spegni.apply(this, arguments);
    if (c) (this.ospiti || []).forEach(o => { if (o === this.cat || !o.active) return; o.evento = false; o.setScale(1); o.velocita = (CARATTERI[o.chiave] && CARATTERI[o.chiave].vel) || 1; o.pausa = 2; });
  };
})();

// ---------------- al pascolo: chi vive in stalla esce di più, con il bel tempo ----------------
// mucche, cavallo, asino, pecora, capretta e maialina passano molte giornate in giardino a brucare;
// con la pioggia restano al riparo (lo gestisce già luogoAttuale).
const AL_PASCOLO = { margherita: 0.7, viola: 0.7, nuvola: 0.7, tempesta: 0.75, ombra: 0.5, fiocco: 0.6, birba: 0.7, maky: 0.55, wilma: 0.45 };
(function () {
  const giro = giroDelGiorno;
  giroDelGiorno = function (k) {
    const q = AL_PASCOLO[k], S = Save.data;
    if (q == null) return giro(k);
    let h = (S.giorno * 2654435761 ^ [...k].reduce((a, c) => a * 37 + c.charCodeAt(0), 5)) >>> 0;
    const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
    if (r() > q) return giro(k);
    const da = (8 + Math.floor(r() * 3)) * 60, a = (16 + Math.floor(r() * 3)) * 60;   // si esce la mattina, si rientra nel pomeriggio
    return { dove: 'fuori', da, a };
  };
})();

// ---------------- prima di parlare con un animale, Anastasia gli si avvicina ----------------
// (prima si poteva chiacchierare, accarezzare o fare un regalo da un capo all'altro del giardino)
(function () {
  const mv = Rifugio.prototype.movePlayer;
  Rifugio.prototype.movePlayer = function (dt, blocked) {
    const t = this.verso; if (!t) return mv.call(this, dt, blocked);
    const v0 = this.hud.vector(), pp = this.player;
    // il giocatore prende il comando col joystick, o qualcos'altro sposta Anastasia: si annulla l'avvicinamento
    if (Math.hypot(v0.x, v0.y) > 0.15 || this.aspirapolvere || this.modo !== 'gioca' || (t.lx != null && Math.hypot(pp.x - t.lx, pp.y - t.ly) > 8)) { this.verso = null; if (t.o && t.o.active) { t.o.evento = false; t.o.coccola = 1; } return mv.call(this, dt, blocked); }
    const p = this.player, dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy);
    if (d >= 3 && this.time.now <= t.scade && t.o.active && t.giro && this.time.now < t.giro.fino) {   // aggira l'ostacolo
      const sp = 62 * dt, x0 = p.x, y0 = p.y;
      if (!blocked(p.x + t.giro.vx * sp, p.y)) p.x += t.giro.vx * sp; if (!blocked(p.x, p.y + t.giro.vy * sp)) p.y += t.giro.vy * sp;
      if (Math.abs(p.x - x0) + Math.abs(p.y - y0) < 0.01) t.giro = null;
      p.anims.play('g-' + (Math.abs(t.giro ? t.giro.vx : 0) > 0.5 ? 'side' : (t.giro && t.giro.vy < 0 ? 'up' : 'down')), true); p.setDepth(p.y); t.lx = p.x; t.ly = p.y; return true;
    }
    if (d < 3 || this.time.now > t.scade || !t.o.active) { this.verso = null; p.anims.stop(); p.setFrame(p.dir === 'down' ? 0 : p.dir === 'up' ? 4 : 8); p.setFlipX(t.o.x < p.x); if (p.dir === 'side' || Math.abs(t.o.x - p.x) > 6) { p.dir = 'side'; p.setFrame(8); } t.poi(); return false; }
    const sp = 62 * dt, vx = dx / d, vy = dy / d, x0 = p.x, y0 = p.y;
    if (!blocked(p.x + vx * sp, p.y)) p.x += vx * sp;
    if (!blocked(p.x, p.y + vy * sp)) p.y += vy * sp;
    if (Math.abs(p.x - x0) + Math.abs(p.y - y0) < 0.01) { const s = (t.lato = -(t.lato || -1)); t.giro = { vx: -vy * s, vy: vx * s, fino: this.time.now + 450 }; }   // bloccata: prova di lato
    if (Math.abs(vx) > Math.abs(vy)) { p.dir = 'side'; p.setFlipX(vx < 0); } else p.dir = vy < 0 ? 'up' : 'down';
    p.anims.play('g-' + p.dir, true); p.setDepth(p.y); t.lx = p.x; t.ly = p.y; return true;
  };
  Rifugio.prototype.avvicinati = function (o, poi) {
    const p = this.player; if (!o || o === this.cat && Math.hypot(o.x - p.x, o.y - p.y) < 30 || Math.hypot(o.x - p.x, o.y - p.y) < 24) return poi();
    o.meta = null; o.coccola = 99; o.evento = true;
    const lato = p.x < o.x ? -1 : 1, x = Phaser.Math.Clamp(o.x + lato * 16, 10, STANZA.w - 10), y = o.y + 2;
    this.verso = { x, y, o, scade: this.time.now + 6000, poi: () => {
      const d = Math.hypot(o.x - p.x, o.y - p.y);
      if (d > 30 && o.active) { o.evento = true; return this.cammina(o, p.x + (o.x < p.x ? -14 : 14), p.y + 1, 1.6, () => { o.evento = false; o.coccola = 99; o.setFlipX(p.x < o.x); poi(); }); }
      o.evento = false; o.coccola = 99; poi();
    } };
  };
  ['accarezza', 'regala', 'chiacchiera', 'bacino'].forEach(k => {
    const f = Rifugio.prototype[k]; if (!f) return;
    Rifugio.prototype[k] = function (o, ...r) { if (!o || !o.chiave || this.verso) return f.call(this, o, ...r); return this.avvicinati(o, () => f.call(this, o, ...r)); };
  });
})();

// ---------------- in giardino non si cammina sull'acqua né sull'orto ----------------
// Anastasia: il laghetto, le aiuole coltivate e i tronchi degli alberi da frutto bloccano il passo.
// Gli animali: non scelgono mete dentro il laghetto o l'orto e non tagliano attraverso l'acqua
// (tranne chi fa il bagno: anatre e oche, quando vanno a nuotare).
(function () {
  const sopraOrto = (x, y, m = 0) => { const S = Save.data; for (let i = 0; i < (S.orto || []).length; i++) { const p = ORTO_XY(i); if (Math.abs(x - p.x) < 8 + m && y > p.y - 7 - m && y < p.y + 8 + m) return true; } return false; };
  const tronco = (x, y) => Object.values(ALBERI).some(a => Math.abs(x - a.x) < 5 && y > a.y - 6 && y < a.y + 2);
  const blo = Rifugio.prototype.bloccatoFuori;
  Rifugio.prototype.bloccatoFuori = function (x, y) { return blo.call(this, x, y) || NEL_LAGO(x, y, -1) || sopraOrto(x, y) || tronco(x, y); };
  const attraversaLago = (x0, y0, x1, y1) => { for (let t = 0; t <= 1; t += 0.08) if (NEL_LAGO(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 3)) return true; return false; };
  const pl = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    if (this.stanza !== 'fuori' || !o) return pl.call(this, o);
    for (let i = 0; i < 10; i++) {
      const p = pl.call(this, o);
      if (p.nuota || p.lago) return p;
      if (NEL_LAGO(p.x, p.y, 6) || sopraOrto(p.x, p.y, 3) || attraversaLago(o.x, o.y, p.x, p.y)) continue;
      return p;
    }
    return { x: o.x, y: o.y };   // niente meta buona: resta dov'è
  };
})();
