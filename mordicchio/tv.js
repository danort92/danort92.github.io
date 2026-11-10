// =====================================================================
//  La televisione (revisione 10/11): si accende toccandola. Tre programmi, schermate originali
//  nello stile del gioco (niente filmati né registrazioni):
//   1. Elisa True Crime – il saluto con cui apre il canale
//   2. Indagini – Stefano Nazzi, sobrio
//   3. Outlander – note che salgono e la poesia di R. L. Stevenson da cui viene la sigla
//      (testo originale del 1892: la versione della serie è protetta e non si riproduce)
//  «Spegni» spegne lo schermo anche nella stanza.
// =====================================================================
const PROGRAMMI_TV = [
  { id: 'elisa', nome: 'Elisa True Crime', colore: 0x3a1f2b, accento: '#f2b8c6', testo: 'Bentornati amici sul mio canale e, se siete nuovi, benvenuti! Io sono Elisa.' },
  { id: 'nazzi', nome: 'Indagini', sotto: 'Stefano Nazzi', colore: 0x1e1e22, accento: '#e6e2d8', testo: 'Mi chiamo Stefano Nazzi, faccio il giornalista da tanti anni. Nel corso della mia carriera mi sono occupato di tante storie...' },
  { id: 'outlander', nome: 'Outlander', colore: 0x27384a, accento: '#cfe3f2', testo: 'Sing me a song of a lad that is gone,\nSay, could that lad be I?\nMerry of soul he sailed on a day\nOver the sea to Skye.', nota: 'R. L. Stevenson, 1892' },
];
Object.assign(Rifugio.prototype, {
  tvSprite() { return (this.arrediSprites || []).find(a => a.dati.id === 'tv'); },
  schermoStanza(colore) {
    const tv = this.tvSprite(); if (!tv) return;
    if (!this.schermoTv) this.schermoTv = this.add.rectangle(tv.x, tv.y - 11, 12, 5, 0x2a2438).setDepth(tv.depth + 1);
    if (this.tvAccesa) { this.tvAccesa.remove(); this.tvAccesa = null; }
    if (colore == null) { this.schermoTv.setFillStyle(0x2a2438); return; }
    this.tvAccesa = this.time.addEvent({ delay: 500, loop: true, callback: () => this.schermoTv.setFillStyle(Phaser.Display.Color.ValueToColor(colore).lighten(10 + Math.random() * 25).color) });
  },
  menuTV() {
    const hud = this.hud, m = hud.modal('La televisione', 74 + (PROGRAMMI_TV.length + 1) * 46);
    PROGRAMMI_TV.forEach((p, i) => hud.button(28, m.y + 50 + i * 46, UW - 56, 38, p.nome + (p.sotto ? ' – ' + p.sotto : ''), () => { m.close(); this.guardaTV(p); }, { parent: m.c, size: 13 }));
    hud.button(28, m.y + 50 + PROGRAMMI_TV.length * 46, UW - 56, 38, 'Spegni la TV', () => { m.close(); this.schermoStanza(null); }, { parent: m.c, size: 13 });
  },
  guardaTV(p) {
    const hud = this.hud; this.schermoStanza(p.colore);
    const m = hud.modal(p.nome, 420), sx = 24, sy = m.y + 46, sw = UW - 48, sh = 250;
    // il televisore: cornice scura, schermo con un leggero bagliore
    const g = hud.add.graphics(); m.c.add(g);
    g.fillStyle(0x2b2633, 1).fillRoundedRect(sx - 6, sy - 6, sw + 12, sh + 12, 8);
    g.fillStyle(p.colore, 1).fillRoundedRect(sx, sy, sw, sh, 5);
    g.fillStyle(0xffffff, 0.05).fillRoundedRect(sx + 6, sy + 6, sw - 12, sh / 3, 4);
    for (let y = sy + 2; y < sy + sh; y += 4) g.fillStyle(0x000000, 0.08).fillRect(sx, y, sw, 1);
    g.fillStyle(0x2b2633, 1).fillRect(UW / 2 - 30, sy + sh + 6, 60, 8);
    const scena = hud.add.graphics(); m.c.add(scena);
    if (p.id === 'elisa') {   // studio raccolto: una lampada calda, la poltrona, un microfono
      scena.fillStyle(0x5a2f3f, 1).fillRect(sx, sy + sh - 70, sw, 70);
      scena.fillStyle(0xf2c7a5, 0.25).fillCircle(sx + sw - 50, sy + 60, 40); scena.fillStyle(0xf2c7a5, 1).fillRect(sx + sw - 54, sy + 60, 8, 50);
      scena.fillStyle(0x2a1a22, 1).fillRect(sx + 40, sy + sh - 110, 6, 50).fillCircle(sx + 43, sy + sh - 116, 9);
    } else if (p.id === 'nazzi') {   // sobrio: bianco e nero, una sola riga di luce
      scena.fillStyle(0xe6e2d8, 0.9).fillRect(sx + 20, sy + 40, sw - 40, 2);
      scena.fillStyle(0xe6e2d8, 0.5).fillRect(sx + 20, sy + sh - 44, (sw - 40) * 0.6, 2);
    } else {   // le Highlands nella nebbia, il mare, una barca
      scena.fillStyle(0x3d5468, 1).fillTriangle(sx, sy + sh - 60, sx + 90, sy + 90, sx + 190, sy + sh - 60);
      scena.fillStyle(0x4b6478, 1).fillTriangle(sx + 120, sy + sh - 60, sx + 230, sy + 110, sx + sw, sy + sh - 60);
      scena.fillStyle(0x6f8fa8, 1).fillRect(sx, sy + sh - 60, sw, 60);
      scena.fillStyle(0xdfe8ef, 0.25).fillRect(sx, sy + 120, sw, 30);
      scena.fillStyle(0x2b2633, 1).fillTriangle(sx + 150, sy + sh - 46, sx + 180, sy + sh - 46, sx + 165, sy + sh - 30).fillRect(sx + 164, sy + sh - 74, 2, 28);
      scena.fillStyle(0xf3f4e7, 1).fillTriangle(sx + 166, sy + sh - 74, sx + 166, sy + sh - 48, sx + 184, sy + sh - 50);
      for (let i = 0; i < 8; i++) {   // note musicali che salgono
        const n = txt(hud, sx + 20 + Math.random() * (sw - 40), sy + sh - 20, i % 2 ? '♪' : '♫', 16, '#cfe3f2').setAlpha(0); m.c.add(n);
        hud.tweens.add({ targets: n, y: sy + 30, alpha: { from: 0.9, to: 0 }, duration: 3600, delay: i * 700, repeat: -1 });
      }
    }
    // titolo e testo che compare lettera per lettera
    m.c.add(txt(hud, UW / 2, sy + 18, p.nome.toUpperCase(), 15, p.accento, { fontStyle: 'bold' }).setOrigin(0.5, 0));
    if (p.sotto) m.c.add(txt(hud, UW / 2, sy + 40, p.sotto, 11, p.accento).setOrigin(0.5, 0));
    const t = txt(hud, UW / 2, sy + (p.id === 'outlander' ? 60 : 80), '', p.id === 'outlander' ? 13 : 14, p.accento, { align: 'center', wordWrap: { width: sw - 40 }, lineSpacing: 6, fontStyle: p.id === 'outlander' ? 'italic' : 'normal' }).setOrigin(0.5, 0);
    m.c.add(t);
    let i = 0; const scrivi = hud.time.addEvent({ delay: 38, repeat: p.testo.length - 1, callback: () => { if (t.active) t.setText(p.testo.slice(0, ++i)); } });
    if (p.nota) m.c.add(txt(hud, sx + sw - 10, sy + sh - 18, p.nota, 9, p.accento).setOrigin(1, 0).setAlpha(0.7));
    hud.button(28, sy + sh + 24, (UW - 64) / 2, 36, 'Cambia canale', () => { scrivi.remove(); m.close(); this.menuTV(); }, { parent: m.c, size: 12 });
    hud.button(36 + (UW - 64) / 2, sy + sh + 24, (UW - 64) / 2, 36, 'Spegni', () => { scrivi.remove(); m.close(); this.schermoStanza(null); }, { parent: m.c, size: 12 });
  },
});
(function () {
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.modo === 'gioca' && Save.data.introVista) { const tv = this.tvSprite(); if (tv && Phaser.Geom.Rectangle.Contains(tv.getBounds(), x, y)) return this.menuTV(); }
    return tap.call(this, x, y);
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    this.schermoTv = null; this.tvAccesa = null; const r = crea.apply(this, arguments);
    // partite già iniziate prima della TV: la si trova in casa, davanti al divanetto
    const S = Save.data;
    if (this.stanza === 'casa' && S.introVista && !S.tvMigrata && !S.arredi.some(a => a.id === 'tv') && !S.inventario.includes('tv')) {
      const a = { id: 'tv', x: 40, y: 166, stanza: 'casa' }; S.arredi.push(a); S.tvMigrata = true; this.spawnArredo(a); if (this.sistemaArredi) this.sistemaArredi(); Save.write();
    }
    return r;
  };
})();
