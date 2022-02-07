export const dateToFinnishLocale = (date) => {
    return date.toLocaleDateString('fi-Fi', {
        minute: '2-digit',
        hour: '2-digit',
        timeZone: 'Europe/Helsinki'
    })
}

export function createPart({ text, heading, inline }) {
    const container = document.createElement('div')
    container.className = inline ? 'part-container inline' : 'part-container'
    if (heading) {
        const el = document.createElement('span')
        el.className = 'part-heading'
        el.textContent = heading
        container.appendChild(el)
    }
    if (text) {
        const el = document.createElement('span')
        el.className = 'part-content'
        el.textContent = text
        container.appendChild(el)
    }
    return container
}
