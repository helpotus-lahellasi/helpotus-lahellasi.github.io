import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'
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
 * Write into html element restroom info (name, address, publish date)
 * @param {HTMLElement} target
 * @param {Restroom} data
 */

export async function setRestroomElement(target, data) {
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'info-container'

    data.name && container.appendChild(createPart({ heading: data.name }))
    container.appendChild(createPart({ heading: 'Osoite:', text: data.streetName || 'Osoite ei saatavilla' }))

    for (const { heading, text }
        of data.tags) {
        if (!heading && !text) continue
        container.appendChild(createPart({ heading, text }))
    }

    container.appendChild(createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(data.timestamp)) }))

    target.appendChild(container)
}