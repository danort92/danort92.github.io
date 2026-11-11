// =====================================================================
//  Niente righe tra le piastrelle (revisione 10/11, notte)
//  Sui telefoni, mentre la telecamera scorre, tra una piastrella e l'altra del prato potevano
//  comparire sottili righe (il disegno «pescava» il pixel della piastrella accanto).
//  Si crea una copia del set di piastrelle con un bordo di 1 pixel ripetuto intorno a ogni piastrella
//  (estrusione) e la mappa usa quella: le righe spariscono.
// =====================================================================
function estrudiTileset(scena, chiave) {
  const nuova = chiave + '_x'; if (scena.textures.exists(nuova)) return nuova;
  const src = scena.textures.get(chiave).getSourceImage(), cols = Math.floor(src.width / T), righe = Math.floor(src.height / T);
  const c = document.createElement('canvas'); c.width = cols * (T + 2); c.height = righe * (T + 2);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  for (let y = 0; y < righe; y++) for (let x = 0; x < cols; x++) {
    const sx = x * T, sy = y * T, dx = x * (T + 2) + 1, dy = y * (T + 2) + 1;
    g.drawImage(src, sx, sy, T, T, dx, dy, T, T);
    g.drawImage(src, sx, sy, T, 1, dx, dy - 1, T, 1); g.drawImage(src, sx, sy + T - 1, T, 1, dx, dy + T, T, 1);           // sopra, sotto
    g.drawImage(src, sx, sy, 1, T, dx - 1, dy, 1, T); g.drawImage(src, sx + T - 1, sy, 1, T, dx + T, dy, 1, T);           // sinistra, destra
    g.drawImage(src, sx, sy, 1, 1, dx - 1, dy - 1, 1, 1); g.drawImage(src, sx + T - 1, sy, 1, 1, dx + T, dy - 1, 1, 1);   // angoli
    g.drawImage(src, sx, sy + T - 1, 1, 1, dx - 1, dy + T, 1, 1); g.drawImage(src, sx + T - 1, sy + T - 1, 1, 1, dx + T, dy + T, 1, 1);
  }
  scena.textures.addCanvas(nuova, c);
  return nuova;
}
(function () {
  const add = Phaser.Tilemaps.Tilemap.prototype.addTilesetImage;
  Phaser.Tilemaps.Tilemap.prototype.addTilesetImage = function (nome, chiave, w, h, margin, spacing) {
    if ((chiave === 'erba' || chiave === 'selciato') && w === T && h === T && !margin && !spacing) {
      try { const x = estrudiTileset(this.scene, chiave); return add.call(this, nome, x, T, T, 1, 2); } catch (e) { /* in caso di problemi, il set originale */ }
    }
    return add.apply(this, arguments);
  };
})();
