// =====================================================================
//  Ambientazioni delle tappe (revisione 7/11)
//  Prima ogni tappa era un'isola verde in mezzo all'acqua. Adesso il bordo intorno al prato
//  dipende dal luogo: bosco fitto, montagna con rocce e vette innevate, paese con case e
//  selciato, giardini con siepi e staccionate, campagna aperta. L'acqua resta solo dove c'è
//  davvero (ruscello, torrente, laghetto alpino) e nel sogno.
//  In montagna e nei prati il terreno non è piatto: poggi, pendii e terrazzamenti.
//  Le zone non calpestabili sono le stesse di prima: cambia solo quello che si vede.
// =====================================================================
const AMBIENTI = {
  1: 'prato', 2: 'prato', 3: 'campagna', 4: 'bosco', 5: 'acqua', 6: 'cortile', 7: 'paese', 8: 'giardino', 9: 'giardino', 10: 'paese',
  11: 'campagna', 12: 'montagna', 13: 'montagna', 14: 'montagna', 15: 'montagna', 16: 'montagna', 17: 'torrente', 18: 'lago', 19: 'bosco', 20: 'bosco',
  21: 'paese', 22: 'paese', 23: 'paese', 24: 'paese', 25: 'acqua', 26: 'giardino', 27: 'campagna', 28: 'prato', 29: 'paese', 30: 'giardino',
};
const STILI_AMBIENTE = {
  bosco: { fondo: 0x2f4a36, macchie: 0x3b5a40, deco: ['pino', 'pino', 'albero', 'alberello', 'pino'], densita: 0.95, terra: null },
  montagna: { fondo: 0x8c8a80, macchie: 0x9f9c90, deco: ['masso', 'masso2', 'sasso', 'pino', 'masso', 'sassolino'], densita: 0.55, terra: 0xc4e0b0, vette: true, pendii: true },
  paese: { fondo: 0x8f8373, macchie: 0x9c907e, deco: [], densita: 0, terra: null, case: true, selciato: true },
  cortile: { fondo: 0x8f8373, macchie: 0x9c907e, deco: ['cespuglio'], densita: 0.15, terra: null, case: true, selciato: true },
  prato: { fondo: 0x6f9a52, macchie: 0x7fab5e, deco: ['cespuglio', 'siepe', 'fiore_giallo2', 'alberello', 'cespuglio_more'], densita: 0.45, terra: null, poggi: true },
  campagna: { fondo: 0x9a8a55, macchie: 0xa89863, deco: ['siepe2', 'alberello', 'cespuglio'], densita: 0.25, terra: null, campi: true, poggi: true },
  giardino: { fondo: 0x6f9a52, macchie: 0x7fab5e, deco: ['siepe', 'alberello', 'fiore_rosa2', 'cespuglio', 'fiore_giallo2'], densita: 0.3, terra: null, staccionata: true },
  lago: { acqua: true, vette: true }, torrente: { acqua: true, vette: true }, acqua: { acqua: true },
};
Object.assign(Livello.prototype, {
  creaAmbiente() {
    const L = this.L, nome = AMBIENTI[L.id] || 'acqua', A = STILI_AMBIENTE[nome]; this.ambiente = nome;
    const rows = L.mappa, H = rows.length, W = rows[0].length, sea = (x, y) => y < 0 || y >= H || x < 0 || x >= W || rows[y][x] === '~';
    const rnd = (() => { let s = L.id * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); })();   // sempre uguale per la stessa tappa
    if (A.vette) this.disegnaVette(W, rnd);
    if (A.acqua) return;
    this.acqua.setVisible(false);
    const g = this.add.graphics().setDepth(-20);
    g.fillStyle(A.fondo, 1).fillRect(-800, -800, W * T + 1600, H * T + 1600); this.cameras.main.setBackgroundColor(A.fondo);
    for (let i = 0; i < 260; i++) g.fillStyle(A.macchie, 0.8).fillEllipse(-200 + rnd() * (W * T + 400), -200 + rnd() * (H * T + 400), 6 + rnd() * 14, 3 + rnd() * 6);
    if (A.campi) for (let y = -10; y < H + 10; y += 2) g.fillStyle(y % 4 ? 0xb3a265 : 0x8e7f4c, 0.5).fillRect(-320, y * T, W * T + 640, T * 0.5);
    // il prato calpestabile: niente «riva» d'acqua, al massimo un bordo d'erba più scura
    if (A.terra) this.terreno.forEachTile(t => { if (t.index >= 0) t.tint = A.terra; });
    if (A.selciato) {   // in paese si cammina sul selciato, non sull'erba
      const dati = []; for (let y = 0; y < H; y++) { const r = []; for (let x = 0; x < W; x++) { const t = this.terreno.getTileAt(x, y); r.push(t ? t.index : -1); } dati.push(r); }
      const m = this.make.tilemap({ data: dati, tileWidth: T, tileHeight: T });
      const nuovo = m.createLayer(0, m.addTilesetImage('selciato', 'selciato', T, T, 0, 0), 0, 0).setDepth(-15);
      this.terreno.setVisible(false); this.terrenoSelciato = nuovo;
    }
    // decori fuori dal prato (fino a qualche casella oltre il bordo), sempre uguali per la tappa
    if (A.deco.length) for (let y = -3; y < H + 3; y++) for (let x = -3; x < W + 3; x++) {
      if (!sea(x, y) || rnd() > A.densita) continue;
      const vicinoPrato = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !sea(x + dx, y + dy));
      if (nome === 'bosco' && !vicinoPrato && rnd() < 0.3) continue;
      const k = A.deco[Math.floor(rnd() * A.deco.length)], cx = x * T + 8 + (rnd() - 0.5) * 6, cy = y * T + 15;
      const im = k === 'pino' ? this.add.image(cx, cy, 'pino') : this.add.image(cx, cy, 'natura', k);
      im.setOrigin(0.5, 1).setDepth(cy); if (nome === 'bosco') im.setTint(0xb8c8b0);
    }
    if (A.case) this.disegnaCase(W, H, sea, rnd, nome);
    if (A.staccionata) this.disegnaStaccionata(W, H, sea);
    if (A.poggi || A.pendii) this.disegnaPendii(W, H, sea, rnd, !!A.pendii);
  },
  // montagne sullo sfondo, con la neve in cima
  disegnaVette(W, rnd) {
    const g = this.add.graphics().setDepth(-19), base = -4;
    for (let i = 0; i < 6; i++) {
      const cx = -60 + i * (W * T + 120) / 5 + (rnd() - 0.5) * 30, h = 70 + rnd() * 60, w = 90 + rnd() * 60;
      g.fillStyle(i % 2 ? 0x7d8aa0 : 0x6c7890, 1).fillTriangle(cx - w / 2, base, cx, base - h, cx + w / 2, base);
      g.fillStyle(0xf3f4e7, 1).fillTriangle(cx - w * 0.14, base - h * 0.72, cx, base - h, cx + w * 0.14, base - h * 0.72);
      g.lineStyle(1, 0x504086, 0.5).strokeTriangle(cx - w / 2, base, cx, base - h, cx + w / 2, base);
    }
  },
  // in paese: file di case con tetti e finestre lungo i bordi, lampioni e vasi sul selciato
  disegnaCase(W, H, sea, rnd, nome) {
    const g = this.add.graphics();
    const colori = [0xe8c39e, 0xd9a07f, 0xf0dcb4, 0xc9b28f, 0xe6b8a2], tetti = [0xa35b4f, 0x8e4c4c, 0x9d6a4c];
    for (let x = -2; x < W + 2; x += 3) {   // case in alto, sopra il bordo della mappa
      const c = colori[Math.floor(rnd() * colori.length)], h = 34 + Math.floor(rnd() * 14), x0 = x * T, w = 3 * T - 4, y0 = -6 - h;
      g.fillStyle(c, 1).fillRect(x0, y0, w, h).lineStyle(1, 0x504086, 0.8).strokeRect(x0, y0, w, h);
      g.fillStyle(tetti[Math.floor(rnd() * tetti.length)], 1).fillRect(x0 - 3, y0 - 8, w + 6, 9).lineStyle(1, 0x504086, 0.8).strokeRect(x0 - 3, y0 - 8, w + 6, 9);
      for (let i = 0; i < 2; i++) g.fillStyle(0x8cbfe2, 1).fillRect(x0 + 6 + i * 20, y0 + 8, 8, 9).lineStyle(1, 0x504086, 0.8).strokeRect(x0 + 6 + i * 20, y0 + 8, 8, 9);
      if (rnd() < 0.6) g.fillStyle(0x754c60, 1).fillRect(x0 + w / 2 - 5, y0 + h - 14, 10, 14);
    }
    g.setDepth(-19);
    // dentro la mappa: dove non si cammina, selciato con qualche lampione, panchina o vaso di fiori
    const d = this.add.graphics().setDepth(-18);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!sea(x, y)) continue;
      if ((x + y) % 2 === 0) d.fillStyle(0xa79a85, 0.6).fillRect(x * T + 2, y * T + 2, 12, 12);
      const vicino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !sea(x + dx, y + dy));
      if (!vicino || rnd() > 0.22) continue;
      const cx = x * T + 8, cy = y * T + 14, r = rnd();
      if (r < 0.35) { const l = this.add.graphics().setDepth(cy); l.fillStyle(0x4a4252).fillRect(cx - 1, cy - 20, 2, 20); l.fillStyle(0xfff2a8).fillCircle(cx, cy - 21, 3); l.lineStyle(1, 0x504086).strokeCircle(cx, cy - 21, 3); }
      else if (r < 0.7) this.add.image(cx, cy, 'natura', rnd() < 0.5 ? 'fiore_rosa' : 'girasole').setOrigin(0.5, 1).setDepth(cy);
      else if (nome === 'paese') this.add.image(cx, cy, 'recinto').setOrigin(0.5, 1).setDepth(cy).setTint(0x9a8f80);
    }
  },
  disegnaStaccionata(W, H, sea) {   // una staccionata bassa lungo il bordo del giardino
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!sea(x, y) || ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !sea(x + dx, y + dy))) continue;
      if ((x + y) % 3 === 0) continue;
      this.add.image(x * T + 8, y * T + 14, 'recinto').setOrigin(0.5, 1).setDepth(y * T + 14);
    }
  },
  // pendii e poggi: il terreno sale e scende (solo a vista, si cammina come prima)
  disegnaPendii(W, H, sea, rnd, ripidi) {
    const g = this.add.graphics().setDepth(-13), libero = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!sea(x, y) && !sea(x + 1, y) && !sea(x, y + 1) && !sea(x - 1, y)) libero.push([x, y]);
    const n = ripidi ? 4 : 2;
    for (let i = 0; i < n && libero.length; i++) {
      const [x, y] = libero[Math.floor(rnd() * libero.length)], cx = x * T + 8, cy = y * T + 8, w = 40 + rnd() * 30;
      g.fillStyle(0x000000, 0.10).fillEllipse(cx + 3, cy + 5, w, w * 0.42);
      g.fillStyle(0xffffff, 0.10).fillEllipse(cx - 2, cy - 2, w * 0.8, w * 0.32);
      g.fillStyle(0xffffff, 0.08).fillEllipse(cx - 4, cy - 4, w * 0.45, w * 0.18);
      // il bordo del poggio fatto di puntini: con «strokeEllipse» alcuni telefoni Android disegnavano righe orizzontali lunghe tutto lo schermo
      for (let k = 0, n = Math.round(w * 1.6); k < n; k++) { const a = k / n * Math.PI * 2; g.fillStyle(0x3f6b4a, 0.35).fillRect(Math.round(cx + Math.cos(a) * w / 2), Math.round(cy + 1 + Math.sin(a) * w * 0.21), 1, 1); }
    }
    if (ripidi) for (let i = 0; i < 6 && libero.length; i++) {   // terrazzamenti: curve di livello
      const [x, y] = libero[Math.floor(rnd() * libero.length)], cx = x * T, cy = y * T;
      const pts = [[cx - 30, cy + 6], [cx - 10, cy], [cx + 12, cy + 2], [cx + 34, cy - 4]];   // curve di livello disegnate a puntini (niente strokePath: righe spurie su alcuni telefoni)
      for (let k = 0; k < pts.length - 1; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let j = 0; j <= n; j++) g.fillStyle(0x5d7a4e, 0.45).fillRect(Math.round(x0 + (x1 - x0) * j / n), Math.round(y0 + (y1 - y0) * j / n), 1, 1); }
    }
  },
});
(function () {
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () { const r = crea.apply(this, arguments); try { this.creaAmbiente(); } catch (e) { setTimeout(() => { throw e; }); } return r; };
})();
