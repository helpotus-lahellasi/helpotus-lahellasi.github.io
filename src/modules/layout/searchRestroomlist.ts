import { getStreetName } from '../api/routereverse/streetNameFromPosition'
import { dateToFinnishLocale, createPart, createSearchUrl } from '../util/index'
import { Coordinates, Restroom, Route } from '../types'

type RestroomWithRoute = Omit<Restroom, 'distance'> & {
    route: Route
    distance: number
}

/**
 * Write into html element list of restrooms (with name, address, distance, fee and wheelchair attribute, publish date) or info that there is no restrooms in area.
 */
export async function setRestroomList(
    target: HTMLElement,
    data: RestroomWithRoute[] | null,
    from: Coordinates,
): Promise<void> {
    const container = document.createElement('div')
    container.className = 'search-results-container'

    if (!data || data.length === 0) {
        const loadingSpinner = document.getElementById('loading-spinner')
        container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
        target.appendChild(container)
        if (loadingSpinner) {
            loadingSpinner.classList.toggle('hidden', true)
        }
        return
    }

    for (let i = 0; i < data.length; i++) {
        const { route, ...restroom } = data[i]
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
            }),
        )
        restroomContainer.appendChild(
            createPart({ heading: 'Etäisyys:', text: Math.round(route.data.walkDistance) + ' m' }),
        )

        // Loop through restroom tags
        for (const { heading, text } of restroom.tags) {
            if (!heading && !text) continue
            restroomContainer.appendChild(createPart({ heading, text }))
        }

        restroomContainer.appendChild(
            createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(restroom.timestamp)) }),
        )

        container.appendChild(restroomContainer)
    }
    target.appendChild(container)
}
