// =====================================================================
//  Rete di sicurezza: se un errore succede dentro l'aggiornamento di una scena, prima il gioco si
//  bloccava (lo stesso errore a ogni fotogramma, es. vicino ai pini della tappa 19). Adesso l'errore
//  viene segnalato una volta (resta visibile nei test) ma il gioco continua.
// =====================================================================
(function () {
  const visti = new Set();
  const segnala = e => { const k = String(e && e.message); if (visti.has(k)) return; visti.add(k); setTimeout(() => { throw e; }); };
  [Rifugio, Livello, Hud].forEach(C => {
    const up = C.prototype.update; if (!up) return;
    C.prototype.update = function () { try { return up.apply(this, arguments); } catch (e) { segnala(e); } };
  });
})();
