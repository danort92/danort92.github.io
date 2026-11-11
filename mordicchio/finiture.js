// =====================================================================
//  Finiture (11/11)
//  - Su iPhone, se il gioco è aperto da Safari e non dall'icona sulla Home, la schermata iniziale
//    ricorda di aggiungerlo alla Home: lì la partita resta al sicuro.
// =====================================================================
(function () {
  const crea = Titolo.prototype.create;
  Titolo.prototype.create = function () {
    const r = crea.apply(this, arguments);
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent), daHome = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (ios && !daHome) txt(this, UW / 2, UH - 42, 'Consiglio: tocca Condividi e «Aggiungi alla schermata Home».\nDall\'icona sulla Home la partita resta sempre salvata.', 9, '#3f5f5e', { align: 'center', lineSpacing: 2 }).setOrigin(0.5);
    return r;
  };
})();

// =====================================================================
//  Linee a pixel (11/11)
//  Nelle scene del gioco (non nei menu), le linee sottili disegnate a codice — rettangoli, ellissi, cerchi,
//  triangoli, segmenti — sono fatte di pixel pieni invece che di tratti vettoriali:
//  - niente più righe spurie su alcuni telefoni Android (venivano dai tratti vettoriali);
//  - il contorno viola diventa la versione scura del colore dell'oggetto, come negli sprite.
// =====================================================================
(function () {
  const VIOLA = 0x504086;
  const scuro = c => {
    const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255, lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const k = lum > 200 ? 0.48 : lum > 150 ? 0.55 : 0.62;
    const f = (v, p) => Math.round(v * k * 0.9 + p * 0.1 * k);
    return (f(r, 0x50) << 16) | (f(g, 0x40) << 8) | f(b, 0x86);
  };
  const G = Phaser.GameObjects.Graphics.prototype;
  const o = { fillStyle: G.fillStyle, lineStyle: G.lineStyle, strokeRect: G.strokeRect, strokeRoundedRect: G.strokeRoundedRect, strokeEllipse: G.strokeEllipse, strokeCircle: G.strokeCircle, strokeTriangle: G.strokeTriangle, lineBetween: G.lineBetween };
  G.fillStyle = function (c, a) { this.__fc = c; this.__fa = a == null ? 1 : a; return o.fillStyle.apply(this, arguments); };
  G.lineStyle = function (w, c, a) { this.__lw = w; this.__lc = c; this.__la = a == null ? 1 : a; return o.lineStyle.apply(this, arguments); };
  const aPixel = g => g.__lw != null && g.__lw <= 6 && !(g.scene && g.scene.sys && ['Hud', 'Titolo'].includes(g.scene.sys.settings.key));
  // disegna i pixel col colore della linea, poi rimette il riempimento di prima
  const conPixel = (g, fn) => {
    const fc = g.__fc, fa = g.__fa, col = g.__lc === VIOLA && fc != null && fc !== VIOLA ? scuro(fc) : g.__lc;
    o.fillStyle.call(g, col, g.__la); fn((x, y, w, h) => g.fillRect(x, y, w || 1, h || 1));
    if (fc != null) o.fillStyle.call(g, fc, fa); else o.fillStyle.call(g, 0xffffff, 0);
    g.__fc = fc; g.__fa = fa; return g;
  };
  const segmento = (px, x1, y1, x2, y2, w) => {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))), h = Math.floor((w || 1) / 2), visti = new Set();
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n), k = x + ',' + y;
      if (visti.has(k)) continue; visti.add(k); px(x - h, y - h, w || 1, w || 1);
    }
  };
  G.strokeRect = function (x, y, w, h) {
    if (!aPixel(this) || this.__lw > 2) return o.strokeRect.apply(this, arguments);
    const t = this.__lw; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    return conPixel(this, px => { px(x, y, w, t); px(x, y + h - t, w, t); px(x, y, t, h); px(x + w - t, y, t, h); });
  };
  G.strokeRoundedRect = function (x, y, w, h) {
    if (!aPixel(this) || this.__lw > 1) return o.strokeRoundedRect.apply(this, arguments);
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    return conPixel(this, px => { px(x + 2, y, w - 4, 1); px(x + 2, y + h - 1, w - 4, 1); px(x, y + 2, 1, h - 4); px(x + w - 1, y + 2, 1, h - 4); px(x + 1, y + 1); px(x + w - 2, y + 1); px(x + 1, y + h - 2); px(x + w - 2, y + h - 2); });
  };
  const ellisse = (g, cx, cy, rx, ry) => conPixel(g, px => {
    const visti = new Set(), n = Math.ceil((rx + ry) * 4);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.round(cx + Math.cos(a) * rx - 0.5), y = Math.round(cy + Math.sin(a) * ry - 0.5), k = x + ',' + y; if (!visti.has(k)) { visti.add(k); px(x, y); } }
  });
  G.strokeEllipse = function (x, y, w, h) { if (!aPixel(this) || this.__lw > 1) return o.strokeEllipse.apply(this, arguments); return ellisse(this, x, y, w / 2, h / 2); };
  G.strokeCircle = function (x, y, r) { if (!aPixel(this) || this.__lw > 1) return o.strokeCircle.apply(this, arguments); return ellisse(this, x, y, r, r); };
  G.strokeTriangle = function (x1, y1, x2, y2, x3, y3) {
    if (!aPixel(this)) return o.strokeTriangle.apply(this, arguments);
    const w = this.__lw; return conPixel(this, px => { segmento(px, x1, y1, x2, y2, w); segmento(px, x2, y2, x3, y3, w); segmento(px, x3, y3, x1, y1, w); });
  };
  G.lineBetween = function (x1, y1, x2, y2) {
    if (!aPixel(this)) return o.lineBetween.apply(this, arguments);
    const w = this.__lw; return conPixel(this, px => segmento(px, x1, y1, x2, y2, w));
  };
})();
