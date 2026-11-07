// =====================================================================
//  Riprendere una tappa da dove l'avevi lasciata (7/11, segnalazione di Danilo:
//  uscendo prima della seconda richiesta, al ritorno ripartiva tutto da capo).
//  Si salvano: chi hai già incontrato, chi hai già salvato, oggetti/chiave/semi/regalo/cuoricino presi,
//  il cancello aperto, la seconda richiesta e cosa ne hai già fatto.
//  Al ritorno la storia non si ripete: Mordicchio dice solo «riprendiamo da dove eravamo».
//  Escluse le tappe speciali (25 il sogno, 30 la festa), che durano pochi minuti e non hanno uscite a metà.
// =====================================================================
(function () {
  const ESCLUSE = [25, 30];
  const kIt = it => it.k0 || (Math.round(it.x) + ',' + Math.round(it.y));
  const add = Livello.prototype.addItem;
  Livello.prototype.addItem = function (tipo, x, y) { const r = add.apply(this, arguments); const it = this.items[this.items.length - 1]; if (it) it.k0 = tipo + ':' + x + ',' + y; return r; };
  function fase2Presi(scena) {
    const D = scena.L.dopo, st = scena.st; if (!D || !st.fase2 || D.tipo !== 'raccogli' || !scena.extra) return [];
    return D.dove.map(([x, y], i) => [i, x * T + 8, y * T + 10]).filter(([i, px, py]) => !scena.extra.some(it => Math.abs(it.x - px) < 2 && Math.abs(it.y - py) < 6)).map(([i]) => i);
  }
  function stato(scena) {
    const st = scena.st;
    return { parlato: !!st.parlato, salvato: !!st.salvato, raccolti: st.raccolti || 0, inMano: !!st.inMano, chiave: !!st.chiave, semi: st.semi || 0, regalo: !!st.regalo, cuore: !!st.cuore,
      cancello: !!scena.cancelloAperto, presi: scena.presiK || [], fase2: !!st.fase2, fase2Presi: st.fase2 ? fase2Presi(scena) : [], fase2fatta: !!st.fase2fatta };
  }
  function salvaStato(scena) {
    const st = scena.st; if (!st || st.giaFatta || st.finito || ESCLUSE.includes(scena.L.id) || scena.fatta) return;
    const s = JSON.stringify(stato(scena)); if (scena._statoSalvato === s) return; scena._statoSalvato = s;
    const S = Save.data; S.inCorso = S.inCorso || {}; S.inCorso[scena.L.id] = JSON.parse(s); Save.write();
  }

  const racc = Livello.prototype.raccogli;
  Livello.prototype.raccogli = function (it) { (this.presiK = this.presiK || []).push(kIt(it)); return racc.call(this, it); };

  const crea = Livello.prototype.create;
  Livello.prototype.create = function () {
    this.presiK = []; this.ripreso = false; this._statoSalvato = null; this._fase2DaTogliere = null; this._prossimoSalva = 0;
    crea.apply(this, arguments);
    const S = Save.data, L = this.L, R = S.inCorso && S.inCorso[L.id];
    if (this.fatta) { if (R) { delete S.inCorso[L.id]; Save.write(); } return; }
    if (!R || ESCLUSE.includes(L.id)) return;
    const st = this.st, M = L.missione;
    if (!(R.parlato || R.presi.length || R.cancello)) return;
    this.ripreso = true; this.presiK = R.presi.slice();
    this.items.slice().forEach(it => { if (R.presi.includes(kIt(it))) { this.items = this.items.filter(i => i !== it); if (it.ombra) it.ombra.destroy(); this.tweens.killTweensOf(it); it.destroy(); } });
    Object.assign(st, { raccolti: R.raccolti, chiave: R.chiave, semi: R.semi, regalo: R.regalo, cuore: R.cuore });
    const inTesta = (tex, frame) => { this.inManoSprite = this.add.image(this.player.x, this.player.y - 20, tex, frame).setScale(0.75); };
    if (R.cancello && this.cancello) { this.cancelloAperto = true; this.muri.delete(this.cancelloXY.k); this.cancello.destroy(); }
    else if (R.chiave && !R.salvato) inTesta('chiave');
    if (R.inMano && !R.salvato) { st.inMano = true; M.frame ? inTesta(M.atlas || 'natura', M.frame) : inTesta(M.tex); }
    if (R.parlato) st.parlato = true;
    const segui = o => { if (!o) return; if (!this.seguaci.includes(o)) this.seguaci.push(o); o.setVisible(true).setScale(1); o.setPosition(this.player.x + 14 + this.seguaci.length * 4, this.player.y + 4); };
    if (R.salvato) {
      st.salvato = true; st.parlato = true;
      if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; }
      if (this.mammaBob) { this.mammaBob.remove(); this.mammaBob = null; }
      segui(this.npc); segui(this.mamma);
    } else if (R.parlato && M.tipo === 'seguimi') {
      if (this.npcBob) { this.npcBob.remove(); this.npcBob = null; }
      segui(this.npc);
    }
    this.aggiornaObiettivi();
    const nome = ANIMALI[L.animale] && L.animale !== 'mordicchio' ? ANIMALI[L.animale].nome : null;
    const bentornata = [{ who: 'mordicchio', text: R.salvato && nome ? 'Eccoci di nuovo. ' + nome + ' ci aspettava.' : 'Eccoci di nuovo qui. Riprendiamo da dove eravamo.' }];
    this.time.delayedCall(500, () => {
      if (R.salvato && L.dopo && !R.fase2fatta) {
        const D = L.dopo, orig = D.chiede;
        D.chiede = bentornata.concat(D.indizio ? [{ who: L.animale, text: 'Ti ricordi? ' + D.indizio }] : []);
        this._fase2DaTogliere = R.fase2Presi || [];
        try { this.avviaFase2(); } finally { D.chiede = orig; }
      } else {
        this.hud.say(bentornata);
        if (R.salvato) this.apriPortale(true);
      }
    });
  };

  const upd = Livello.prototype.update;
  Livello.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    if (!this.st) return;
    // dopo la ripresa: togli gli oggetti della seconda richiesta già raccolti
    if (this._fase2DaTogliere && this.extra && this.st.fase2) {
      const D = this.L.dopo, via = this._fase2DaTogliere; this._fase2DaTogliere = null;
      via.forEach(i => { const [x, y] = D.dove[i] || []; const it = this.extra.find(e => Math.abs(e.x - (x * T + 8)) < 2 && Math.abs(e.y - (y * T + 10)) < 6); if (it) { this.extra = this.extra.filter(e => e !== it); this.tweens.killTweensOf(it); it.destroy(); this.st.fase2.presi++; } });
      this.aggiornaObiettivi();
    }
    if (time > this._prossimoSalva) { this._prossimoSalva = time + 700; salvaStato(this); }
  };

  const comp = Livello.prototype.completa;
  Livello.prototype.completa = function () {
    const S = Save.data; if (S.inCorso && this.L && S.inCorso[this.L.id]) { delete S.inCorso[this.L.id]; Save.write(); }
    return comp.apply(this, arguments);
  };
})();
