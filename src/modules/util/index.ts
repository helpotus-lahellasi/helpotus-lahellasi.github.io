import { Coordinates, Restroom, PartOptions, ReadSearchParamsOutput } from '../types'

/**
 * Convert js date into Finnish locale
 * eq. 10.8.2019 klo 16.01
 */
export const dateToFinnishLocale = (date: Date): string => {
    return date.toLocaleDateString('fi-Fi', {
        minute: '2-digit',
        hour: '2-digit',
        timeZone: 'Europe/Helsinki',
    })
}

/**
 * Remove all children of a HTML Element
 */
export function clearElement(target: HTMLElement): void {
    while (target.firstChild) {
        target.removeChild(target.firstChild)
    }
}

/**
 * Create HTML part used in listing properties
 */
export function createPart({ text, heading, inline, icon }: PartOptions): HTMLElement {
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
 * Convert Application data into shareable URL
 */
export function createSearchUrl(
    from: Coordinates | null,
    restroom: Pick<Restroom, 'location' | 'id' | 'name' | 'tags' | 'timestamp'>,
): string {
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
        data += restroom.tags.map((t) => `t[]=${encodeURIComponent(`${t.heading},${t.text}`)}&`).join('')
    }
    if (restroom.timestamp) {
        const timestamp = restroom.timestamp instanceof Date ? restroom.timestamp : new Date(restroom.timestamp)
        data += `time=${timestamp.getTime()}&`
    }

    return `${base}${data}`
}

/**
 * Check if object is a valid js Date
 */
export function isValidDate(d: unknown): boolean {
    return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Read url created by createSearchUrl() from page window.location
 */
export function readSearchParams(): ReadSearchParamsOutput {
    const search = window.location.search
    const params = new URLSearchParams(search)

    const flat = params.get('flat')
    const flon = params.get('flon')
    const from: Coordinates | null =
        flat && flon && !isNaN(Number(flat)) && !isNaN(Number(flon)) ? { lat: Number(flat), lon: Number(flon) } : null

    const rid = params.get('rid')
    const tlat = params.get('tlat')
    const tlon = params.get('tlon')
    const time = params.get('time')
    const rname = params.get('rname')

    const tags = Array.from(params.entries())
        .filter((pair) => pair[0] === 't[]')
        .map((pair) => {
            const parts = pair[1].split(',')
            return { heading: parts[0] || '', text: parts[1] || '' }
        })

    const validRestroom =
        rid &&
        tlat &&
        tlon &&
        time &&
        !isNaN(Number(rid)) &&
        !isNaN(Number(tlat)) &&
        !isNaN(Number(tlon)) &&
        !isNaN(Number(time)) &&
        isValidDate(new Date(Number(time)))

    const restroom: Restroom | null = validRestroom
        ? {
              id: Number(rid),
              name: rname || undefined,
              location: { lat: Number(tlat), lon: Number(tlon) },
              tags,
              timestamp: new Date(Number(time)),
          }
        : null

    return { from, restroom }
}

/**
 * Split array into chunks of n size
 */
export function arrayToChunks<T>(arr: T[], size: number): T[][] {
    const _arr = [...arr]
    const chunks = []
    while (_arr.length > 0) {
        const chunk = _arr.splice(0, size)
        chunks.push(chunk)
    }
    return chunks
}
