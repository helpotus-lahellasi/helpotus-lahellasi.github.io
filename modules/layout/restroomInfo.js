import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'

export async function setRestroomElement(target, data) {
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'info-container'

    console.log(data.tags)

    data.tags.name && container.appendChild(createPart({ heading: data.tags.name }))
    container.appendChild(createPart({ heading: 'Osoite', text: data.streetName }))
    container.appendChild(createPart({ heading: 'Lisätty', text: dateToFinnishLocale(new Date(data.timestamp)) }))
    for (const [key, value] of Object.entries(data.tags)) {
        container.appendChild(createPart({ heading: key + ':', text: value }))
    }

    target.appendChild(container)
}
