import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'

export async function setRestroomElement(target, data) {
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'info-container'

    data.name && container.appendChild(createPart({ heading: data.name }))
    container.appendChild(createPart({ heading: 'Osoite:', text: data.streetName }))

    for (const { heading, text }
        of data.tags) {
        if (!heading && !text) continue
        container.appendChild(createPart({ heading, text }))
    }

    container.appendChild(createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(data.timestamp)) }))

    target.appendChild(container)
}