import { App } from './app/index'
import { setSearchResultsElement } from './layout/searchResults'
import { setRestroomList } from './layout/searchRestroomlist'
import { clearElement, createPart, arrayToChunks } from './util/index'

// Functionality for the search page (haku.html)
;(async function () {
    const searchBar = document.getElementById('searchbar')
    const searchForm = document.getElementById('search-form')
    const resultsTarget = document.querySelector('.search-results')
    const restroomList = document.querySelector('.restroomlist')
    const moreRestroomsButton = document.getElementById('more-restrooms')

    let oldSearch
    const app = new App()

    // Use cached searches to use fewer api calls when they are not required
    const cachedSearches = App.getStoredSearches()

    if (cachedSearches) {
        app.addSearches(cachedSearches)
    }

    /**
     * @typedef {Object} Restroom
     * @property {number} id
     * @property {Date} timestamp
     * @property {Coordinates} location
     * @property {Tag[]} tags
     */

    /**
     * List restrooms into DOM and do quite a bit of misc things
     * @param {MouseEvent} _event
     * @param {Restroom} data
     * @returns {void}
     */
    async function listRestrooms(_event, data) {
        const loadingSpinner = document.getElementById('loading-spinner')

        const { lat, lon } = data
        app.location = { lat, lon }
        loadingSpinner.classList.toggle('hidden', false)

        // Fetch restrooms from given location
        const restrooms = await App.fetchRestroomsFromLocation({ lat, lon })

        app.addRestrooms(restrooms)
        clearElement(restroomList)

        // Compute distance into restrooms
        const restroomsWithDistance = restrooms.map((restroom) => ({
            ...restroom,
            distance: App.distanceBetween(app.location, restroom.location),
        }))
        // Split restrooms into chunks for pagination
        const restroomChunks = arrayToChunks(
            [...restroomsWithDistance].sort((vessaA, vessaB) => vessaA.distance - vessaB.distance),
            4
        )

        // Handler for when there are no found restrooms
        if (!restroomChunks || restroomChunks.length === 0) {
            const container = document.createElement('div')
            container.className = 'search-results-container'

            container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
            restroomList.appendChild(container)
            loadingSpinner.classList.toggle('hidden', true)
            return
        }

        let currentPage = 0

        // Fetch routes for first page of restrooms
        const restroomsWithRoutes = await Promise.all(
            restroomChunks[currentPage].map(async (restroom) => ({
                ...restroom,
                route: await app.getRoute(restroom.id),
            }))
        )

        const heading = document.createElement('h3')
        heading.textContent = 'Löydetyt käymälät:'
        const desc = document.createElement('span')
        desc.textContent = '(napauta käymälää etsiäksesi reitin)'
        desc.className = 'mb'

        restroomList.appendChild(heading)
        restroomList.appendChild(desc)

        // Push restrooms into DOM
        await setRestroomList(restroomList, restroomsWithRoutes, { lat, lon })

        // Show the "show more restrooms" button, if there are multiple pages of restrooms available
        if (restroomChunks.length > 1) {
            moreRestroomsButton.classList.toggle('hidden', false)
        }

        // Show more restrooms
        moreRestroomsButton.addEventListener('click', async () => {
            currentPage++
            if (currentPage >= restroomChunks.length) {
                moreRestroomsButton.classList.toggle('hidden', true)
                return
            }
            if (currentPage + 1 >= restroomChunks.length) {
                moreRestroomsButton.classList.toggle('hidden', true)
            }

            loadingSpinner.classList.toggle('hidden', false)
            const restroomsWithRoutes = await Promise.all(
                restroomChunks[currentPage].map(async (restroom) => ({
                    ...restroom,
                    route: await app.getRoute(restroom.id),
                }))
            )
            await setRestroomList(restroomList, restroomsWithRoutes)
            loadingSpinner.classList.toggle('hidden', true)
        })

        loadingSpinner.classList.toggle('hidden', true)
    }

    // Handle location search event
    async function onSearch(event) {
        event.preventDefault()
        clearTimeout(timeout)

        if (searchBar.value === oldSearch) return
        oldSearch = searchBar.value

        const data = await app.getSearchResult(searchBar.value)

        setSearchResultsElement(resultsTarget, data.results, listRestrooms)
    }

    let timeout

    // Debounced search for keyup events so that the search does not start too early
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
})()
