import { getSearch } from './api/osm/search.js'


let timeout

function onSearch(event) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        console.log(event.target.value)
        getSearch(event.target.value);
    }, 500)
}


document.querySelector('#searchbar').addEventListener('change', onSearch);
document.querySelector('#searchbar').addEventListener('keyup', onSearch);