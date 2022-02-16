import { dateToFinnishLocale, createPart, clearElement } from '../util/index.js'

export async function setSearchResultsElement(target, data, onClickHandler) {
    clearElement(target)

    const container = document.createElement('div')
    container.className = 'search-results-container'

    const heading = document.createElement('h3')
    heading.textContent = 'Hakutulokset:'
    const desc = document.createElement('span')
    desc.textContent = '(napauta sijaintia etsiäksesi käymälät)'

    container.appendChild(heading)
    container.appendChild(desc)

    for (const location of data) {
        const button = document.createElement('button')
        button.addEventListener('click', (event) => onClickHandler(event, location))
        button.className = 'search-result-button'
        const heading = location.display_name.substring(0, location.display_name.indexOf(', '))
        const rest = location.display_name.substring(location.display_name.indexOf(', ') + 2)

        const element = createPart({ heading: heading, text: rest })
        button.appendChild(element)
        container.appendChild(button)
        target.appendChild(container)
    }
}
