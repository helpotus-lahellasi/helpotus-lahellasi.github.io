const CACHE_NAME = 'helpotus-lahellasi-cache'
const CACHE_VERSION = 12
const CACHE_ID = `${CACHE_NAME}-v${CACHE_VERSION}`

const urlsToCache = [
    'index.html',
    'sovellus.html',
    'haku.html',
    'media-vaatimukset.html',
    'esitys.html',
    [
        'modules',
        [
            'config.js',
            'darkmode.js',
            'global.js',
            'index.js',
            'presentation.js',
            'search.js',
            [
                'api',
                [
                    ['hsl', ['routing.js']],
                    ['osm', ['restrooms.js', 'routing.js', 'search.js']],
                    ['routereverse', ['streetNameFromPosition.js']],
                ],
            ],
            ['app', ['index.js']],
            [
                'layout',
                ['restroomamount.js', 'restroomInfo.js', 'routeInfo.js', 'searchRestroomlist.js', 'searchResults.js'],
            ],
            ['location', ['index.js']],
            ['map', ['index.js', 'markers.js']],
            ['util', ['index.js']],
        ],
    ],
    ['style', ['app.css', 'global.css', 'landing.css', 'presentation.css', 'search.css', 'theme.css']],
]

/**
 * Flat an array and append directory name before items
 */
function dirFlatMap(arr, dir) {
    return arr.flatMap((c) => {
        if (!Array.isArray(c)) return dir ? dir + '/' + c : '/' + c
        return dirFlatMap(c[1], dir ? dir + '/' + c[0] : '/' + c[0])
    })
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_ID)
            cache.addAll(dirFlatMap(urlsToCache))
        })()
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const cacheKeys = await caches.keys()
            for (const key of cacheKeys) {
                if (key !== CACHE_ID) {
                    caches.delete(key)
                }
            }
        })()
    )
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        (async () => {
            const cacheResponse = await caches.match(event.request)

            if (cacheResponse) {
                return cacheResponse
            }

            const response = await fetch(event.request)

            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response
            }

            const responseToCache = response.clone()

            const cache = await caches.open(CACHE_ID)
            cache.put(event.request, responseToCache)

            return response
        })()
    )
})

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting()
})
