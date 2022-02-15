import { getSearch } from './api/osm/search.js'
import { App } from './app/index.js'
import { setSearchResultsElement } from './layout/searchResults.js'


async function getRestrooms(location) {
    return await App.fetchRestroomsFromLocation(location)
}

async function main() {

    function onClick(event, data) {
        ///
        console.log(data)

    }

    let timeout

    function onSearch(event) {
        clearTimeout(timeout)
        timeout = setTimeout(async() => {
            console.log(event.target.value)
            const data = await getSearch(event.target.value);
            setSearchResultsElement(document.querySelector('.search-results'), data, onClick)
        }, 500)

    }



    document.querySelector('#searchbar').addEventListener('change', onSearch);
    document.querySelector('#searchbar').addEventListener('keyup', onSearch);
}

main()