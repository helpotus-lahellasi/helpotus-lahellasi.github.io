import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'
import { setRestroomList } from './layout/searchRestroomlist.js'

const searchBar = document.getElementById('searchbar')
const searchForm = document.getElementById('search-form')
const resultsTarget = document.querySelector('.search-results')
const loadingSpinner = document.getElementById('loading-spinner')
const restroomList = document.querySelector('.restroomlist')

let oldSearch

async function main() {
    const app = new App()
    const cachedSearches = App.getStoredSearches()

    if (cachedSearches) {
        app.addSearches(cachedSearches)
    }

    async function listRestrooms(_event, data) {
        const { lat, lon } = data
        app.location = { lat, lon }
        loadingSpinner.classList.toggle('hidden', false)

        const restrooms = await App.fetchRestroomsFromLocation({ lat, lon })

        app.addRestrooms(restrooms)

        const restroomsWithDistance = restrooms.map((restroom) => ({
            ...restroom,
            distance: App.distanceBetween(app.location, restroom.location),
        }))

        const sortedRestrooms = [...restroomsWithDistance]
            .sort((vessaA, vessaB) => vessaA.distance - vessaB.distance)
            .slice(0, 4)

        const restroomsWithRoutes = await Promise.all(
            [...sortedRestrooms].map(async (restroom) => ({
                ...restroom,
                route: await app.getRoute(restroom.id),
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

        const data = await app.getSearchResult(searchBar.value)

        setSearchResultsElement(resultsTarget, data.results, listRestrooms)
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
