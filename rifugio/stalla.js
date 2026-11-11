// =====================================================================
//  La stalla con i recinti (revisione 10/11): lungo i lati e sul fondo, ognuno grande quanto serve
//  alla specie. Il recinto è aperto verso il centro: gli animali entrano ed escono, ma quando si
//  fermano tornano soprattutto nel loro.
// =====================================================================
const RECINTI_STALLA = [
  // fondo: i grandi
  { x: 6, y: 40, w: 66, h: 42, chi: ['margherita', 'viola', 'nuvola'], nome: 'Mucche' },
  { x: 76, y: 40, w: 46, h: 42, chi: ['tempesta'], nome: 'Cavallo' },
  { x: 126, y: 40, w: 44, h: 42, chi: ['ombra'], nome: 'Asinello' },
  // lato sinistro: i medi, e in fondo la pozza di Maky
  { x: 6, y: 94, w: 44, h: 40, chi: ['fragola'], nome: 'Cerbiatta' },
  { x: 6, y: 140, w: 44, h: 40, chi: ['birba', 'fiocco'], nome: 'Capra e pecora' },
  { x: 6, y: 186, w: 44, h: 36, chi: ['maky'], nome: 'Maialina' },
  // lato destro: i pennuti
  { x: 130, y: 94, w: 40, h: 50, chi: ['hana', 'ottavia'], nome: 'Gru e oca' },
  { x: 130, y: 150, w: 40, h: 40, chi: ['wilma', 'pina', 'gaia', 'paperotto'], nome: 'Cortile' },
];
function recintoDi(k) { return RECINTI_STALLA.find(r => r.chi.includes(k)); }
Object.assign(Rifugio.prototype, {
  disegnaRecinti() {
    const g = this.add.graphics().setDepth(-6), legno = 0xa3714e, scuro = 0x754c60;
    RECINTI_STALLA.forEach(r => {
      g.fillStyle(0xe2c98f, 0.45).fillRect(r.x, r.y, r.w, r.h);            // paglia sul pavimento
      for (let i = 0; i < r.w * r.h / 90; i++) g.fillStyle(0xc9a85e, 0.7).fillRect(r.x + 2 + ((i * 37) % (r.w - 4)), r.y + 2 + ((i * 53) % (r.h - 4)), 3, 1);
    });
    // staccionate basse: il lato verso il centro ha un'apertura
    const rail = (x0, y0, x1, y1) => {
      const s = this.add.graphics().setDepth(Math.max(y0, y1));
      s.fillStyle(legno, 1); s.lineStyle(1, scuro, 1);
      if (y0 === y1) { s.fillRect(x0, y0 - 5, x1 - x0, 2).fillRect(x0, y0 - 2, x1 - x0, 2); for (let x = x0; x <= x1; x += 10) s.fillRect(x - 1, y0 - 7, 2, 7); }
      else { s.fillRect(x0 - 1, y0, 2, y1 - y0); for (let y = y0; y <= y1; y += 10) s.fillStyle(scuro, 1).fillRect(x0 - 1, y - 4, 2, 5).fillStyle(legno, 1); }
    };
    RECINTI_STALLA.forEach(r => {
      const sx = r.x, dx = r.x + r.w, su = r.y, giu = r.y + r.h, dietroSx = r.x < 60, dietroDx = r.x > 120, fondo = r.y < 60;
      if (fondo) {   // fondo: aperto in basso al centro
        rail(sx, giu, sx + r.w * 0.3, giu); rail(dx - r.w * 0.3, giu, dx, giu);
        if (sx > 8) rail(sx, su + 4, sx, giu);
      } else if (dietroSx) {   // lato sinistro: aperto a destra, al centro
        rail(sx, giu, dx, giu); rail(dx, su, dx, su + r.h * 0.3); rail(dx, giu - r.h * 0.3, dx, giu);
      } else if (dietroDx) {   // lato destro: aperto a sinistra
        rail(sx, giu, dx, giu); rail(sx, su, sx, su + r.h * 0.3); rail(sx, giu - r.h * 0.3, sx, giu);
      }
    });
  },
  puntoRecinto(r) { return { x: Phaser.Math.Between(r.x + 9, r.x + r.w - 9), y: Phaser.Math.Between(r.y + 14, r.y + r.h - 4), posto: true }; },
});
(function () {
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    crea.apply(this, arguments);
    if (this.stanza !== 'stalla' || !Save.data.stallaAperta) return;
    this.disegnaRecinti();
    (this.ospiti || []).forEach(o => { const r = recintoDi(o.chiave); if (r && !o.evento) { const p = this.puntoRecinto(r); o.setPosition(p.x, p.y); } });
  };
  const pl = Rifugio.prototype.puntoLibero;
  Rifugio.prototype.puntoLibero = function (o) {
    if (this.stanza === 'stalla' && o) { const r = recintoDi(o.chiave); if (r && Math.random() < 0.75) return this.puntoRecinto(r); }
    return pl.call(this, o);
  };
})();
