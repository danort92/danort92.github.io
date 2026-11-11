// =====================================================================
//  Ricordi e sogni: sei piccole cose vostre. Arrivano da sole, una al
//  giorno al massimo, portate da un animale (col «!»), oppure dal sogno.
//  Nell'album hanno una sezione tutta loro, separata dai tesori.
// =====================================================================
const RICORDI = {
  wilma: { nome: 'Il fiore di Wilma', da: 'wilma', stanza: 'stalla', giorno: 2,
    testo: 'Il giorno in cui hai conosciuto Wilma e hai ascoltato la sua storia. Da quel giorno sei vegana: per lei e per tutti quelli come lei.',
    dice: [{ who: 'wilma', text: 'Sai, il giorno che ci siamo conosciute mi hai ascoltata davvero. Tutta la mia storia, anche le parti brutte.' }, { who: 'wilma', text: 'Mi hanno detto che da quel giorno non mangi più animali. Questo fiore è per te. Grazie, da parte mia e di tutti quelli come me.' }] },
  parigi: { nome: 'Il biglietto per Parigi', da: 'tubino', stanza: 'casa', giorno: 2,
    testo: 'Il nostro primo viaggio insieme. Parigi, noi due, e la sensazione che fosse soltanto l\'inizio.',
    dice: [{ who: 'tubino', text: 'Rruu! Un mio cugino di Parigi mi ha dato questo. Dice che vi ha visti passare, tanto tempo fa.' }, { who: 'tubino', text: 'Dice anche che sembravate felicissimi. I piccioni di Parigi se ne intendono.' }] },
  scale: { nome: 'Il gradino', da: 'mordicchio', stanza: 'casa', giorno: 3,
    testo: 'Quella volta che sei caduta dalle scale, ti sei rialzata tutta rossa e hai detto solo: «Buona giornata e buon lavoro!». Una delle scene più divertenti a cui abbia mai assistito.',
    dice: [{ who: 'mordicchio', text: 'Ho trovato questo gradino. Mi ha fatto venire in mente una storia.' }, { who: 'mordicchio', text: 'Qualcuno, una volta, è caduto dalle scale e si è rialzato dicendo «Buona giornata e buon lavoro!». Non faccio nomi.' }, { who: 'anastasia', text: '...Mordicchio!' }] },
  mitty: { nome: 'Il fiocchetto di Mitty', da: 'mitty', stanza: null, giorno: 4,
    testo: 'Il giorno in cui hai salvato Mitty. Adesso è il più pestifero di casa, e non è mai stato così felice.',
    dice: [{ who: 'mitty', text: 'Tieni. Questo fiocchetto è per ricordare il giorno in cui mi hai salvato.' }, { who: 'mitty', text: 'Da allora non ho più paura di niente. Tranne dell\'aspirapolvere. E di Thiago quando si arrabbia. Ma poco.' }] },
  pulli: { nome: 'La scatola dei pulli', da: 'ciro', stanza: 'stalla', giorno: 5, sera: true,
    testo: 'La sera dei pulli: li abbiamo portati da chi poteva curarli e siamo tornati a casa alle due di notte. Stanchi morti, ma felici e sollevati di averli salvati.',
    dice: [{ who: 'ciro', text: 'Uh. Di notte ripenso alle cose belle. Questa scatola, per esempio.' }, { who: 'ciro', text: 'Dentro una volta c\'erano dei pulli. Qualcuno ha guidato fino a notte fonda per salvarli. Uh. Io lo so chi.' }] },
  giappone: { nome: 'La gru di carta', da: 'hana', stanza: 'fuori', giorno: 1,
    testo: 'Non è un ricordo: è una promessa. Un giorno i ciliegi del Giappone li vedrai davvero.',
    dice: [{ who: 'hana', text: 'Ho piegato questa gru per te. In Giappone si dice che porti fortuna ai desideri.' }, { who: 'hana', text: 'So qual è il tuo: i ciliegi in fiore, quelli veri. Questa gru ti aspetterà finché non partirai.' }] },
  rocky: { nome: 'La pallina di Rocky', da: null, sogno: true,
    testo: 'Rocky, con la faccia un po\' triste e la voglia di giocare sempre. Nel sogno ti ha riportato la pallina, ancora e ancora. È sua: tienila tu.' },
};

function ricordiTrovati() { const S = Save.data; return Object.keys(RICORDI).filter(k => S.ricordi && S.ricordi[k]); }
function ricordoDaDare(k) {
  const S = Save.data; S.ricordi = S.ricordi || {};
  if (S.oggi && S.oggi.ricordo) return null;
  return Object.keys(RICORDI).find(id => { const R = RICORDI[id]; return R.da === k && !S.ricordi[id] && S.giorno >= R.giorno && (!R.sera || S.ora >= 19 * 60); }) || null;
}
// mostra la scheda del ricordo appena ricevuto
function mostraRicordo(hud, id, poi) {
  const R = RICORDI[id], S = Save.data; S.ricordi = S.ricordi || {}; S.ricordi[id] = S.giorno; S.oggi.ricordo = id; Save.write(); Sfx.cuore();
  const t = txt(hud, UW / 2, 0, R.testo, 12, COL.testo, { align: 'center', wordWrap: { width: UW - 80 }, lineSpacing: 4 }).setOrigin(0.5, 0);
  const m = hud.modal('Un ricordo', 150 + t.height, poi);
  m.c.add(hud.add.image(UW / 2, m.y + 64, 'ricordi', id).setScale(3));
  m.c.add(txt(hud, UW / 2, m.y + 96, R.nome, 14, COL.titolo).setOrigin(0.5, 0));
  t.setY(m.y + 122); m.c.add(t);
}

Object.assign(Rifugio.prototype, {
  // chi ha un ricordo da dare viene di persona, col «!»
  cercaRicordo() {
    const o = this.ospiti.find(o => ricordoDaDare(o.chiave) && (!RICORDI[ricordoDaDare(o.chiave)].stanza || RICORDI[ricordoDaDare(o.chiave)].stanza === this.stanza) && this.liberoPerChiacchiere(o));
    if (!o) return false;
    const p = this.player; o.notizia = true; o.ricordo = ricordoDaDare(o.chiave); o.evento = true; o.meta = null;
    o.esclamativo = txt(this, o.x, o.y - 22, '!', 14, '#d0453a', { stroke: '#fbf4dc', strokeThickness: 4, fontStyle: 'bold' }).setOrigin(0.5, 1).setDepth(20004).setResolution(Math.ceil(ZR * DPR / 1.5));
    this.tweens.add({ targets: o.esclamativo, scaleY: 1.2, yoyo: true, repeat: -1, duration: 350 });
    const x = Phaser.Math.Clamp(p.x + (o.x < p.x ? -16 : 16), 12, STANZA.w - 12), y = Phaser.Math.Clamp(p.y + 2, STANZA.muro + 14, STANZA.h - 10);
    this.cammina(o, x, y, 1.1, () => {
      if (!o.active || !o.notizia) return; o.setFlipX(o.x > this.player.x);
      // se nessuno lo tocca, dopo un minuto torna ai fatti suoi e riproverà più tardi
      o.attesaNotizia = this.time.delayedCall(60000, () => { o.ricordo = null; this.fineNotizia(o); this.prossimoRicordo = this.time.now + 90000; });
    });
    return true;
  },
});
(function () {
  const racconta = Rifugio.prototype.raccontaNotizia;
  Rifugio.prototype.raccontaNotizia = function (o) {
    const id = o.ricordo; if (!id) return racconta.call(this, o);
    o.ricordo = null; this.fineNotizia(o); this.tweens.killTweensOf(o); o.anims.stop(); o.setFrame(o.idleFrame);
    this.hud.say(RICORDI[id].dice, () => mostraRicordo(this.hud, id, () => this.hud.toast('Lo trovi nell\'album, tra i ricordi')));
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta); if (!this.ospiti) return;
    if (time > (this.prossimoRicordo || 0)) {
      this.prossimoRicordo = time + 6000;
      if (this.momentoTranquillo() && !this.ospiti.some(o => o.notizia) && time > (this.creatoIl || 0) + 8000) this.cercaRicordo();
    }
  };
  const crea = Rifugio.prototype.create;
  Rifugio.prototype.create = function () { this.prossimoRicordo = 0; crea.call(this); this.creatoIl = this.time.now; };
  // l'album ha una seconda sezione
  const album = Rifugio.prototype.album;
  Rifugio.prototype.album = function () {
    album.call(this);
    const hud = this.hud, sa = hud.scroller; if (!sa) return;
    const ids = Object.keys(RICORDI), trovati = ricordiTrovati(), cw = (UW - 56) / 2; let y0 = sa.contentH + 14;
    sa.inner.add(txt(hud, 0, y0, 'Ricordi e sogni · ' + trovati.length + '/' + ids.length, 14, COL.titolo)); y0 += 26;
    ids.forEach(k => {
      const ok = trovati.includes(k), w = UW - 48, c = hud.add.container(0, y0);
      const t = txt(hud, 46, 26, ok ? RICORDI[k].testo : 'Arriverà da sé, quando sarà il momento.', 10, COL.testo, { wordWrap: { width: w - 56 }, lineSpacing: 2 });
      const h = Math.max(56, 34 + t.height);
      c.add(hud.add.rectangle(0, 0, w, h, ok ? 0xfbeef0 : 0xece3c8).setOrigin(0).setStrokeStyle(2, ok ? 0xd98aa0 : 0xc4bc93));
      c.add(hud.add.image(23, 26, 'ricordi', k).setScale(2).setAlpha(ok ? 1 : 0.2).setTint(ok ? 0xffffff : 0x8a8080));
      c.add(txt(hud, 46, 8, ok ? RICORDI[k].nome : '???', 12, ok ? COL.titolo : '#9d866f'));
      c.add(t); sa.inner.add(c); y0 += h + 8; sa.contentH = y0;
    });
  };
})();

// un ricordo da consegnare ha la precedenza su chiacchiere e notizie qualunque
(function () {
  // solo finché chi porta il ricordo non si è ancora mosso: poi le chiacchiere riprendono
  const inAttesa = r => typeof ricordoDaDare === 'function' && r.ospiti && !r.ospiti.some(o => o.ricordo) && r.ospiti.some(o => { const id = ricordoDaDare(o.chiave); return id && (!RICORDI[id].stanza || RICORDI[id].stanza === r.stanza); });
  const ch = Rifugio.prototype.avviaChiacchiera, no = Rifugio.prototype.avviaNotizia;
  Rifugio.prototype.avviaChiacchiera = function () { return inAttesa(this) ? false : ch.call(this); };
  Rifugio.prototype.avviaNotizia = function () { return inAttesa(this) ? false : no.call(this); };
})();
