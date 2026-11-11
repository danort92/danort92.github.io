// =====================================================================
//  Anastasia non passa attraverso mobili e oggetti (revisione 10/11, sera)
//  In casa e in stalla i mobili «da pavimento» (non tappeti né quadri) hanno un ingombro alla base;
//  lo stesso per il bancone della cucina, il calorifero, la lettiera e le staccionate dei recinti.
//  Se per qualche motivo si trova già dentro un ingombro (arrivo dalla porta, mobile appena messo),
//  può sempre uscirne: si blocca solo il passo che entra in un ostacolo nuovo.
// =====================================================================
Object.assign(Rifugio.prototype, {
  ostacoliStanza() {
    if (this.stanza === 'fuori') return [];
    const R = (x, y, w, h) => ({ x, y, w, h }), out = [];
    (this.arrediSprites || []).forEach(s => {
      if (!s.ogg || s.ogg.tipo === 'tappeto' || s.ogg.tipo === 'muro' || (this.ghost && this.ghost.s === s)) return;
      const w = s.displayWidth, h = Math.min(8, Math.max(4, s.displayHeight * 0.4));
      out.push(R(s.x - w / 2 + 2, s.y - h, w - 4, h));
    });
    if (this.stanza === 'casa') {
      out.push(R(7, STANZA.muro - 6, 44, 18));                       // bancone della cucina
      out.push(R(STANZA.w - 46, STANZA.muro - 6, 30, 14));            // calorifero
      if (typeof LETTIERA === 'function') { const L = LETTIERA(); out.push(R(L.x - L.w / 2, L.y + 2, L.w, L.h)); }
    }
    if (this.stanza === 'stalla' && Save.data.stallaAperta && typeof RECINTI_STALLA !== 'undefined') {
      // le staccionate: gli stessi tratti disegnati in stalla.js (spessore 4 px)
      RECINTI_STALLA.forEach(r => {
        const sx = r.x, dx = r.x + r.w, su = r.y, giu = r.y + r.h, fondo = r.y < 60, aSx = r.x < 60;
        const oriz = (x0, x1, y) => out.push(R(x0, y - 4, x1 - x0, 4)), vert = (x, y0, y1) => out.push(R(x - 2, y0, 4, y1 - y0));
        if (fondo) { oriz(sx, sx + r.w * 0.3, giu); oriz(dx - r.w * 0.3, dx, giu); if (sx > 8) vert(sx, su + 4, giu); }
        else if (aSx) { oriz(sx, dx, giu); vert(dx, su, su + r.h * 0.3); vert(dx, giu - r.h * 0.3, giu); }
        else { oriz(sx, dx, giu); vert(sx, su, su + r.h * 0.3); vert(sx, giu - r.h * 0.3, giu); }
      });
    }
    return out;
  },
  dentroOstacolo(x, y) { return (this.__ostacoli || []).some(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h); },
});
(function () {
  const mv = Rifugio.prototype.movePlayer;
  Rifugio.prototype.movePlayer = function (dt, blocked) {
    if (this.stanza === 'fuori' || !this.player) return mv.call(this, dt, blocked);
    this.__ostacoli = this.ostacoliStanza();
    const p = this.player, giaDentro = this.dentroOstacolo(p.x, p.y);
    return mv.call(this, dt, (x, y) => blocked(x, y) || (!giaDentro && this.dentroOstacolo(x, y)));
  };
})();
