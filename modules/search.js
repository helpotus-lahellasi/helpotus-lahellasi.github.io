import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'
import { setRestroomList } from './layout/searchRestroomlist.js'
import { clearElement, createPart, arrayToChunks } from './util/index.js'

;(async function () {
    const searchBar = document.getElementById('searchbar')
    const searchForm = document.getElementById('search-form')
    const resultsTarget = document.querySelector('.search-results')
    const restroomList = document.querySelector('.restroomlist')
    const moreRestroomsButton = document.getElementById('more-restrooms')

    let oldSearch
    const app = new App()
    const cachedSearches = App.getStoredSearches()

    if (cachedSearches) {
        app.addSearches(cachedSearches)
    }

    async function listRestrooms(_event, data) {
        const loadingSpinner = document.getElementById('loading-spinner')

        const { lat, lon } = data
        app.location = { lat, lon }
        loadingSpinner.classList.toggle('hidden', false)

        const restrooms = await App.fetchRestroomsFromLocation({ lat, lon })
        clearElement(restroomList)
        app.addRestrooms(restrooms)

        const restroomsWithDistance = restrooms.map((restroom) => ({
            ...restroom,
            distance: App.distanceBetween(app.location, restroom.location),
        }))

        const restroomChunks = arrayToChunks(
            [...restroomsWithDistance].sort((vessaA, vessaB) => vessaA.distance - vessaB.distance)
        )

        if (!restroomChunks || restroomChunks.length === 0) {
            const container = document.createElement('div')
            container.className = 'search-results-container'

            container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
            restroomList.appendChild(container)
            loadingSpinner.classList.toggle('hidden', true)
            return
        }

        let i = 0

        if (!restroomChunks || restroomChunks.length === 0) return

        const restroomsWithRoutes = await Promise.all(
            restroomChunks[i].map(async (restroom) => ({
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

        await setRestroomList(restroomList, restroomsWithRoutes, { lat, lon })

        if (restroomChunks.length > 1) {
            moreRestroomsButton.classList.toggle('hidden', false)
        }

        moreRestroomsButton.addEventListener('click', async () => {
            i++

            if (i >= restroomChunks.length) {
                moreRestroomsButton.classList.toggle('hidden', true)
                return
            }
            if (i + 1 >= restroomChunks.length) {
                moreRestroomsButton.classList.toggle('hidden', true)
            }

            loadingSpinner.classList.toggle('hidden', false)
            const restroomsWithRoutes = await Promise.all(
                restroomChunks[i].map(async (restroom) => ({
                    ...restroom,
                    route: await app.getRoute(restroom.id),
                }))
            )
            await setRestroomList(restroomList, restroomsWithRoutes)
            loadingSpinner.classList.toggle('hidden', true)
        })

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
})()

