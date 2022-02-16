import { getStreetName } from '../api/routereverse/streetNameFromPosition.js'
import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'

export async function setRestroomList(target, data) {
    clearElement(target)
    const container = document.createElement('div')
    container.className = 'search-results-container'

    const heading = document.createElement('h3')
    heading.textContent = 'Löydetyt käymälät:'
    const desc = document.createElement('span')
    desc.textContent = '(napauta käymälää etsiäksesi reitin)'

    container.appendChild(heading)
    container.appendChild(desc)

    if (!data || data.length === 0) {
        container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
        target.appendChild(container)
        loadingSpinner.classList.toggle('hidden', true)
        return
    }

    for (const restroom of data) {
        const restroomContainer = document.createElement('div')
        restroomContainer.className = 'info-container'

        const route = restroom.route.data

        restroom.name && restroomContainer.appendChild(createPart({ heading: restroom.name }))

        restroomContainer.appendChild(
            createPart({
                heading: 'Osoite:',
                text: await getStreetName(restroom.location.lat, restroom.location.lon),
            })
        )
        restroomContainer.appendChild(createPart({ heading: 'Etäisyys:', text: Math.round(route.walkDistance) + ' m' }))

        // Loop through restroom tags
        for (const { heading, text } of restroom.tags) {
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
