export const dateToFinnishLocale = (date) => {
    return date.toLocaleDateString('fi-Fi', {
        minute: '2-digit',
        hour: '2-digit',
        timeZone: 'Europe/Helsinki',
    })
}

export function clearElement(target) {
    while (target.firstChild) {
        target.removeChild(target.firstChild)
    }
}

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

export function createSearchUrl(from, restroom) {
    const to = restroom.location
    const base = '/sovellus.html?'
    let data = ''
    if (from && from.lat && from.lon) {
        data += `flat=${from.lat}&flon=${from.lon}&`
    }
    if (to && to.lat && to.lon) {
        data += `tlat=${to.lat}&tlon=${to.lon}&`
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

