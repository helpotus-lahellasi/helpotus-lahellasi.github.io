import { getSearch } from './api/osm/search.js'
import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'
import { setRestroomList } from './layout/searchRestroomlist.js'

const searchBar = document.getElementById('searchbar')
const searchForm = document.getElementById('search-form')
const resultsTarget = document.querySelector('.search-results')
const loadingSpinner = document.getElementById('loading-spinner')
const restroomList = document.querySelector('.restroomlist')

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
        const restroomsWithDistance = restrooms.map((restroom) => ({
            ...restroom,
            distance: App.distanceBetween({ lat: lat, lon: lon }, restroom.location),
        }))
        const sortedRestrooms = [...restroomsWithDistance]
            .sort((vessaA, vessaB) => vessaA.distance - vessaB.distance)
            .slice(0, 4)
        const restroomsWithRoutes = await Promise.all(
            [...sortedRestrooms].map(async (restroom) => ({
                ...restroom,
                route: await App.getRouteBetweenLocations({ lat, lon }, restroom.location),
            }))
        )

        await setRestroomList(restroomList, restroomsWithRoutes)

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
        timeout = setTimeout(async () => {
            await onSearch(event)
        }, 500)
    }

    searchBar.addEventListener('change', debouncedOnSearch)
    searchBar.addEventListener('keyup', debouncedOnSearch)
    searchForm.addEventListener('submit', onSearch)
}

main()
