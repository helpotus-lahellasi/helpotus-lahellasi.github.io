/**
 * Convert js date into Finnish locale
 * eq. 10.8.2019 klo 16.01
 * @param {Date} date
 * @returns string
 */
export const dateToFinnishLocale = (date) => {
    return date.toLocaleDateString('fi-Fi', {
        minute: '2-digit',
        hour: '2-digit',
        timeZone: 'Europe/Helsinki',
    })
}

/**
 * Remove all children of a HTML ELement
 * @param {HTMLElement} target
 */
export function clearElement(target) {
    while (target.firstChild) {
        target.removeChild(target.firstChild)
    }
}

/**
 * @typedef {Object} PartOptions
 * @property {string} heading
 * @property {string} text
 * @property {boolean} inline
 * @property {string} icon
 */

/**
 * Create HTML part used in listing properties
 * @param {PartOptions} partOptions
 * @returns
 */
export function createPart({ text, heading, inline, icon }) {
    const container = document.createElement('div')
    container.className = inline ? 'part-container inline' : 'part-container'
    if (icon) {
        const img = document.createElement('img')
        img.className = 'part-icon'
        img.src = icon
        container.appendChild(img)
    }
    if (heading) {
        const el = document.createElement('span')
        el.className = 'part-heading'
        el.textContent = heading
        container.appendChild(el)
    }
    if (text) {
        const el = document.createElement('span')
        el.className = 'part-content'
        el.textContent = text
        container.appendChild(el)
    }

    return container
}

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 * @typedef {Object} Tag
 * @property {string} heading
 * @property {string} text
 */

/**
 * @typedef {Object} Restroom
 * @property {number} id
 * @property {Date} timestamp
 * @property {Coordinates} location
 * @property {Tag[]} tags
 */

/**
 * Convert Application data into shareable URL
 * @param {Coordinates} from
 * @param {Restroom} restroom
 * @returns {string} shareable url
 */
export function createSearchUrl(from, restroom) {
    let origin

    if (location.hostname.includes('github.io')) {
        origin = 'https://helpotus-lahellasi.github.io'
    } else {
        origin = location.origin
    }
    const page = 'sovellus'
    const base = `${origin}/${page}?`

    let data = ''
    if (from && from.lat && from.lon) {
        data += `flat=${from.lat}&flon=${from.lon}&`
    }
    if (restroom.location && restroom.location.lat && restroom.location.lon) {
        data += `tlat=${restroom.location.lat}&tlon=${restroom.location.lon}&`
    }
    if (restroom.id) {
        data += `rid=${restroom.id}&`
    }
    if (restroom.name) {
        data += `rname=${restroom.name}&`
    }
    if (restroom.tags.length > 0) {
        data += restroom.tags.map((t) => `t[]=${encodeURIComponent([t.heading, t.text])}&`).join('')
    }
    if (restroom.timestamp) {
        data += `time=${new Date(restroom.timestamp).getTime()}&`
    }

    return `${base}${data}`
}

/**
 * Check if object is a valid js Date
 * @param {any} d
 * @returns {boolean}
 */
export function isValidDate(d) {
    return d instanceof Date && !isNaN(d)
}

/**
 * @typedef {Object} ReadSearchParamsOuput
 * @property {Coordinates|null} location
 * @property {Restroom|null} restroom
 */

/**
 * Read url created by createSearchUrl() from page window.location
 * @returns {ReadSearchParamsOuput}
 */
export function readSearchParams() {
    const search = window.location.search
    const params = new URLSearchParams(search)

    const from = {
        lat: params.get('flat'),
        lon: params.get('flon'),
    }

    const restroom = {
        id: params.get('rid'),
        name: params.get('rname'),
        location: { lat: params.get('tlat'), lon: params.get('tlon') },
        tags: Array.from(params.entries())
            .filter((pair) => pair[0] === 't[]')
            .map((pair) => {
                const parts = pair[1].split(',')
                return { heading: parts[0], text: parts[1] }
            }),
        timestamp: new Date(Number(params.get('time'))).toGMTString(),
    }

    const validFrom = !isNaN(from.lat) && !isNaN(from.lon)
    const validRestroom =
        restroom.id && restroom.location.lat && restroom.location.lon && isValidDate(new Date(restroom.timestamp))

    return { from: validFrom ? from : null, restroom: validRestroom ? restroom : null }
}

/**
 * Split array into chunks of n size
 * @param {any[]} arr
 * @param {number} size
 * @returns {any[]}
 */
export function arrayToChunks(arr, size) {
    const _arr = [...arr]
    const chunks = []
    while (_arr.length > 0) {
        const chunk = _arr.splice(0, size)
        chunks.push(chunk)
    }
    return chunks
}
