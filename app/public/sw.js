// The smallest service worker that makes this installable.
//
// Chrome only builds a real installed app (a WebAPK) for a site that has a
// service worker with a fetch handler. Without one, "Add to Home Screen"
// creates a bookmark shortcut instead — and a shortcut is always drawn on
// Chrome's own white plate, ignoring the manifest's maskable icon entirely.
//
// It caches nothing on purpose. The list is shared and must never be served
// stale; this exists to satisfy installability and to say something honest
// when the phone is offline.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  // Only page loads. Everything else — server actions especially — goes
  // straight to the network untouched.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          "<!doctype html><meta charset=utf-8>" +
            "<meta name=viewport content='width=device-width,initial-scale=1'>" +
            "<style>body{margin:0;display:grid;place-items:center;height:100vh;" +
            "background:#0B0C0E;color:#9BA1AB;font:16px system-ui;text-align:center}</style>" +
            "<p>Step Up is offline.<br>The list needs a connection.</p>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } },
        ),
    ),
  );
});
