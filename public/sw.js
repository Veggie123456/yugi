self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)
	if (url.pathname.includes('/ygoprodeck.com/pics')) {
		event.respondWith((async () => {
			const cache = await caches.open('images')
			const cached = await cache.match(event.request)
			if (cached) return cached
			const res = await fetch(event.request)
			cache.put(event.request, res.clone())
			return res
		})())
	}
})



