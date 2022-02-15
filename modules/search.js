import { getSearch } from './api/osm/search.js'
import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'

const searchBar = document.getElementById('searchbar')
const searchForm = document.getElementById("search-form")
const resultsTarget = document.querySelector('.search-results')

async function getRestrooms(location) {
    return await App.fetchRestroomsFromLocation(location)
}

async function main() {
    function onClick(event, data) {
        ///
        console.log(data)

    }

    async function onSearch(event) {
        event.preventDefault()
        console.log(searchBar.value)
        const data = await getSearch(searchBar.value);
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



    searchBar.addEventListener('change', debouncedOnSearch);
    searchBar.addEventListener('keyup', debouncedOnSearch);
    searchForm.addEventListener('submit', onSearch)
}

main()