import { dateToFinnishLocale, createPart, clearElement } from '../util/index'
import { Route } from '../types'

/**
 * Write into html element route to restroom info (arrival time, distance, walking time)
 */
export function setRouteInfoElement(target: HTMLElement, route: Route): void {
    const data = route.data
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'info-container'

    container.appendChild(createPart({ heading: 'Perillä:', text: dateToFinnishLocale(new Date(data.endTime)) }))
    container.appendChild(createPart({ text: (data.walkDistance / 1000).toFixed(1) + ' km', inline: true }))
    container.appendChild(
        createPart({
            text: Math.round(data.walkDistance / 60) + ' min',
            inline: true,
            icon: '/images/icons/walk.svg',
        }),
    )

    target.appendChild(container)
}
