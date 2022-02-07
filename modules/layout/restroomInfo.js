import { dateToFinnishLocale, createPart } from '../util/index.js'

export function setRestroomElement(target, data) {
    const previousContainer = target.querySelector('.container')
    if (previousContainer) {
        target.removeChild(previousContainer)
    }

    const container = document.createElement('div')
    container.className = 'info-container'

    data.tags.name && container.appendChild(createPart({ text: data.tags.name }))
    container.appendChild(createPart({ heading: 'Maksullinen:', text: data.tags.fee || '?' }))
    container.appendChild(createPart({ heading: 'Lisätty', text: dateToFinnishLocale(new Date(data.timestamp)) }))

    target.appendChild(container)
}
