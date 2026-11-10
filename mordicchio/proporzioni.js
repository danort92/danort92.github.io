// =====================================================================
//  Proporzioni (revisione 10/11). Riferimenti: la mucca (32 px, larga 27) per gli animali grandi,
//  l'anatroccolo/pulcino per i piccoli. Gli sprite sono quasi tutti 16×16, quindi senza correzione
//  un cavallo era grande come un gatto e un topolino come un coniglio.
//  La scala si applica in modo «trasparente»: il codice che fa setScale(1) o tween su scaleY lavora
//  sempre in unità logiche (1 = dimensione giusta per quella specie), e la base viene moltiplicata sotto.
//  Il disegno (e getBounds) leggono la scala vera.
// =====================================================================
const SCALA_SPECIE = {
  tempesta: 1.9, ombra: 1.6, nuvola: 1.4, fragola: 1.5, hana: 1.3,          // grandi, rispetto alla mucca
  maky: 1.25, birba: 1.2, fiocco: 1.3, briciola: 1.1, wilma: 1.1,
  ciuffo: 0.85, ghianda: 0.75, tubino: 0.72, pisolo: 0.75, spillo: 0.75,   // piccoli, rispetto al pulcino
  teodora: 0.8, ciro: 0.9, gaia: 0.9, paperotto: 0.8, zip: 0.55,
};
(function () {
  let p = Phaser.GameObjects.Sprite.prototype, dX = null, dY = null;
  while (p && !(dX && dY)) { dX = dX || Object.getOwnPropertyDescriptor(p, 'scaleX'); dY = dY || Object.getOwnPropertyDescriptor(p, 'scaleY'); p = Object.getPrototypeOf(p); }
  if (!dX || !dY || !dX.set || !dY.set) return;
  function applicaScala(s, base) {
    if (!base || base === 1 || s.__base) return s;
    const sx = dX.get.call(s), sy = dY.get.call(s);
    s.__base = base;
    Object.defineProperty(s, 'scaleX', { configurable: true, get() { return this.__vero ? dX.get.call(this) : dX.get.call(this) / base; }, set(v) { dX.set.call(this, v * base); } });
    Object.defineProperty(s, 'scaleY', { configurable: true, get() { return this.__vero ? dY.get.call(this) : dY.get.call(this) / base; }, set(v) { dY.set.call(this, v * base); } });
    Object.defineProperty(s, 'scale', { configurable: true, get() { return (this.scaleX + this.scaleY) / 2; }, set(v) { this.scaleX = v; this.scaleY = v; } });
    s.scaleX = sx; s.scaleY = sy;
    // il disegno e i contorni usano la scala vera
    ['renderWebGL', 'renderCanvas', 'getBounds'].forEach(m => { const f = s[m]; if (typeof f !== 'function') return; s[m] = function () { const v = this.__vero; this.__vero = true; try { return f.apply(this, arguments); } finally { this.__vero = v; } }; });
    return s;
  }
  window.applicaScala = applicaScala;
  const mk = Mondo.prototype.makeAnimal;
  Mondo.prototype.makeAnimal = function (id, x, y) { return applicaScala(mk.apply(this, arguments), SCALA_SPECIE[id]); };
})();
