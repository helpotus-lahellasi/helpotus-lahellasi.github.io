import { getSearch } from './api/osm/search.js'
import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'
import { dateToFinnishLocale, createPart, clearElement } from './util/index.js'
import { getStreetName } from './api/routereverse/streetNameFromPosition.js'

const searchBar = document.getElementById('searchbar')
const searchForm = document.getElementById('search-form')
const resultsTarget = document.querySelector('.search-results')
const loadingSpinner = document.getElementById('loading-spinner')

let oldSearch

async function getRestrooms(location) {
    return await App.fetchRestroomsFromLocation(location)
}

async function main() {
    function onClick(event, data) {
        listRestRooms(data.lat, data.lon)
    }

    async function listRestRooms(lat, lon) {
        loadingSpinner.classList.toggle('hidden', false)
        const restrooms = await getRestrooms({ lat: lat, lon: lon })
        const restroomsWithDistance = restrooms.map(restroom => ({...restroom, distance: App.distanceBetween({ lat: lat, lon: lon }, restroom.location) }))
        const sortedRestrooms = [...restroomsWithDistance]
            .sort(
                (vessaA, vessaB) =>
                vessaA.distance -
                vessaB.distance
            )
            .slice(0, 4)
        const restroomsWithRoutes = await Promise.all([...sortedRestrooms].map(async(restroom) => ({...restroom, route: await App.getRouteBetweenLocations({ lat, lon }, restroom.location) })))


        clearElement(resultsTarget)

        if (!restrooms || restrooms.length === 0) {
            const container = document.createElement('div')
            container.className = 'info-container'
            container.appendChild(
                createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' })
            )
            resultsTarget.appendChild(container)
        }

        for (const restroom of restroomsWithRoutes) {
            const container = document.createElement('div')
            container.className = 'info-container'

            const route = restroom.route.data

            restroom.name && container.appendChild(createPart({ heading: restroom.name }))

            container.appendChild(
                createPart({ heading: 'Osoite:', text: await getStreetName(restroom.location.lat, restroom.location.lon) })
            )
            container.appendChild(createPart({ heading: 'Etäisyys:', text: Math.round(route.walkDistance) + ' m' }))

            // Loop through restroom tags
            for (const { heading, text }
                of restroom.tags) {
                if (!heading && !text) continue
                container.appendChild(createPart({ heading, text }))
            }

            container.appendChild(
                createPart({ heading: 'Lisätty:', text: dateToFinnishLocale(new Date(restroom.timestamp)) })
            )

            resultsTarget.appendChild(container)
        }


        loadingSpinner.classList.toggle('hidden', true)
    }

    async function onSearch(event) {
        event.preventDefault()
        clearTimeout(timeout)

        if (searchBar.value === oldSearch) return
        oldSearch = searchBar.value

        const data = await getSearch(searchBar.value)
        setSearchResultsElement(resultsTarget, data, onClick)
    }

    let timeout

    function debouncedOnSearch(event) {
        event.preventDefault()
        clearTimeout(timeout)
        timeout = setTimeout(async() => {
            await onSearch(event)
        }, 500)
    }

    searchBar.addEventListener('change', debouncedOnSearch)
    searchBar.addEventListener('keyup', debouncedOnSearch)
    searchForm.addEventListener('submit', onSearch)
}

main()