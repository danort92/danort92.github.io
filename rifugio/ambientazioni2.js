// =====================================================================
//  Ambientazioni (revisione 10/11)
//  13 · La pozza di fango è dove Maky chiede di andare alla fine: lì si rotola davvero.
//  17 · Il torrente: i guadi diventano sassi; uno dei due sassi di ogni guado ogni tanto va sott'acqua.
//       Se Anastasia ci è sopra torna indietro di un passo, senza perdere niente. Basta aspettare.
//  20 · L'acqua è dove Fragola chiede di essere accompagnata alla fine: lì beve davvero.
//  29 · La fabbrica: nastri trasportatori, presse, ingranaggi e tubi. È domenica: tutto fermo e spento.
// =====================================================================
const GUADI_17 = [{ cols: [8, 9], x: 8, fermo: 8, mobile: 9, fase: 0 }, { cols: [16, 17], x: 17, fermo: 8, mobile: 9, fase: 1700 }];
Object.assign(Livello.prototype, {
  pozzaFango(x, y) {
    const g = this.add.graphics().setDepth(-13);
    g.fillStyle(0x5e3f28, 1).fillEllipse(x, y, 46, 22).fillEllipse(x - 18, y + 4, 18, 10).fillEllipse(x + 20, y - 3, 16, 9);
    g.fillStyle(0x7a5536, 1).fillEllipse(x, y - 1, 38, 16).fillEllipse(x + 14, y + 4, 12, 6);
    g.fillStyle(0x9a7350, 0.8).fillEllipse(x - 8, y - 4, 10, 3).fillEllipse(x + 9, y + 2, 7, 2);
    for (let i = 0; i < 4; i++) { const b = this.add.circle(x - 14 + i * 9, y + (i % 2 ? 2 : -2), 1.2, 0x9a7350).setDepth(-12.5); this.tweens.add({ targets: b, scale: { from: 0.4, to: 1.4 }, alpha: { from: 1, to: 0 }, repeat: -1, duration: 1400, delay: i * 500 }); }
    return g;
  },
  schizzi(x, y, col) {
    for (let i = 0; i < 7; i++) {
      const s = this.add.circle(x, y - 2, 1.3, col).setDepth(y + 2), a = Math.PI + Math.random() * Math.PI;
      this.tweens.add({ targets: s, x: x + Math.cos(a) * (8 + Math.random() * 8), y: y - 2 + Math.sin(a) * (6 + Math.random() * 6), alpha: 0, duration: 500, onComplete: () => s.destroy() });
    }
  },
  sorgente(x, y) {
    const g = this.add.graphics().setDepth(-13);
    g.fillStyle(0x8a8f99, 1).fillEllipse(x, y, 30, 15);
    g.fillStyle(0x5aa3c0, 1).fillEllipse(x, y, 25, 11);
    g.fillStyle(0x9ad3e6, 0.8).fillEllipse(x - 4, y - 2, 10, 3);
    [[-14, -3], [13, -4], [-11, 5], [12, 5], [0, -7]].forEach(([dx, dy]) => g.fillStyle(0x9a9ea6, 1).fillEllipse(x + dx, y + dy, 6, 4));
    // l'acqua che sgorga tra i sassi, in alto
    this.time.addEvent({ delay: 900, loop: true, callback: () => { const r = this.add.ellipse(x + 2, y - 3, 4, 2).setStrokeStyle(1, 0xd8f0f8, 0.9).setDepth(-12.5); this.tweens.add({ targets: r, scale: 3, alpha: 0, duration: 1300, onComplete: () => r.destroy() }); } });
    return { x, y };
  },
  ingranaggio(x, y, r, col) {
    const g = this.add.graphics({ x, y }).setDepth(y + 20);
    g.fillStyle(col, 1).fillCircle(0, 0, r);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.fillRect(Math.cos(a) * r - 1.5, Math.sin(a) * r - 1.5, 3, 3); }
    g.fillStyle(0x3b3546, 1).fillCircle(0, 0, r * 0.35);
    if (this.L.id !== 29) this.tweens.add({ targets: g, angle: 360, repeat: -1, duration: 2600 });   // in fabbrica è domenica: tutto fermo
    return g;
  },
});
(function () {
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    const r = crea.apply(this, arguments), L = this.L, st = this.st;
    // ---------------- 13: la pozza di fango, dove Maky chiede di andare alla fine (in alto a sinistra) ----------------
    if (L.id === 13) {
      const [tx, ty] = (L.dopo && L.dopo.dove[0]) || [2, 5];
      this.pozza13 = { x: tx * T + 8, y: ty * T + 12 }; this.pozzaFango(this.pozza13.x, this.pozza13.y);
    }
    // ---------------- 20: l'acqua, dove Fragola chiede di essere accompagnata (in alto a destra) ----------------
    if (L.id === 20) {
      const [tx, ty] = (L.dopo && L.dopo.dove[0]) || [18, 3];
      this.acqua20 = this.sorgente(tx * T + 8, ty * T + 12);
    }
    // ---------------- 17: i sassi del guado ----------------
    if (L.id === 17) {
      this.sassiGuado = [];
      GUADI_17.forEach(gd => {
        gd.cols.forEach(x => [gd.fermo, gd.mobile].forEach(y => { if (this.land[y] && this.land[y][x]) { this.land[y][x] = false; this.terreno.removeTileAt(x, y); } }));
        const sx = gd.x * T + 8;
        [gd.fermo, gd.mobile].forEach((y, i) => {
          const g = this.add.graphics({ x: sx, y: y * T + 8 }).setDepth(-13);
          g.fillStyle(0x6e7480, 1).fillEllipse(0, 2, 17, 13); g.fillStyle(0x9aa1ad, 1).fillEllipse(0, 0, 15, 11); g.fillStyle(0xc3c9d2, 1).fillEllipse(-3, -2, 5, 3);
          this.land[y][gd.x] = true;
          if (i === 1) this.sassiGuado.push({ g, tx: gd.x, ty: y, fase: gd.fase, su: true });
        });
      });
      this.time.addEvent({ delay: 100, loop: true, callback: () => this.cicloSassi() });
    }
    // ---------------- 29: la fabbrica ----------------
    if (L.id === 29) {
      const rows = L.mappa, H = rows.length;
      // nastri trasportatori lungo i corridoi dei reparti
      const nastri = [[5, 3, 3], [9, 4, 5], [15, 2, 4], [4, 7, 8], [13, 7, 6]];
      nastri.forEach(([x0, y, n]) => {
        const ok = [...Array(n)].every((_, i) => rows[y] && rows[y][x0 + i] && '.Rs'.includes(rows[y][x0 + i])); if (!ok) return;
        const X = x0 * T, Y = y * T + 9, Wn = n * T;
        const g = this.add.graphics().setDepth(-12.8);
        g.fillStyle(0x3b3546, 1).fillRect(X, Y - 4, Wn, 9); g.fillStyle(0x5a5466, 1).fillRect(X, Y - 3, Wn, 6);
        g.fillStyle(0x8a8f99, 1).fillCircle(X + 2, Y, 3).fillCircle(X + Wn - 2, Y, 3);
        const strisce = this.add.tileSprite(X + 4, Y, Wn - 8, 5, 'selciato').setOrigin(0, 0.5).setDepth(-12.7).setTint(0x4a4456).setAlpha(0.6);
        // scatoline di cerniere che scorrono sul nastro
        for (let k = 0; k < Math.max(1, n - 2); k++) {
          const sc = this.add.rectangle(X + 6 + k * 22, Y - 2, 5, 4, 0xd8b26a).setStrokeStyle(1, 0x754c60).setDepth(-12.6);
        }
      });
      // le macchine: dove prima c'erano i tronchi ci sono presse con il pistone e un ingranaggio
      this.children.list.slice().forEach(o => { if (o.frame && o.frame.name === 'tronco') o.setVisible(false); });
      rows.forEach((rw, y) => [...rw].forEach((ch, x) => {
        if (ch !== 'x') return;
        const cx = x * T + 8, by = y * T + 16, g = this.add.graphics().setDepth(by);
        g.fillStyle(0x4f5a66, 1).fillRect(cx - 8, by - 18, 16, 18); g.fillStyle(0x6b7886, 1).fillRect(cx - 7, by - 17, 14, 7);
        g.fillStyle(0x2f3540, 1).fillRect(cx - 6, by - 6, 12, 4);
        g.fillStyle(0xe8894f, 1).fillRect(cx - 8, by - 2, 16, 2);
        const pist = this.add.rectangle(cx, by - 9, 4, 6, 0xc3c9d2).setDepth(by + 0.5);
        this.add.circle(cx + 5, by - 14, 1.3, 0x6e6a66).setDepth(by + 0.6);   // spia spenta
        const ing = this.ingranaggio(cx - 4, by - 14, 3, 0xc3a46a); ing.setDepth(by + 0.6);
      }));
      // tubi lungo il muro in alto, con sbuffi di vapore
      const yT = 2 * T - 2, g = this.add.graphics().setDepth(2 * T + 9);
      g.fillStyle(0x8a8f99, 1).fillRect(4 * T, yT, 16 * T, 3); g.fillStyle(0x6e7480, 1);
      for (let x = 5; x < 20; x += 3) g.fillRect(x * T, yT - 1, 3, 5);
      // niente vapore: le macchine sono spente
      [[6, 2], [16, 2]].forEach(([x, y]) => { if (rows[y + 1] && rows[y + 1][x] !== '~') this.ingranaggio(x * T + 8, y * T + 4, 5, 0x9aa1ad).setDepth(2 * T + 10); });
    }
    return r;
  };
})();
Object.assign(Livello.prototype, {
  cicloSassi() {
    const t = this.time.now, p = this.player;
    (this.sassiGuado || []).forEach(s => {
      const ciclo = (t + s.fase) % 4400;   // 2,6 s fuori, 0,5 s trema, 1,3 s sotto
      const su = ciclo < 3100, trema = ciclo >= 2600 && ciclo < 3100;
      s.g.x = s.tx * T + 8 + (trema ? Math.sin(t / 30) * 1 : 0);
      if (su === s.su) return;
      s.su = su; this.land[s.ty][s.tx] = su;
      this.tweens.add({ targets: s.g, alpha: su ? 1 : 0.15, scaleY: su ? 1 : 0.6, duration: 200 });
      if (!su) {
        this.schizzi(s.tx * T + 8, s.ty * T + 12, 0xd8f0f8);
        // chi ci è sopra torna sulla riva da cui è partito, un passo indietro
        if (p && Math.floor(p.x / T) === s.tx && Math.floor((p.y - 1) / T) === s.ty) {
          const riva = (s.ty + 1) * T + 10;
          this.tweens.add({ targets: p, y: riva, duration: 260 }); Sfx.pop && Sfx.pop();
          this.hud.toast('Splash! Aspetta che il sasso torni su.');
        }
      }
    });
  },
});

// alla fine della tappa: Maky si rotola nella pozza, Fragola beve, e solo dopo dicono la loro frase
(function () {
  const chiudi = Livello.prototype.chiudiFase2;
  Livello.prototype.chiudiFase2 = function () {
    const L = this.L, n = this.npc, meta = L.id === 13 ? this.pozza13 : L.id === 20 ? this.acqua20 : null;
    if (!meta || !n) return chiudi.apply(this, arguments);
    this.seguaci = this.seguaci.filter(x => x !== n); this.frozenAll = true; if (this.hud.ctrl) this.hud.ctrl.frozen = true; this.hud.joyEnd && this.hud.joyEnd();
    const dx = L.id === 13 ? 0 : 12;
    if (n.anims && n.walkAnim) n.anims.play(n.walkAnim, true); n.setFlipX(meta.x + dx < n.x);
    this.tweens.add({ targets: n, x: meta.x + dx, y: meta.y + 1, duration: Math.max(300, Math.hypot(meta.x + dx - n.x, meta.y - n.y) * 25), onUpdate: () => n.setDepth(n.y), onComplete: () => {
      if (n.anims) n.anims.stop();
      const fine = () => { this.frozenAll = false; if (this.hud.ctrl) this.hud.ctrl.frozen = false; this.seguaci.push(n); chiudi.call(this); };
      if (L.id === 13) {   // due belle rotolate nel fango
        [0, 1].forEach(i => this.time.delayedCall(i * 900, () => { this.tweens.add({ targets: n, angle: (i ? -1 : 1) * 360, duration: 700, ease: 'Sine.inOut', onComplete: () => n.setAngle(0) }); this.time.delayedCall(250, () => this.schizzi(n.x, n.y, 0x7a5536)); }));
        this.time.delayedCall(2000, fine);
      } else {             // Fragola abbassa la testa e beve
        n.setFlipX(true);
        this.tweens.add({ targets: n, scaleY: 0.88, angle: -12, yoyo: true, hold: 1200, duration: 260, repeat: 1, onComplete: () => { n.setAngle(0); n.scaleY = 1; } });
        [400, 1900].forEach(t => this.time.delayedCall(t, () => { const rr = this.add.ellipse(meta.x + 4, meta.y, 3, 1.5).setStrokeStyle(1, 0xffffff, 0.9).setDepth(-12.4); this.tweens.add({ targets: rr, scale: 4, alpha: 0, duration: 900, onComplete: () => rr.destroy() }); }));
        this.time.delayedCall(3400, fine);
      }
    } });
  };
  // all'arrivo Maky non si sta rotolando: si sente solo grugnire
  const L13 = LIVELLI.find(l => l.id === 13);
  if (L13) L13.dialoghi.arrivo = [{ who: 'narratore', text: 'Un pascolo pieno di sassi. Da qualche parte qualcuno grugnisce, tutto contento.' }, { who: 'mordicchio', text: 'Senti? C\'è qualcuno di buon umore. Andiamo a vedere.' }];
})();
