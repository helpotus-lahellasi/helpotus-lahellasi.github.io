import { getStreetName } from '../api/routereverse/streetNameFromPosition.js'
import { dateToFinnishLocale, createPart, createSearchUrl } from '../util/index.js'

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 * Write into html element list of restrooms (with name, address, distance, fee and wheelchair attribute, publish date) or info that there is no restrooms in area.
 * @param {HTMLElement} target
 * @param {restroomsWithRoutes} data
 * @param {Coordinates} from
 * @returns
 */

export async function setRestroomList(target, data, from) {
    const container = document.createElement('div')
    container.className = 'search-results-container'

    if (!data || data.length === 0) {
        const loadingSpinner = document.getElementById('loading-spinner')
        container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
        target.appendChild(container)
        loadingSpinner.classList.toggle('hidden', true)
        return
    }

    for (let i = 0; i < data.length; i++) {
        const { route, distance, ...restroom } = data[i]
        const restroomContainer = document.createElement('a')

        restroomContainer.className = 'restroom-result info-container fade-in'
        restroomContainer.style.animationDelay = i * 30 + 'ms'
        restroomContainer.href = createSearchUrl(from, restroom)

        restroom.name && restroomContainer.appendChild(createPart({ heading: restroom.name }))

        const streetName = await getStreetName(restroom.location.lat, restroom.location.lon)
        restroomContainer.appendChild(
            createPart({
                heading: 'Osoite:',
                text: streetName || 'Osoite ei saatavilla',
            })
        )
        restroomContainer.appendChild(
            createPart({ heading: 'Etäisyys:', text: Math.round(route.data.walkDistance) + ' m' })
        )

        // Loop through restroom tags
        for (const { heading, text }
            of restroom.tags) {
            if (!heading && !text) continue
            restroomContainer.appendChild(createPart({ heading, text }))
        }

        restroomContainer.appendChild(
            createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(restroom.timestamp)) })
        )

        container.appendChild(restroomContainer)
    }
    target.appendChild(container)
}