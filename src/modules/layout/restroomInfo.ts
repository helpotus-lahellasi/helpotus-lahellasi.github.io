import { dateToFinnishLocale, createPart, clearElement } from '../util/index'
import { Restroom } from '../types'

/**
 * Write into html element restroom info (name, address, publish date)
 */
export async function setRestroomElement(target: HTMLElement, data: Restroom): Promise<void> {
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'info-container'

    data.name && container.appendChild(createPart({ heading: data.name }))
    container.appendChild(createPart({ heading: 'Osoite:', text: data.streetName || 'Osoite ei saatavilla' }))

    for (const { heading, text } of data.tags) {
        if (!heading && !text) continue
        container.appendChild(createPart({ heading, text }))
    }

    container.appendChild(createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(data.timestamp)) }))

    target.appendChild(container)
}
