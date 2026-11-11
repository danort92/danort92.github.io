// =====================================================================
//  IL RIFUGIO DI MORDICCHIO — motore di gioco (Phaser 3)
// =====================================================================
const DPR = Math.min(window.devicePixelRatio || 1, 3);
const BOX = document.getElementById('gioco');
const VW = () => (BOX && BOX.clientWidth) || window.innerWidth, VH = () => (BOX && BOX.clientHeight) || window.innerHeight;
const CW = Math.round(VW() * DPR);
const CH = Math.round(VH() * DPR);
const U = CW / 360;                 // unità dell'interfaccia (layout pensato su 360 di larghezza)
const UW = 360, UH = CH / U;        // dimensioni logiche dell'interfaccia
const Z = Math.max(2, Math.round(CW / (16 * 15)));   // zoom del mondo (intero = pixel nitidi)
const T = 16;
const FONT = '"Pixelify Sans", monospace';
const COL = { scuro: '#504086', testo: '#5c4a3d', titolo: '#8a4a70', verde: '#67835c', crema: '#f3e5c2' };

// ---------------------------------------------------------------------
//  Salvataggio
// ---------------------------------------------------------------------
const SAVE_KEY = 'rifugio_mordicchio_v3';
function nuovoSalvataggio() {
  return {
    introVista: false, completati: [], semi: 0, inventario: [], regali: {},
    arredi: ARREDO_INIZIALE.map(o => ({ ...o })),
    animali: { mordicchio: {} }, scoperti: {}, cuoricini: [],
    bastoncino: false, ultimoArrivo: null, bonusOggi: {},
  };
}
const Save = {
  data: null,
  load() {
    try { const s = localStorage.getItem(SAVE_KEY); this.data = s ? Eco.nuovoStato({ ...nuovoSalvataggio(), ...JSON.parse(s) }) : null; }
    catch (e) { this.data = null; }
    return this.data;
  },
  start() { this.data = Eco.nuovoStato(nuovoSalvataggio()); this.write(); },
  write() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { } },
  reset() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } this.data = null; },
  get() { return this.data || this.load() || (this.start(), this.data); },
};
function scoperto(id) { const S = Save.data; return S.scoperti[id] || (S.scoperti[id] = { adora: null, gradisce: null, sgradito: null, indizi: [] }); }
function giorno() { return Save.data.completati.length; }
// animali grandi disegnati alla loro misura vera (revisione 11/11): lato del fotogramma in px
const LATO_SPRITE = { tempesta: 30, ombra: 26, fragola: 24, nuvola: 22, hana: 22, fiocco: 21, maky: 20, birba: 19, briciola: 18 };
// nei riquadri (menu, diario, mappa) tutti gli animali hanno la stessa grandezza: s è la scala per un fotogramma da 16 px
function scalaRitratto(tex, s) { return s * 16 / (tex === 'mucca' ? 32 : (LATO_SPRITE[tex] || 16)); }
function bonusUnaVolta(k) { const S = Save.data; if (S.oggi[k]) return false; S.oggi[k] = true; return true; }
function aggiungiCuori(id, n) { const r = Eco.aggiungiPunti(Save.data, id, n); Save.write(); return r; }
function cuoriDi(id) { return Eco.punti(Save.data, id) / 4; }
// una frase che nomina un animale non ancora arrivato al rifugio non si dice (sarebbe incoerente)
function frasiValide(arr) {
  const S = Save.data, assenti = Object.keys(ANIMALI).filter(k => k !== 'mordicchio' && !S.animali[k]).map(k => ANIMALI[k].nome);
  const ok = arr.filter(f => !assenti.some(n => new RegExp('(^|[^A-Za-zà-ù])' + n + '([^A-Za-zà-ù]|$)').test(f)));
  return ok.length ? ok : arr;
}

// ---------------------------------------------------------------------
//  Suoni leggeri sintetizzati
// ---------------------------------------------------------------------
const Sfx = {
  ctx: null,
  ok() { try { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); return true; } catch (e) { return false; } },
  tone(freq, dur = 0.08, type = 'sine', vol = 0.08, when = 0) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  pop() { this.tone(660, 0.07, 'triangle'); this.tone(990, 0.06, 'triangle', 0.05, 0.05); },
  seme() { this.tone(1200, 0.05, 'sine', 0.05); this.tone(1600, 0.06, 'sine', 0.04, 0.04); },
  aspira() { [0, 0.25, 0.5, 0.75, 1.0, 1.25].forEach(w => { this.tone(95, 0.3, 'sawtooth', 0.012, w); this.tone(190, 0.3, 'square', 0.004, w); }); },
  blip() { this.tone(760, 0.025, 'sine', 0.004); },
  no() { this.tone(300, 0.12, 'triangle', 0.05); this.tone(220, 0.14, 'triangle', 0.05, 0.1); },
  cuore() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.06, i * 0.07)); },
  fanfara() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.06, i * 0.1)); },
  miao() { if (!this.ok()) return; const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(950, t + 0.12); o.frequency.linearRampToValueAtTime(600, t + 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.35); },
};

// ---------------------------------------------------------------------
//  Musica cozy generata (niente file audio): un tema per ogni luogo
// ---------------------------------------------------------------------
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const TEMI = {
  casa:     { bpm: 66, onda: 'sine',     prog: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 58]], scala: [65, 67, 69, 72, 74, 77] },
  sentiero: { bpm: 80, onda: 'triangle', prog: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]], scala: [64, 67, 69, 72, 74, 76] },
  prato:    { bpm: 84, onda: 'triangle', prog: [[48, 52, 55, 60], [43, 47, 50, 55], [45, 48, 52, 57], [41, 45, 48, 53]], scala: [67, 69, 72, 74, 76, 79] },
  alpeggio: { bpm: 74, onda: 'sine',     prog: [[50, 54, 57, 62], [47, 50, 54, 59], [43, 47, 50, 55], [45, 49, 52, 57]], scala: [66, 69, 71, 74, 76, 78] },
  notte:    { bpm: 58, onda: 'sine',     prog: [[45, 48, 52, 55], [41, 45, 48, 52], [48, 52, 55, 59], [43, 47, 50, 55]], scala: [64, 67, 69, 72, 76] },
  paese:    { bpm: 78, onda: 'triangle', prog: [[43, 47, 50, 54], [40, 43, 47, 50], [36, 40, 43, 47], [38, 42, 45, 48]], scala: [67, 69, 71, 74, 76, 79] },
};
const Musica = {
  on: (() => { try { return localStorage.getItem('rifugio_musica') !== 'no'; } catch (e) { return true; } })(),
  tema: null, timer: null, passo: 0, prossimo: 0,
  setup() {
    if (this.out || !Sfx.ok()) return !!this.out;
    const c = Sfx.ctx; this.out = c.createGain(); this.out.gain.value = this.on ? 0.07 : 0;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    const eco = c.createDelay(); eco.delayTime.value = 0.33; const fb = c.createGain(); fb.gain.value = 0.28;
    this.out.connect(lp); lp.connect(c.destination); lp.connect(eco); eco.connect(fb); fb.connect(eco); eco.connect(c.destination);
    return true;
  },
  suona(nome) {
    this.tema = nome; if (!this.setup()) return;
    if (!this.timer) { this.prossimo = Sfx.ctx.currentTime + 0.2; this.timer = setInterval(() => this.tick(), 120); }
  },
  nota(f, t, dur, vol, onda) {
    const c = Sfx.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = onda; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.05);
  },
  tick() {
    const T = TEMI[this.tema]; if (!T || !Sfx.ctx) return;
    const c = Sfx.ctx, ottavo = 60 / T.bpm / 2;
    if (c.state !== 'running') { this.prossimo = c.currentTime + 0.1; return; }
    while (this.prossimo < c.currentTime + 0.4) {
      const t = this.prossimo, battuta = Math.floor(this.passo / 8) % T.prog.length, p = this.passo % 8, acc = T.prog[battuta];
      if (p === 0) { acc.forEach(n => this.nota(NOTE(n), t, ottavo * 8, 0.18, 'sine')); this.nota(NOTE(acc[0] - 12), t, ottavo * 4, 0.3, 'sine'); }
      if (p === 4) this.nota(NOTE(acc[0] - 12), t, ottavo * 4, 0.22, 'sine');
      if (Math.random() < 0.7) this.nota(NOTE(acc[[0, 2, 1, 3, 2, 1, 3, 2][p]] + 12), t, ottavo * 1.6, 0.16, T.onda);
      if (p % 2 === 0 && Math.random() < 0.3) this.nota(NOTE(T.scala[Math.floor(Math.random() * T.scala.length)]), t, ottavo * 3, 0.12, 'sine');
      this.prossimo += ottavo; this.passo++;
    }
  },
  toggle() {
    this.on = !this.on; try { localStorage.setItem('rifugio_musica', this.on ? 'si' : 'no'); } catch (e) { }
    if (this.setup()) this.out.gain.setTargetAtTime(this.on ? 0.07 : 0, Sfx.ctx.currentTime, 0.2);
    return this.on;
  },
};
function temaLivello(L) { return L.id === 30 ? 'casa' : L.atmosfera === 'notte' || L.atmosfera === 'nebbia' || L.atmosfera === 'sogno' ? 'notte' : L.id <= 10 ? 'prato' : L.id <= 20 ? 'alpeggio' : 'paese'; }

// ---------------------------------------------------------------------
//  Utility
// ---------------------------------------------------------------------
function txt(scene, x, y, s, size = 14, color = COL.testo, extra = {}) {
  const t = scene.add.text(x, y, s, { fontFamily: FONT, fontSize: size + 'px', color, ...extra });
  t.setResolution(Math.ceil(U));
  return t;
}
// rimpicciolisce un testo finché non sta nel suo riquadro (nomi lunghi di mobili e regali)
function stringi(t, maxW, maxH, min = 7) { let f = parseFloat(t.style.fontSize); while (f > min && ((maxW && t.width > maxW) || (maxH && t.height > maxH))) { f -= 0.5; t.setFontSize(f + 'px'); } return t; }
function pannello(scene, x, y, w, h) { return scene.add.nineslice(x, y, 'pannello', null, w, h, 6, 6, 6, 6).setOrigin(0, 0); }
function pick(arr, recent) {
  const opts = arr.filter(a => !recent || !recent.includes(a));
  const src = opts.length ? opts : arr; const r = src[Math.floor(Math.random() * src.length)];
  if (recent) { recent.push(r); if (recent.length > 6) recent.shift(); }
  return r;
}
function livello(id) { return LIVELLI.find(l => l.id === id); }
function iconaRegalo(scene, x, y, id) {
  const o = REGALI[id] || OGGETTI[id] || { tex: id };
  return o.atlas ? scene.add.image(x, y, o.atlas, o.frame) : scene.add.image(x, y, o.tex);
}
function fitIcon(im, size) { im.setScale(Math.max(1, Math.floor(size / Math.max(im.width, im.height) * 2) / 2)); return im; }
function cuoriFrames(c) { const out = []; for (let i = 0; i < 3; i++) out.push(c >= i + 1 ? 10 : c >= i + 0.5 ? 11 : 12); return out; }

// ---------------------------------------------------------------------
//  HUD: interfaccia sempre in primo piano
// ---------------------------------------------------------------------
class Hud extends Phaser.Scene {
  constructor() { super({ key: 'Hud', active: false }); }
  create() {
    const cam = this.cameras.main; cam.setZoom(U); cam.centerOn(UW / 2, UH / 2);
    this.ctrl = null; this.joy = { x: 0, y: 0 }; this.dialog = null; this.scroller = null;
    this.bubbles = []; this.hint = null; this.buttons = []; this.layer = this.add.container(0, 0);
    this.joyBase = this.add.circle(0, 0, 34, 0xffffff, 0.18).setStrokeStyle(2, 0xffffff, 0.5).setVisible(false).setDepth(50);
    this.joyKnob = this.add.circle(0, 0, 15, 0xfbf4dc, 0.85).setStrokeStyle(2, 0x504086, 0.8).setVisible(false).setDepth(51);
    this.arrow = this.add.triangle(0, 0, 0, 0, 14, 0, 7, 12, 0xf2cf8c).setStrokeStyle(2, 0x504086).setVisible(false).setDepth(40);
    this.input.on('pointerdown', (p, over) => this.down(p, over));
    this.input.on('pointermove', p => this.move(p));
    this.input.on('pointerup', p => this.up(p));
    this.keys = this.input.keyboard ? this.input.keyboard.createCursorKeys() : null;
    this.wasd = this.input.keyboard ? this.input.keyboard.addKeys('W,A,S,D,SPACE,ENTER') : null;
    if (this.wasd) { this.wasd.SPACE.on('down', () => this.advance()); this.wasd.ENTER.on('down', () => this.advance()); }
  }
  attach(ctrl) { this.ctrl = ctrl; this.clearAll(); this.scene.bringToTop(); }
  clearAll() {
    this.layer.removeAll(true); this.buttons = []; this.scroller = null;
    this.bubbles.forEach(b => b.c.destroy()); this.bubbles = [];
    if (this.dialog) { if (this.dialog.typing) this.dialog.typing.remove(); this.dialog.c.destroy(); this.dialog = null; }
    this.hint = null; this.arrow.setVisible(false); this.joyEnd(); this.codaDialoghi = [];
    if (this.ctrl) this.ctrl.frozen = false;
  }
  toUi(wx, wy) {
    const c = this.ctrl && this.ctrl.cam; if (!c) return { x: 0, y: 0 };
    return { x: (wx - c.worldView.x) * c.zoom / U, y: (wy - c.worldView.y) * c.zoom / U };
  }
  down(p, over) {
    Sfx.ok(); if (Musica.tema) Musica.suona(Musica.tema);
    if (this.dialog) { this.advance(); return; }
    const ux = p.x / U, uy = p.y / U, sc = this.scroller;
    this.scrollDragged = false;
    if (sc && ux > sc.x && ux < sc.x + sc.w && uy > sc.y && uy < sc.y + sc.h) { sc.startY = uy; sc.startInner = sc.inner.y; }
    if (over && over.length) return;
    if (!this.ctrl || this.ctrl.frozen) return;
    this.pDown = { x: p.x, y: p.y, moved: false };
    if (this.ctrl.joystick !== false) { this.joyStart = { x: ux, y: uy }; this.joyBase.setPosition(ux, uy); this.joyKnob.setPosition(ux, uy); }
  }
  move(p) {
    const sc = this.scroller;
    if (p.isDown && sc && sc.startY != null) {
      const d = p.y / U - sc.startY;
      if (Math.abs(d) > 6) this.scrollDragged = true;
      if (this.scrollDragged) sc.inner.y = Phaser.Math.Clamp(sc.startInner + d, sc.y - Math.max(0, sc.contentH - sc.h), sc.y);
    }
    if (!p.isDown || !this.pDown || this.dialog) return;
    const dx = p.x - this.pDown.x, dy = p.y - this.pDown.y;
    if (Math.hypot(dx, dy) > 5 * U) this.pDown.moved = true;
    if (this.ctrl && this.ctrl.onDrag && this.ctrl.onDrag(p)) return;
    if (this.joyStart && this.pDown.moved) {
      this.joyBase.setVisible(true); this.joyKnob.setVisible(true);
      let jx = p.x / U - this.joyStart.x, jy = p.y / U - this.joyStart.y; const d = Math.hypot(jx, jy), R = 34;
      if (d > R) { jx = jx / d * R; jy = jy / d * R; }
      this.joyKnob.setPosition(this.joyStart.x + jx, this.joyStart.y + jy);
      this.joy = d > 4 ? { x: jx / R, y: jy / R } : { x: 0, y: 0 };
    }
  }
  up(p) {
    if (this.scroller) this.scroller.startY = null;
    if (this.pDown && !this.pDown.moved && this.ctrl && this.ctrl.onTap && !this.dialog && !this.ctrl.frozen) {
      const w = this.ctrl.cam.getWorldPoint(p.x, p.y); this.ctrl.onTap(w.x, w.y);
    }
    this.pDown = null; this.joyEnd();
  }
  joyEnd() { this.joyStart = null; this.joy = { x: 0, y: 0 }; this.joyBase.setVisible(false); this.joyKnob.setVisible(false); }
  vector() {
    let x = this.joy.x, y = this.joy.y;
    if (this.keys) {
      const k = this.keys, w = this.wasd;
      const kx = (k.right.isDown || w.D.isDown ? 1 : 0) - (k.left.isDown || w.A.isDown ? 1 : 0);
      const ky = (k.down.isDown || w.S.isDown ? 1 : 0) - (k.up.isDown || w.W.isDown ? 1 : 0);
      if (kx || ky) { const d = Math.hypot(kx, ky); x = kx / d; y = ky / d; }
    }
    if (this.dialog || (this.ctrl && this.ctrl.frozen)) return { x: 0, y: 0 };
    return { x, y };
  }
  button(x, y, w, h, label, cb, opts = {}) {
    const c = this.add.container(x, y);
    const bg = pannello(this, 0, 0, w, h);
    const t = txt(this, w / 2, h / 2 + 1, label, opts.size || 13, opts.color || COL.testo).setOrigin(0.5);
    c.add([bg, t]); bg.setInteractive();
    bg.on('pointerdown', () => { if (!this.dialog) c.setAlpha(0.75); });
    bg.on('pointerup', () => { c.setAlpha(1); if (this.dialog || this.scrollDragged) return; Sfx.blip(); cb(); });
    bg.on('pointerout', () => c.setAlpha(1));
    c.label = t; c.bg = bg; c.setDepth(opts.depth || 30);
    (opts.parent || this.layer).add(c); this.buttons.push(c);
    return c;
  }
  modal(title, h, onClose) {
    if (this.ctrl) this.ctrl.frozen = true; this.joyEnd();
    this.bubbles.forEach(b => { b.dead = true; b.c.destroy(); }); this.bubbles = [];
    const c = this.add.container(0, 0).setDepth(55); this.layer.add(c);
    c.add(this.add.rectangle(0, 0, UW, UH, 0x2a2238, 0.6).setOrigin(0).setInteractive());
    const y = Math.max(20, (UH - h) / 2);
    c.add(pannello(this, 12, y, UW - 24, h));
    c.add(txt(this, 28, y + 22, title, 17, COL.titolo).setOrigin(0, 0.5));
    const close = () => { c.destroy(); this.scroller = null; if (this.ctrl) this.ctrl.frozen = false; if (onClose) onClose(); };
    this.button(UW - 98, y + 8, 76, 28, 'Chiudi', close, { parent: c, size: 12 });
    return { c, x: 12, y, w: UW - 24, h, close };
  }
  scrollArea(parent, x, y, w, h) {
    const inner = this.add.container(x, y); parent.add(inner);
    const g = this.make.graphics({ add: false }); g.fillStyle(0xffffff).fillRect(x, y, w, h);
    inner.setMask(g.createGeometryMask());
    this.scroller = { inner, x, y, w, h, contentH: 0, startY: null };
    return this.scroller;
  }
  say(lines, done) {
    if (!lines || !lines.length) { if (done) done(); return; }
    // se c'è già un dialogo aperto, il nuovo aspetta il suo turno: così nessuna conseguenza (es. salvare un animale) va persa
    if (this.dialog) { (this.codaDialoghi = this.codaDialoghi || []).push([lines, done]); return; }
    const h = 92, y = UH - h - 14, c = this.add.container(0, 0).setDepth(60);
    const bg = pannello(this, 10, y, UW - 20, h);
    const portrait = this.add.image(44, y + h / 2, 'pisolo').setScale(3).setVisible(false);
    const nome = txt(this, 76, y + 10, '', 13, COL.titolo, { fontStyle: 'bold' });
    const testo = txt(this, 76, y + 28, '', 13, COL.testo, { wordWrap: { width: UW - 106 }, lineSpacing: 2 });
    const next = txt(this, UW - 26, y + h - 18, '▼', 11, COL.titolo).setOrigin(0.5);
    this.tweens.add({ targets: next, y: next.y + 3, yoyo: true, repeat: -1, duration: 400 });
    c.add([bg, portrait, nome, testo, next]);
    this.dialog = { c, lines, i: -1, done, testo, nome, portrait, typing: null, full: '' };
    this.joyEnd(); this.advance();
  }
  advance() {
    const d = this.dialog; if (!d) return;
    if (d.typing) { d.typing.remove(); d.typing = null; d.testo.setText(d.full); return; }
    d.i++;
    if (d.i >= d.lines.length) { d.c.destroy(); this.dialog = null; if (d.done) d.done(); if (!this.dialog && this.codaDialoghi && this.codaDialoghi.length) { const [l, f] = this.codaDialoghi.shift(); this.say(l, f); } return; }
    const line = d.lines[d.i], who = PERSONAGGI[line.who] || PERSONAGGI.narratore;
    d.nome.setText(who.nome);
    if (who.tex) { d.portrait.setTexture(who.tex, who.frame || 0).setVisible(true); { const f = d.portrait.frame; d.portrait.setScale(Math.min(3, 56 / Math.max(f.realWidth || f.width, f.realHeight || f.height))); } d.testo.setX(76); d.nome.setX(76); d.testo.setWordWrapWidth(UW - 106); }
    else { d.portrait.setVisible(false); d.testo.setX(26); d.nome.setX(26); d.testo.setWordWrapWidth(UW - 56); }
    if (line.who === 'mordicchio' && d.i === 0) Sfx.miao();
    d.full = line.text; d.testo.setText(''); let n = 0;
    d.typing = this.time.addEvent({ delay: 22, repeat: d.full.length - 1, callback: () => {
      if (!d.testo.active) { if (d.typing) d.typing.remove(); d.typing = null; return; }
      n++; d.testo.setText(d.full.slice(0, n)); if (n % 5 === 0) Sfx.blip();
      if (n >= d.full.length) d.typing = null;
    } });
  }
  bubble(target, text, ms = 3500) {
    this.bubbles.filter(b => b.target === target).forEach(b => { b.c.destroy(); b.dead = true; });
    this.bubbles = this.bubbles.filter(b => !b.dead);
    const t = txt(this, 0, -5, text, 11, COL.testo, { wordWrap: { width: 160 }, align: 'center', lineSpacing: 1 }).setOrigin(0.5, 1);
    const w = Math.max(40, t.width + 14), h = t.height + 10;
    const bg = pannello(this, -w / 2, -h, w, h);
    const tail = this.add.triangle(0, 4, -5, -1, 5, -1, 0, 6, 0xe6cfa2);
    const c = this.add.container(0, 0, [bg, tail, t]).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 150 });
    const b = { c, target, until: this.time.now + ms };
    this.bubbles.push(b); this.posBubble(b); return b;
  }
  posBubble(b) {
    const p = this.toUi(b.target.x, b.target.y - (b.target.displayHeight || 16) - 2);
    b.c.setPosition(Phaser.Math.Clamp(p.x, 90, UW - 90), Math.max(80, p.y - 4));
  }
  toast(text) {
    const t = txt(this, 0, 1, text, 13, COL.testo).setOrigin(0.5);
    const w = t.width + 24, h = 28;
    if (this.ultimoToast && this.ultimoToast.active) { this.tweens.killTweensOf(this.ultimoToast); this.ultimoToast.destroy(); }
    const c = this.add.container(UW / 2, 64, [pannello(this, -w / 2, -h / 2, w, h), t]).setDepth(70).setAlpha(0); this.ultimoToast = c;
    this.tweens.add({ targets: c, alpha: 1, y: 74, duration: 200 });
    this.tweens.add({ targets: c, alpha: 0, delay: 1900, duration: 300, onComplete: () => c.destroy() });
  }
  // niente freccia gialla: bastano gli indizi a parole di Mordicchio (scelta di Danilo)
  setHint() { this.hint = null; if (this.arrow) this.arrow.setVisible(false); }
  update(time) {
    this.bubbles.forEach(b => { if (!b.dead) this.posBubble(b); if (time > b.until && !b.dead) { b.dead = true; this.tweens.add({ targets: b.c, alpha: 0, duration: 200, onComplete: () => b.c.destroy() }); } });
    this.bubbles = this.bubbles.filter(b => !b.dead || b.c.active);
    if (this.hint && this.ctrl && this.ctrl.frozen) this.arrow.setVisible(false);
    else if (this.hint && this.ctrl && this.ctrl.cam) {
      const p = this.toUi(this.hint.x, this.hint.y - 18), m = 22;
      const inside = p.x > m && p.x < UW - m && p.y > 80 && p.y < UH - 40;
      this.arrow.setVisible(true);
      if (inside) this.arrow.setPosition(p.x - 7, p.y - 14 + Math.sin(time / 180) * 3).setRotation(0);
      else {
        const ang = Math.atan2(p.y - UH / 2, p.x - UW / 2);
        this.arrow.setPosition(Phaser.Math.Clamp(p.x, m, UW - m), Phaser.Math.Clamp(p.y, 90, UH - 50)).setRotation(ang - Math.PI / 2);
      }
    }
  }
}

// ---------------------------------------------------------------------
//  Avvio
// ---------------------------------------------------------------------
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    const g = this.add.graphics();
    this.load.on('progress', v => { g.clear(); g.fillStyle(0xf3e5c2); g.fillRect(CW * 0.2, CH / 2, CW * 0.6 * v, 8 * DPR); });
    const a = 'assets/';
    this.load.spritesheet('girl', a + 'girl.png', { frameWidth: 16, frameHeight: 18 });
    this.load.spritesheet('paesani', a + 'paesani.png', { frameWidth: 16, frameHeight: 18 });
    this.load.image('ritratto_rocky', a + 'ritratto_rocky.jpg');
    ['mordicchio', 'mordicchio_titolo', 'pisolo', 'ciuffo', 'ghianda', 'paperotto', 'papera', 'gallina', 'thiago', 'mitty', 'mino', 'max', 'wilma', 'maky', 'birba', 'fiocco', 'ombra', 'tempesta', 'ottavia', 'ciro', 'fragola', 'rossella', 'teodora', 'briciola', 'tubino', 'hana', 'nuvola', 'spillo', 'zip', 'erba', 'acqua', 'selciato'].forEach(k =>
      this.load.spritesheet(k, a + k + '.png', { frameWidth: LATO_SPRITE[k] || 16, frameHeight: LATO_SPRITE[k] || 16 }));
    this.load.spritesheet('mucca', a + 'mucca.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('icone', a + 'icone_speciali.png', { frameWidth: 16, frameHeight: 16 });
    this.load.atlas('mobili', a + 'mobili.png', a + 'mobili.json');
    this.load.atlas('natura', a + 'natura.png', a + 'natura.json');
    this.load.atlas('cibo', a + 'cibo.png', a + 'cibo.json');
    this.load.spritesheet('germogli', a + 'germogli.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('van', a + 'van.png', { frameWidth: 44, frameHeight: 30 });
    this.load.image('aiuola', a + 'aiuola.png');
    this.load.spritesheet('peli', a + 'peli.png', { frameWidth: 12, frameHeight: 10 });
    this.load.atlas('tesori', a + 'tesori.png', a + 'tesori.json'); this.load.atlas('ricordi', a + 'ricordi.png', a + 'ricordi.json'); this.load.spritesheet('rocky', a + 'rocky.png', { frameWidth: 16, frameHeight: 16 });
    ['pannello', 'seme', 'cuccia', 'scintilla', 'portale', 'pavimento', 'muro', 'carota', 'insalata', 'gomitolo', 'bastoncino',
      'campanellino', 'cuscino', 'fiori', 'chiave', 'recinto', 'cancello', 'auto', 'ciotola', 'pallina', 'fieno', 'zucca', 'abbeveratoio', 'mangiatoia', 'campanaccio', 'parete', 'portone', 'portone_aperto', 'frigo', 'tavolo_grande', 'scaffale', 'appendiabiti', 'scarpiera', 'wc', 'bidet', 'scaffale_lato', 'scaffale_lato_dx', 'tavolino_salotto', 'wc_giu', 'bidet_giu', 'paglia', 'travi', 'pino', 'torretta', 'lettuccio', 'trappola', 'cerniera', 'barattolo', 'cartello', 'aspirapolvere', 'cuscinone', 'cesta_giochi', 'pianta_grande', 'mensola', 'lucine', 'libreria', 'divanetto', 'lanterna', 'spazzola', 'letto_paglia', 'carriola', 'cuscino_cuore', 'ritratto_mordicchio', 'foto_festa', 'quadro_sogno', 'collare_rocky', 'quadro_rocky', 'tv', 'pacco', 'scarpe'].forEach(k => this.load.image(k, a + k + '.png'));
  }
  create() {
    const an = this.anims;
    an.create({ key: 'g-down', frames: an.generateFrameNumbers('girl', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    an.create({ key: 'g-up', frames: an.generateFrameNumbers('girl', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
    an.create({ key: 'g-side', frames: an.generateFrameNumbers('girl', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
    Object.entries(ANIMALI).forEach(([id, A]) => an.create({ key: 'walk-' + id, frames: an.generateFrameNumbers(A.tex, { frames: A.walk }), frameRate: 6, repeat: -1 }));
    const lt = this.textures.createCanvas('luce', 128, 128), cx = lt.getContext(), gr = cx.createRadialGradient(64, 64, 8, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128); lt.refresh();
    this.scene.launch('Hud');
    const go = () => this.scene.start('Titolo');
    if (document.fonts && document.fonts.load) Promise.race([document.fonts.load('16px "Pixelify Sans"'), new Promise(r => setTimeout(r, 2500))]).then(go, go);
    else go();
  }
}

// ---------------------------------------------------------------------
//  Titolo
// ---------------------------------------------------------------------
class Titolo extends Phaser.Scene {
  constructor() { super('Titolo'); }
  create() {
    const hud = this.scene.get('Hud'); hud.attach(null); Musica.suona('casa');
    const cam = this.cameras.main; cam.setZoom(U); cam.centerOn(UW / 2, UH / 2); cam.setBackgroundColor('#9bd4c3');
    const cx = UW / 2, cy = UH * 0.52, g = this.add.container(cx, cy).setScale(3), W = 7, H = 4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const fx = x === 0 ? 0 : x === W - 1 ? 2 : 1, fy = y === 0 ? 0 : y === H - 1 ? 2 : 1;
      g.add(this.add.image((x - W / 2) * T + 8, (y - H / 2) * T + 8, 'erba', fy * 11 + fx));
    }
    g.add(this.add.image(-36, -8, 'natura', 'albero').setOrigin(0.5, 1));
    g.add(this.add.image(38, -4, 'natura', 'melo').setOrigin(0.5, 1));
    g.add(this.add.image(-10, 20, 'natura', 'fiore_rosa2'));
    g.add(this.add.image(24, 22, 'natura', 'fiore_giallo2'));
    const girl = this.add.sprite(-4, 14, 'girl', 0).setOrigin(0.5, 1);
    const cat = this.add.sprite(12, 15, 'mordicchio_titolo', 2).setOrigin(0.5, 1);   // solo qui il contorno è quasi nero (11/11)
    g.add([girl, cat]);
    this.tweens.add({ targets: cat, y: 14, yoyo: true, repeat: -1, duration: 700 });
    txt(this, cx, UH * 0.17, 'Il Rifugio di', 22, '#fbf4dc', { stroke: COL.scuro, strokeThickness: 5 }).setOrigin(0.5);
    const t2 = txt(this, cx, UH * 0.17 + 34, 'Mordicchio', 40, '#f2cf8c', { stroke: COL.scuro, strokeThickness: 7 }).setOrigin(0.5);
    this.tweens.add({ targets: t2, y: t2.y - 4, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.inOut' });
    txt(this, cx, UH * 0.17 + 70, 'per ' + NOME, 15, COL.scuro).setOrigin(0.5);
    const salvato = Save.load(), bw = 200, bx = cx - bw / 2;
    if (salvato && (salvato.introVista || salvato.completati.length || salvato.giorno > 1 || salvato.semi > 0)) {
      hud.button(bx, UH * 0.76, bw, 40, 'Continua', () => this.scene.start('Rifugio'), { size: 16 });
      hud.button(bx + 40, UH * 0.76 + 52, bw - 80, 30, 'Ricomincia', () => this.conferma(hud), { size: 11 });
    } else hud.button(bx, UH * 0.76, bw, 40, 'Gioca', () => { Save.start(); this.scene.start('Rifugio'); }, { size: 16 });
    txt(this, cx, UH - 14, 'Grafica: Sprout Lands di Cup Nooble', 9, '#5f7a79').setOrigin(0.5);
  }
  conferma(hud) {
    hud.clearAll();
    hud.button(UW / 2 - 110, UH * 0.76, 220, 40, 'Sì, cancella e ricomincia', () => { Save.reset(); Save.start(); this.scene.start('Rifugio'); }, { size: 12 });
    hud.button(UW / 2 - 60, UH * 0.76 + 52, 120, 30, 'No', () => this.scene.restart(), { size: 12 });
  }
}

// ---------------------------------------------------------------------
//  Base per scene con mondo e personaggi
// ---------------------------------------------------------------------
class Mondo extends Phaser.Scene {
  setupWorld(bg, zoom = Z) {
    const cam = this.cameras.main; cam.setZoom(zoom); cam.setBackgroundColor(bg); cam.setRoundPixels(true);
    this.hud = this.scene.get('Hud'); this.recent = []; this.trail = [];
  }
  makePlayer(x, y) { const p = this.add.sprite(x, y, 'girl', 0).setOrigin(0.5, 1); p.dir = 'down'; this.player = p; return p; }
  makeAnimal(id, x, y) {
    const A = ANIMALI[id], s = this.add.sprite(x, y, A.tex, A.idle).setOrigin(0.5, 1);
    s.chiave = id; s.walkAnim = 'walk-' + id; s.idleFrame = A.idle; return s;
  }
  movePlayer(dt, blocked) {
    const v = this.hud.vector(), p = this.player, sp = 62 * dt, moving = Math.hypot(v.x, v.y) > 0.15;
    if (moving) {
      const nx = p.x + v.x * sp, ny = p.y + v.y * sp;
      if (!blocked(nx, p.y)) p.x = nx;
      if (!blocked(p.x, ny)) p.y = ny;
      if (Math.abs(v.x) > Math.abs(v.y)) { p.dir = 'side'; p.setFlipX(v.x < 0); } else p.dir = v.y < 0 ? 'up' : 'down';
      p.anims.play('g-' + p.dir, true);
    } else { p.anims.stop(); p.setFrame(p.dir === 'down' ? 0 : p.dir === 'up' ? 4 : 8); }
    p.setDepth(p.y); return moving;
  }
  followers(list) {
    const p = this.player, tr = this.trail;
    const last = tr[tr.length - 1];
    if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 1.5) tr.push({ x: p.x, y: p.y });
    if (tr.length > 300) tr.shift();
    list.forEach((f, i) => {
      const gap = 12 * (i + 1); let idx = tr.length - 1, acc = 0;
      while (idx > 0 && acc < gap) { acc += Math.hypot(tr[idx].x - tr[idx - 1].x, tr[idx].y - tr[idx - 1].y); idx--; }
      const tgt = tr[Math.max(0, idx)] || p;
      if (Math.hypot(tgt.x - f.x, tgt.y - f.y) > 0.5 && acc >= gap * 0.9) {
        if (Math.abs(tgt.x - f.x) > 0.3) f.setFlipX(tgt.x < f.x);
        f.x += (tgt.x - f.x) * 0.25; f.y += (tgt.y - f.y) * 0.25; f.anims.play(f.walkAnim, true);
      } else { f.anims.stop(); f.setFrame(f.idleFrame); }
      f.setDepth(f.y - 0.1);
    });
  }
  hearts(x, y) {
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(x + (i - 1) * 6, y, 'icone', 3).setScale(0.5).setDepth(9999);
      this.tweens.add({ targets: h, y: y - 14 - i * 3, alpha: 0, duration: 900, delay: i * 120, onComplete: () => h.destroy() });
    }
  }
}

// ---------------------------------------------------------------------
//  Il rifugio
// ---------------------------------------------------------------------
const STANZA = { w: 11 * T, h: 15 * T, muro: 2 * T };
const ZR = Math.max(2, Math.floor(CW / (STANZA.w + 4)));   // la stanza riempie quasi tutta la larghezza (zoom intero = pixel nitidi)
class Rifugio extends Mondo {
  constructor() { super('Rifugio'); }
  init(d) { this.stanza = (d && d.stanza) || 'casa'; this.pos0 = d && d.pos; this.uscendo = false; this.gattoDorme = !!(d && d.gattoDorme); }
  // se Mordicchio sta dormendo quando esci, resta lì: ti raggiunge più tardi
  gattoDormiente() { const c = this.cat; return !!(c && (c.dorme || (c.evento && this.eventoCorrente && this.eventoCorrente.chi.includes(c) && this.eventoOggi === 'mordicchio_posto'))); }
  create() {
    const S = Save.get();
    if (this.stanza === 'stalla' && !S.stallaAperta) this.stanza = 'casa';
    const stalla = this.stanza === 'stalla', giardino = this.stanza === 'fuori'; Musica.suona('casa'); this.dormendo = false;
    this.setupWorld('#3b2f4a', ZR);
    const cam = this.cameras.main;
    if (giardino) this.creaFuori(); else {
    this.add.tileSprite(0, STANZA.muro, STANZA.w, STANZA.h - STANZA.muro, stalla ? 'paglia' : 'pavimento').setOrigin(0).setDepth(-10);
    this.add.tileSprite(0, 0, STANZA.w, STANZA.muro, stalla ? 'travi' : 'muro').setOrigin(0).setDepth(-9); }
    this.add.graphics().setDepth(-8).lineStyle(3, 0x754c60).strokeRect(-1, -1, STANZA.w + 2, STANZA.h + 2);
    const f = this.add.graphics().setDepth(-8.5), fx = giardino ? -999 : STANZA.w - 46;
    f.fillStyle(0x754c60).fillRect(fx, 4, 30, 22); f.fillStyle(0xb1e0be).fillRect(fx + 2, 6, 26, 18);
    f.fillStyle(0xd6f1cd).fillRect(fx + 4, 8, 6, 4); f.fillStyle(0x754c60).fillRect(fx + 14, 6, 2, 18).fillRect(fx + 2, 14, 26, 2);
    const z = this.add.graphics().setVisible(this.stanza !== 'fuori').setDepth(-7);
    z.fillStyle(0x754c60).fillRect(STANZA.w / 2 - 16, STANZA.h - 6, 32, 6);
    z.fillStyle(0xd79e61).fillRect(STANZA.w / 2 - 14, STANZA.h - 14, 28, 9);
    z.fillStyle(0xba7c54).fillRect(STANZA.w / 2 - 12, STANZA.h - 12, 24, 1).fillRect(STANZA.w / 2 - 12, STANZA.h - 8, 24, 1);
    this.porta = { x: STANZA.w / 2, y: STANZA.h - 9 };
    this.arrediSprites = []; S.arredi.filter(a => (a.stanza || 'casa') === this.stanza).forEach(a => this.spawnArredo(a));
    this.peliSprites = []; if (this.stanza === 'casa') for (let i = 0; i < (S.peli || 0); i++) this.spawnPelo(i);
    const p0 = typeof this.pos0 === 'string' ? (POSTI_FUORI[this.pos0] || null) : this.pos0;
    this.makePlayer(p0 ? p0.x : STANZA.w / 2, p0 ? p0.y : STANZA.h - 26);
    // Mordicchio entra ed esce appena dopo Anastasia: compare sulla porta e la raggiunge
    const portaDa = this.stanza === 'fuori' ? (typeof this.pos0 === 'string' && typeof PORTE !== 'undefined' && PORTE[this.pos0]) : (!this.pos0 ? { x: STANZA.w / 2 + 4, y: STANZA.h - 3 } : null);
    this.cat = portaDa ? this.makeAnimal('mordicchio', portaDa.x, portaDa.y) : this.stanza === 'fuori' && this.player ? this.makeAnimal('mordicchio', this.player.x + 12, this.player.y) : this.makeAnimal('mordicchio', STANZA.w / 2 + 30, STANZA.h - 70);
    if (portaDa) {
      const c = this.cat, ritardo = this.gattoDorme ? 15000 + Math.random() * 10000 : 450; c.setAlpha(0).setVisible(false); c.occupato = true;
      if (this.gattoDorme) this.catSveglioFino = this.time.now + ritardo + 50000;
      this.time.delayedCall(ritardo, () => { if (!c.active) return; c.setAlpha(1).setVisible(true); if (this.gattoDorme && this.stanza === 'fuori') { c.setPosition(portaDa.x, portaDa.y); } const tx = this.player.x + 12, ty = this.player.y + (this.stanza === 'fuori' ? 0 : -6);
        c.setFlipX(tx < c.x); c.anims.play(c.walkAnim, true);
        this.tweens.add({ targets: c, x: tx, y: ty, duration: 650, onUpdate: () => c.setDepth(c.y), onComplete: () => { c.anims.stop(); c.setFrame(c.idleFrame); c.occupato = false; c.pausa = 6 + Math.random() * 4; } }); });
    }
    this.ospiti = [this.cat];
    // Mordicchio arriva con te ed è sveglio: per un po' non si mette a dormire né sparisce in un evento (continuità tra le stanze)
    this.catSveglioFino = this.time.now + 50000;
    Object.keys(S.animali).filter(k => k !== 'mordicchio' && ANIMALI[k] && luogoAttuale(k) === this.stanza && (this.stanza !== 'stalla' || S.stallaAperta)).forEach((k, i) => {
      const p = giardino ? this.puntoLibero() : { x: 30 + (i * 37) % 130, y: STANZA.muro + 40 + ((i * 53) % 150) };
      this.ospiti.push(this.makeAnimal(k, p.x, p.y));
    });
    this.ospiti.forEach(o => { o.meta = null; o.pausa = 1 + Math.random() * 2; });
    const visH = CH / ZR;
    if (visH >= STANZA.h + 40) cam.centerOn(STANZA.w / 2, STANZA.h / 2 - 4);
    else { cam.setBounds(Math.min(0, (STANZA.w - CW / ZR) / 2), -40, Math.max(STANZA.w, CW / ZR), STANZA.h + 80); cam.startFollow(this.player, true, 0.15, 0.15); }
    this.modo = 'gioca';
    this.attachHud();
    if (!S.introVista) { if (this.avviaIntro && this.stanza === 'casa') this.avviaIntro(); else this.time.delayedCall(400, () => this.hud.say(INTRO, () => { S.introVista = true; Save.write(); })); }
    else if (!S.consiglioSonno && this.stanza === 'casa') { S.consiglioSonno = true; Save.write(); this.time.delayedCall(900, () => this.hud.say([{ who: 'mordicchio', text: 'Quando vuoi riposare o andare a dormire, tocca l\'orologio in alto oppure il letto. Io mi sistemo tra le tue gambe, come sempre.' }])); }
    else if (S.ultimoArrivo && this.stanzaArrivo(S.ultimoArrivo)) { const id = S.ultimoArrivo; S.ultimoArrivo = null; Save.write(); this.hud.attendiStoria(1500); if (this.messaInScena) this.messaInScena(id); this.time.delayedCall(400, () => this.hud.say((DOPO_LIVELLO[id] || []).filter(l => S.bastoncino || !/bastoncino/i.test(l.text)), () => this.commentaPeli())); }
    else this.time.delayedCall(600, () => this.commentaPeli());
  }
  // Mordicchio commenta il nuovo arrivato solo nella stanza dove vive (non fuori se l'animale è in casa)
  stanzaArrivo(id) {
    const L = LIVELLI.find(l => l.id === id); if (!L || L.animale === 'mordicchio') return true;
    const k = L.ospite && L.animale !== L.ospite ? L.animale : L.animale;
    return (typeof stanzaDi === 'function' ? stanzaDi(k) : (ANIMALI[k].stanza || 'casa')) === this.stanza;
  }
  attachHud() {
    const hud = this.hud, S = Save.data;
    hud.attach({ cam: this.cameras.main, onTap: (x, y) => this.tap(x, y), onDrag: p => this.drag(p), joystick: this.modo === 'gioca' });
    if (this.modo !== 'gioca') return this.uiArreda();
    hud.layer.add(pannello(hud, 8, 8, 112, 30));
    hud.layer.add(hud.add.image(26, 23, 'seme').setScale(1.3));
    this.semiTxt = txt(hud, 40, 23, S.semi + ' semi', 13).setOrigin(0, 0.5); hud.layer.add(this.semiTxt);
    const mb = hud.button(126, 8, 34, 30, Musica.on ? '♪' : '–', () => { mb.label.setText(Musica.toggle() ? '♪' : '–'); }, { size: 15 });
    this.barraOra(hud);
    hud.button(256, 8, UW - 264, 30, 'Diario', () => this.diario(), { size: 13 });   // i posti sostituiscono la barra in basso
    if (this.stanza === 'casa' && (S.peli || 0) > 0) this.btnAspira = hud.button(UW - 120, 46, 112, 30, 'Aspirapolvere', () => this.aspira(), { size: 12 });
  }
  spawnArredo(a) {
    const o = OGGETTI[a.id]; if (!o) return null;
    const s = o.atlas ? this.add.image(a.x, a.y, o.atlas, o.frame) : this.add.image(a.x, a.y, o.tex);
    s.setOrigin(0.5, 1); s.dati = a; s.ogg = o; s.setDepth(this.depthDi(s));
    this.arrediSprites.push(s); return s;
  }
  spawnPelo(i) {
    const r = n => { const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    const x = 14 + r(1) * (STANZA.w - 28), y = STANZA.muro + 16 + r(2) * (STANZA.h - STANZA.muro - 40);
    const g = this.add.graphics({ x, y }).setDepth(-4);
    g.fillStyle(0xf4f1ea).fillCircle(0, 0, 2.6).fillCircle(2.6, -1, 2).fillCircle(-2.2, 1, 1.8);
    g.fillStyle(0x3a3240).fillCircle(1.2, 1.2, 1.4).fillCircle(-1, -1.4, 1);
    g.px = x; g.py = y; this.peliSprites.push(g);
  }
  commentaPeli() {
    const n = Save.data.peli || 0; if (this.stanza !== 'casa' || n < 4 || !this.cat || this.hud.dialog) return;
    this.hud.bubble(this.cat, pick(n >= 8 ? FRASI_PELI_TANTI : FRASI_PELI, this.recent), 4200);
  }
  raccogliPelo(g) {
    const S = Save.data; this.peliSprites = this.peliSprites.filter(p => p !== g);
    this.tweens.add({ targets: g, alpha: 0, y: g.y - 6, duration: 250, onComplete: () => g.destroy() });
    S.peli = Math.max(0, (S.peli || 0) - 1); S.semi += 1; Save.write(); Sfx.seme();
    if (this.semiTxt) this.semiTxt.setText(S.semi + ' semi');
    if (!S.peli && this.btnAspira) { this.btnAspira.destroy(); this.btnAspira = null; }
  }
  aspira() {
    const S = Save.data; if (this.aspirando || !this.peliSprites.length) return; this.aspirando = true;
    Sfx.aspira(); this.cameras.main.shake(1400, 0.002);
    const cat = this.cat; cat.dorme = false; cat.coccola = 0;
    const via = cat.x < STANZA.w / 2 ? STANZA.w - 18 : 18;
    cat.meta = { x: via, y: STANZA.muro + 22 }; cat.pausa = 6;
    this.time.delayedCall(250, () => { this.hud.bubble(cat, pick(FRASI_ASPIRAPOLVERE, this.recent), 3600); Sfx.miao(); });
    const n = this.peliSprites.length;
    this.peliSprites.slice().forEach((g, i) => this.time.delayedCall(150 + i * 120, () => this.raccogliPelo(g)));
    this.time.delayedCall(400 + n * 120, () => {
      this.aspirando = false;
      if (bonusUnaVolta('pulizia')) { S.semi += 5; Save.write(); if (this.semiTxt) this.semiTxt.setText(S.semi + ' semi'); this.hud.toast('Casa pulita! +5 semi'); Sfx.cuore(); }
      else this.hud.toast('Casa pulita!');
    });
  }
  depthDi(s) { return s.ogg.tipo === 'tappeto' ? -5 : s.ogg.tipo === 'muro' ? -6 : s.y; }
  wander(dt) {
    if (this.stanza === 'fuori' && this.cat && !this.cat.occupato && !(this.cat.coccola > 0) && !this.cat.evento) this.followers([this.cat]);
    this.ospiti.forEach(o => {
      if (o.occupato || o.evento || o.uscendo || (this.stanza === 'fuori' && o === this.cat && !o.eventoFuori)) return;
      if (o.coccola > 0) { o.coccola -= dt; return; }
      if (!o.meta) {
        o.pausa -= dt; if (!o.gesto) { o.anims.stop(); o.setFrame(o.dorme && o.chiave === 'mordicchio' ? 4 : o.idleFrame); }
        if (o.pausa <= 0) {
          o.dorme = false; o.meta = this.puntoLibero(o);
          const pp = this.postoPreferito ? this.postoPreferito(o) : null; if (pp && Math.random() < 0.5) o.meta = pp;
        }
      } else {
        const dx = o.meta.x - o.x, dy = o.meta.y - o.y, d = Math.hypot(dx, dy), sp = 18 * dt * (o.velocita || 1);
        if (d < 2) { const posto = o.meta.posto; o.meta = null; o.pausa = 2 + Math.random() * 4; if (o.chiave === 'mordicchio' && this.time.now > (this.catSveglioFino || 0) && (posto || Math.random() < 0.35)) { o.dorme = true; o.pausa = posto ? 12 : 8; } else if (posto && o.chiave !== 'mordicchio' && this.arrivoPosto) this.arrivoPosto(o, posto); else this.gestoArrivo(o); }
        else { o.x += dx / d * sp; o.y += dy / d * sp; o.setFlipX(dx < 0); o.anims.play(o.walkAnim, true); }
      }
      o.setDepth(o.dorme && o.chiave === 'mordicchio' ? o.y + 30 : o.y);
    });
    this.separa(dt);
  }
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (this.modo === 'gioca') {
      if (this.stanza === 'fuori') { this.movePlayer(dt, (x, y) => this.bloccatoFuori(x, y)); this.controllaFuori(); }
      else {
        this.movePlayer(dt, (x, y) => x < 8 || x > STANZA.w - 8 || y < STANZA.muro + 10 || y > STANZA.h - 2);
        if (Math.abs(this.player.x - this.porta.x) < 14 && this.player.y > STANZA.h - 6) this.esci();
      }
    }
    this.wander(dt);
    this.tickOra(dt);
  }
  // ---------------- animali ----------------
  tap(x, y) {
    if (this.modo === 'arreda') return this.tapArreda(x, y);
    if (this.stanza === 'fuori' && this.tapGiardino(x, y)) return;
    const o = this.ospiti.filter(o => o.visible && Math.abs(o.x - x) < 12 && y < o.y + 4 && y > o.y - 20).sort((a, b) => Math.hypot(a.x - x, a.y - 8 - y) - Math.hypot(b.x - x, b.y - 8 - y))[0];
    if (o && !o.occupato) return this.menuAnimale(o);
    const g = (this.peliSprites || []).find(g => Math.abs(g.px - x) < 9 && Math.abs(g.py - y) < 9);
    if (g) this.raccogliPelo(g);
    else { const letto = (this.arrediSprites || []).find(a => /^letto/.test(a.dati.id) && a.getBounds().contains(x, y)); if (letto) this.giornata(); }
  }
  menuAnimale(o) {
    const hud = this.hud, id = o.chiave, A = ANIMALI[id], S = Save.data;
    o.meta = null; o.coccola = 99; o.dorme = false; o.anims.stop(); o.setFrame(o.idleFrame);
    const azioni = [['Accarezza', () => this.accarezza(o)], ['Fai un regalo', () => this.regala(o)]];
    if (id === 'mordicchio' && S.bastoncino) azioni.push(['Lancia il bastoncino', () => this.lancia()]);
    if (id === 'mordicchio' && cuoriDi('mordicchio') >= 1) azioni.push(['Chiedi un bacino', () => this.bacino(o)]);
    if (FRASI_EXTRA[id]) azioni.splice(1, 0, ['Chiacchiera', () => this.chiacchiera(o)]);
    if (id !== 'mordicchio' && !(typeof LIBERI !== 'undefined' && LIBERI[id])) azioni.push(['Dove vive: ' + NOMI_STANZE[stanzaDi(id)], () => this.sceltaStanza(o)]);
    this.fineEvento && this.fineEvento(o);
    const h = 104 + azioni.length * 40, m = hud.modal(A.nome, h, () => { o.coccola = 1; });
    m.c.add(hud.add.image(44, m.y + 64, A.tex, o.idleFrame).setScale(scalaRitratto(A.tex, 3)));
    m.c.add(txt(hud, 72, m.y + 46, A.carattere + ' · ' + A.specie, 12, COL.testo));
    cuoriFrames(cuoriDi(id)).forEach((fr, i) => m.c.add(hud.add.image(80 + i * 20, m.y + 72, 'icone', fr).setScale(1.2)));
    azioni.forEach(([l, cb], i) => hud.button(28, m.y + 96 + i * 40, UW - 56, 34, l, () => { m.c.destroy(); hud.scroller = null; hud.ctrl.frozen = false; cb(); }, { parent: m.c, size: 14 }));
  }
  bacino(o) {
    o.coccola = 3; o.setFlipX(this.player.x < o.x); Sfx.miao();
    this.time.delayedCall(300, () => { this.hearts(o.x, o.y - 14); this.hud.bubble(o, pick(FRASI_BACINO, this.recent), 3800); });
    if (bonusUnaVolta('bacino')) aggiungiCuori('mordicchio', 1);
  }
  accarezza(o) {
    const id = o.chiave, A = ANIMALI[id], S = Save.data;
    o.coccola = 2.5; this.hearts(o.x, o.y - 14);
    if (id === 'mordicchio') Sfx.miao(); else Sfx.cuore();
    let frase;
    // gli indizi sui gusti si dicono come consigli per i regali (non frasi a caso), e sempre meno quando li conosci già
    const scI = scoperto(id), nuovi = (A.indizi || []).filter(f => !scI.indizi.includes(f));
    if (A.indizi && Math.random() < (nuovi.length ? 0.35 : 0.08)) {
      const base = pick(nuovi.length ? nuovi : A.indizi, this.recent), i = A.indizi.indexOf(base);
      const lead = i === 0 ? pick(['Se un giorno mi fai un regalo... ', 'Un consiglio per i regali: ']) : pick(['A proposito di regali: ', 'Un consiglio, se mi fai un regalo: ']);
      frase = lead + base.charAt(0).toLowerCase() + base.slice(1); if (!scI.indizi.includes(base)) scI.indizi.push(base); Save.write();
    } else {
      const lvl = Math.floor(cuoriDi(id)), ctx = Math.random() < 0.35 ? frasiContesto(id, this.stanza) : []; const finoA = [].concat(...Object.keys(A.frasi).filter(n => +n <= lvl).map(n => A.frasi[n])); frase = Frasi.scegli(frasiValide(ctx.length ? ctx.concat(finoA) : finoA), id, this.recent) || pick(GESTI_RIPIEGO, this.recent);
    }
    this.hud.bubble(o, frase, 4200);
    if (/^\*.*addorment/.test(frase)) { o.dorme = true; o.meta = null; o.pausa = 10; o.coccola = 4.4; this.time.delayedCall(4400, () => { if (o.active && o.dorme && this.pensiero) this.pensiero(o, 'zzz', true); }); } // se dice che si addormenta, si addormenta davvero
    const r = Eco.coccola(S, id); Save.write();
    if (r.sporco) this.time.delayedCall(4400, () => this.hud.bubble(o, pick(FRASI_SPORCO, this.recent), 3800));
    else if (r.nuovoCuore) this.time.delayedCall(700, () => this.hud.toast('Amicizia con ' + A.nome + ': ' + r.cuori + (r.cuori === 1 ? ' cuore' : ' cuori') + '!'));
  }
  regala(o) {
    const hud = this.hud, S = Save.data, A = ANIMALI[o.chiave];
    if (Eco.regaloOggi(S, o.chiave)) { o.coccola = 2; return hud.bubble(o, pick(['Oggi mi hai già fatto un regalo! Domani magari.', 'Un regalo al giorno basta e avanza. Grazie!']), 3500); }
    const ids = Object.keys(REGALI).filter(k => Eco.quantiRegali(S, k) > 0);
    const m = hud.modal('Un regalo per ' + A.nome, 300, () => { o.coccola = 1; });
    if (!ids.length) { m.c.add(txt(hud, UW / 2, m.y + 140, 'Non hai regali.\nLi trovi lungo il sentiero,\nnell\'orto o alla bancarella.', 13, COL.testo, { align: 'center' }).setOrigin(0.5)); return; }
    const sa = hud.scrollArea(m.c, 24, m.y + 48, UW - 48, 236), cw = (UW - 48 - 16) / 3;
    ids.forEach((k, i) => {
      const r = REGALI[k], x = (i % 3) * (cw + 8), y = Math.floor(i / 3) * 82, cell = hud.add.container(x, y);
      const box = hud.add.rectangle(0, 0, cw, 74, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, 0xd79e61).setInteractive();
      cell.add([box, fitIcon(iconaRegalo(hud, cw / 2, 28, k), 30), stringi(txt(hud, cw / 2, 52, r.nome, 10, COL.testo, { align: 'center', wordWrap: { width: cw - 8 } }).setOrigin(0.5), cw - 6, 26), txt(hud, cw - 6, 6, '×' + Eco.quantiRegali(S, k), 10, COL.titolo).setOrigin(1, 0)]);
      box.on('pointerup', () => { if (hud.scrollDragged) return; m.close(); this.dai(o, k); });
      sa.inner.add(cell); sa.contentH = y + 82;
    });
  }
  dai(o, k) {
    const S = Save.data, id = o.chiave, A = ANIMALI[id], r = REGALI[k], g = A.gusti, sc = scoperto(id), hud = this.hud;
    o.coccola = 3;
    let esito;
    if (A.soloGiochi && r.tag.includes('cibo')) esito = 'gatto';
    else if (r.tag.includes(g.adora)) esito = 'adora';
    else if (r.tag.includes(g.gradisce)) esito = 'gradisce';
    else if (r.tag.includes(g.sgradito)) esito = 'sgradito';
    else esito = 'neutro';
    const testi = {
      adora: ['Lo adoro! È proprio quello che volevo!', 'Come facevi a saperlo? Grazie!', 'Il regalo più bello di sempre!'],
      gradisce: ['Che pensiero gentile, grazie!', 'Mi piace, lo tengo vicino.'],
      neutro: ['Grazie, ma non fa tanto per me. Riprendilo pure.', 'Carino, ma forse a qualcun altro piace di più.'],
      sgradito: ['No no, questo proprio no! Tienilo tu.', 'Preferirei di no, grazie... te lo ridò.'],
      gatto: ['Grazie, ma io mangio solo le mie crocchette. Tienilo per gli altri.'],
    };
    hud.bubble(o, pick(testi[esito]), 3800);
    if (esito === 'adora' || esito === 'gradisce' || esito === 'sgradito') {
      const r = Eco.regala(S, id, k); if (!sc[esito]) sc[esito] = k;
      if (esito !== 'sgradito') { this.hearts(o.x, o.y - 14); Sfx.cuore(); }
      this.time.delayedCall(800, () => hud.toast(r.nuovoCuore ? A.nome + ': ' + r.cuori + (r.cuori === 1 ? ' cuore' : ' cuori') + '!' : esito === 'adora' ? 'Amicizia con ' + A.nome + ': tanta!' : esito === 'gradisce' ? 'Amicizia con ' + A.nome + ': un po\' di più' : A.nome + ' ha un po\' storto il naso'));
    }
    if (esito === 'sgradito' || esito === 'neutro' || esito === 'gatto') {
      Sfx.no(); this.tweens.add({ targets: o, x: o.x + 2, yoyo: true, repeat: 3, duration: 50 });
    }
    Save.write();
  }
  lancia() {
    const cat = this.cat, p = this.player, hud = this.hud;
    if (cat.occupato) return;
    cat.occupato = true; cat.meta = null; cat.dorme = false;
    const tx = Phaser.Math.Between(20, STANZA.w - 20), ty = Phaser.Math.Between(STANZA.muro + 30, STANZA.h - 40);
    const stick = this.add.image(p.x, p.y - 12, 'bastoncino').setScale(0.6).setDepth(9000);
    this.time.delayedCall(7000, () => { if (stick.active) { stick.destroy(); cat.anims.timeScale = 1; cat.occupato = false; } }); // se qualcosa lo interrompe, il bastoncino non resta per terra
    Sfx.pop();
    this.tweens.add({ targets: stick, x: tx, duration: 600 });
    this.tweens.add({ targets: stick, y: { from: p.y - 12, to: ty - 2 }, angle: 540, duration: 600, ease: 'Quad.in', onComplete: () => stick.setDepth(ty - 1) });
    const corri = (x, y, dopo) => {
      const d = Math.hypot(x - cat.x, y - cat.y); cat.setFlipX(x < cat.x); cat.anims.play('walk-mordicchio', true); cat.anims.timeScale = 2;
      this.tweens.add({ targets: cat, x, y, duration: Math.max(200, d / 75 * 1000), onUpdate: () => cat.setDepth(cat.y), onComplete: dopo });
    };
    this.time.delayedCall(250, () => corri(tx, ty + 2, () => {
      stick.destroy(); cat.anims.stop(); cat.anims.timeScale = 1; cat.setFrame(3);
      corri(p.x + 10, p.y, () => {
        cat.anims.stop(); cat.anims.timeScale = 1; cat.setFrame(2); cat.occupato = false; cat.coccola = 2;
        Sfx.miao(); hud.bubble(cat, pick(['Eccolo! Ancora?', 'Te l\'ho riportato. Lancialo di nuovo!', 'Preso! Di nuovo, di nuovo!'], this.recent), 3000);
        if (bonusUnaVolta('bastoncino')) aggiungiCuori('mordicchio', 1);
      });
    }));
  }
  // ---------------- Amici ----------------
  amici() {
    const hud = this.hud, S = Save.data;
    const m = hud.modal('Amici del rifugio', Math.min(UH - 40, 560));
    const sa = hud.scrollArea(m.c, 24, m.y + 46, UW - 48, m.h - 58);
    let y = 0;
    Object.keys(S.animali).filter(k => ANIMALI[k]).forEach(k => {
      const A = ANIMALI[k], sc = scoperto(k), card = hud.add.container(0, y);
      const righe = [['Adora', sc.adora], ['Gradisce', sc.gradisce], ['Non sopporta', sc.sgradito]];
      const ind = sc.indizi.map(s => '«' + s + '»');
      const L0 = LIVELLI.find(l => l.animale === k || l.ospite === k), amici = (typeof amiciDi === 'function' ? amiciDi(k) : []).filter(x => S.animali[x] && ANIMALI[x]).map(x => ANIMALI[x].nome);
      const info = [(k === 'mordicchio' ? 'Sempre con te, ovunque.' : typeof LIBERI !== 'undefined' && LIBERI[k] ? LIBERI[k].dove + (L0 ? ' · incontro: «' + L0.nome + '»' : '') : 'Vive ' + ({ casa: 'in casa', stalla: 'in stalla', fuori: 'in giardino' })[typeof stanzaDi === 'function' ? stanzaDi(k) : 'casa'] + (L0 ? ' · incontro: «' + L0.nome + '»' : '')), amici.length ? 'Amici: ' + amici.join(', ') : null, (A.preferiti || []).length ? 'Posti preferiti: ' + [...new Set(A.preferiti.map(p => (OGGETTI[p] || {}).nome).filter(Boolean).map(n => n.replace(/ (verde|rosa|azzurr[oa])$/i, '')))].slice(0, 4).join(', ').toLowerCase() : null, typeof piattoPreferitoInfo === 'function' ? piattoPreferitoInfo(k) : null].filter(Boolean).join('\n');
      const carTxt = txt(hud, 60, 32, A.carattere + ' · ' + A.specie, 11, COL.testo, { wordWrap: { width: UW - 48 - 70 }, lineSpacing: 1 }), dy = Math.max(0, carTxt.height - 14);
      const infoTxt = txt(hud, 14, 128 + dy, info, 11, '#7d6a5c', { wordWrap: { width: UW - 80 }, lineSpacing: 2 });
      const indTxt = txt(hud, 14, 136 + dy + infoTxt.height, ind.length ? 'Cosa ti ha raccontato:\n' + ind.join('\n') : 'Accarezzalo per sentire cosa racconta.', 11, COL.testo, { wordWrap: { width: UW - 80 }, lineSpacing: 2 });
      const hh = 146 + dy + infoTxt.height + indTxt.height;
      card.add(hud.add.rectangle(0, 0, UW - 48, hh, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, 0xd79e61));
      card.add(hud.add.image(30, 34, A.tex, A.idle).setScale(scalaRitratto(A.tex, 2.5)));
      card.add(txt(hud, 60, 12, A.nome, 15, COL.titolo));
      card.add(carTxt);
      cuoriFrames(cuoriDi(k)).forEach((fr, i) => card.add(hud.add.image(68 + i * 18, 58 + dy, 'icone', fr)));
      righe.forEach(([l, v], i) => card.add(txt(hud, 14 + i * 98, 80 + dy, l + ':\n' + (v ? REGALI[v].nome : '???'), 11, v ? COL.verde : '#9d866f', { lineSpacing: 2, wordWrap: { width: 92 } })));
      card.add(infoTxt); card.add(indTxt);
      sa.inner.add(card); y += hh + 10;
    });
    sa.contentH = y;
  }
  // ---------------- Bottega ----------------
  bottega(tab = 'regali', scroll) {
    const hud = this.hud, S = Save.data;
    const m = hud.modal('La bancarella', Math.min(UH - 40, 560), () => this.attachHud());
    m.c.add(hud.add.image(34, m.y + 50, 'seme'));
    m.c.add(txt(hud, 46, m.y + 50, S.semi + ' semi', 13, COL.titolo).setOrigin(0, 0.5));
    hud.button(UW / 2 - 4, m.y + 38, 74, 26, 'Regali', () => { m.c.destroy(); this.bottega('regali'); }, { parent: m.c, size: 12, color: tab === 'regali' ? COL.titolo : '#9d866f' });
    hud.button(UW / 2 + 74, m.y + 38, 74, 26, 'Arredo', () => { m.c.destroy(); this.bottega('arredi'); }, { parent: m.c, size: 12, color: tab === 'arredi' ? COL.titolo : '#9d866f' });
    const sa = hud.scrollArea(m.c, 24, m.y + 72, UW - 48, m.h - 84), cw = (UW - 48 - 16) / 3;
    BOTTEGA[tab].forEach((k, i) => {
      const o = tab === 'regali' ? REGALI[k] : OGGETTI[k], x = (i % 3) * (cw + 8), y = Math.floor(i / 3) * 96;
      const cell = hud.add.container(x, y), puoi = S.semi >= o.prezzo;
      const box = hud.add.rectangle(0, 0, cw, 88, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, puoi ? 0xd79e61 : 0xc4bc93).setInteractive();
      cell.add([box, fitIcon(iconaRegalo(hud, cw / 2, 26, k), 30).setAlpha(puoi ? 1 : 0.5), stringi(txt(hud, cw / 2, 46, o.nome, 10, COL.testo, { align: 'center', wordWrap: { width: cw - 6 } }).setOrigin(0.5, 0), cw - 4, 24)]);
      cell.add(hud.add.image(cw / 2 - 8, 76, 'seme').setScale(0.7)); cell.add(txt(hud, cw / 2, 76, String(o.prezzo), 11, puoi ? COL.titolo : '#9d866f').setOrigin(0, 0.5));
      box.on('pointerup', () => {
        if (hud.scrollDragged) return;
        if (S.semi < o.prezzo) { Sfx.no(); hud.toast('Ti servono ancora ' + (o.prezzo - S.semi) + ' semi'); return; }
        S.semi -= o.prezzo;
        if (tab === 'regali') S.regali[k] = (S.regali[k] || 0) + 1; else S.inventario.push(k);
        Save.write(); Sfx.seme();
        const sy = sa.inner.y; m.c.destroy(); this.bottega(tab, sy);
        hud.toast(tab === 'regali' ? 'Comprato: ' + o.nome : o.nome + ': lo trovi in Arreda');
      });
      sa.inner.add(cell); sa.contentH = y + 96;
    });
    if (scroll != null) sa.inner.y = scroll;
  }
  // ---------------- ARREDAMENTO ----------------
  entraArreda() { this.modo = 'arreda'; this.ghost = null; this.player.anims.stop(); this.attachHud(); this.mostraGriglia(true); }
  esciArreda() { if (this.ghost) this.annullaGhost(); this.modo = 'gioca'; this.mostraGriglia(false); this.attachHud(); }
  mostraGriglia(on) {
    if (this.griglia) this.griglia.destroy(); this.griglia = null; if (!on) return;
    const g = this.add.graphics().setDepth(-4); g.lineStyle(0.5, 0xffffff, 0.25);
    for (let x = 0; x <= STANZA.w; x += 8) g.lineBetween(x, 0, x, STANZA.h);
    for (let y = 0; y <= STANZA.h; y += 8) g.lineBetween(0, y, STANZA.w, y);
    this.griglia = g;
  }
  uiArreda() {
    const hud = this.hud, S = Save.data;
    hud.layer.add(pannello(hud, 8, 8, UW - 16, 34));
    hud.layer.add(txt(hud, 20, 25, 'Arreda: tocca un mobile per spostarlo', 11, COL.testo).setOrigin(0, 0.5));
    hud.button(UW - 74, 10, 62, 30, 'Fine', () => this.esciArreda());
    const th = 88, ty = UH - th - 8;
    hud.layer.add(pannello(hud, 8, ty, UW - 16, th));
    if (!S.inventario.length) hud.layer.add(txt(hud, UW / 2, ty + th / 2, 'Nessun mobile da sistemare.\nNe trovi lungo il sentiero e alla bancarella in giardino.', 11, COL.testo, { align: 'center', wordWrap: { width: UW - 40 } }).setOrigin(0.5));
    const per = Math.floor((UW - 32) / 58), pagina = this.pagina || 0, pagine = Math.max(1, Math.ceil(S.inventario.length / per));
    if (pagina >= pagine) this.pagina = 0;
    S.inventario.slice((this.pagina || 0) * per, (this.pagina || 0) * per + per).forEach((id, j) => {
      const i = (this.pagina || 0) * per + j, o = OGGETTI[id]; if (!o) return;
      const cell = hud.add.container(16 + j * 58, ty + 10);
      const box = hud.add.rectangle(0, 0, 54, 68, 0xfbf4dc).setOrigin(0).setStrokeStyle(2, 0xd79e61).setInteractive();
      const et = txt(hud, 27, 54, o.nome, 10.5, COL.testo, { align: 'center', wordWrap: { width: 52, useAdvancedWrap: true }, lineSpacing: -1 }).setOrigin(0.5);
      if (o.nome.split(' ').some(w => w.length > 9)) et.setFontSize(9);   // parole lunghe come «Cassettiera»
      stringi(et, 52, 26);
      cell.add([box, fitIcon(iconaRegalo(hud, 27, 22, id), 32), et]);
      box.on('pointerup', () => { Sfx.pop(); this.prendiDaInventario(i); });
      hud.layer.add(cell);
    });
    if (pagine > 1) hud.button(UW - 64, ty - 32, 54, 26, 'Altri ›', () => { this.pagina = ((this.pagina || 0) + 1) % pagine; this.attachHud(); }, { size: 11 });
    if (this.ghost) this.uiGhost();
  }
  prendiDaInventario(i) {
    if (this.ghost) this.annullaGhost();
    const S = Save.data, id = S.inventario.splice(i, 1)[0]; Save.write();
    const cam = this.cameras.main, a = { id, x: Math.round(cam.midPoint.x / 8) * 8, y: Math.round(cam.midPoint.y / 8) * 8 };
    if (OGGETTI[id].tipo === 'muro') a.y = 24;
    const s = this.spawnArredo(a); this.ghost = { s, daInventario: true };
    this.aggiornaGhost(); this.attachHud();
  }
  tapArreda(x, y) {
    if (this.ghost) { this.spostaGhost(x, y); return; }
    const hit = this.arrediSprites.slice().sort((a, b) => b.depth - a.depth).find(s => s.getBounds().contains(x, y));
    if (!hit) return;
    Sfx.pop(); this.ghost = { s: hit, daInventario: false, orig: { x: hit.x, y: hit.y } };
    this.aggiornaGhost(); this.attachHud();
  }
  drag(p) {
    if (this.modo !== 'arreda' || !this.ghost) return false;
    const w = this.cameras.main.getWorldPoint(p.x, p.y); this.spostaGhost(w.x, w.y + this.ghost.s.displayHeight / 2); return true;
  }
  spostaGhost(x, y) {
    const s = this.ghost.s, tipo = s.ogg.tipo;
    const nx = Phaser.Math.Clamp(Math.round(x / 8) * 8, Math.ceil(s.width / 2), STANZA.w - Math.ceil(s.width / 2));
    let ny = Math.round(y / 8) * 8;
    ny = tipo === 'muro' ? Phaser.Math.Clamp(ny, s.height + 2, STANZA.muro - 2) : Phaser.Math.Clamp(ny, STANZA.muro + s.height * 0.4 + 4, STANZA.h - 16);
    s.setPosition(nx, ny); this.aggiornaGhost();
  }
  valido(s) {
    const tipo = s.ogg.tipo, base = b => new Phaser.Geom.Rectangle(b.x + 1, b.y + b.height * 0.45, b.width - 2, b.height * 0.55 - 1);
    return !this.arrediSprites.some(o => o !== s && (o.ogg.tipo === 'tappeto') === (tipo === 'tappeto') && (o.ogg.tipo === 'muro') === (tipo === 'muro')
      && Phaser.Geom.Rectangle.Overlaps(base(s.getBounds()), base(o.getBounds())));
  }
  aggiornaGhost() {
    const s = this.ghost.s, ok = this.valido(s);
    if (ok) s.clearTint(); else s.setTint(0xff8a8a);
    s.setDepth(9000);
    if (!this.ghost.pulse) this.ghost.pulse = this.tweens.add({ targets: s, alpha: 0.55, yoyo: true, repeat: -1, duration: 450 });
    this.ghost.ok = ok;
  }
  uiGhost() {
    const hud = this.hud, by = UH - 88 - 8 - 44;
    hud.layer.add(pannello(hud, 8, 46, UW - 16, 26));
    hud.layer.add(txt(hud, UW / 2, 59, 'Trascina il dito per spostarlo', 11, COL.titolo).setOrigin(0.5));
    hud.button(UW / 2 - 132, by, 84, 34, 'Metti qui', () => this.confermaGhost());
    hud.button(UW / 2 - 42, by, 84, 34, 'Annulla', () => this.annullaGhost(true));
    hud.button(UW / 2 + 48, by, 84, 34, 'Metti via', () => this.inBorsa());
  }
  stopPulse(g) { if (g && g.pulse) { g.pulse.remove(); g.pulse = null; g.s.setAlpha(1); } }
  confermaGhost() {
    const g = this.ghost; if (!g) return;
    if (!g.ok) { this.hud.toast('Qui non ci sta: è sopra un altro mobile'); return; }
    const s = g.s, S = Save.data; this.stopPulse(g);
    s.clearTint(); s.dati.x = s.x; s.dati.y = s.y; s.setDepth(this.depthDi(s));
    if (g.daInventario) { s.dati.stanza = this.stanza; S.arredi.push(s.dati); }
    Save.write(); Sfx.pop(); this.tweens.add({ targets: s, scaleY: 1.15, yoyo: true, duration: 90 });
    this.ghost = null; this.attachHud();
  }
  annullaGhost(refresh) {
    const g = this.ghost; if (!g) return; this.stopPulse(g);
    if (g.daInventario) { Save.data.inventario.push(g.s.dati.id); this.rimuoviSprite(g.s); }
    else { g.s.setPosition(g.orig.x, g.orig.y).clearTint(); g.s.setDepth(this.depthDi(g.s)); }
    Save.write(); this.ghost = null; if (refresh) this.attachHud();
  }
  inBorsa() {
    const g = this.ghost; if (!g) return; const S = Save.data; this.stopPulse(g);
    S.inventario.push(g.s.dati.id); if (!g.daInventario) S.arredi = S.arredi.filter(a => a !== g.s.dati);
    this.rimuoviSprite(g.s); Save.write(); this.ghost = null; this.attachHud();
  }
  rimuoviSprite(s) { this.arrediSprites = this.arrediSprites.filter(o => o !== s); s.destroy(); }
}

// ---------------------------------------------------------------------
//  Il sentiero
// ---------------------------------------------------------------------
class Mappa extends Phaser.Scene {
  constructor() { super('Mappa'); }
  create() {
    const S = Save.get(), hud = this.scene.get('Hud'); hud.attach(null); Musica.suona('sentiero');
    const cam = this.cameras.main; cam.setZoom(U); cam.setBackgroundColor('#9bd4c3'); cam.fadeIn(250);
    const step = 74, totale = 30, altezza = 230 + totale * step + 80;
    cam.setBounds(0, 0, UW, Math.max(UH, altezza));
    const pts = []; for (let i = 0; i < totale; i++) pts.push({ x: UW / 2 + Math.sin(i * 1.1) * 90 + Math.sin(i * 2.7) * 14, y: altezza - 170 - i * step });
    // tre paesaggi: prati, alpeggio, paese
    const zone = [[0x9bd4c3, null], [0xb5d27a, 0xa4c263], [0x9fc27a, 0x86a866], [0xd8d3b0, 0xc4bc93]];
    const sfondo = this.add.graphics();
    NOMI_CAPITOLI.forEach((cap, ci) => {
      const y1 = ci === 0 ? altezza : pts[cap.da - 1].y + step / 2, y0 = ci === 2 ? 0 : pts[cap.a - 1].y - step / 2;
      sfondo.fillStyle(zone[ci + 1][0], 1).fillRect(0, y0, UW, y1 - y0);
      for (let k = 0; k < 40; k++) sfondo.fillStyle(zone[ci + 1][1], 1).fillRect((k * 83) % UW, y0 + ((k * 137) % Math.max(1, y1 - y0)), 3, 2);
    });
    // montagne all'alpeggio e casette in paese, ai lati del sentiero
    pts.forEach((p, i) => {
      const lato = Math.sin(i * 1.1) > 0 ? -1 : 1, x = p.x + lato * 84;
      if (i >= 10 && i < 20) { const m = this.add.graphics(); m.fillStyle(0x8a9a8c).fillTriangle(x - 28, p.y + 20, x, p.y - 26, x + 28, p.y + 20); m.fillStyle(0xf3f4e7).fillTriangle(x - 9, p.y - 12, x, p.y - 26, x + 9, p.y - 12); }
      else if (i >= 20) { const h = this.add.graphics(); h.fillStyle(0xf3e5c2).fillRect(x - 14, p.y - 6, 28, 20); h.fillStyle(0xbd757e).fillTriangle(x - 17, p.y - 6, x, p.y - 20, x + 17, p.y - 6); h.fillStyle(0x8cbfc2).fillRect(x - 8, p.y, 6, 6); h.lineStyle(1, 0x504086).strokeRect(x - 14, p.y - 6, 28, 20); }
      else this.add.image(x, p.y + 10, 'natura', ['albero', 'alberello', 'funghi', 'cespuglio', 'melo'][i % 5]).setScale(2).setOrigin(0.5, 1);
    });
    // il sentiero di terra, dal rifugio fino alla festa
    const casa = { x: UW / 2, y: altezza - 70 };
    const path = new Phaser.Curves.Spline([casa.x, casa.y, ...pts.map(p => [p.x, p.y]).flat()]), pg = this.add.graphics();
    const punti = path.getSpacedPoints(totale * 5);   // poche linee spesse: leggero anche sui telefoni
    pg.lineStyle(14, 0xd9bd93, 1).strokePoints(punti); pg.lineStyle(10, 0xe8cfa6, 1).strokePoints(punti);
    pg.fillStyle(0xd9bd93, 1); pg.fillCircle(casa.x, casa.y, 7);
    const hc = this.add.graphics(); hc.fillStyle(0xf3e5c2).fillRect(casa.x - 20, casa.y - 4, 40, 24); hc.fillStyle(0xbd757e).fillTriangle(casa.x - 24, casa.y - 4, casa.x, casa.y - 24, casa.x + 24, casa.y - 4);
    hc.fillStyle(0x90625d).fillRect(casa.x - 5, casa.y + 6, 10, 14); hc.lineStyle(2, 0x504086).strokeRect(casa.x - 20, casa.y - 4, 40, 24);
    txt(this, casa.x, casa.y + 30, 'Il rifugio', 12, COL.scuro, { backgroundColor: '#f3e5c2', padding: { x: 6, y: 2 } }).setOrigin(0.5, 0);
    const zc = this.add.zone(casa.x, casa.y + 10, 70, 70).setInteractive();
    zc.on('pointerup', () => { if (this.dragged || !this.toccoQui) return; Sfx.blip(); cam.fadeOut(250); this.time.delayedCall(260, () => this.scene.start('Rifugio', { stanza: 'fuori', pos: 'sentiero' })); });
    NOMI_CAPITOLI.forEach(cap => {
      const y = pts[cap.da - 1].y + step / 2 + 4;
      this.add.rectangle(UW / 2, y, UW, 22, 0x504086, 0.85).setDepth(5);
      txt(this, UW / 2, y, cap.nome, 13, '#f3e5c2').setOrigin(0.5).setDepth(6);
    });
    const aperto = id => id === 1 || S.completati.includes(id - 1);
    pts.forEach((p, i) => {
      const id = i + 1, fatto = S.completati.includes(id), ok = aperto(id), L = livello(id), prossima = ok && !fatto;
      const c = this.add.container(p.x, p.y);
      // un cartello di legno per ogni luogo; quelli lontani sono ancora nella nebbia
      c.add(this.add.image(0, 6, 'cartello').setScale(2).setOrigin(0.5, 1).setTint(ok ? 0xffffff : 0x9a948c).setAlpha(ok ? 1 : 0.6));
      if (fatto && L && ANIMALI[L.animale] && L.animale !== 'mordicchio') { const A = ANIMALI[L.animale]; c.add(this.add.image(20, 4, A.tex, A.idle).setScale(scalaRitratto(A.tex, 1.6)).setOrigin(0.5, 1)); }
      if (fatto) c.add(this.add.image(-18, -20, 'icone', 3).setScale(1.2));
      if (prossima) { const sc = this.add.image(0, -40, 'scintilla').setScale(0.9); c.add(sc); this.tweens.add({ targets: sc, angle: 360, alpha: 0.4, yoyo: true, repeat: -1, duration: 900 }); this.tweens.add({ targets: c, scale: 1.08, yoyo: true, repeat: -1, duration: 700 }); }
      c.setSize(70, 64).setInteractive();
      c.on('pointerup', () => {
        if (this.dragged || !this.toccoQui) return; Sfx.blip();
        if (!ok) { const prima = livello(id - 1); hud.toast('Prima ' + (prima && aperto(id - 1) ? prima.nome.toLowerCase() : 'le tappe precedenti')); return; }
        if (!L) { hud.toast('Questo posto arriva presto!'); return; }
        const pos = Eco.tappaPossibile(S, id);
        if (!pos.ok) {
          if (pos.perche === 'stanco') hud.say([{ who: 'mordicchio', text: pick(FRASI_STANCO) }]);
          else if (pos.perche === 'cancello') hud.say([{ who: 'mordicchio', text: pos.testo }]);
          else if (pos.perche === 'tardi') hud.say([{ who: 'mordicchio', text: 'È tardi per partire. Si va domattina, col sole.' }]);
          else if (pos.perche === 'alba' && this.tappaAllAlba) this.tappaAllAlba(id);
          else if (pos.perche === 'sogno' && this.tappaSogno) this.tappaSogno(id);
          else if (pos.perche === 'domani' && this.tappaDomani) this.tappaDomani(id);
          else if (pos.perche === 'nonora') { const sc = S.scomparsa && S.scomparsa.stato; hud.say([sc === 'via' || sc === 'sera' ? { who: 'anastasia', text: 'Non so dove sia andato. Di solito torna da solo prima del tramonto... aspettiamo.' } : (sc === 'prevista' || (S.completati.includes(9) && !S.completati.includes(10)) ? { who: 'mordicchio', text: pick(['Oggi non ho voglia di proseguire. Ho le zampe pesanti. Restiamo un po\' qui, in giardino?', 'Sono stanco, oggi. Il sentiero non scappa: facciamo una pausa, ti va?', 'Proseguire? Mmh. Oggi preferisco stare qui al sole. Domani, magari.']) } : { who: 'mordicchio', text: 'Lì non c\'è niente da vedere, per adesso. Io sto qui con te.' })]); }
          return;
        }
        cam.fadeOut(250); this.time.delayedCall(260, () => this.scene.start('Livello', { id }));
      });
      const nome = ok && L ? L.nome : '???';
      txt(this, p.x, p.y + 10, nome, 11, ok ? COL.scuro : '#7b6762', { backgroundColor: ok ? '#f3e5c2' : '#d8d0b8', padding: { x: 5, y: 2 } }).setOrigin(0.5, 0);
    });
    cam.centerOn(UW / 2, S.completati.length ? pts[Math.min(totale - 1, S.completati.length)].y : altezza - 160);
    // se arrivi qui col dito ancora appoggiato (camminando sul cartello), quel tocco non deve spostare la mappa
    this.dragY = null; this.dragged = false; this.toccoQui = false;
    this.input.on('pointerdown', p => { this.dragY = p.y; this.dragged = false; this.scroll0 = cam.scrollY; this.toccoQui = true; });
    this.input.on('pointerup', () => { this.dragY = null; this.time.delayedCall(0, () => { this.toccoQui = false; }); });
    this.input.on('pointermove', p => { if (!p.isDown || this.dragY == null) return; const d = (p.y - this.dragY) / U; if (Math.abs(d) > 6) this.dragged = true; const y = this.scroll0 - d; if (isFinite(y)) cam.scrollY = y; });
    this.input.on('wheel', (p, o, dx, dy) => { cam.scrollY += dy * 0.5; });
    hud.layer.add(pannello(hud, 8, 8, UW - 16, 36));
    hud.layer.add(txt(hud, 22, 26, 'Il sentiero', 15, COL.titolo).setOrigin(0, 0.5));
    hud.layer.add(txt(hud, 128, 26, 'Giorno ' + S.giorno + ' · ' + Eco.orario(S), 11, COL.testo).setOrigin(0, 0.5));
    const ob = Eco.obiettivo(S);
    if (ob && Eco.tappaPossibile(S, S.completati.length + 1).perche === 'cancello') { hud.layer.add(pannello(hud, 8, 48, UW - 16, 30)); hud.layer.add(txt(hud, 18, 63, 'Per proseguire: ' + ob.testo.split(',')[0].toLowerCase() + ' · ' + Math.min(S.semi, ob.prezzo) + '/' + ob.prezzo + ' semi', 11, COL.titolo).setOrigin(0, 0.5)); }
    hud.button(UW - 104, 12, 92, 28, 'Rifugio', () => this.scene.start('Rifugio', { stanza: 'fuori', pos: 'sentiero' }), { size: 12 });
  }
}

// ---------------------------------------------------------------------
//  Una tappa
// ---------------------------------------------------------------------
const IMMAGINI = { p: 'pino' };
const BLOCCANTI = { p: null, T: 'albero', M: 'melo', a: 'alberello', b: 'cespuglio', B: 'cespuglio_more', r: 'sasso', q: 'masso', g: 'girasole', x: 'tronco' };
const DECORI = { f: ['fiore_rosa2', 'fiore_giallo2', 'fiore_blu', 'fiore_rosa', 'fiore_giallo'], u: ['funghi', 'fungo', 'fungo_viola'] };
class Livello extends Mondo {
  constructor() { super('Livello'); }
  init(d) { this.lvId = d.id || 1; }
  create() {
    this.buio = null; this.luce = null; this.portale = null; this.cancello = null; this.dest = null; this.mamma = null; this.frozenAll = false; this.inManoSprite = null; this.npcBob = null; this.mammaBob = null;
    this.palchi = null; this.festaSprites = null; this.tasti = null; this.inDanza = false; this.uscita = null; this.animale = null;
    this.cancelloAperto = false; this.vicinoUscita = false; this.attesaDetta = 0; this.dettoPrimaParliamo = false; // la scena viene riusata: ogni nuova visita riparte pulita
    const L = livello(this.lvId), M = L.missione; this.L = L; Musica.suona(temaLivello(L));
    const rows = L.mappa, H = rows.length, W = rows[0].length;
    this.setupWorld('#9bd4c3');
    this.acqua = this.add.tileSprite(-320, -320, W * T + 640, H * T + 640, 'acqua', 0).setOrigin(0).setDepth(-20);
    this.time.addEvent({ delay: 500, loop: true, callback: () => { this.acquaF = ((this.acquaF || 0) + 1) % 4; this.acqua.setFrame(this.acquaF); } });
    const land = rows.map(r => [...r].map(ch => ch !== '~' && ch !== 'n'));
    this.land = land; this.blocchi = new Set(); this.muri = new Set();
    const isL = (x, y) => y >= 0 && y < H && x >= 0 && x < W && land[y][x], data = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        if (!land[y][x]) { row.push(-1); continue; }
        const n = isL(x, y - 1), s = isL(x, y + 1), w = isL(x - 1, y), e = isL(x + 1, y);
        let fx = 1, fy = 1;
        if (!w && e) fx = 0; else if (!e && w) fx = 2;
        if (!n && s) fy = 0; else if (!s && n) fy = 2;
        let idx = fy * 11 + fx;
        if (n && s && w && e) { const r = Math.random(); if (r < 0.18) idx = 55 + Math.floor(Math.random() * 6); else if (r < 0.3) idx = 66 + Math.floor(Math.random() * 6); }
        row.push(idx);
      }
      data.push(row);
    }
    const map = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    this.terreno = map.createLayer(0, map.addTilesetImage('erba', 'erba', T, T, 0, 0), 0, 0).setDepth(-15);
    this.items = []; this.nascondigli = []; let start = { x: 0, y: 0 };
    const fatta = this.fatta = Save.data.completati.includes(L.id);
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      const cx = x * T + 8, by = y * T + 14;
      if (fatta && 'OKRHs'.includes(ch)) return;
      if (ch in BLOCCANTI) {
        const im = (IMMAGINI[ch] ? this.add.image(cx, by + 2, IMMAGINI[ch]) : this.add.image(cx, by + 2, 'natura', BLOCCANTI[ch])).setOrigin(0.5, 1).setDepth(by);
        this.blocchi.add(x + ',' + y);
        if (ch === 'T' || ch === 'M') this.tweens.add({ targets: im, scaleX: 1.02, yoyo: true, repeat: -1, duration: 1800 + Math.random() * 600, ease: 'Sine.inOut' });
      } else if (DECORI[ch]) this.add.image(cx, by, 'natura', Phaser.Utils.Array.GetRandom(DECORI[ch])).setOrigin(0.5, 1).setDepth(-12);
      else if (ch === 'n') this.add.image(cx, by - 4, 'natura', Math.random() < 0.5 ? 'ninfea' : 'ninfea_fiore').setDepth(-14);
      else if (ch === 'F') { this.add.image(cx, y * T + 16, 'recinto').setOrigin(0.5, 1).setDepth(y * T + 8); this.muri.add(x + ',' + y); }
      else if (ch === 'W') { this.add.image(cx, y * T + 16, 'parete').setOrigin(0.5, 1).setDepth(y * T + 8); this.muri.add(x + ',' + y); }
      else if (ch === 'G' || ch === 'Y') { this.cancello = this.add.image(cx, y * T + 16, ch === 'Y' ? 'portone' : 'cancello').setOrigin(0.5, 1).setDepth(y * T + 8); this.cancelloXY = { x: cx, y: by, k: x + ',' + y }; this.muri.add(x + ',' + y); }
      else if (ch === 'h') { const nd = (M.nascondiglio || 'natura:cespuglio').split(':'); const b = nd.length > 1 ? this.add.image(cx, by + 2, nd[0], nd[1]) : this.add.image(cx, by + 2, nd[0]); b.setOrigin(0.5, 1).setDepth(by); this.nascondigli.push(b); }
      else if (ch === 'P') start = { x: cx, y: by };
      else if (ch === 'A') this.animale = { x: cx, y: by };
      else if (ch === 'D') this.dest = { x: cx, y: by };
      else if (ch === 'O') M.frame ? this.addItem('oggetto', cx, by, M.atlas || 'natura', M.frame) : this.addItem('oggetto', cx, by, M.tex);
      else if (ch === 'K') this.addItem('chiave', cx, by, M.texChiave || 'chiave');
      else if (ch === 'R') { const r = REGALI[L.regalo]; r && r.atlas ? this.addItem('regalo', cx, by, r.atlas, r.frame) : this.addItem('regalo', cx, by, r ? r.tex : L.regalo); }
      else if (ch === 's') this.addItem('seme', cx, by, 'seme');
      else if (ch === 'H') this.addItem('cuore', cx, by, 'icone', 3);
      else if (ch === 'E') this.uscita = { x: cx, y: by };
    }));
    if (L.atmosfera === 'notte' || L.atmosfera === 'nebbia') { this.buio = this.add.renderTexture(-320, -320, W * T + 640, H * T + 640).setOrigin(0).setDepth(20000); this.luce = this.make.image({ key: 'luce', add: false }); this.buioCol = L.atmosfera === 'notte' ? [0x0b0a1e, 0.86, 1.1] : [0xeef2f0, 0.78, 1.5]; }
    if (L.atmosfera === 'alpeggio' || L.atmosfera === 'nebbia') this.terreno.forEachTile(t => { if (t.index >= 0) t.tint = 0xc4e0b0; });
    if (L.atmosfera === 'alba') this.add.rectangle(-320, -320, W * T + 640, H * T + 640, 0xf2a65a, 0.16).setOrigin(0).setDepth(20000);
    this.totOggetti = this.items.filter(i => i.tipo === 'oggetto').length;
    this.totSemi = this.items.filter(i => i.tipo === 'seme').length;
    this.makePlayer(start.x, start.y);
    if (L.animale === 'mordicchio') { this.cat = this.player; this.seguaci = []; }
    else { this.cat = this.makeAnimal('mordicchio', start.x + 10, start.y + 2); this.seguaci = [this.cat]; }
    if (M.tipo === 'nascondino') { const b = Phaser.Utils.Array.GetRandom(this.nascondigli); b.giusto = true; this.animale = { x: b.x, y: b.y - 2 }; }
    this.npc = this.makeAnimal(L.animale, this.animale.x, this.animale.y).setDepth(this.animale.y);
    if (M.tipo === 'nascondino') this.npc.setVisible(false);
    else this.npcBob = this.tweens.add({ targets: this.npc, scaleY: 0.92, yoyo: true, repeat: -1, duration: 500 });
    if (this.dest && !L.ospite) {
      if (!M.meta || M.meta === 'Cancello') this.add.image(this.dest.x, this.dest.y + 2, 'cancello').setOrigin(0.5, 1).setDepth(this.dest.y);
      else if (M.meta === 'Fontana') { const f = this.add.graphics().setDepth(this.dest.y); f.fillStyle(0xb2a486).fillEllipse(this.dest.x, this.dest.y, 22, 11); f.fillStyle(0x8cbfc2).fillEllipse(this.dest.x, this.dest.y - 1, 16, 7); f.fillStyle(0xb2a486).fillRect(this.dest.x - 2, this.dest.y - 12, 4, 10); f.fillStyle(0x8cbfc2).fillCircle(this.dest.x, this.dest.y - 13, 3); f.lineStyle(1, 0x504086).strokeEllipse(this.dest.x, this.dest.y, 22, 11); }
      else this.add.image(this.dest.x, this.dest.y + 3, 'cartello').setOrigin(0.5, 1).setDepth(this.dest.y); // niente scritte sul cartello: la meta la indica la freccia
    }
    if (this.dest && L.ospite) { this.mamma = this.makeAnimal(L.ospite, this.dest.x, this.dest.y).setDepth(this.dest.y); this.mammaBob = this.tweens.add({ targets: this.mamma, y: this.dest.y - 1, yoyo: true, repeat: -1, duration: 600 }); }
    this.st = { parlato: false, inMano: false, raccolti: 0, chiave: false, salvato: false, regalo: false, semi: 0, cuore: false, finito: false };
    this.ultimoProgresso = this.time.now; this.prossimaBattuta = L.animale === 'mordicchio' ? Infinity : this.time.now + 12000; this.indizioDato = 0; this.prossimoMiao = this.time.now + 3000;
    const cam = this.cameras.main;
    cam.setBounds(-3 * T, -6 * T, W * T + 6 * T, H * T + 14 * T); cam.startFollow(this.player, true, 0.12, 0.12); cam.setFollowOffset(0, -10); cam.fadeIn(300);
    this.attachHud();
    this.creaCartello();
    if (fatta) return this.giaFatta();
    this.time.delayedCall(500, () => { if (!this.st.parlato && !this.ripreso) this.hud.say(L.dialoghi.arrivo); });
  }
  // tappa già completata: si può passeggiare, ma la storia non si ripete e l'animale vive al rifugio
  giaFatta() {
    const st = this.st, L = this.L;
    st.parlato = st.salvato = true; st.giaFatta = true;
    this.npc.setVisible(false); if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; }
    if (this.mamma) { this.mamma.destroy(); this.mamma = null; if (this.mammaBob) this.mammaBob.remove(); }
    if (this.cancello) { this.cancello.destroy(); this.muri.delete(this.cancelloXY.k); }
    this.nascondigli.forEach(b => b.giusto = false);
    this.indizioDato = 0; this.prossimaBattuta = this.time.now + 20000;
    const chi = [L.animale, L.ospite].filter(a => a && a !== 'mordicchio').map(a => ANIMALI[a].nome);
    const liberi = [L.animale, L.ospite].filter(a => a && a !== 'mordicchio').every(a => typeof LIBERI !== 'undefined' && LIBERI[a]);
    const frase = chi.length ? 'Qui adesso è tutto tranquillo. ' + chi.join(' e ') + (liberi ? (chi.length > 1 ? ' ogni tanto passano' : ' ogni tanto passa') + ' a trovarci al rifugio.' : (chi.length > 1 ? ' vivono' : ' vive') + ' al rifugio, con noi.') : 'Che bello tornare qui. È tutto tranquillo.';
    this.aggiornaObiettivi();
    this.time.delayedCall(400, () => { this.apriPortale(true); this.hud.toast(L.nome); this.hud.bubble(this.cat, frase, 4200); });
  }
  addItem(tipo, x, y, tex, frame) {
    const s = this.add.image(x, y - 2, tex, frame).setOrigin(0.5, 1).setDepth(y);
    if (s.width > 15) s.setScale(0.85);
    const sh = this.add.ellipse(x, y, 10, 3, 0x000000, 0.15).setDepth(-11);
    this.tweens.add({ targets: s, y: y - 5, yoyo: true, repeat: -1, duration: 700 + Math.random() * 200, ease: 'Sine.inOut' });
    s.tipo = tipo; s.ombra = sh; this.items.push(s); return s;
  }
  attachHud() {
    const hud = this.hud, L = this.L;
    hud.attach({ cam: this.cameras.main, onTap: () => { } });
    hud.layer.add(pannello(hud, 8, 8, UW - 16, 46));
    hud.layer.add(txt(hud, 18, 20, L.nome, 14, COL.titolo).setOrigin(0, 0.5));
    this.ob = { a: txt(hud, 18, 40, '', 11).setOrigin(0, 0.5), b: txt(hud, 132, 40, '', 11).setOrigin(0, 0.5), c: txt(hud, 256, 40, '', 11).setOrigin(0, 0.5) };
    Object.values(this.ob).forEach(t => hud.layer.add(t));
    this.semiTxt = txt(hud, UW - 18, 20, '', 11).setOrigin(1, 0.5); hud.layer.add(this.semiTxt);
    hud.button(UW - 62, 60, 54, 26, 'Pausa', () => this.pausa(), { size: 11 });
    this.aggiornaObiettivi();
  }
  aggiornaObiettivi() {
    const st = this.st, L = this.L, M = L.missione, A = ANIMALI[L.animale], v = b => b ? '✔ ' : '○ ', c = b => b ? COL.verde : COL.testo;
    this.ob.a.setText(v(st.salvato) + A.nome).setColor(c(st.salvato));
    let mis = '', fatto = st.salvato;
    if (M.tipo === 'raccogli_n') mis = M.nomeOggetto + ' ' + st.raccolti + '/' + this.totOggetti;
    else if (M.tipo === 'trova_e_porta') { mis = M.nomeOggetto; fatto = st.inMano || st.salvato; }
    else if (M.tipo === 'chiave_cancello') { mis = M.nomeChiave || 'Chiave'; fatto = st.chiave || st.salvato; }
    else if (M.tipo === 'nascondino') mis = ({ auto: 'Auto ', pino: 'Pini ', 'natura:masso': 'Massi ' }[M.nascondiglio] || 'Cespugli ') + this.nascondigli.filter(b => b.controllato).length + '/' + this.nascondigli.length;
    else if (M.tipo === 'seguimi') mis = ANIMALI[L.ospite] ? ANIMALI[L.ospite].nome : (M.meta || 'Arrivo');
    else if (M.tipo === 'ritrova') mis = 'Torna a casa';
    else if (M.tipo === 'danza') { const n = this.palchi ? this.palchi.length : 2; mis = 'Isole ' + Math.min(st.round || 0, n) + '/' + n; fatto = (st.round || 0) >= n; }
    else if (M.tipo === 'festa') mis = 'La festa';
    if (st.giaFatta) { this.ob.a.setText(L.animale === 'mordicchio' ? '✔ Già fatto' : '✔ ' + A.nome + ' vive al rifugio').setColor(COL.verde); this.ob.b.setText(''); this.ob.c.setText(''); this.semiTxt.setText(''); return; }
    this.ob.b.setText(v(fatto) + mis).setColor(c(fatto));
    this.ob.c.setText(v(st.regalo) + 'Regalo').setColor(c(st.regalo));
    this.semiTxt.setText('semi ' + st.semi + '/' + this.totSemi);
  }
  pausa() {
    const hud = this.hud; this.frozenAll = true;
    const m = hud.modal('Pausa', 272, () => { this.frozenAll = false; });
    hud.button(UW / 2 - 90, m.y + 52, 180, 34, 'Continua', () => m.close(), { parent: m.c });
    hud.button(UW / 2 - 90, m.y + 94, 180, 34, 'Torna al sentiero', () => this.scene.start('Mappa'), { parent: m.c });
    hud.button(UW / 2 - 90, m.y + 178, 180, 34, 'Torna a casa', () => this.scene.start('Rifugio', { stanza: 'fuori', pos: 'sentiero' }), { parent: m.c });
    const mb = hud.button(UW / 2 - 90, m.y + 136, 180, 34, Musica.on ? 'Musica: sì' : 'Musica: no', () => { mb.label.setText(Musica.toggle() ? 'Musica: sì' : 'Musica: no'); }, { parent: m.c, size: 13 });
    m.c.add(txt(hud, UW / 2, m.y + 238, this.st.giaFatta || this.st.salvato ? 'Quello che hai fatto qui resta salvato.' : 'Uscendo ora, la tappa ricomincia da capo.', 11, COL.testo).setOrigin(0.5));
  }
  blocked(x, y) {
    return [[x - 4, y - 2], [x + 4, y - 2], [x - 4, y], [x + 4, y]].some(([px, py]) => {
      const tx = Math.floor(px / T), ty = Math.floor(py / T), k = tx + ',' + ty;
      if (!this.land[ty] || !this.land[ty][tx]) return true;
      if (this.muri.has(k)) return true;
      if (this.blocchi.has(k)) return py - ty * T > 6;
      return false;
    });
  }
  progresso() { this.ultimoProgresso = this.time.now; this.indizioDato = 0; this.hud.setHint(null); this.aggiornaObiettivi(); }
  vicino(arr) { const p = this.player; return arr.reduce((b, o) => !b || Math.hypot(o.x - p.x, o.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? o : b, null); }
  obiettivoAttuale() {
    const st = this.st, M = this.L.missione, npc = { x: this.npc.x, y: this.npc.y };
    if (st.salvato) return { k: 'uscita', x: this.uscita.x, y: this.uscita.y };
    if (M.tipo === 'nascondino') { const b = this.nascondigli.find(b => b.giusto); return { k: 'animale', x: b.x, y: b.y }; }
    if (!st.parlato) return { k: 'animale', ...npc };
    if (M.tipo === 'seguimi') return { k: 'consegna', x: this.dest.x, y: this.dest.y };
    if (M.tipo === 'chiave_cancello') { if (!st.chiave) { const k = this.items.find(i => i.tipo === 'chiave'); return { k: 'oggetto', x: k.x, y: k.y }; } return { k: 'consegna', x: this.cancelloXY.x, y: this.cancelloXY.y }; }
    if (st.inMano) return { k: 'consegna', ...npc };
    const o = this.vicino(this.items.filter(i => i.tipo === 'oggetto')); return o ? { k: 'oggetto', x: o.x, y: o.y } : { k: 'consegna', ...npc };
  }
  update(time, delta) {
    { const hud = this.scene.get('Hud'); if (!hud.dialog && !(hud.ctrl && hud.ctrl.frozen) && !(this.st && this.st.finito)) Eco.passa(Save.data, Math.min(delta, 50) / 1000 * 60 / TEMPO.secPerOra); }
    if (this.frozenAll) return;
    const dt = Math.min(delta, 50) / 1000, st = this.st, p = this.player, hud = this.hud, L = this.L, M = L.missione;
    this.movePlayer(dt, (x, y) => this.blocked(x, y));
    this.followers(this.seguaci);
    if (this.inManoSprite) this.inManoSprite.setPosition(p.x, p.y - 20).setDepth(p.y + 1);
    if (this.buio) {
      this.buio.clear(); this.buio.fill(this.buioCol[0], this.buioCol[1]);
      const luci = [[p.x, p.y - 8, this.buioCol[2]]]; luci.push([this.uscita.x, this.uscita.y - 8, 0.6]); if (this.st.salvato) luci.push([this.npc.x, this.npc.y - 6, 0.4]);
      luci.forEach(([x, y, s]) => { this.luce.setScale(s); this.buio.erase(this.luce, x + 320, y + 320); });
    }
    if (hud.dialog || st.finito || (hud.ctrl && hud.ctrl.frozen)) return;
    this.items.slice().forEach(it => {
      if (Math.hypot(it.x - p.x, it.ombra.y - p.y) > 11) return;
      if (it.tipo === 'oggetto' && !st.parlato && !this.dettoPrimaParliamo) { this.dettoPrimaParliamo = true; hud.bubble(this.cat, 'Chissà a chi serve... Prima andiamo a sentire chi c\'è.', 3500); }
      if (it.tipo === 'oggetto' && (!st.parlato || st.inMano)) return;
      this.raccogli(it);
    });
    const dA = Math.hypot(this.npc.x - p.x, this.npc.y - p.y);
    if (M.tipo === 'ritrova' && !st.parlato) {
      if (time > this.prossimoMiao) { this.prossimoMiao = time + 7000; hud.bubble(this.npc, 'Miao...', 1800); Sfx.miao(); }
      if (dA < 16) { st.parlato = true; hud.say(this.incontroPallina(L.dialoghi.incontro), () => this.salva(true)); }
    }
    else if (M.tipo === 'nascondino' && !st.parlato) this.nascondino();
    else if (!st.parlato && dA < (M.tipo === 'chiave_cancello' ? 56 : 16)) {
      st.parlato = true; hud.say(st.chiave && L.dialoghi.incontroChiave ? L.dialoghi.incontroChiave : L.dialoghi.incontro, () => {   // se la chiave l'hai già trovata, il dialogo ne tiene conto
        this.progresso();
        if (M.tipo === 'seguimi') { this.seguaci.push(this.npc); if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; } this.npc.setScale(1); }
      });
    } else if (st.parlato && !st.salvato) {
      if (M.tipo === 'seguimi') { if (Math.hypot(this.dest.x - p.x, this.dest.y - p.y) < 22) this.salva(); }
      else if (M.tipo === 'chiave_cancello') { if (st.chiave && Math.hypot(this.cancelloXY.x - p.x, this.cancelloXY.y - p.y) < 20) this.apriCancello(); else if (!st.chiave) this.attesa(dA, 56); }
      else if (dA < 16 && st.inMano) this.salva();
      else this.attesa(dA, 16);
    }
    this.controllaUscita();
    const fermo = time - this.ultimoProgresso;
    if (fermo > 30000 && this.indizioDato < 1) { this.indizioDato = 1; const o = this.obiettivoAttuale(); hud.bubble(this.cat, L.indizi[o.k] || L.indizi.animale, 5000); Sfx.miao(); }
    if (fermo > 75000 && this.indizioDato < 2) { this.indizioDato = 2; const o = this.obiettivoAttuale(); hud.bubble(this.cat, L.indizi[o.k] || L.indizi.animale, 5000); }   // un secondo indizio a parole, niente freccia
    if (this.indizioDato >= 1) { const o = this.obiettivoAttuale(); hud.setHint(o.x, o.y); }
    if (time > this.prossimaBattuta && this.indizioDato === 0 && !hud.bubbles.some(b => !b.dead) && this.battutaOpportuna(dA)) { this.prossimaBattuta = time + 25000 + Math.random() * 15000; const fg = Frasi.scegli(FRASI_MORDICCHIO_GIRO, 'mordicchio', this.recent); if (fg) hud.bubble(this.cat, fg, 3800); }
  }
  // Mordicchio fa una battuta durante il giro solo se non sta per partire un dialogo della storia:
  // non vicino all'animale da incontrare, a un cespuglio del nascondino o a un oggetto da raccogliere
  battutaOpportuna(dA) {
    if (this.cat === this.player || this.hud.quieto()) return false;
    const p = this.player, st = this.st, M = this.L.missione || {};
    if (!st.parlato && M.tipo !== 'nascondino' && dA < 110) return false;
    if (!st.parlato && (this.nascondigli || []).some(b => Math.hypot(b.x - p.x, b.y - p.y) < 50)) return false;
    if ((this.items || []).some(it => it.tipo === 'oggetto' && Math.hypot(it.x - p.x, it.y - p.y) < 50)) return false;
    if (st.parlato && !st.salvato && dA < 60) return false;
    return true;
  }
  // tappa 10: la pallina può essere trovata prima o dopo Mordicchio, e il dialogo ne tiene conto
  incontroPallina(righe) {
    const L = this.L; if (!(L.animale === 'mordicchio' && L.regalo === 'pallina' && !this.st.giaFatta)) return righe;
    const extra = this.st.regalo
      ? [{ who: 'anastasia', text: 'Questa l\'ho trovata per strada.' }, { who: 'mordicchio', text: 'La mia pallina! Allora hai seguito i rimbalzi.' }]
      : [{ who: 'mordicchio', text: 'La mia pallina è rimbalzata via, qui intorno. Se la vedi, prendiamola.' }];
    const i = righe.findIndex(r => r.who === 'anastasia'); const out = righe.slice();
    out.splice(i < 0 ? out.length : i, 0, ...extra); return out;
  }
  attesa(d, r) {
    if (d < r && this.L.dialoghi.attesa && (!this.attesaDetta || this.time.now > this.attesaDetta)) {
      this.attesaDetta = this.time.now + 8000; this.hud.bubble(this.npc, this.L.dialoghi.attesa, 3000);
    }
  }
  nascondino() {
    const p = this.player, b = this.nascondigli.find(b => !b.scuotendo && Math.hypot(b.x - p.x, b.y - p.y) < 14);
    if (!b) return;
    b.scuotendo = true; this.tweens.add({ targets: b, angle: { from: -6, to: 6 }, yoyo: true, repeat: 2, duration: 70, onComplete: () => { b.angle = 0; this.time.delayedCall(1500, () => b.scuotendo = false); } });
    if (!b.controllato) { b.controllato = true; this.aggiornaObiettivi(); }
    if (b.giusto) {
      this.st.parlato = true; Sfx.pop();
      this.npc.setVisible(true).setPosition(b.x + 10, b.y + 2).setScale(0);
      this.tweens.add({ targets: this.npc, scale: 1, duration: 300, ease: 'Back.out' });
      this.hud.say(this.L.dialoghi.incontro, () => this.salva(true));
    } else { Sfx.blip(); const sb = this.L.dialoghi.sbagliato || ['Qui non c\'è.', 'Niente. Proviamo il prossimo.', 'Vuoto.']; this.hud.bubble(this.cat, pick(sb, this.recent), 1800); }
  }
  apriCancello() {
    if (this.cancelloAperto) return; this.cancelloAperto = true;
    this.muri.delete(this.cancelloXY.k); if (this.inManoSprite) { this.inManoSprite.destroy(); this.inManoSprite = null; }
    Sfx.pop(); this.tweens.add({ targets: this.cancello, alpha: 0, scaleX: 0.2, duration: 400 });
    this.time.delayedCall(450, () => this.salva());
  }
  raccogli(it) {
    const st = this.st, hud = this.hud, L = this.L, M = L.missione;
    this.items = this.items.filter(i => i !== it); it.ombra.destroy(); this.tweens.killTweensOf(it);
    const inTesta = (tex, frame) => { this.inManoSprite = this.add.image(this.player.x, this.player.y - 20, tex, frame).setScale(0.75); };
    if (it.tipo === 'oggetto') {
      Sfx.pop(); it.destroy();
      if (M.tipo === 'raccogli_n') {
        st.raccolti++;
        if (st.raccolti >= this.totOggetti) { st.inMano = true; M.frame ? inTesta(M.atlas || 'natura', M.frame) : inTesta(M.tex); hud.toast('Tutte! Portale a ' + ANIMALI[L.animale].nome); }
        else hud.toast(M.nomeOggetto + ': ' + st.raccolti + ' su ' + this.totOggetti);
      } else { st.inMano = true; M.frame ? inTesta(M.atlas || 'natura', M.frame) : inTesta(M.tex); hud.toast('Hai raccolto: ' + M.nomeOggetto); }
      this.progresso(); return;
    }
    if (it.tipo === 'chiave') { st.chiave = true; Sfx.pop(); it.destroy(); inTesta(M.texChiave || 'chiave'); hud.toast(M.trovataChiave || 'Hai trovato la chiave!'); this.progresso(); return; }
    this.tweens.add({ targets: it, y: it.y - 16, alpha: 0, duration: 400, onComplete: () => it.destroy() });
    if (it.tipo === 'seme') { st.semi++; Sfx.seme(); this.aggiornaObiettivi(); return; }
    if (it.tipo === 'cuore') { st.cuore = true; Sfx.cuore(); hud.toast('Cuoricino segreto trovato!'); return; }
    if (it.tipo === 'regalo') {
      st.regalo = true; Sfx.pop(); this.aggiornaObiettivi();
      if (L.regalo === 'bastoncino') { Sfx.miao(); hud.bubble(this.cat, 'Un bastoncino! Tienilo: a casa me lo lanci e io te lo riporto.', 4000); }
      else if (L.regalo === 'pallina' && L.animale === 'mordicchio') { if (st.parlato) { Sfx.miao(); hud.bubble(this.npc, 'La mia pallina! L\'hai trovata!', 3500); } else hud.bubble(this.player, 'La sua pallina! Allora è qui vicino...', 3500); }
      else hud.toast('Regalo trovato: ' + REGALI[L.regalo].nome);
    }
  }
  salva(silenzioso) {
    const st = this.st, hud = this.hud, L = this.L;
    if (st.salvato) return;
    st.salvato = true; st.inMano = false; if (this.inManoSprite) { this.inManoSprite.destroy(); this.inManoSprite = null; }
    if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; this.npc.setScale(1); }
    this.hearts(this.npc.x, this.npc.y - 14); Sfx.cuore();
    const dopo = () => {
      if (!this.seguaci.includes(this.npc)) this.seguaci.push(this.npc);
      if (this.mamma) { if (this.mammaBob) this.mammaBob.remove(); this.seguaci.push(this.mamma); }
      this.trail = this.trail.slice(-5); this.progresso(); this.apriPortale();
    };
    if (silenzioso) dopo(); else hud.say(typeof righeFestaCuori === 'function' ? righeFestaCuori(L, this) : L.dialoghi.salvato, dopo);
  }
  // L'uscita è un cartello di legno: spento finché la missione non è finita, poi indica la strada di casa
  // L'uscita è un cartello di legno, sempre uguale: si può tornare al sentiero quando si vuole
  creaCartello() {
    const u = this.uscita;
    this.cartello = this.add.image(u.x, u.y + 3, 'cartello').setOrigin(0.5, 1).setDepth(u.y + 2);
    this.vicinoUscita = true;   // si parte accanto al cartello: per usarlo bisogna prima allontanarsi
  }
  controllaUscita() {
    const p = this.player, u = this.uscita; if (!u || this.st.finito) return;
    const d = Math.hypot(u.x - p.x, u.y - p.y);
    if (d > 26) { this.vicinoUscita = false; return; }
    if (d > 12 || this.vicinoUscita) return;
    this.vicinoUscita = true;
    if (this.st.salvato && !this.st.giaFatta) return this.completa();
    this.st.finito = true; this.cameras.main.fadeOut(260, 251, 244, 220);
    this.time.delayedCall(280, () => this.scene.start('Mappa'));
  }
  apriPortale(silenzioso) {
    if (this.portale) return;
    this.portale = this.cartello;
    if (silenzioso) return;
    Sfx.fanfara(); this.time.delayedCall(300, () => this.hud.say(this.L.dialoghi.fine));
  }
  completa() {
    const st = this.st, L = this.L, S = Save.data; if (st.finito) return; st.finito = true;
    if (st.giaFatta) { Save.write(); this.cameras.main.fadeOut(300, 251, 244, 220); this.time.delayedCall(320, () => this.scene.start('Mappa')); return; }
    const primaVolta = !S.completati.includes(L.id), ricettePrima = Object.keys(S.ricette).length;
    const guadagno = Eco.completaTappa(S, L.id, st.semi);
    this.nuoveRicette = Object.keys(S.ricette).length - ricettePrima;
    if (primaVolta) {
      S.inventario.push(L.premio);
      [L.animale, L.ospite].filter(Boolean).forEach(a => S.animali[a] = S.animali[a] || { cuori: 0 });
      if (st.cuore && !S.cuoricini.includes(L.id)) { S.cuoricini.push(L.id); this.sorpresaCuori = typeof sorpresaCuori === 'function' ? sorpresaCuori(S) : null; }
      S.ultimoArrivo = L.id;
      if (L.apreStalla && !S.stallaAperta) { S.stallaAperta = true; ARREDO_INIZIALE_STALLA.forEach(a => S.arredi.push({ ...a, stanza: 'stalla' })); }
    }
    if (st.regalo) { if (L.regalo === 'bastoncino') S.bastoncino = true; else S.regali[L.regalo] = (S.regali[L.regalo] || 0) + 1; }
    Save.write();
    this.cameras.main.fadeOut(400, 251, 244, 220);
    this.time.delayedCall(420, () => this.riepilogo(primaVolta ? guadagno : 0, primaVolta));
  }
  riepilogo(guadagno, primaVolta) {
    const hud = this.hud, L = this.L, st = this.st; hud.clearAll(); Sfx.fanfara();
    const c = hud.add.container(0, 0).setDepth(58); hud.layer.add(c);
    c.add(hud.add.rectangle(0, 0, UW, UH, 0xfbf4dc, 1).setOrigin(0).setInteractive());
    c.add(txt(hud, UW / 2, UH * 0.15, L.id === 30 ? 'Buon compleanno,\nAnastasia!' : L.nome + ': fatto!', 22, COL.titolo, { align: 'center' }).setOrigin(0.5));
    const righe = [];
    [L.animale, L.ospite].filter(Boolean).forEach(a => righe.push([ANIMALI[a].tex, ANIMALI[a].idle, a === L.animale && L.testoArrivo ? L.testoArrivo : ANIMALI[a].nome + ' viene a vivere al rifugio']));
    if (st.regalo) righe.push(L.regalo === 'bastoncino' ? ['bastoncino', null, 'Il bastoncino di Mordicchio'] : [REGALI[L.regalo].atlas || REGALI[L.regalo].tex, REGALI[L.regalo].frame, 'Regalo: ' + REGALI[L.regalo].nome]);
    if (primaVolta) { const o = OGGETTI[L.premio]; righe.push([o.atlas || o.tex, o.frame, 'Nuovo mobile: ' + o.nome]); righe.push(['seme', null, '+' + guadagno + ' semi']); }
    if (st.cuore) righe.push(['icone', 3, 'Cuoricino segreto · ' + new Set(Save.data.cuoricini).size + ' / ' + CUORI_TOTALI]);
    if (this.sorpresaCuori) { const sp = this.sorpresaCuori, o = OGGETTI[sp.premio]; righe.push([o ? (o.atlas || o.tex) : 'icone', o ? o.frame : 3, sp.testo]); this.sorpresaCuori = null; }
    if (this.nuoveRicette > 0) righe.push(['cibo', 'pizza_rucola', this.nuoveRicette === 1 ? 'Una nuova ricetta nel libro' : this.nuoveRicette + ' nuove ricette nel libro']);
    righe.forEach((r, i) => {
      const y = UH * 0.26 + i * 44, im = hud.add.image(70, y, r[0], r[1] == null ? undefined : r[1]); fitIcon(im, 30);
      const t = txt(hud, 100, y, r[2], 14, COL.testo, { wordWrap: { width: UW - 120 } }).setOrigin(0, 0.5);
      [im, t].forEach(o => { o.setAlpha(0); c.add(o); hud.tweens.add({ targets: o, alpha: 1, delay: 300 + i * 250, duration: 300 }); });
    });
    hud.button(UW / 2 - 90, UH * 0.80, 180, 40, 'Torna al rifugio', () => this.scene.start('Rifugio', { stanza: L.animale === 'mordicchio' ? 'casa' : stanzaDi(L.animale) }), { size: 15, parent: c });
    hud.button(UW / 2 - 70, UH * 0.80 + 50, 140, 32, 'Resta sul sentiero', () => this.scene.start('Mappa'), { size: 12, parent: c });
  }
}

// ---------------------------------------------------------------------
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'gioco', width: CW, height: CH, backgroundColor: '#9bd4c3', pixelArt: true,
  scale: { mode: Phaser.Scale.NONE, zoom: 1 / DPR }, input: { activePointers: 2 },
  scene: [Boot, Titolo, Rifugio, Mappa, Livello, Hud],
});
window.game = game;
// Android e iPhone, quando il gioco resta a lungo in sottofondo, possono «svuotare» la grafica (contesto WebGL perso):
// in quel caso il gioco si ricarica da solo. La partita è già salvata, quindi si riparte da dove si era.
(function () {
  let perso = false;
  window.addEventListener('webglcontextlost', () => { perso = true; }, true);
  window.addEventListener('webglcontextrestored', () => { location.reload(); }, true);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && perso) location.reload(); });
})();
let _rs = null;
window.addEventListener('resize', () => {
  clearTimeout(_rs);
  _rs = setTimeout(() => {
    const w = Math.round(VW() * DPR), h = Math.round(VH() * DPR);
    if (Math.abs(w - CW) / CW > 0.1 || Math.abs(h - CH) / CH > 0.3) location.reload();
  }, 500);
});
