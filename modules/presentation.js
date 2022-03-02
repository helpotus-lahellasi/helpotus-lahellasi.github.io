const slideCount = 18
const baseSlideName = 'helpotuslähelläsi-esittely_Sivu_'
const slideExt = '.png'
const baseUrl = './images/presentation/'

const presentation = document.createElement('main')
presentation.setAttribute('id', 'presentation')

const container = document.querySelector('body')

function onIntersect(o) {
    currentSlide = Number(o[0].target.id.split('-')[1])
}

const observer = new IntersectionObserver(onIntersect, {
    root: document.querySelector('#presentation'),
    rootMargin: '20px',
    threshold: 0.9,
})

function parseSlideNumber(i) {
    return String(i + 1).padStart(String(slideCount).length, '0')
}

let slideImages = []

function createSlide(i) {
    const slide = document.createElement('section')

    slide.className = 'presentation-slide'

    const img = document.createElement('img')
    img.className = 'presentation-slide-image'
    img.src = baseUrl + baseSlideName + parseSlideNumber(i, slideCount) + slideExt
    img.width = document.documentElement.clientWidth
    img.height = document.documentElement.clientHeight
    img.alt = ''
    img.loading = 'lazy'
    img.setAttribute('id', 'p-' + (i + 1))

    slideImages.push(img)

    slide.appendChild(img)

    observer.observe(img)

    return slide
}

let currentSlide = null

for (let i = 0; i < slideCount; i++) {
    const slide = createSlide(i)
    presentation.appendChild(slide)
}

container.appendChild(presentation)

function previousSlide() {
    slideImages[currentSlide - 2]?.scrollIntoView()
    if (slideImages[currentSlide - 3]) {
        currentSlide--
    }
}

function nextSlide() {
    slideImages[currentSlide]?.scrollIntoView()
    if (slideImages[currentSlide + 1]) {
        currentSlide++
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
    }
})

presentation.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    previousSlide()
})
