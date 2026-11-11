// =====================================================================
//  L'inizio del gioco: il pacco con le scarpe (revisione 10/11)
//  Anastasia è sul divano e guarda la TV. Mordicchio entra con il «!»: è arrivato un pacco.
//  Lei si alza, lo apre: dentro le scarpe e un biglietto. Mordicchio si infila nella scatola…
//  «Ah, giusto! Ora ricordo!» e parte l'introduzione di sempre.
//  Le scarpe sono bianche, verdi, rosa e marroni; da quel momento Anastasia le porta ai piedi.
// =====================================================================
OGGETTI.tv = { nome: 'Televisione', tex: 'tv', tipo: 'pavimento' };
ARREDO_INIZIALE.push({ id: 'tv', x: 40, y: 166 });
const INTRO_DOPO_PACCO = [
  { who: 'mordicchio', text: 'Ah, giusto! Ora ricordo!' },
  { who: 'mordicchio', text: 'Oggi comincia la tua avventura. Questa casa diventerà un rifugio: per ora è un po\' vuota, ma ci vivranno tanti animali.' },
].concat(INTRO.slice(2));
Rifugio.prototype.avviaIntro = function () {
  const S = Save.data, p = this.player, c = this.cat, hud = this.hud, divano = (this.arrediSprites || []).find(a => a.dati.id === 'divanetto'), tv = (this.arrediSprites || []).find(a => a.dati.id === 'tv');
  if (!divano || !c) return this.time.delayedCall(400, () => hud.say(INTRO, () => { S.introVista = true; Save.write(); }));
  this.sdraiata = true;   // niente joystick durante la scena
  p.setPosition(divano.x, divano.y - 4).setDepth(divano.y + 1); if (p.anims) p.anims.stop(); p.setFrame(4);
  // la TV accesa: lo schermo cambia colore
  let schermo = null;
  if (tv) { schermo = this.add.rectangle(tv.x, tv.y - 11, 12, 5, 0x8cbfe2).setDepth(tv.depth + 1); this.tvAccesa = this.time.addEvent({ delay: 450, loop: true, callback: () => schermo.setFillStyle(Phaser.Utils.Array.GetRandom([0x8cbfe2, 0xa9d8b8, 0xf2c7a5, 0xd6c9e8])) }); }
  c.evento = true; c.meta = null; c.setPosition(STANZA.w / 2, STANZA.h + 12).setVisible(true);
  const pacco = this.add.image(STANZA.w / 2 + 14, STANZA.h - 22, 'pacco').setDepth(STANZA.h - 22).setAlpha(0);
  this.time.delayedCall(1600, () => {
    this.cammina(c, divano.x + 22, divano.y + 4, 1.8, () => {
      hud.bubble(c, '!', 1300);
      this.time.delayedCall(900, () => hud.say([{ who: 'mordicchio', text: 'Anastasia! È arrivato un pacco! È qui davanti alla porta!' }], () => {
        if (this.tvAccesa) { this.tvAccesa.remove(); schermo.setFillStyle(0x2a2438); }
        pacco.setAlpha(1);
        // si alza dal divano e va al pacco
        p.anims.play('g-down', true);
        this.tweens.add({ targets: p, x: pacco.x - 12, y: pacco.y - 2, duration: 1500, onUpdate: () => p.setDepth(p.y), onComplete: () => {
          p.anims.stop(); p.setFrame(8); p.setFlipX(false);
          this.cammina(c, pacco.x + 14, pacco.y, 2);
          this.tweens.add({ targets: pacco, y: pacco.y - 3, yoyo: true, duration: 160, repeat: 1 });
          this.time.delayedCall(600, () => this.apriPacco(pacco, () => {
            // Mordicchio si infila nella scatola
            this.cammina(c, pacco.x, pacco.y - 2, 2, () => {
              c.setDepth(pacco.depth - 1); this.tweens.add({ targets: pacco, angle: { from: -6, to: 6 }, yoyo: true, repeat: 5, duration: 120, onComplete: () => { pacco.angle = 0; } });
              this.tweens.add({ targets: c, y: c.y + 4, yoyo: true, repeat: 2, hold: 300, duration: 250 });
              hud.bubble(c, 'Questa scatola è mia.', 2400);
              this.time.delayedCall(2800, () => hud.say(INTRO_DOPO_PACCO, () => {
                S.introVista = true; Save.write(); this.sdraiata = false; c.evento = false; c.setDepth(c.y);
                this.tweens.add({ targets: pacco, alpha: 0, duration: 1500, delay: 6000, onComplete: () => pacco.destroy() });
              }));
            });
          }));
        } });
      }));
    });
  });
};
Rifugio.prototype.apriPacco = function (pacco, poi) {
  const hud = this.hud, m = hud.modal('Un pacco per te', 300, () => this.time.delayedCall(0, poi));
  m.c.add(hud.add.image(UW / 2, m.y + 110, 'scarpe').setScale(7));
  m.c.add(pannello(hud, 40, m.y + 170, UW - 80, 54));
  m.c.add(txt(hud, UW / 2, m.y + 197, '«Indossale per la tua avventura di oggi!»', 14, COL.titolo, { align: 'center', wordWrap: { width: UW - 100 } }).setOrigin(0.5));
  hud.button(UW / 2 - 70, m.y + 240, 140, 38, 'Le metto!', () => m.close(), { parent: m.c, size: 14 });
};
