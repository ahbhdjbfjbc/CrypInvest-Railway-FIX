const CACHE='crypinvest-v6';
const STATIC=['/app-ui-v2.css','/app-ui-v2.js','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.pathname.startsWith('/api/')||u.pathname.startsWith('/admin'))return;
  if(event.request.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('.html')){event.respondWith(fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match('/'))));return;}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r})));
});
