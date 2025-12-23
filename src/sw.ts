/// <reference lib="webworker" />

const CACHE_NAME = 'helpotus-lahellasi-cache'
const CACHE_VERSION = 16
const CACHE_ID = `${CACHE_NAME}-v${CACHE_VERSION}`

const sw = self as unknown as ServiceWorkerGlobalScope

sw.addEventListener('install', (event: Event) => {
    const e = event as ExtendableEvent
    e.waitUntil(sw.skipWaiting())
})

sw.addEventListener('activate', (event: Event) => {
    const e = event as ExtendableEvent
    e.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys()
            for (const key of cacheKeys) {
                if (key !== CACHE_ID) {
                    await caches.delete(key)
                }
            }
            await sw.clients.claim()
        })(),
    )
})

sw.addEventListener('fetch', (event: Event) => {
    const e = event as FetchEvent
    if (!e.request.url.startsWith(self.location.origin)) {
        return
    }

    e.respondWith(
        (async () => {
            const cacheResponse = await caches.match(e.request)

            if (cacheResponse) {
                return cacheResponse
            }

            const response = await fetch(e.request)
            if (response.status === 200 && response.type === 'basic' && e.request.method === 'GET') {
                const responseToCache = response.clone()
                const cache = await caches.open(CACHE_ID)
                cache.put(e.request, responseToCache)
            }

            return response
        })(),
    )
})

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data === 'skipWaiting') {
        sw.skipWaiting()
    }
})
