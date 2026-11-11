// Il gioco si è spostato in /rifugio/. Questo service worker sostituisce quello vecchio di /mordicchio/:
// si toglie di mezzo e porta le finestre aperte al nuovo indirizzo. Non tocca le cache (sono condivise col sito).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  self.registration.unregister()
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(cs => cs.forEach(c => c.navigate(c.url.replace('/mordicchio/', '/rifugio/'))))
));
