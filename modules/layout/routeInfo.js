import { dateToFinnishLocale, createPart } from '../util/index.js'

export function setRouteInfoElement(target, data) {
    while (target.firstChild) {
        target.removeChild(target.firstChild)
    }

    const container = document.createElement('div')
    container.className = 'info-container'

    container.appendChild(createPart({ heading: 'Perillä:', text: dateToFinnishLocale(new Date(data.endTime)) }))
    container.appendChild(createPart({ text: (data.walkDistance / 1000).toFixed(1) + ' km', inline: true }))
    container.appendChild(createPart({ text: Math.round(data.walkDistance / 60) + ' min', inline: true }))

    target.appendChild(container)
}
