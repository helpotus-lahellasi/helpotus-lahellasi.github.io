/*********   Edit these   *****************/
const pageCount = 18
const basePageName = 'helpotuslähelläsi-esittely_Sivu_'
const pageExt = '.png'
const baseUrl = './images/presentation/'
/******************************************/

const presentation = document.createElement('main')
presentation.setAttribute('id', 'presentation')

const container = document.querySelector('body')

function onIntersect(o) {
    currentPage = Number(o[0].target.id.split('-')[1])
}

const observer = new IntersectionObserver(onIntersect, {
    root: document.querySelector('#presentation'),
    rootMargin: '20px',
    threshold: 0.9,
})

function parsePageNumber(i) {
    return String(i + 1).padStart(String(pageCount).length, '0')
}

let pageImages = []

function createPage(i) {
    const page = document.createElement('section')

    page.className = 'presentation-page'

    const img = document.createElement('img')
    img.className = 'presentation-page-image'
    img.src = baseUrl + basePageName + parsePageNumber(i, pageCount) + pageExt
    img.width = document.documentElement.clientWidth
    img.height = document.documentElement.clientHeight
    img.alt = ''
    img.loading = 'lazy'
    img.setAttribute('id', 'p-' + (i + 1))

    pageImages.push(img)

    page.appendChild(img)

    observer.observe(img)

    return page
}

let currentPage = null

for (let i = 0; i < pageCount; i++) {
    const page = createPage(i)
    presentation.appendChild(page)
}

container.appendChild(presentation)

function previousSlide() {
    pageImages[currentPage - 2]?.scrollIntoView()
    if (pageImages[currentPage - 3]) {
        currentPage--
    }
}

function nextSlide() {
    pageImages[currentPage]?.scrollIntoView()
    if (pageImages[currentPage + 1]) {
        currentPage++
    }
}

window.addEventListener('keydown', (e) => {
    e.preventDefault()
    if (e.repeat) return
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
        nextSlide()
    } else if (e.keyCode === 38 || e.keyCode === 37) {
        previousSlide()
    }
})

presentation.addEventListener('mouseup', (e) => {
    e.preventDefault()
    if (e.button === 0) {
        nextSlide()
    } else if (e.button === 2) {
        previousSlide()
    }
})

presentation.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    previousSlide()
})
