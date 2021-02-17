var CACHE_NAME = 'pwa-drawcalc-caches';
var urlsToCache = [
  './',
  './index.html',
  './drawcalc.js',
  './drawcalc-web.js',
  './drawcalc-sw.js',
  './drawcalc.css',
  './img/drawcalc-icon.png',
  './img/drawcalc-icon-256.png',
  './img/drawcalc-icon-128.png',
  './img/drawcalc-ogp.png',
  '../../external/js/rawdeflate.js',
  '../../external/js/rawinflate.js',
  '../../external/js/base64.js',
  '../../favicon.ico',
  ];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches
      .match(event.request)
      .then(function(response) {
        return response ? response : fetch(event.request);
      })
  );
});
