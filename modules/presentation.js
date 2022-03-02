// Create a presentation from powerpoint slide images

// Variables that dictate the slide image src creation
const slideCount = 18
const baseSlideName = 'helpotuslähelläsi-esittely_Sivu_'
const slideExt = '.png'
const baseUrl = './images/presentation/'

const presentation = document.createElement('main')
presentation.setAttribute('id', 'presentation')

const container = document.querySelector('body')

/**
 * Change current slide index from intersection observer callback
 * @param {any} o
 */
function onIntersect(o) {
    currentSlide = Number(o[0].target.id.split('-')[1])
}

// Intersection observer for observing the current slide index
const observer = new IntersectionObserver(onIntersect, {
    root: document.querySelector('#presentation'),
    rootMargin: '20px',
    threshold: 0.9,
})

/**
 * Parse slide file number from the slide element ID
 * @param {number} i
 * @returns {string}
 */
function parseSlideNumber(i) {
    return String(i + 1).padStart(String(slideCount).length, '0')
}

let slideImages = []

/**
 * Create slide element
 * @param {number} slideIndex
 * @returns {HTMLElement}
 */
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

// Add slides into presentation
for (let i = 0; i < slideCount; i++) {
    const slide = createSlide(i)
    presentation.appendChild(slide)
}

// Output presentation into DOM
container.appendChild(presentation)

/**
 * Move to previous slide
 */
function previousSlide() {
    slideImages[currentSlide - 2]?.scrollIntoView()
    if (slideImages[currentSlide - 3]) {
        currentSlide--
    }
}

/**
 * Move to next slide
 */
function nextSlide() {
    slideImages[currentSlide]?.scrollIntoView()
    if (slideImages[currentSlide + 1]) {
        currentSlide++
    }
}

/**
 * Listen for keypresses
 * space, right arrow, down arrow = next slide
 * left arrow, up arrow = previous slide
 */
window.addEventListener('keydown', (e) => {
    e.preventDefault()
    if (e.repeat) return
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
        nextSlide()
    } else if (e.keyCode === 38 || e.keyCode === 37) {
        previousSlide()
    }
})

/**
 * Listen for left click presses
 * left click = next slide
 */
presentation.addEventListener('mouseup', (e) => {
    e.preventDefault()
    if (e.button === 0) {
        nextSlide()
    }
})

/**
 * Listen for right click presses
 * right click = previous slide
 */
presentation.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    previousSlide()
})
