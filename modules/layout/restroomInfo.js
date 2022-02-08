import { dateToFinnishLocale, createPart } from '../util/index.js'


export async function setRestroomElement(target, data) {
    while (target.firstChild) {
        target.removeChild(target.firstChild)
    }

    const container = document.createElement('div')
    container.className = 'info-container'

    console.log(data);

    data.tags.name && container.appendChild(createPart({ heading: data.tags.name }))
    container.appendChild(createPart({ heading: 'Osoite', text: data.streetName }))
    container.appendChild(createPart({ heading: 'Maksullinen:', text: data.tags.fee || '?' }))
    container.appendChild(createPart({ heading: 'Lisätty', text: dateToFinnishLocale(new Date(data.timestamp)) }))
    target.appendChild(container)
}