// =====================================================================
//  Musiche (revisione 10/11): un'identità per ogni ambientazione, più i momenti speciali.
//  Rifugio: il tema di sempre. Montagna ariosa, paese caldo e vivace, bosco delicato e un po'
//  misterioso, campagna pastorale, acqua (torrente, lago) fluida. Il sogno di Rocky, il ritorno
//  alla sua collina (malinconico ma sereno), la prima ricerca di Mordicchio (più tesa), la festa.
//  Passaggi morbidi: il tema vecchio sfuma, poi entra il nuovo.
// =====================================================================
Object.assign(TEMI, {
  montagna: { bpm: 62, onda: 'sine', prog: [[50, 57, 62, 64], [55, 59, 62, 66], [52, 59, 64, 67], [47, 54, 59, 62]], scala: [62, 64, 66, 69, 71, 74] },
  bosco: { bpm: 68, onda: 'triangle', prog: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]], scala: [57, 60, 62, 64, 67, 69] },
  campagna: { bpm: 90, onda: 'triangle', prog: [[43, 47, 50, 55], [48, 52, 55, 60], [50, 54, 57, 62], [43, 47, 50, 55]], scala: [67, 69, 71, 74, 76, 79] },
  acqua: { bpm: 72, onda: 'sine', prog: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], scala: [64, 67, 69, 72, 76, 79] },
  paese2: { bpm: 96, onda: 'triangle', prog: [[48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]], scala: [67, 69, 72, 74, 76, 79] },
  sogno: { bpm: 52, onda: 'sine', prog: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], scala: [69, 72, 74, 76, 79, 81] },
  ricordo: { bpm: 50, onda: 'sine', prog: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 62]], scala: [64, 67, 69, 72, 76] },
  ricerca: { bpm: 92, onda: 'triangle', prog: [[50, 53, 57, 62], [46, 50, 53, 58], [43, 46, 50, 55], [45, 49, 52, 57]], scala: [62, 65, 67, 69, 72, 74] },
  festa: { bpm: 100, onda: 'triangle', prog: [[48, 52, 55, 60], [53, 57, 60, 65], [55, 59, 62, 67], [48, 52, 55, 60]], scala: [72, 74, 76, 79, 81, 84] },
});
const TEMA_AMBIENTE = { bosco: 'bosco', montagna: 'montagna', lago: 'acqua', torrente: 'acqua', acqua: 'prato', paese: 'paese2', cortile: 'paese2', campagna: 'campagna', prato: 'prato', giardino: 'prato' };
temaLivello = function (L) {
  const S = Save.data || {}, fatto = (S.completati || []).includes(L.id);
  if (L.id === 10) return fatto ? 'paese2' : 'ricerca';
  if (L.id === 25) return fatto ? 'ricordo' : 'sogno';
  if (L.id === 30) return fatto ? 'prato' : 'festa';
  return TEMA_AMBIENTE[(typeof AMBIENTI !== 'undefined' && AMBIENTI[L.id]) || 'prato'] || 'prato';
};
(function () {
  const suona = Musica.suona.bind(Musica);
  Musica.suona = function (nome) {
    if (nome === this.tema && this.timer) return;
    if (!this.timer || !this.out || !Sfx.ctx) { this.passo = 0; return suona(nome); }
    const c = Sfx.ctx, g = this.out.gain, vol = this.on ? 0.07 : 0;
    g.cancelScheduledValues(c.currentTime); g.setTargetAtTime(0.0001, c.currentTime, 0.15);   // sfuma il vecchio tema
    clearTimeout(this.cambio);
    this.cambio = setTimeout(() => { this.tema = nome; this.passo = 0; this.prossimo = c.currentTime + 0.1; g.setTargetAtTime(vol, c.currentTime + 0.05, 0.4); }, 600);
  };
})();
