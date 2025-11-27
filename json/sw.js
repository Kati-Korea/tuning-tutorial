const CACHE = 'tuning-guide-v1';
const ASSETS = [
  '/', // 서버 설정에 따라 제거/유지
  '/menu00.html',
  '/manifest.json'
  // 아이콘 등 정적 파일 경로 추가: '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    fetch(req).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, resClone)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req))
  );
});