const CACHE_PREFIX='sociosofia-alunos-';
const CACHE=`${CACHE_PREFIX}v14`;
const APP_SHELL=['./','./index.html','./styles.css','./app.js?v=14','./content.js?v=14','./install-disclaimer.js?v=13','./manifest.webmanifest','./offline.html','./brand/logo-sociosofia.svg','./icons/icon-192.svg','./icons/icon-512.svg','../alunos/sociologia-1ano/page-01.b64','../alunos/sociologia-1ano/page-02.b64','../alunos/sociologia-1ano/page-03.b64','../alunos/sociologia-1ano/page-04.b64',
  '../alunos/sociologia-2ano/page-01.b64',
  '../alunos/sociologia-2ano/page-02-01.b64',
  '../alunos/sociologia-2ano/page-02-02.b64',
  '../alunos/sociologia-2ano/page-02-03.b64',
  '../alunos/sociologia-2ano/page-02-04.b64',
  '../alunos/sociologia-2ano/page-02-05.b64',
  '../alunos/sociologia-2ano/page-02-06.b64',
  '../alunos/sociologia-2ano/page-03-01.b64',
  '../alunos/sociologia-2ano/page-03-02.b64',
  '../alunos/sociologia-2ano/page-03-03.b64',
  '../alunos/sociologia-2ano/page-03-04.b64',
  '../alunos/sociologia-2ano/page-03-05.b64',
  '../alunos/sociologia-2ano/page-03-06.b64',
  '../alunos/sociologia-2ano/page-04-01.b64',
  '../alunos/sociologia-2ano/page-04-02.b64',
  '../alunos/sociologia-2ano/page-04-03.b64',
  '../alunos/sociologia-2ano/page-04-04.b64',
  '../alunos/sociologia-2ano/page-04-05.b64',
  '../alunos/sociologia-2ano/page-04-06.b64',
  '../alunos/area-01a.b64',
  '../alunos/area-01b.b64',
  '../alunos/area-02.b64'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./offline.html'))));return}event.respondWith(caches.match(event.request).then(cached=>{const network=fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>cached);return cached||network}))});
