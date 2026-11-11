// =====================================================================
//  Coerenza tra frasi e mondo: alcune frasi parlano di un posto, di un
//  oggetto, di un momento o di qualcuno presente. Si dicono solo quando
//  quella cosa è vera adesso (altrimenti si sceglie un'altra frase).
// =====================================================================
const CONDIZIONI_FRASI = [
  [/torretta/i, c => c.haArredo('torretta')],
  [/lettuccio/i, c => c.haArredo('lettuccio')],
  [/bastoncino/i, c => !!c.S.bastoncino],
  [/dalla finestra|gocce sul vetro|piccioni alla finestra|da quella finestra entra|vicino al vetro|dalla finestra, al calduccio|pavimento bello caldo/i, c => c.stanza !== 'fuori'],
  [/sul tappeto/i, c => c.stanza === 'casa'],
  [/posto più caldo della stalla/i, c => c.stanza === 'stalla'],
  [/Max oggi non c'è/i, c => !c.qui('max')],
  [/Dov'è Thiago\?/i, c => !c.qui('thiago')],
  [/vicino a Margherita/i, c => c.qui('margherita')],
  [/che sole oggi/i, c => c.sole && c.ora >= 8 * 60 && c.ora < 18 * 60],
  [/per tutta la mattina/i, c => c.ora >= 12 * 60],
  [/vedi quella stella/i, c => c.ora >= 19 * 60],
  [/^Buongiorno|^Qua! Buongiorno|mattina\?|Sono sveglio dalle cinque/i, c => c.ora < 12 * 60],
];
function contestoFrasi(k) {
  const S = Save.data, r = game.scene.getScene('Rifugio'), attiva = r && r.sys.isActive();
  const m = typeof meteoAdesso === 'function' ? meteoAdesso().tipo : 'sereno';
  return {
    S, k, stanza: attiva ? r.stanza : null, ora: S.ora, sole: m === 'sereno' || m === 'arcobaleno',
    qui: x => !!(attiva && r.ospiti && r.ospiti.some(o => o.chiave === x && o.visible)),
    haArredo: id => (S.arredi || []).some(a => a.id === id) || (S.inventario || []).includes(id),
  };
}
function frasiAdatte(arr, k) {
  if (!arr || !arr.length || !Save.data) return arr || [];
  const c = contestoFrasi(k);
  return arr.filter(t => CONDIZIONI_FRASI.every(([re, ok]) => !re.test(t) || ok(c)));
}
(function () {
  // filtro unico: animali non ancora arrivati + coerenza col momento
  const fv = frasiValide;
  frasiValide = function (arr) { const base = fv(arr), ok = base.filter(t => frasiAdatte([t]).length); if (ok.length) return ok; const neutre = base.filter(t => !CONDIZIONI_FRASI.some(([re]) => re.test(t))); return neutre.length ? neutre : base; };
})();

// Ciro è un gufo: di giorno dorme appollaiato, di notte veglia
(function () {
  const wander = Rifugio.prototype.wander;
  Rifugio.prototype.wander = function (dt) {
    const giorno = Save.data.ora >= 7 * 60 && Save.data.ora < 19 * 60;
    (this.ospiti || []).forEach(o => {
      if (o.chiave !== 'ciro' || o.evento || o.occupato || o.uscendo || o.coccola > 0) return;
      if (giorno) { if (!o.meta) { o.dorme = true; o.pausa = Math.max(o.pausa || 0, 5); } }
      else if (o.dorme && !o.gesto) o.dorme = false;
    });
    return wander.call(this, dt);
  };
  const upd = Rifugio.prototype.update;
  Rifugio.prototype.update = function (time, delta) {
    upd.call(this, time, delta);
    if (!this.ospiti || time < (this.prossimoZzzCiro || 0)) return; this.prossimoZzzCiro = time + 9000;
    const c = this.ospiti.find(o => o.chiave === 'ciro' && o.dorme && !o.meta); if (c && !this.nuvola) this.pensiero(c, 'zzz');
  };
})();
