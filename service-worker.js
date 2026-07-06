/* 入庫検算カメラ — Service Worker
   アプリ本体(シェル)をキャッシュしオフライン起動を可能にする。
   Gemini APIなど別オリジンへの通信はキャッシュせずネットワークへ素通し。 */
var CACHE = "tally-check-v4";
var ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  // 別オリジン(Google APIなど)はキャッシュせずネットワークへ
  if (url.origin !== self.location.origin) return;
  // 同一オリジンはキャッシュ優先、なければネットワーク
  e.respondWith(
    caches.match(e.request).then(function (r) { return r || fetch(e.request); })
  );
});
