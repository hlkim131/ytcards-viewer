// 웹앱 서비스 워커: 화면 파일을 미리 저장해 인터넷 없이도 열리게 한다 (webapp.py가 아래 캐시 버전과 파일 목록을 채움).
// 화면 파일이 바뀌면 버전이 바뀌어 새 캐시를 받고, 다음에 앱을 열 때 새 화면이 쓰인다
var CACHE = "ytcards-5dd96d973f37";
var FILES = ["./", "icon-192.png", "icon-512.png", "index.html", "manifest.webmanifest"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    // 브라우저의 HTTP 캐시(GitHub Pages는 10분)를 거치지 않고 받는다. 거치면 새 버전 캐시에 예전 화면이 들어간다
    caches.open(CACHE).then(function (c) {
      return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf("ytcards-") === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 저장한 화면 파일 먼저 (?v=… 같은 쿼리는 무시하고 같은 화면을 준다)
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); })
  );
});
