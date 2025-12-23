import { App } from './app/index'
import { setSearchResultsElement } from './layout/searchResults'
import { setRestroomList } from './layout/searchRestroomlist'
import { clearElement, createPart, arrayToChunks } from './util/index'
import { SearchResult, Coordinates, Restroom, Route } from './types'

interface RestroomWithRoute extends Omit<Restroom, 'distance'> {
    route: Route
    distance: number
}

// Functionality for the search page (haku.html)
;(async function () {
    const searchBar = document.getElementById('searchbar') as HTMLInputElement | null
    const searchForm = document.getElementById('search-form') as HTMLFormElement | null
    const resultsTarget = document.querySelector<HTMLElement>('.search-results')
    const restroomList = document.querySelector<HTMLElement>('.restroomlist')
    const moreRestroomsButton = document.getElementById('more-restrooms') as HTMLButtonElement | null

    if (!searchBar || !searchForm || !resultsTarget || !restroomList || !moreRestroomsButton) {
        return
    }

    let oldSearch: string | undefined
    const app = new App()

    // Use cached searches to use fewer api calls when they are not required
    const cachedSearches = App.getStoredSearches()

    if (cachedSearches) {
        app.addSearches(cachedSearches)
    }

    async function listRestrooms(_event: MouseEvent, data: SearchResult): Promise<void> {
        const loadingSpinner = document.getElementById('loading-spinner') as HTMLElement | null
        if (!loadingSpinner) return

        const lat = Number(data.lat)
        const lon = Number(data.lon)
        const location: Coordinates = { lat, lon }
        app.location = location
        loadingSpinner.classList.toggle('hidden', false)

        // Fetch restrooms from given location
        const restrooms = await App.fetchRestroomsFromLocation(location)

        app.addRestrooms(restrooms)
        if (restroomList) {
            clearElement(restroomList)
        }

        // Compute distance into restrooms
        const restroomsWithDistance = restrooms.map((restroom) => ({
            ...restroom,
            distance: App.distanceBetween(app.location, restroom.location),
        }))
        // Split restrooms into chunks for pagination
        const restroomChunks = arrayToChunks(
            [...restroomsWithDistance].sort((vessaA, vessaB) => vessaA.distance - vessaB.distance),
            4,
        )

        // Handler for when there are no found restrooms
        if (!restroomChunks || restroomChunks.length === 0) {
            const container = document.createElement('div')
            container.className = 'search-results-container'

            container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
            if (restroomList) {
                restroomList.appendChild(container)
            }
            loadingSpinner.classList.toggle('hidden', true)
            return
        }

        let currentPage = 0

        // Fetch routes for first page of restrooms
        const restroomsWithRoutes: RestroomWithRoute[] = await Promise.all(
            restroomChunks[currentPage].map(async (restroom) => {
                const route = await app.getRoute(restroom.id)
                if (!route) {
                    throw new Error('Failed to get route for restroom')
                }
                return {
                    ...restroom,
                    route,
                }
            }),
        )

        const heading = document.createElement('h3')
        heading.textContent = 'Löydetyt käymälät:'
        const desc = document.createElement('span')
        desc.textContent = '(napauta käymälää etsiäksesi reitin)'
        desc.className = 'mb'

        if (restroomList) {
            restroomList.appendChild(heading)
            restroomList.appendChild(desc)

            // Push restrooms into DOM
            await setRestroomList(restroomList, restroomsWithRoutes, location)
        }

        // Show the "show more restrooms" button, if there are multiple pages of restrooms available
        if (restroomChunks.length > 1 && moreRestroomsButton) {
            moreRestroomsButton.classList.toggle('hidden', false)
        }

        // Show more restrooms
        if (moreRestroomsButton) {
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
                const restroomsWithRoutes: RestroomWithRoute[] = await Promise.all(
                    restroomChunks[currentPage].map(async (restroom) => {
                        const route = await app.getRoute(restroom.id)
                        if (!route) {
                            throw new Error('Failed to get route for restroom')
                        }
                        return {
                            ...restroom,
                            route,
                        }
                    }),
                )
                if (restroomList) {
                    await setRestroomList(restroomList, restroomsWithRoutes, location)
                }
                loadingSpinner.classList.toggle('hidden', true)
            })
        }

        loadingSpinner.classList.toggle('hidden', true)
    }

    // Handle location search event
    async function onSearch(event: Event): Promise<void> {
        event.preventDefault()
        if (timeout) {
            clearTimeout(timeout)
        }

        if (!searchBar || searchBar.value === oldSearch) return
        oldSearch = searchBar.value

        const data = await app.getSearchResult(searchBar.value)
        if (!data || !resultsTarget) return

        setSearchResultsElement(resultsTarget, data.results, listRestrooms)
    }

    let timeout: ReturnType<typeof setTimeout> | undefined

    // Debounced search for keyup events so that the search does not start too early
    function debouncedOnSearch(event: Event): void {
        event.preventDefault()
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(async () => {
            await onSearch(event)
        }, 500)
    }

    if (searchBar) {
        searchBar.addEventListener('change', debouncedOnSearch)
        searchBar.addEventListener('keyup', debouncedOnSearch)
    }
    if (searchForm) {
        searchForm.addEventListener('submit', onSearch)
    }
})()
