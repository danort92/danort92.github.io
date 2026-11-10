// =====================================================================
//  Il finale (revisione 10/11). Dopo la festa, la prima volta soltanto:
//   riepilogo «Buon compleanno» → i 30 incontri uno dopo l'altro → «30 tappe, una per ogni anno»
//   → il pensiero conclusivo → «E adesso, Anastasia, è ora di tornare a casa…»
//   → la schermata illustrata «Made with love by Danilo» → di nuovo a casa, gioco libero.
//  Si salva in S.finaleVisto: non si ripete.
// =====================================================================
const FINALE = {
  anni: '30 tappe, una per ogni anno della sua vita.',
  pensiero: 'Non sono i luoghi che attraversiamo a rendere speciale il nostro viaggio, ma gli incontri, i piccoli gesti e l\'affetto che lasciamo lungo la strada.',
  casa: 'E adesso, Anastasia, è ora di tornare a casa.\nÈ stato un viaggio bellissimo.',
  firma: 'Made with love by Danilo',
};
function iconaTappa(L) {
  if (L.id === 25) return { tex: 'rocky', frame: 0, nome: L.nome };   // il sogno è l'incontro con Rocky
  const a = ANIMALI[L.animale] || {};
  return { tex: a.tex || 'icone', frame: a.idle != null ? a.idle : (a.frame != null ? a.frame : (a.tex ? undefined : 3)), nome: L.nome };
}
// lo spettacolo vero e proprio, su una scena qualsiasi che abbia un Hud
function mostraFinale(scena, poi) {
  const hud = scena.hud || game.scene.getScene('Hud'); hud.clearAll();
  if (hud.ctrl) hud.ctrl.frozen = true;
  try { Musica.suona('ricordo'); } catch (e) {}
  const c = hud.add.container(0, 0).setDepth(85); hud.layer.add(c);
  const fondo = hud.add.rectangle(0, 0, UW, UH, 0x2c2440, 1).setOrigin(0).setInteractive(); c.add(fondo);
  const strato = hud.add.container(0, 0); c.add(strato);
  const pulisci = () => strato.removeAll(true);
  const passi = [];
  // 1. gli incontri: trenta caselle che si accendono una alla volta
  passi.push(fine => {
    const tappe = LIVELLI.slice(0, 30), col = 5, cw = Math.min(58, (UW - 40) / col), x0 = UW / 2 - (col * cw) / 2 + cw / 2, y0 = UH * 0.17;
    strato.add(txt(hud, UW / 2, UH * 0.08, 'Il sentiero di Anastasia', 18, COL.crema, { align: 'center' }).setOrigin(0.5));
    tappe.forEach((L, i) => {
      const x = x0 + (i % col) * cw, y = y0 + Math.floor(i / col) * (cw + 6), ic = iconaTappa(L);
      const box = hud.add.rectangle(x, y, cw - 8, cw - 8, 0x3d3357).setStrokeStyle(2, 0xf2cf8c).setAlpha(0);
      const im = hud.add.image(x, y - 3, ic.tex, ic.frame); fitIcon(im, cw - 22); im.setAlpha(0);
      const n = txt(hud, x, y + cw / 2 - 12, String(L.id), 9, '#f2cf8c').setOrigin(0.5).setAlpha(0);
      strato.add([box, im, n]);
      hud.tweens.add({ targets: [box, im, n], alpha: 1, delay: 400 + i * 160, duration: 300, onStart: () => { if (i % 3 === 0) Sfx.tone(523 + (i % 6) * 66, 0.12, 'triangle', 0.03); } });
    });
    const t = txt(hud, UW / 2, y0 + 6 * (cw + 6) + 16, FINALE.anni, 15, COL.crema, { align: 'center', wordWrap: { width: UW - 50 } }).setOrigin(0.5, 0).setAlpha(0); strato.add(t);
    hud.tweens.add({ targets: t, alpha: 1, delay: 400 + 30 * 160 + 400, duration: 900 });
    hud.time.delayedCall(400 + 30 * 160 + 1400, fine);
  });
  // 2. il pensiero
  passi.push(fine => {
    const t = txt(hud, UW / 2, UH * 0.42, FINALE.pensiero, 16, COL.crema, { align: 'center', wordWrap: { width: UW - 60 }, lineSpacing: 6, fontStyle: 'italic' }).setOrigin(0.5).setAlpha(0); strato.add(t);
    for (let i = 0; i < 18; i++) { const l = hud.add.circle(Math.random() * UW, Math.random() * UH, 1.6, 0xfff2a8).setAlpha(0); strato.add(l); hud.tweens.add({ targets: l, alpha: { from: 0, to: 0.9 }, y: l.y - 20, yoyo: true, repeat: -1, duration: 1800 + Math.random() * 1600, delay: Math.random() * 1500 }); }
    hud.tweens.add({ targets: t, alpha: 1, duration: 1200, onComplete: () => hud.time.delayedCall(200, fine) });
  });
  // 3. «è ora di tornare a casa»
  passi.push(fine => {
    const t = txt(hud, UW / 2, UH * 0.44, FINALE.casa, 17, COL.crema, { align: 'center', wordWrap: { width: UW - 60 }, lineSpacing: 8 }).setOrigin(0.5).setAlpha(0); strato.add(t);
    hud.tweens.add({ targets: t, alpha: 1, duration: 1200, onComplete: () => hud.time.delayedCall(200, fine) });
  });
  // 4. la firma, illustrata: tramonto, la casetta, Anastasia e Mordicchio sul prato
  passi.push(fine => {
    const g = hud.add.graphics(); strato.add(g);
    const fasce = [0x3d3357, 0x5b4470, 0x8a5a7a, 0xc77d7d, 0xe8a77a, 0xf2cf8c];
    fasce.forEach((f, i) => g.fillStyle(f, 1).fillRect(0, i * UH * 0.1, UW, UH * 0.1 + 1));
    g.fillStyle(0xfff2c4, 1).fillCircle(UW * 0.7, UH * 0.55, 34);
    g.fillStyle(0x6f9a5a, 1).fillRect(0, UH * 0.58, UW, UH * 0.42);
    g.fillStyle(0x5c8a4c, 1).fillEllipse(UW * 0.2, UH * 0.6, UW * 0.9, 60).fillEllipse(UW * 0.85, UH * 0.62, UW * 0.8, 50);
    // la casetta
    const hx = UW * 0.24, hy = UH * 0.56;
    g.fillStyle(0xe9d3b0, 1).fillRect(hx - 30, hy - 30, 60, 40);
    g.fillStyle(0xa8574e, 1).fillTriangle(hx - 38, hy - 28, hx + 38, hy - 28, hx, hy - 58);
    g.fillStyle(0x754c60, 1).fillRect(hx - 7, hy - 8, 14, 18);
    g.fillStyle(0xfff2a8, 1).fillRect(hx + 12, hy - 20, 10, 9).fillRect(hx - 22, hy - 20, 10, 9);
    g.fillStyle(0x8a6a5a, 1).fillRect(hx + 18, hy - 54, 6, 14);
    // fiori sul prato
    for (let i = 0; i < 40; i++) g.fillStyle([0xf2a7c3, 0xfff2a8, 0xffffff, 0xd99a9a][i % 4], 1).fillCircle((i * 37) % UW, UH * 0.66 + ((i * 53) % (UH * 0.3)), 2);
    const ana = hud.add.sprite(UW * 0.52, UH * 0.70, 'girl', 0).setScale(5).setOrigin(0.5, 1);
    const gatto = hud.add.image(UW * 0.66, UH * 0.70, ANIMALI.mordicchio.tex, ANIMALI.mordicchio.idle != null ? ANIMALI.mordicchio.idle : 0).setScale(4).setOrigin(0.5, 1);
    strato.add([ana, gatto]);
    for (let k = 0; k < 6; k++) { const h = hud.add.image(UW * 0.59 + Math.sin(k) * 20, UH * 0.56, 'icone', 3).setScale(1.5).setAlpha(0); strato.add(h); hud.tweens.add({ targets: h, y: UH * 0.40, alpha: { from: 1, to: 0 }, duration: 2600, delay: k * 450, repeat: -1 }); }
    const f = txt(hud, UW / 2, UH * 0.82, FINALE.firma, 22, '#fbf4dc', { align: 'center', fontStyle: 'bold' }).setOrigin(0.5).setStroke('#3b2f4a', 5).setAlpha(0); strato.add(f);
    hud.tweens.add({ targets: f, alpha: 1, delay: 600, duration: 1400 });
    hud.time.delayedCall(2200, fine);
  });
  let i = 0, bottone = null;
  const avanti = () => {
    if (bottone) { bottone.destroy(); bottone = null; }
    if (i >= passi.length) { c.destroy(); if (hud.ctrl) hud.ctrl.frozen = false; return poi && poi(); }
    const ultimo = i === passi.length - 1;
    if (i > 0 && !ultimo) pulisci();
    if (ultimo) { pulisci(); }
    passi[i++](() => { bottone = hud.button(UW / 2 - 80, UH - 70, 160, 40, ultimo ? 'Torna a casa' : 'Avanti', avanti, { parent: c, size: 14 }); });
  };
  avanti();
}
Object.assign(Livello.prototype, {
  finale() {
    const S = Save.data; S.finaleVisto = true; Save.write();
    mostraFinale(this, () => { this.scene.start('Rifugio', { stanza: 'casa' }); });
  },
});
(function () {
  const riep = Livello.prototype.riepilogo;
  Livello.prototype.riepilogo = function (guadagno, primaVolta) {
    const r = riep.apply(this, arguments);
    if (this.L.id !== 30 || Save.data.finaleVisto) return r;
    // invece di «Torna al rifugio» / «Resta sul sentiero»: si continua verso il finale
    const hud = this.hud;
    hud.buttons.filter(b => b.active && b.label && /Torna al rifugio|Resta sul sentiero/.test(b.label.text)).forEach(b => b.setVisible(false).setActive(false));
    const cont = hud.buttons.filter(b => b.label && /Torna al rifugio/.test(b.label.text)).pop();
    hud.button(UW / 2 - 90, UH * 0.80, 180, 40, 'Continua', () => this.finale(), { size: 15, parent: cont && cont.parentContainer });
    return r;
  };
})();
// al ritorno a casa Mordicchio dice la sua frase di sempre (DOPO_LIVELLO 30), poi una riga che lascia il gioco libero
if (DOPO_LIVELLO[30] && !DOPO_LIVELLO[30].some(r => /Il rifugio è tuo/.test(r.text))) DOPO_LIVELLO[30].push({ who: 'narratore', text: 'Il rifugio è tuo: puoi tornare in ogni tappa, prenderti cura di tutti e arredare la casa come vuoi.' });
