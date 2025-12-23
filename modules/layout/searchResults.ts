import { createPart, clearElement } from '../util/index'

/**
 * Write into html element list of address search results
 * @param {HTMLElement} target
 * @param {SearchResult[]} data
 * @param {{()=>void} onClickHandler} onClickHandler
 */

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

    for (let i = 0; i < data.length; i++) {
        const location = data[i]
        const button = document.createElement('button')
        button.addEventListener('click', (event) => onClickHandler(event, location))
        button.className = 'search-result-button fade-in'
        button.style.animationDelay = i * 30 + 'ms'
        const heading = location.display_name.substring(0, location.display_name.indexOf(', '))
        const rest = location.display_name.substring(location.display_name.indexOf(', ') + 2)

        const element = createPart({ heading: heading, text: rest })
        button.appendChild(element)
        container.appendChild(button)
    }
    target.appendChild(container)
}
