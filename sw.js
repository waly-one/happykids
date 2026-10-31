// Offline support: after the first visit the game (and Three.js + fonts from
// the CDN) is cached, so it starts even without a connection.
// The game page itself is fetched network-first, so updates show up right away.
// bump this whenever a cached file other than the page changes (sounds, icons…)
const CACHE = 'happy-kids-v2';
const CORE = ['./happy_kids_3d.html', './manifest.webmanifest', './icon-180.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(CORE)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=> Promise.all(keys.filter(k=> k !== CACHE).map(k=> caches.delete(k))))
    .then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  if(isPage){
    e.respondWith(fetch(e.request)
      .then(res=>{ const copy = res.clone(); caches.open(CACHE).then(c=> c.put(e.request, copy)); return res; })
      .catch(()=> caches.match(e.request).then(r=> r || caches.match('./happy_kids_3d.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
    if(res.ok || res.type === 'opaque'){ const copy = res.clone(); caches.open(CACHE).then(c=> c.put(e.request, copy)); }
    return res;
  })));
});
