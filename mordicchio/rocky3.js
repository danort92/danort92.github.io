// =====================================================================
//  Il sogno di Rocky, terza versione (revisione 10/11, sera)
//  - Dopo la tappa 24 il sogno non si sceglie dalla mappa: arriva quando Anastasia va a dormire.
//    Toccando la tappa, Mordicchio dice che è ora di riposare (sera) o che oggi si sta a casa (giorno).
//  - Nel sogno non c'è Mordicchio. Sulla collina Rocky le corre accanto e si accuccia vicino alla sua spalla;
//    Anastasia resta in piedi (niente sprite di traverso): la scritta racconta che si sdraiano a guardare le stelle.
//  - Al risveglio Anastasia è sotto le coperte, nel letto. Si alza, prende la pallina rossa (piccola),
//    la posa sul comodino accanto al ritratto, lo guarda: «Mi manchi...». Allora compare il ritratto grande.
//    Da quel momento toccando il comodino lo si può riguardare. Il ritratto non è più un mobile da appendere.
//  - Tornando nel sogno: sotto il collare c'è un bigliettino di Rocky (niente ritratto).
// =====================================================================
OGGETTI.comodino = { nome: 'Comodino', tex: 'comodino', tipo: 'pavimento' };
ARREDO_INIZIALE.push({ id: 'comodino', x: 46, y: 82 });   // accanto al letto (nella casa a zone finisce in camera, col letto)
const COPERTE = { letto_verde: 0x8fc27a, letto_azzurro: 0x8cbfe2, letto_rosa: 0xf2a7c3 };
function textureComodino(scena) {
  if (scena.textures.exists('comodino')) return;
  const g = scena.make.graphics({ add: false });
  g.fillStyle(0x754c60, 1).fillRect(1, 6, 14, 10); g.fillStyle(0xb98a5c, 1).fillRect(2, 7, 12, 8); g.fillStyle(0xd9b48a, 1).fillRect(1, 5, 14, 2);
  g.fillStyle(0x8a5a48, 1).fillRect(3, 10, 10, 1); g.fillStyle(0xf2cf8c, 1).fillRect(7, 12, 2, 1);           // il cassetto e il pomello
  g.fillStyle(0x754c60, 1).fillRect(3, 0, 7, 6); g.fillStyle(0xe8d6b8, 1).fillRect(4, 1, 5, 4);           // la cornice col ritratto
  g.fillStyle(0x6b4b3a, 1).fillRect(5, 2, 1, 2); g.fillStyle(0xa8673d, 1).fillRect(7, 2, 1, 2); g.fillStyle(0x7fa86a, 1).fillRect(4, 4, 5, 1);
  g.generateTexture('comodino', 16, 16); g.destroy();
}
(function () {
  const L25 = LIVELLI.find(l => l.id === 25);
  if (L25) {
    L25.premio = 'quadro_sogno';
    L25.dialoghi.salvato = [
      { who: 'narratore', text: 'Sulla collina vi sdraiate a guardare le stelle. Rocky si accuccia vicino alla tua spalla.' },
      { who: 'narratore', text: 'Non serve dire niente. Respira piano, la coda batte ancora un po\' sull\'erba.' },
      { who: 'narratore', text: 'Le lucciole si posano intorno a voi. Piano piano, ti si chiudono gli occhi.' },
    ];
  }
  // ---------------- il sogno arriva dormendo ----------------
  const sognoInArrivo = S => (S.completati || []).includes(24) && !(S.completati || []).includes(25);
  const tp = Eco.tappaPossibile;
  Eco.tappaPossibile = function (S, id) { const r = tp.apply(this, arguments); if (id === 25 && r.ok && !r.rigioca && sognoInArrivo(S)) return { ok: false, perche: 'sogno' }; return r; };
  Mappa.prototype.tappaSogno = function () {
    const S = Save.data, hud = this.hud || game.scene.getScene('Hud');
    if (S.ora >= ORA_LETTO) hud.say([{ who: 'mordicchio', text: 'È sera. È ora di riposarsi: oggi abbiamo camminato abbastanza.' }, { who: 'mordicchio', text: 'Andiamo a letto. Domani si vedrà.' }]);
    else hud.say([{ who: 'mordicchio', text: 'Oggi non ho voglia di partire. Restiamo a casa, ti va?' }, { who: 'mordicchio', text: 'C\'è l\'orto da sistemare, qualcosa di buono da cucinare, e tanti amici con cui fare due chiacchiere.' }]);
  };
  const dormi = Rifugio.prototype.dormi;
  Rifugio.prototype.dormi = function (forzato) {
    const S = Save.data;
    if (this.dormendo || !sognoInArrivo(S) || (S.scomparsa && ['via', 'sera', 'cerca'].includes(S.scomparsa.stato))) return dormi.apply(this, arguments);
    this.dormendo = true; const hud = this.hud; hud.clearAll(); Musica.suona('sogno');
    const c = hud.add.container(0, 0).setDepth(80); hud.layer.add(c);
    const bg = hud.add.rectangle(0, 0, UW, UH, 0x1d1828, 1).setOrigin(0).setAlpha(0); c.add(bg);
    const t = txt(hud, UW / 2, UH * 0.42, 'Anastasia si addormenta.\n\nE sogna.', 16, COL.crema, { align: 'center', lineSpacing: 6 }).setOrigin(0.5).setAlpha(0); c.add(t);
    hud.tweens.add({ targets: bg, alpha: 1, duration: 800 }); hud.tweens.add({ targets: t, alpha: 1, delay: 700, duration: 900 });
    Eco.notte(S); Save.write();
    hud.time.delayedCall(3400, () => { this.dormendo = false; c.destroy(); this.scene.start('Livello', { id: 25 }); });
  };
  // ---------------- nel sogno: niente Mordicchio ----------------
  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    const r = crea.apply(this, arguments);
    if (this.L.id === 25 && this.npc) { this.npc.setVisible(false); if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; } }
    return r;
  };
  // sulla collina: restano dove sono, si accendono le stelle, la scritta, il sonno
  const mr = Livello.prototype.missioneRocky;
  Livello.prototype.missioneRocky = function (time) {
    const st = this.st, p = this.player;
    if (st.rocky === 'corsa' && Math.hypot(this.collina.x - p.x, this.collina.y - p.y) < 26) {
      st.rocky = 'stelle'; this.frozenAll = true; this.hud.joyEnd && this.hud.joyEnd(); this.hud.setHint(null);
      const c = this.collina, r = this.rocky; if (p.anims) p.anims.stop(); p.setFrame(0);
      // Rocky le corre accanto, vicino alla spalla, e si accuccia lì
      this.tweens.killTweensOf(r); const lato = r.x >= p.x ? 1 : -1;
      if (r.anims) r.anims.play('rocky-corre', true); r.setFlipX(lato > 0);
      this.tweens.add({ targets: r, x: p.x + lato * 11, y: p.y + 1, duration: 700, onUpdate: () => r.setDepth(r.y), onComplete: () => {
        if (r.anims) r.anims.stop(); r.setFrame(0); r.setFlipX(lato > 0);
        this.tweens.add({ targets: r, scaleY: 0.78, scaleX: 1.08, duration: 450 });   // si accuccia
        this.hud.bubble(r, '♥', 2200); this.hearts(r.x, r.y - 12);
      } });
      for (let i = 0; i < 22; i++) { const s = this.add.circle(c.x - 100 + Math.random() * 200, c.y - 130 + Math.random() * 80, 0.8 + Math.random(), 0xfff6c8).setDepth(20003).setAlpha(0); this.tweens.add({ targets: s, alpha: { from: 0, to: 1 }, yoyo: true, repeat: -1, duration: 900 + Math.random() * 900, delay: 600 + i * 120 }); }
      this.time.delayedCall(2400, () => this.hud.say(this.L.dialoghi.salvato, () => {
        this.cameras.main.fadeOut(1800, 20, 16, 34);
        this.time.delayedCall(1900, () => { this.frozenAll = false; st.salvato = true; st.parlato = true; this.svegliaRocky = true; this.completa(); });
      }));
      return;
    }
    // tornando nel sogno: il collare, e sotto il collare un bigliettino
    if (st.rocky === 'ricordo') {
      if (this.collare && Math.hypot(this.collare.x - p.x, this.collare.y - p.y) < 18) {
        st.rocky = 'fine'; const k = this.collare; this.collare = null; this.tweens.killTweensOf(k);
        this.tweens.add({ targets: k, y: p.y - 18, alpha: 0, duration: 400, onComplete: () => k.destroy() }); Sfx.cuore();
        const S = Save.data, nuovo = !S.collareRocky; S.collareRocky = true; if (nuovo) S.inventario.push('collare_rocky'); Save.write();
        this.hud.say([
          { who: 'narratore', text: 'Tra l\'erba della collina c\'è un collare marrone, consumato. Sulla medaglietta, quasi cancellato, un nome: Rocky.' },
          { who: 'anastasia', text: 'Sotto il collare c\'è un bigliettino. Le lettere sono storte, come scritte con una zampa.' },
          { who: 'narratore', text: '«Sei rimasta con me fino alla fine, anche se ti faceva male. Avevo paura ed ero tanto stanco, ma con te accanto mi sono addormentato felice. Non ti dimenticherò mai. Rocky»' },
          { who: 'anastasia', text: 'Neanch\'io, Rocky. Neanch\'io.' },
        ].concat(nuovo ? [{ who: 'narratore', text: 'Il collare di Rocky è in «Arreda».' }] : []));
        return;
      }
      return mr.call(this, time);   // la targa tra i fiori e il resto della collina
    }
    return mr.call(this, time);
  };
  // dal sogno si va dritti al risveglio, con la pallina accanto al cuscino (niente mobile «pallina»)
  const riep = Livello.prototype.riepilogo;
  Livello.prototype.riepilogo = function (guadagno, primaVolta) {
    if (this.svegliaRocky && this.L.id === 25) {
      this.svegliaRocky = false; const S = Save.data;
      S.pallinaRossa = 'letto'; S.risveglioRocky = true; S.arredi = S.arredi.filter(a => a.id !== 'pallina_rossa'); Save.write();
      return this.scene.start('Rifugio', { stanza: 'casa' });
    }
    return riep.apply(this, arguments);
  };
  // ---------------- salvataggi: comodino per tutti, niente quadro da appendere ----------------
  const ld = Save.load;
  Save.load = function () {
    const S = ld.apply(this, arguments); if (!S) return S;
    S.inventario = (S.inventario || []).filter(k => k !== 'quadro_rocky' && k !== 'pallina_rossa');
    if ((S.arredi || []).some(a => a.id === 'pallina_rossa')) S.pallinaRossa = 'comodino';
    S.arredi = (S.arredi || []).filter(a => a.id !== 'quadro_rocky' && a.id !== 'pallina_rossa');
    if ((S.completati || []).includes(25) && !S.pallinaRossa) S.pallinaRossa = 'comodino';
    if (S.pallinaRossa === 'comodino') S.ritrattoVisto = true;
    return S;
  };
  // ---------------- in casa: comodino, pallina, risveglio ----------------
  const creaR = Rifugio.prototype.create;
  Rifugio.prototype.create = function () {
    textureComodino(this);
    const S = Save.data;
    if (S && S.arredi && !S.arredi.some(a => a.id === 'comodino')) {   // partite già iniziate: il comodino accanto al letto
      const l = S.arredi.find(a => /^letto_(verde|azzurro|rosa)$/.test(a.id) && (a.stanza || 'casa') === 'casa');
      S.arredi.push({ id: 'comodino', x: l ? l.x + (S.casaZone ? -20 : (l.x < 88 ? 20 : -20)) : 40, y: l ? l.y : 80, stanza: 'casa' });   // a sinistra del letto, anche dopo lo spostamento in camera
    }
    creaR.apply(this, arguments);
    if (this.stanza !== 'casa') return;
    if (this.sistemaArredi) this.sistemaArredi();
    const k = (this.arrediSprites || []).find(a => a.dati.id === 'comodino');
    if (k && S.pallinaRossa === 'comodino') this.pallinaComodino = this.add.image(k.x + 4, k.y - 12, 'ricordi', 'rocky').setScale(0.3).setDepth(k.depth + 0.1);
  };
  const tap = Rifugio.prototype.tap;
  Rifugio.prototype.tap = function (x, y) {
    if (this.modo === 'gioca' && this.stanza === 'casa') {
      const k = (this.arrediSprites || []).find(a => a.dati.id === 'comodino' && Phaser.Geom.Rectangle.Contains(a.getBounds(), x, y));
      if (k) { if (Save.data.ritrattoVisto) return mostraRitrattoRocky(this.hud, false); this.hud.toast('Sul comodino c\'è una piccola cornice.'); return; }
    }
    return tap.call(this, x, y);
  };
  const mis = Rifugio.prototype.messaInScena;
  Rifugio.prototype.messaInScena = function (id) {
    if (id !== 25) return mis.apply(this, arguments);
    const S = Save.data, l = (this.arrediSprites || []).find(a => /^letto_(verde|azzurro|rosa)$/.test(a.dati.id)) || (this.arrediSprites || []).find(a => /^letto/.test(a.dati.id)), p = this.player, hud = this.hud;
    if (!l) return;
    // sotto le coperte: in verticale, come il letto
    p.setAngle(0).setFrame(0).setPosition(l.x, l.y - 4).setDepth(l.depth + 0.2); if (p.anims) p.anims.stop(); this.sdraiata = true;
    const coperta = this.add.rectangle(l.x, l.y - 1, Math.max(12, l.displayWidth - 4), 8, COPERTE[l.dati.id] || 0xd9cbb0).setStrokeStyle(1, 0x504086, 0.7).setDepth(l.depth + 0.3);
    const palla = this.add.image(l.x + 8, l.y - 14, 'ricordi', 'rocky').setScale(0.3).setDepth(l.depth + 0.4);
    this.tweens.add({ targets: palla, y: palla.y - 1.5, yoyo: true, repeat: 5, duration: 300 });
    if (this.cat) { this.cat.setPosition(l.x + 22, l.y + 8); this.cat.meta = null; this.cat.evento = true; }
    let tentativi = 0;
    const alzati = () => {
      if (!this.sys.isActive()) return;
      if ((hud.dialog || (hud.ctrl && hud.ctrl.frozen)) && tentativi++ < 60) return this.time.delayedCall(400, alzati);
      coperta.destroy(); this.sdraiata = false;
      const k = (this.arrediSprites || []).find(a => a.dati.id === 'comodino');
      if (hud.ctrl) hud.ctrl.frozen = true;
      // prende la pallina
      this.tweens.add({ targets: p, x: l.x + 14, y: l.y + 8, duration: 500, onUpdate: () => p.setDepth(p.y), onComplete: () => {
        this.tweens.add({ targets: palla, x: p.x, y: p.y - 20, duration: 300, onComplete: () => {
          const dove = k ? { x: k.x, y: k.y + 12 } : { x: p.x, y: p.y };
          this.tweens.add({ targets: [p, palla], x: dove.x, y: (t, key, v, i) => i === 0 ? dove.y : dove.y - 20, duration: 700, onUpdate: () => p.setDepth(p.y), onComplete: () => {
            // la posa sul comodino, accanto al ritratto, e lo guarda
            p.setFrame(4);   // di spalle: guarda il comodino
            this.tweens.add({ targets: palla, x: k ? k.x + 4 : p.x, y: k ? k.y - 12 : p.y - 6, duration: 350, onComplete: () => {
              S.pallinaRossa = 'comodino'; S.ritrattoVisto = true; Save.write(); this.pallinaComodino = palla;
              this.time.delayedCall(700, () => hud.say([{ who: 'anastasia', text: 'Mi manchi...' }], () => {
                if (hud.ctrl) hud.ctrl.frozen = false; if (this.cat) this.cat.evento = false;
                mostraRitrattoRocky(hud, false, 'Il ritratto è sul comodino: toccalo quando vuoi rivederlo.');
                if (S.ricordi && !S.ricordi.rocky) { S.ricordi.rocky = 1; Save.write(); }
              }));
            } });
          } });
        } });
      } });
    };
    this.time.delayedCall(2500, alzati);
  };
})();
