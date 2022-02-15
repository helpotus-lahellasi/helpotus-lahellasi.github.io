import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'

export async function setSearchResultsElement(target, data, onClickHandler) {
    clearElement(target)
    console.log(data);

    const container = document.createElement('div')
    container.className = 'info-container'

    for (const location of data) {
        const button = document.createElement('button')
        button.addEventListener('click', (event) => onClickHandler(event, location))
        button.className = 'search-result-button'
        const element = createPart({ heading: 'Osoite:', text: location.display_name })
        button.appendChild(element)
        container.appendChild(button)
        target.appendChild(container)
    }


}