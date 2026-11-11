// =====================================================================
//  Tappe speciali: il sogno delle lucciole (25) e la festa (30),
//  più le atmosfere sogno / ciliegi / festa.
// =====================================================================
const DIREZIONI = { su: { a: 'g-up', flip: false, ang: -90, f: 523 }, giu: { a: 'g-down', flip: false, ang: 90, f: 392 }, sx: { a: 'g-side', flip: true, ang: 180, f: 440 }, dx: { a: 'g-side', flip: false, ang: 0, f: 659 } };

Object.assign(Livello.prototype, {
  preparaSpeciale() {
    const L = this.L, M = L.missione, W = L.mappa[0].length * T, H = L.mappa.length * T;
    if (L.atmosfera === 'sogno') {
      this.terreno.forEachTile(t => { if (t.index >= 0) t.tint = 0xc2b4ee; }); this.acqua.setTint(0x7a68b8);
      this.buio = this.add.renderTexture(-320, -320, W + 640, H + 640).setOrigin(0).setDepth(20000);
      this.luce = this.make.image({ key: 'luce', add: false }); this.buioCol = [0x1a1033, 0.55, 1.9];
      this.lucciole(40, W, H, 20001);
    }
    if (L.atmosfera === 'ciliegi') {
      this.children.list.slice().forEach(o => { if (o.frame && o.frame.name === 'albero') for (let i = 0; i < 9; i++) { const c = this.add.circle(o.x - 6 + (i % 3) * 6 + Math.random() * 2, o.y - 22 + Math.floor(i / 3) * 5 + Math.random() * 2, 2.6, i % 2 ? 0xffc6dc : 0xf7a8c8).setDepth(o.depth + 0.1); } });
      for (let i = 0; i < 26; i++) {
        const p = this.add.rectangle(Math.random() * W, Math.random() * H, 2, 2, 0xffc6dc).setDepth(19000);
        this.tweens.add({ targets: p, y: p.y + 60 + Math.random() * 60, x: p.x + 20 - Math.random() * 40, alpha: { from: 1, to: 0 }, duration: 4000 + Math.random() * 3000, repeat: -1, delay: Math.random() * 3000, onRepeat: () => { p.x = Math.random() * W; p.y = Math.random() * H * 0.8; } });
      }
    }
    if (M.tipo === 'danza') {
      this.palchi = []; L.mappa.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'Z') this.palchi.push({ x: x * T + 8, y: y * T + 10 }); }));
      this.palchi.forEach(p => {
        const g = this.add.ellipse(p.x, p.y, 22, 11, 0xfff2a8, 0.55).setDepth(-11).setStrokeStyle(1, 0xffe066);
        this.tweens.add({ targets: g, alpha: 0.25, scaleX: 1.15, yoyo: true, repeat: -1, duration: 800 }); p.g = g;
      });
      this.st.round = 0;
      if (this.fatta) { this.st.round = this.palchi.length; (L.ponti || []).flat().forEach(([x, y]) => { this.land[y][x] = true; const t = this.terreno.putTileAt(12, x, y); if (t) t.tint = 0xfff2a8; }); this.palchi.forEach(p => p.g.setFillStyle(0x8db15d, 0.5)); }
    }
    if (M.tipo === 'festa') {
      const a = this.animale, tav = this.add.rectangle(a.x, a.y + 12, 64, 12, 0xd79e61).setStrokeStyle(1, 0x754c60).setDepth(a.y + 12);
      ['sacher', 'pizza_casa', 'popcorn', 'biscotti'].forEach((k, i) => this.add.image(a.x - 24 + i * 16, a.y + 8, 'cibo', k).setDepth(a.y + 13));
      const col = [0xe8894f, 0xf2cf8c, 0x8db15d, 0xd99a9a, 0x8cbfc2];
      for (let x = 3 * T; x < W - 3 * T; x += 8) { const tr = this.add.triangle(x, 22, 0, 0, 7, 0, 3.5, 7, col[(x / 8) % 5 | 0]).setDepth(5); this.tweens.add({ targets: tr, angle: 6, yoyo: true, repeat: -1, duration: 900 + (x % 5) * 80 }); }
    }
  },
  lucciole(n, W, H, depth) {
    for (let i = 0; i < n; i++) {
      const l = this.add.circle(Math.random() * W, Math.random() * H, 1.2, 0xfff2a8).setDepth(depth);
      this.tweens.add({ targets: l, x: l.x + 30 - Math.random() * 60, y: l.y + 30 - Math.random() * 60, alpha: { from: 0.2, to: 1 }, yoyo: true, repeat: -1, duration: 1500 + Math.random() * 2000, delay: Math.random() * 2000 });
    }
  },
  missioneSpeciale(time) {
    const st = this.st, p = this.player, M = this.L.missione, hud = this.hud;
    const dA = Math.hypot(this.npc.x - p.x, this.npc.y - p.y);
    if (M.tipo === 'danza') {
      const r = st.round, pal = this.palchi[r];
      if (pal && !this.inDanza && Math.hypot(pal.x - p.x, pal.y - p.y) < 10) this.avviaDanza(r);
      if (!pal && !st.parlato && dA < 18) { st.parlato = true; hud.say(this.L.dialoghi.incontro, () => this.ballaTutti(() => this.salva())); }
    }
    if (M.tipo === 'festa' && !st.parlato && dA < 30 && !st.giaFatta) {
      st.parlato = true; this.sorpresa();
      this.time.delayedCall(900, () => hud.say(this.L.dialoghi.incontro, () => this.ballaTutti(() => this.salva(), true)));
    }
    this.controllaUscita();
    if (time - this.ultimoProgresso > 30000 && this.indizioDato < 1) { this.indizioDato = 1; }
    if (this.indizioDato >= 1) { const o = st.salvato ? this.uscita : (this.palchi && this.palchi[st.round]) || this.npc; hud.setHint(o.x, o.y); }
  },
  // ---------------- danza ----------------
  avviaDanza(r) {
    const hud = this.hud, L = this.L; this.inDanza = true; this.frozenAll = true; if (hud.ctrl) hud.ctrl.frozen = true; hud.joyEnd();
    const n = (L.passi || [3, 4, 5])[r] || 4, dirs = Object.keys(DIREZIONI), seq = [];
    while (seq.length < n) { const d = Phaser.Utils.Array.GetRandom(dirs); if (seq.length < 2 || !(seq[seq.length - 1] === d && seq[seq.length - 2] === d)) seq.push(d); }
    this.seqDanza = seq; this.player.setPosition(this.palchi[r].x, this.palchi[r].y + 2);
    hud.toast(r === 0 ? 'Guarda i passi delle lucciole...' : 'Più difficile! Guarda bene...');
    this.time.delayedCall(900, () => this.mostraPassi());
  },
  posa(d) { const D = DIREZIONI[d], p = this.player; p.anims.play(D.a, true); p.setFlipX(D.flip); this.time.delayedCall(260, () => { p.anims.stop(); }); Sfx.tone(D.f, 0.22, 'triangle', 0.05); },
  freccia(d) {
    const D = DIREZIONI[d], p = this.player, g = this.add.graphics().setDepth(20002).setPosition(p.x, p.y - 30);
    g.fillStyle(0xfff2a8, 1).fillTriangle(8, 0, -4, -7, -4, 7).fillRect(-9, -2.5, 6, 5); g.setAngle(D.ang).setScale(1.3);
    const glow = this.add.circle(p.x, p.y - 30, 12, 0xfff2a8, 0.3).setDepth(20001);
    this.tweens.add({ targets: [g, glow], alpha: 0, y: '-=6', delay: 380, duration: 250, onComplete: () => { g.destroy(); glow.destroy(); } });
  },
  mostraPassi() {
    this.seqDanza.forEach((d, i) => this.time.delayedCall(i * 700, () => { this.freccia(d); this.posa(d); }));
    this.time.delayedCall(this.seqDanza.length * 700 + 300, () => this.tastiDanza());
  },
  tastiDanza() {
    const hud = this.hud, c = hud.add.container(0, 0).setDepth(60); hud.layer.add(c); this.tasti = c; this.passo = 0;
    c.add(txt(hud, UW / 2, UH - 200, 'Tocca a te! Ripeti i passi', 14, COL.crema).setOrigin(0.5).setStroke('#3b2f4a', 4));
    const cx = UW / 2, cy = UH - 110, off = 52;
    [['su', 0, -off], ['giu', 0, off], ['sx', -off, 0], ['dx', off, 0]].forEach(([d, dx, dy]) => {
      const x = cx + dx, y = cy + dy, b = hud.add.circle(x, y, 24, 0xf3e5c2).setStrokeStyle(3, 0x8a4a70).setInteractive();
      const g = hud.add.graphics({ x, y }); g.fillStyle(0x8a4a70).fillTriangle(10, 0, -6, -10, -6, 10); g.setAngle(DIREZIONI[d].ang);
      b.on('pointerdown', () => { this.tweens.add({ targets: [b], scale: 0.9, yoyo: true, duration: 80 }); this.premi(d); });
      c.add([b, g]);
    });
  },
  premi(d) {
    const hud = this.hud, seq = this.seqDanza;
    this.posa(d); this.freccia(d);
    if (d !== seq[this.passo]) {
      Sfx.no(); this.tasti.destroy(); this.tasti = null; hud.toast(pick(['Quasi! Le lucciole te li rifanno vedere.', 'Ops, passo buffo! Riproviamo.', 'Le lucciole ridono. Di nuovo!']));
      this.time.delayedCall(1100, () => this.mostraPassi()); return;
    }
    this.passo++;
    if (this.passo >= seq.length) { this.tasti.destroy(); this.tasti = null; this.time.delayedCall(400, () => this.ponte()); }
  },
  ponte() {
    const st = this.st, hud = this.hud, L = this.L, r = st.round;
    (L.ponti[r] || []).forEach(([x, y], i) => this.time.delayedCall(i * 180, () => {
      this.land[y][x] = true; const t = this.terreno.putTileAt(12, x, y); if (t) t.tint = 0xfff2a8;
      const s = this.add.image(x * T + 8, y * T + 8, 'scintilla').setDepth(20002).setScale(0.3);
      this.tweens.add({ targets: s, scale: 0.8, alpha: 0, duration: 600, onComplete: () => s.destroy() }); Sfx.tone(523 + i * 130, 0.2, 'triangle', 0.05);
    }));
    this.palchi[r].g.setFillStyle(0x8db15d, 0.5);
    st.round++; this.progresso(); this.aggiornaObiettivi();
    this.time.delayedCall(700, () => {
      Sfx.fanfara(); hud.toast(st.round < this.palchi.length ? 'Si è accesa la strada!' : 'Mordicchio ti aspetta sull\'ultima isola!');
      this.frozenAll = false; if (hud.ctrl) hud.ctrl.frozen = false; this.inDanza = false;
    });
  },
  // ---------------- tutti ballano ----------------
  ballaTutti(cb, festa) {
    const S = Save.data, p = this.player, ids = Object.keys(S.animali).filter(k => k !== 'mordicchio' && ANIMALI[k] && ANIMALI[k].tex !== 'mucca').slice(0, festa ? 22 : 12);
    this.frozenAll = true; const sprites = this.festaSprites || [];
    if (!this.festaSprites) ids.forEach((k, i) => {
      const a = (i / ids.length) * Math.PI * 2, rr = 34 + (i % 2) * 14, s = this.makeAnimal(k, p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * 0.6);
      s.setDepth(s.y).setAlpha(0); this.tweens.add({ targets: s, alpha: 1, duration: 400, delay: i * 60 }); sprites.push(s);
    });
    sprites.forEach((s, i) => {
      this.tweens.add({ targets: s, y: s.y - 6, yoyo: true, repeat: 7, duration: 220 + (i % 3) * 40, delay: i * 30 });
      this.time.addEvent({ delay: 400, repeat: 6, callback: () => s.setFlipX(!s.flipX) });
    });
    if (this.npc) this.tweens.add({ targets: this.npc, y: this.npc.y - 6, yoyo: true, repeat: 7, duration: 200 });
    const pose = ['giu', 'dx', 'su', 'sx', 'giu', 'dx', 'su', 'sx'];
    pose.forEach((d, i) => this.time.delayedCall(i * 380, () => this.posa(d)));
    this.time.delayedCall(3400, () => { this.frozenAll = false; cb && cb(); });
  },
  sorpresa() {
    const hud = this.hud, a = this.animale; Sfx.fanfara(); Musica.suona('casa');
    this.cameras.main.flash(300, 255, 240, 200);
    const col = [0xe8894f, 0xf2cf8c, 0x8db15d, 0xd99a9a, 0x8cbfc2, 0xbd757e];
    for (let i = 0; i < 70; i++) {
      const c = this.add.rectangle(a.x - 90 + Math.random() * 180, a.y - 80 - Math.random() * 60, 3, 2, Phaser.Utils.Array.GetRandom(col)).setDepth(20003);
      this.tweens.add({ targets: c, y: c.y + 140 + Math.random() * 60, x: c.x + 20 - Math.random() * 40, angle: 360, duration: 2200 + Math.random() * 1500, delay: Math.random() * 600, onComplete: () => c.destroy() });
    }
    const S = Save.data, p = this.player, ids = Object.keys(S.animali).filter(k => k !== 'mordicchio' && ANIMALI[k] && ANIMALI[k].tex !== 'mucca');
    this.festaSprites = ids.map((k, i) => {
      const lato = i % 2 ? 1 : -1, fila = Math.floor(i / 2), s = this.makeAnimal(k, a.x + lato * (40 + (fila % 4) * 16), a.y + 4 + Math.floor(fila / 4) * 18);
      s.setDepth(s.y).setFlipX(lato > 0); s.setScale(0); this.tweens.add({ targets: s, scale: 1, duration: 350, delay: i * 50, ease: 'Back.out' }); return s;
    });
  },
});

// ---- aggancio al motore ----
(function () {
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () { crea.call(this); this.preparaSpeciale(); };
  const upd = Livello.prototype.update;
  Livello.prototype.update = function (time, delta) {
    const M = this.L && this.L.missione;
    if (M && (M.tipo === 'danza' || M.tipo === 'festa' || M.tipo === 'rocky')) {
      { const h = this.hud; if (h && !h.dialog && !(h.ctrl && h.ctrl.frozen) && !this.frozenAll && !(this.st && this.st.finito)) Eco.passa(Save.data, Math.min(delta, 50) / 1000 * 60 / TEMPO.secPerOra); }
      if (this.frozenAll) return;
      const dt = Math.min(delta, 50) / 1000, p = this.player, hud = this.hud;
      this.movePlayer(dt, (x, y) => this.blocked(x, y));
      if (this.buio) {
        this.buio.clear(); this.buio.fill(this.buioCol[0], this.buioCol[1]);
        const luci = [[p.x, p.y - 8, this.buioCol[2]]]; if (this.npc.visible) luci.push([this.npc.x, this.npc.y - 6, 0.7]);
        (this.palchi || []).forEach(z => luci.push([z.x, z.y - 4, 0.6])); luci.push([this.uscita.x, this.uscita.y - 8, 0.6]);
        luci.forEach(([x, y, s]) => { this.luce.setScale(s); this.buio.erase(this.luce, x + 320, y + 320); });
      }
      if (hud.dialog || this.st.finito || (hud.ctrl && hud.ctrl.frozen)) return;
      this.items.slice().forEach(it => { if (it.tipo !== 'oggetto' && Math.hypot(it.x - p.x, it.ombra.y - p.y) < 11) this.raccogli(it); });
      return this.missioneSpeciale(time);
    }
    return upd.call(this, time, delta);
  };
})();
