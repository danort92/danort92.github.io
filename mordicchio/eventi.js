// =====================================================================
//  Un rifugio vivo: dove vivono gli animali, piccoli gesti per specie,
//  nuvolette con desideri e stati d'animo, eventi spontanei leggeri,
//  luce che cambia durante la giornata. Niente obblighi, niente risorse.
// =====================================================================
const NOMI_STANZE = { casa: 'casa', stalla: 'stalla', fuori: 'giardino' };
// dove vanno a vivere di default (chi ama stare all'aperto va in giardino)
const STANZA_PREDEFINITA = { ciuffo: 'fuori', pina: 'fuori', ghianda: 'fuori', paperotto: 'fuori', gaia: 'fuori', ottavia: 'fuori', hana: 'fuori' };
const GRANDI = ['margherita', 'viola', 'tempesta', 'ombra', 'nuvola'];   // in casa non ci stanno
function stanzaDi(k) {
  const S = Save.data, scelta = S.animali[k] && S.animali[k].stanza;
  if (scelta && (scelta !== 'stalla' || S.stallaAperta)) return scelta;
  const d = STANZA_PREDEFINITA[k] || (ANIMALI[k] && ANIMALI[k].stanza) || 'casa';
  return d === 'stalla' && !S.stallaAperta ? 'fuori' : d;
}

// ---------------- giri tra gli ambienti ----------------
// Ognuno ha il suo posto per riposare (stanzaDi). Ogni tanto, di giorno, qualcuno fa un giro altrove
// per un paio d'ore e poi torna. Chi è grande gira solo tra stalla e giardino; Teodora e Ciro restano a casa loro.
const GIRO_STALLA = ['margherita', 'viola', 'tempesta', 'ombra', 'nuvola', 'maky', 'birba', 'fiocco', 'fragola', 'wilma', 'rossella'];
const GIRO_FERMI = ['teodora', 'ciro'];
function giroDelGiorno(k) {
  const S = Save.data; if (GIRO_FERMI.includes(k) || k === 'mordicchio') return null;
  let h = (S.giorno * 2654435761 ^ [...k].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) >>> 0;
  const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
  if (r() > 0.35) return null;
  const casa = stanzaDi(k);
  const possibili = (GIRO_STALLA.includes(k) || GRANDI.includes(k) ? ['stalla', 'fuori'] : ['casa', 'fuori', 'stalla']).filter(x => x !== casa && (x !== 'stalla' || S.stallaAperta));
  if (!possibili.length) return null;
  const da = (9 + Math.floor(r() * 8)) * 60, a = Math.min(19 * 60, da + (120 + Math.floor(r() * 60)));
  return { dove: possibili[Math.floor(r() * possibili.length)], da, a };
}
function luogoAttuale(k) {
  const g = giroDelGiorno(k), ora = Save.data.ora;
  // con la pioggia nessuno esce a fare il giro in giardino
  const piove = g && g.dove === 'fuori' && typeof meteoAdesso === 'function' && meteoAdesso().tipo === 'pioggia';
  return g && !piove && ora >= g.da && ora < g.a ? g.dove : stanzaDi(k);
}

// ---------------- comportamenti per specie ----------------
// gesto: cosa fa ogni tanto quando si ferma; icone: i desideri che mostra nelle nuvolette
const CARATTERI = {
  mordicchio: { icone: ['pallina', 'bastoncino', 'cuore', 'zzz'] },
  wilma: { gesto: 'razzola', icone: ['seme', 'zzz', 'fiori'] },
  pina: { gesto: 'razzola', icone: ['seme', 'carota'] },
  gaia: { gesto: 'razzola', icone: ['insalata', 'cuore'] }, paperotto: { gesto: 'saltella', icone: ['insalata', 'cuore'], vel: 1.2 },
  ottavia: { gesto: 'razzola', icone: ['insalata', 'cuore', 'nota'] },
  ciuffo: { gesto: 'saltella', icone: ['carota', 'cuore'], vel: 1.5 }, ghianda: { gesto: 'saltella', icone: ['mela', 'pallina'], vel: 1.6 },
  pisolo: { gesto: 'dorme', icone: ['zzz', 'more'] }, spillo: { gesto: 'arrotola', icone: ['mela', 'zzz'], vel: 0.8 },
  thiago: { gesto: 'siede', icone: ['cuscino', 'cuore'] }, mitty: { gesto: 'agguato', icone: ['gomitolo', 'pallina'], vel: 1.3 },
  mino: { gesto: 'siede', icone: ['ciotola', 'cuore'] }, max: { gesto: 'agguato', icone: ['gomitolo', 'pallina'] },
  teodora: { gesto: 'dorme', icone: ['insalata', 'zzz'], vel: 0.35 }, briciola: { gesto: 'dorme', icone: ['cuscino', 'zzz', 'cuore'], vel: 0.6 },
  tubino: { gesto: 'saltella', icone: ['seme', 'cuore'] }, zip: { gesto: 'saltella', icone: ['gomitolo', 'nota'], vel: 1.6 },
  margherita: { gesto: 'bruca', icone: ['fieno', 'zzz'], vel: 0.7 }, viola: { gesto: 'bruca', icone: ['fieno', 'cuore'], vel: 0.7 },
  nuvola: { gesto: 'saltella', icone: ['insalata', 'pallina'], vel: 1.2 }, maky: { gesto: 'rotola', icone: ['zucca', 'cuore'] },
  birba: { gesto: 'saltella', icone: ['carota', 'nota'], vel: 1.4 }, fiocco: { gesto: 'bruca', icone: ['insalata', 'cuore'], vel: 0.8 },
  ombra: { gesto: 'bruca', icone: ['carota', 'zzz'], vel: 0.6 }, tempesta: { gesto: 'bruca', icone: ['mela', 'nota'], vel: 1.1 },
  ciro: { gesto: 'dorme', icone: ['zzz', 'cuscino'] }, fragola: { gesto: 'bruca', icone: ['more', 'fiori'], vel: 1.2 },
  rossella: { gesto: 'agguato', icone: ['mela', 'zzz'] }, hana: { gesto: 'danza', icone: ['fiori', 'nota'] },
};
const ICONE = {
  cuore: ['icone', 3], seme: ['seme'], fieno: ['fieno'], ciotola: ['ciotola'], bastoncino: ['bastoncino'],
};
function iconaPensiero(scene, x, y, k) {
  if (k === 'zzz') return txt(scene, x, y, 'z z', 7, '#504086').setOrigin(0.5).setResolution(Math.ceil(ZR * DPR / 1.5));
  if (k === 'nota') return txt(scene, x, y, '♪', 9, '#8a4a70').setOrigin(0.5).setResolution(Math.ceil(ZR * DPR / 1.5));
  if (ICONE[k]) return scene.add.image(x, y, ICONE[k][0], ICONE[k][1]);
  return iconaRegalo(scene, x, y, k);
}

Object.assign(Rifugio.prototype, {
  // ---------------- dove può andare un animale ----------------
  puntoLibero(o) {
    const S = Save.data;
    if (this.stanza !== 'fuori') {
      const pref = o ? (ANIMALI[o.chiave].preferiti || []) : [], posto = this.arrediSprites ? this.arrediSprites.filter(a => pref.includes(a.dati.id)) : [];
      if (posto.length && Math.random() < 0.5) { const a = Phaser.Utils.Array.GetRandom(posto); return { x: a.x, y: a.y - (a.dati.id === 'torretta' ? 22 : 6), posto: true }; }
      return { x: Phaser.Math.Between(16, STANZA.w - 16), y: Phaser.Math.Between(STANZA.muro + 24, STANZA.h - 30) };
    }
    // in giardino: nella parte aperta, lontano da van e orto
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(12, STANZA.w - 12), y = Phaser.Math.Between(80, STANZA.h - 16);
      const nelVan = Math.abs(x - VAN_XY.x) < 26 && y > VAN_XY.y - 16 && y < VAN_XY.y + 20, nellOrto = x < 84 && y > 82 && y < 164;
      if (!nelVan && !nellOrto) return { x, y };
    }
    return { x: STANZA.w - 30, y: STANZA.h - 40 };
  },
  // animali fermi uno sopra l'altro si scostano piano
  separa(dt) {
    const L = this.ospiti; if (!L || L.length < 2) return;
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j]; if (a.evento || b.evento || a.occupato || b.occupato) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d > 0.01 && d < 10) { const k = (10 - d) * 3 * dt / d; if (!a.meta && a !== this.cat) { a.x -= dx * k; a.y -= dy * k; } if (!b.meta && b !== this.cat) { b.x += dx * k; b.y += dy * k; } }
    }
  },
  // ---------------- piccoli gesti per specie ----------------
  gestoArrivo(o) {
    const C = CARATTERI[o.chiave] || {}, g = C.gesto; if (!g || Math.random() > 0.35 || o.gesto) return;
    const ora = Save.data.ora, giorno = ora < 19 * 60;
    o.gesto = g; const fine = () => { if (o.active) { o.gesto = null; o.angle = 0; o.setScale(1); } };
    if (g === 'razzola') { this.tweens.add({ targets: o, angle: o.flipX ? -14 : 14, yoyo: true, repeat: 3, duration: 160, onComplete: fine }); o.pausa = 3; }
    else if (g === 'saltella') { this.tweens.add({ targets: o, y: o.y - 4, yoyo: true, repeat: 2, duration: 140, ease: 'Quad.out', onComplete: fine }); }
    else if (g === 'rotola') { this.tweens.add({ targets: o, angle: 360, duration: 700, onComplete: fine }); }
    else if (g === 'bruca') { this.tweens.add({ targets: o, scaleY: 0.92, yoyo: true, repeat: 3, duration: 380, onComplete: fine }); o.pausa = 4; }
    else if (g === 'arrotola') { this.tweens.add({ targets: o, scaleX: 0.85, scaleY: 0.85, yoyo: true, hold: 1600, duration: 200, onComplete: fine }); o.pausa = 3; }
    else if (g === 'danza') { this.tweens.add({ targets: o, angle: { from: -8, to: 8 }, yoyo: true, repeat: 2, duration: 300, onComplete: fine }); }
    else if (g === 'siede' || g === 'agguato') { o.setFrame(o.idleFrame); this.tweens.add({ targets: o, scaleX: g === 'agguato' ? 1.1 : 1, scaleY: g === 'agguato' ? 0.85 : 0.96, yoyo: true, hold: 1200, duration: 250, onComplete: fine }); o.pausa = 4; }
    else if (g === 'dorme') {
      if (o.chiave === 'ciro' && !giorno) { o.gesto = null; return; }          // il gufo di notte è sveglio
      o.pausa = 9 + Math.random() * 6; this.time.delayedCall(o.pausa * 1000, fine); this.pensiero(o, 'zzz', true);
    }
  },
  // ---------------- nuvolette: desideri e stati d'animo ----------------
  pensiero(o, icona, forza) {
    const hud = this.hud;
    if (!o || !o.active || !o.visible || this.nuvola || hud.dialog || (hud.ctrl && hud.ctrl.frozen) || this.modo !== 'gioca') return;
    if (!forza && hud.bubbles.some(b => !b.dead)) return;
    const C = CARATTERI[o.chiave] || { icone: ['cuore'] }, k = icona || Phaser.Utils.Array.GetRandom(C.icone);
    const c = this.add.container(o.x, o.y - 24).setDepth(19000).setAlpha(0);
    const g = this.add.graphics(); g.fillStyle(0xfbf4dc, 1).fillRoundedRect(-8, -7, 16, 13, 4); g.lineStyle(1, 0x504086, 0.9).strokeRoundedRect(-8, -7, 16, 13, 4);
    g.fillStyle(0xfbf4dc, 1).fillCircle(-3, 8, 1.6).fillCircle(-5, 11, 1); g.lineStyle(1, 0x504086, 0.7).strokeCircle(-3, 8, 1.6);
    const ic = iconaPensiero(this, 0, -1, k); if (ic.width) ic.setScale(Math.min(1, 10 / Math.max(ic.width, ic.height)) * (ic.type === 'Text' ? 1 : 1));
    c.add([g, ic]); this.nuvola = { c, o, fine: this.time.now + 2600 };
    this.tweens.add({ targets: c, alpha: 1, y: c.y - 2, duration: 220 });
  },
  aggiornaNuvola(time) {
    const n = this.nuvola, hud = this.hud;
    if (n) {
      const via = !n.o.active || time > n.fine || hud.dialog || (hud.ctrl && hud.ctrl.frozen) || this.modo !== 'gioca';
      if (via) { const c = n.c; this.nuvola = null; this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() }); }
      else n.c.setPosition(n.o.x, n.o.y - 26 + Math.sin(time / 300));
    }
    if (!this.nuvola && time > (this.prossimaNuvola || 0)) {
      this.prossimaNuvola = time + 9000 + Math.random() * 8000;
      const liberi = this.ospiti.filter(o => !o.occupato && o.visible && !(o.coccola > 0));
      if (liberi.length) { const o = Phaser.Utils.Array.GetRandom(liberi); this.pensiero(o, o.dorme ? 'zzz' : null); }
    }
  },
  // ---------------- scegliere dove vive un animale ----------------
  sceltaStanza(o) {
    const S = Save.data, hud = this.hud, id = o.chiave, A = ANIMALI[id];
    const opz = [['casa', 'In casa, al riparo'], ['fuori', 'In giardino, all\'aria aperta']];
    if (S.stallaAperta) opz.splice(1, 0, ['stalla', 'In stalla, con più spazio']);
    const ok = opz.filter(([k]) => !(k === 'casa' && GRANDI.includes(id)));
    const m = hud.modal('Dove vive ' + A.nome + '?', 90 + ok.length * 44 + (GRANDI.includes(id) ? 22 : 0));
    ok.forEach(([k, l], i) => hud.button(28, m.y + 48 + i * 44, UW - 56, 36, l + (stanzaDi(id) === k ? '  ✓' : ''), () => {
      m.close(); if (stanzaDi(id) === k) return;
      (S.animali[id] || (S.animali[id] = {})).stanza = k; Save.write(); Sfx.pop();
      o.occupato = true; this.tweens.add({ targets: o, alpha: 0, duration: 300, onComplete: () => { o.setVisible(false); this.ospiti = this.ospiti.filter(x => x !== o); o.destroy(); } });
      hud.toast(A.nome + ' adesso vive ' + (k === 'casa' ? 'in casa' : k === 'stalla' ? 'in stalla' : 'in giardino'));
    }, { parent: m.c, size: 13 }));
    if (GRANDI.includes(id)) m.c.add(txt(hud, UW / 2, m.y + 52 + ok.length * 44, 'È troppo grande per stare in casa.', 11, '#9d866f').setOrigin(0.5));
  },
  // ---------------- eventi spontanei ----------------
  eventoDelGiorno() {
    const S = Save.data, st = this.stanza, k = 'ev-' + st;
    if (S.oggi[k] !== undefined) return S.oggi[k];
    // scelta deterministica: stesso giorno e stesso posto = stesso evento, anche dopo aver chiuso il gioco
    let h = S.giorno * 977 + st.length * 131 + st.charCodeAt(0) * 17; const r = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    let scelto = null;
    if (r() < 0.55) {
      const ult = S.eventiUltimi || (S.eventiUltimi = {}), altri = this.ospiti.filter(o => o !== this.cat);
      const cand = [['mordicchio_posto', 3], ['coccole', 3], ['gioco', altri.length >= 2 ? 3 : 0], ['lucciole', st === 'fuori' ? 3 : 0], ['foglia', st === 'fuori' ? 2 : 0]]
        .filter(([id, p]) => p > 0 && !(ult[id + '@' + st] > S.giorno - 3));
      let tot = cand.reduce((a, c) => a + c[1], 0), x = r() * tot;
      for (const [id, p] of cand) { if ((x -= p) <= 0) { scelto = id; break; } }
      if (scelto) ult[scelto + '@' + st] = S.giorno;
    }
    S.oggi[k] = scelto; Save.write(); return scelto;
  },
  avviaEventi() {
    if (this.stanza === 'fuori') this.fioriSpontanei();
    const ev = this.eventoDelGiorno(); this.eventoOggi = ev;
    this.momentoEvento = this.time.now + 6000 + Math.random() * 9000;
    if (ev === 'lucciole') this.momentoEvento = this.time.now + 1500;
  },
  controllaEventi(time) {
    const S = Save.data, ev = this.eventoOggi, hud = this.hud;
    if (!ev || time < this.momentoEvento || this.inEvento) return;
    if (hud.dialog || (hud.ctrl && hud.ctrl.frozen) || this.modo !== 'gioca' || this.aspirapolvere || this.dormendo || this.inChiacchiera || (this.cat && this.cat.notizia)) { this.momentoEvento = time + 3000; return; }
    if (ev === 'lucciole') { if (S.ora >= 19 * 60 && !this.lucciole) this.accendiLucciole(); return; }
    const k = 'evf-' + this.stanza; if (S.oggi[k]) return;
    S.oggi[k] = true; Save.write(); this.inEvento = true;
    if (ev === 'mordicchio_posto') this.evPosto(); else if (ev === 'coccole') this.evCoccole(); else if (ev === 'gioco') this.evGioco(); else if (ev === 'foglia') this.evFoglia();
  },
  libera(list) { list.forEach(o => { if (o && o.active) { o.evento = false; o.eventoFuori = false; o.meta = null; o.pausa = 1; o.angle = 0; } }); this.inEvento = false; this.eventoCorrente = null; },
  fineEvento(o) { const e = this.eventoCorrente; if (e && e.chi.includes(o)) { if (e.timer) e.timer.remove(); if (e.extra) e.extra.forEach(x => x.destroy()); this.libera(e.chi); } },
  cammina(o, x, y, vel, poi) {
    const d = Math.hypot(x - o.x, y - o.y); o.setFlipX(x < o.x); o.anims.play(o.walkAnim, true);
    this.tweens.add({ targets: o, x, y, duration: Math.max(200, d / (20 * vel) * 1000), onUpdate: () => o.setDepth(o.y), onComplete: () => { if (!o.active) return; o.anims.stop(); o.setFrame(o.idleFrame); poi && poi(); } });
  },
  // Mordicchio si addormenta in un posto insolito
  evPosto() {
    const cat = this.cat, S = Save.data; let p;
    if (this.stanza === 'fuori') p = Phaser.Utils.Array.GetRandom([{ x: VAN_XY.x + 6, y: VAN_XY.y - 12 }, { x: 88, y: 116 }, { x: STANZA.w - 22, y: 96 }]);
    else {
      const mob = this.arrediSprites.filter(a => ['cassettiera', 'poltroncina', 'fieno', 'tavolino', 'letto_verde', 'letto_azzurro', 'letto_rosa', 'mangiatoia'].includes(a.dati.id));
      p = mob.length ? (a => ({ x: a.x, y: a.y - a.displayHeight * 0.55 }))(Phaser.Utils.Array.GetRandom(mob)) : Phaser.Utils.Array.GetRandom([{ x: 14, y: STANZA.muro + 22 }, { x: STANZA.w - 14, y: STANZA.h - 26 }]);
    }
    cat.evento = true; cat.eventoFuori = true; cat.dorme = false; cat.meta = null;
    const ev = this.eventoCorrente = { chi: [cat] };
    this.cammina(cat, p.x, p.y, 1, () => {
      if (this.eventoCorrente !== ev || !cat.active) return; // interrotto mentre camminava (es. toccato)
      cat.dorme = true; cat.setFrame(4); cat.setDepth(p.y + 30); this.pensiero(cat, 'zzz', true);
      const zz = this.time.addEvent({ delay: 4000, repeat: 4, callback: () => cat.active && this.pensiero(cat, 'zzz', true) });
      this.eventoCorrente.timer = this.time.delayedCall(22000, () => { zz.remove(); cat.dorme = false; this.libera([cat]); });
      this.eventoCorrente.extra = [];
    });
  },
  // un animale viene a chiedere coccole, senza obblighi
  evCoccole() {
    const S = Save.data, cand = this.ospiti.filter(o => o !== this.cat && !o.occupato && !o.uscendo && !o.evento);
    const o = cand.sort((a, b) => Eco.punti(S, b.chiave) - Eco.punti(S, a.chiave))[0] || this.cat; if (!o) return this.libera([]);
    const p = this.player, x = Phaser.Math.Clamp(p.x + (o.x < p.x ? -14 : 14), 12, STANZA.w - 12), y = Phaser.Math.Clamp(p.y + 2, 30, STANZA.h - 10);
    o.evento = true; o.meta = null; const ev = this.eventoCorrente = { chi: [o] };
    this.cammina(o, x, y, 1.1, () => {
      if (this.eventoCorrente !== ev || !o.active) return; // interrotto mentre arrivava
      o.setFlipX(o.x > this.player.x); this.pensiero(o, 'cuore', true);
      const ripeti = this.time.addEvent({ delay: 3500, repeat: 2, callback: () => o.active && this.pensiero(o, 'cuore', true) });
      this.eventoCorrente.timer = this.time.delayedCall(12000, () => { ripeti.remove(); this.libera([o]); });
    });
  },
  // due animali si rincorrono per qualche secondo
  evGioco() {
    // giocano solo due che vanno d'accordo (amici, oppure Mitty che salta addosso a Thiago)
    const libero = k => this.ospiti.find(o => o.chiave === k && o !== this.cat && !o.occupato && !o.uscendo && !o.evento && !o.notizia && !o.dorme);
    const coppie = (typeof AMICIZIE !== 'undefined' ? AMICIZIE : []).filter(c => !c[3] || c[3] === 'mitty').map(c => [libero(c[0]), libero(c[1])]).filter(([x, y]) => x && y);
    const tm = coppie.find(([x, y]) => x.chiave === 'thiago' && y.chiave === 'mitty');
    let [a, b] = tm || Phaser.Utils.Array.GetRandom(coppie) || [];
    if (!a || !b) return this.libera([]);
    if (a.chiave === 'mitty') [a, b] = [b, a];   // alla fine il cuoricino lo fa Mitty, non Thiago
    a.evento = b.evento = true; a.meta = b.meta = null; this.eventoCorrente = { chi: [a, b] };
    const cx = Phaser.Math.Clamp((a.x + b.x) / 2, 30, STANZA.w - 30), cy = Phaser.Math.Clamp((a.y + b.y) / 2, this.stanza === 'fuori' ? 90 : STANZA.muro + 34, STANZA.h - 30);
    const ic = a.chiave === 'mitty' || b.chiave === 'mitty' ? 'gomitolo' : 'pallina';
    let t0 = this.time.now; this.pensiero(a, ic, true);
    const giro = this.time.addEvent({ delay: 30, loop: true, callback: () => {
      const t = (this.time.now - t0) / 1000, r = 14;
      [[a, 0], [b, Math.PI]].forEach(([o, f]) => { if (!o.active) return; const nx = cx + Math.cos(t * 2.4 + f) * r, ny = cy + Math.sin(t * 2.4 + f) * r * 0.6; o.setFlipX(nx < o.x); o.setPosition(nx, ny).setDepth(ny); o.anims.play(o.walkAnim, true); });
      if (t > 5.5) { giro.remove(); [a, b].forEach(o => o.active && (o.anims.stop(), o.setFrame(o.idleFrame))); this.pensiero(b, 'cuore', true); this.eventoCorrente.timer = this.time.delayedCall(1500, () => this.libera([a, b])); }
    } });
    this.eventoCorrente.timer = { remove: () => giro.remove() };
  },
  // una foglia portata dal vento e Mordicchio che la insegue
  evFoglia() {
    const cat = this.cat, y = Phaser.Math.Between(150, STANZA.h - 30);
    const f = this.add.rectangle(-4, y, 3, 2, Phaser.Utils.Array.GetRandom([0xd79e61, 0xc0d470, 0xe8894f])).setDepth(19000);
    cat.evento = true; cat.eventoFuori = true; this.eventoCorrente = { chi: [cat], extra: [f] };
    this.tweens.add({ targets: f, x: STANZA.w + 6, y: { value: y - 20, ease: 'Sine.inOut' }, angle: 720, duration: 5200, onComplete: () => f.destroy() });
    const insegui = this.time.addEvent({ delay: 60, repeat: 70, callback: () => {
      if (!cat.active || !f.active) return; const dx = f.x - cat.x, dy = f.y + 4 - cat.y, d = Math.hypot(dx, dy);
      if (d > 3) { cat.x += dx / d * 2.2; cat.y += dy / d * 2.2; cat.setFlipX(dx < 0); cat.anims.play(cat.walkAnim, true); cat.setDepth(cat.y); }
    } });
    this.eventoCorrente.timer = this.time.delayedCall(4400, () => { insegui.remove(); if (cat.active) { cat.anims.stop(); cat.setFrame(2); this.pensiero(cat, 'nota', true); } this.time.delayedCall(1200, () => this.libera([cat])); });
  },
  accendiLucciole() {
    this.lucciole = [];
    for (let i = 0; i < 14; i++) {
      const l = this.add.circle(Phaser.Math.Between(10, STANZA.w - 10), Phaser.Math.Between(70, STANZA.h - 20), 0.9, 0xfff2a8).setDepth(19500).setAlpha(0);
      this.tweens.add({ targets: l, x: l.x + Phaser.Math.Between(-24, 24), y: l.y + Phaser.Math.Between(-16, 16), alpha: { from: 0.1, to: 1 }, yoyo: true, repeat: -1, duration: 1800 + Math.random() * 1800, delay: Math.random() * 1500 });
      this.lucciole.push(l);
    }
  },
  // qualche fiore spontaneo diverso ogni giorno, solo decorazione
  fioriSpontanei() {
    const S = Save.data; let h = S.giorno * 7919; const r = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    const n = Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const x = 90 + r() * (STANZA.w - 110), y = 150 + r() * (STANZA.h - 180);
      if (Math.abs(x - VAN_XY.x) < 28 && Math.abs(y - VAN_XY.y) < 24) continue;
      this.add.image(x, y, 'natura', ['fiore_rosa', 'fiore_giallo', 'fiore_blu'][Math.floor(r() * 3)]).setDepth(-9);
    }
  },
  // chi arriva e chi va, mentre sei nella stanza
  aggiornaGiri() {
    if (!this.ospiti || this.modo !== 'gioca') return;
    const S = Save.data, st = this.stanza, porta = st === 'fuori' ? null : { x: STANZA.w / 2, y: STANZA.h - 6 };
    this.ospiti.slice().forEach(o => {
      if (o === this.cat || o.evento || o.occupato || o.uscendo || luogoAttuale(o.chiave) === st) return;
      o.uscendo = true; o.meta = null; const dest = porta || { x: o.x < STANZA.w / 2 ? 4 : STANZA.w - 4, y: Phaser.Math.Clamp(o.y, 90, STANZA.h - 20) };
      if (Math.random() < 0.5) this.pensiero(o, 'nota', true);
      this.cammina(o, dest.x, dest.y, 1, () => { this.ospiti = this.ospiti.filter(x => x !== o); o.destroy(); });
    });
    Object.keys(S.animali).forEach(k => {
      if (k === 'mordicchio' || !ANIMALI[k] || luogoAttuale(k) !== st || this.ospiti.some(o => o.chiave === k)) return;
      const da = porta || { x: Math.random() < 0.5 ? 4 : STANZA.w - 4, y: Phaser.Math.Between(110, STANZA.h - 24) };
      const o = this.makeAnimal(k, da.x, da.y); const C = CARATTERI[k]; if (C && C.vel) o.velocita = C.vel;
      this.ospiti.push(o); o.evento = true;
      const p = this.puntoLibero(o); this.cammina(o, p.x, p.y, 1, () => { o.evento = false; o.pausa = 2; });
    });
  },
  // ---------------- luce della giornata ----------------
  creaLuce() {
    this.velo = this.add.rectangle(0, 0, STANZA.w, STANZA.h, 0x000000, 0).setOrigin(0).setDepth(18000);
    this.lucine = [];
    if (this.stanza === 'casa') this.arrediSprites.filter(a => /lampada/.test(a.dati.id)).forEach(a => this.lucine.push(this.add.ellipse(a.x, a.y - a.displayHeight * 0.6, 46, 34, 0xffe08a, 0).setDepth(18001).setBlendMode(Phaser.BlendModes.ADD)));
    if (this.stanza === 'fuori') [[CASA_R.x + 16, CASA_R.y + 31], [CASA_R.x + CASA_R.w - 16, CASA_R.y + 31]].forEach(([x, y]) => this.lucine.push(this.add.rectangle(x, y, 12, 10, 0xffd56a, 0).setDepth(CASA_R.y + CASA_R.h + 2)));
    this.aggiornaLuce(true);
  },
  aggiornaLuce() {
    if (!this.velo) return;
    const m = Save.data.ora, h = m / 60; let col = 0x000000, a = 0, luci = 0;
    if (h < 9) { col = 0xffd9a0; a = 0.10 * (9 - h) / 2; }
    else if (h >= 16 && h < 19) { col = 0xffa860; a = 0.14 * (h - 16) / 3; }
    else if (h >= 19) { col = 0x241a48; a = (this.stanza === 'fuori' ? 0.22 : 0.14) + 0.12 * Math.min(1, (h - 19) / 3); luci = 1; }
    this.velo.setFillStyle(col, a);
    this.lucine.forEach(l => l.setFillStyle(l.fillColor, luci ? (this.stanza === 'fuori' ? 0.95 : 0.22) : 0));
  },
});

// ---- aggancio leggero al motore esistente ----
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.nuvola = null; this.lucciole = null; this.inEvento = false; this.eventoCorrente = null; this.velo = null; this.prossimaNuvola = 0;
    crea.call(this);
    this.creaLuce(); this.avviaEventi();
    this.ospiti.forEach(o => { const C = CARATTERI[o.chiave]; if (C && C.vel) o.velocita = C.vel; });
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    if (!this.ospiti) return;
    this.aggiornaNuvola(time); this.controllaEventi(time);
    if (time > (this.prossimaLuce || 0)) { this.prossimaLuce = time + 2000; this.aggiornaLuce(); this.aggiornaGiri(); }
  };
})();

// ---------------- chiacchiere: frasi secondo momento, tempo, posto e amici ----------------
function frasiContesto(k, stanza) {
  const F = FRASI_EXTRA[k]; if (!F) return [];
  const S = Save.data, ora = S.ora, m = typeof meteoAdesso === 'function' ? meteoAdesso().tipo : 'sereno', out = [];
  if (ora < 10 * 60 && F.mattina) out.push(...F.mattina);
  if (ora >= 19 * 60 && F.sera) out.push(...F.sera);
  if (m === 'pioggia' && F.pioggia) out.push(...F.pioggia, ...F.pioggia);
  if (stanza === 'fuori' && F.giardino) out.push(...F.giardino);
  if (F.amici) out.push(...F.amici);
  if (F.altro) out.push(...F.altro);
  if (k !== 'mordicchio' && luogoAttuale(k) !== stanzaDi(k)) out.push('Oggi faccio un giretto qui. Poi torno ' + (stanzaDi(k) === 'casa' ? 'a casa' : stanzaDi(k) === 'stalla' ? 'in stalla' : 'in giardino') + ', al mio posto.');
  return frasiValide(out);
}
Rifugio.prototype.chiacchiera = function (o) {
  const pool = frasiContesto(o.chiave, this.stanza); if (!pool.length) return;
  o.coccola = 3; o.setFlipX(this.player.x < o.x);
  const f = pick(pool, this.recent), lines = [{ who: o.chiave, text: f }];
  if (Math.random() < 0.4) lines.push({ who: 'anastasia', text: pick(RISPOSTE, this.recent) });
  this.hud.say(lines);
};
