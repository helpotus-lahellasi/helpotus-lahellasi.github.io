// Create a presentation from powerpoint slide images

// Variables that dictate the slide image src creation
const slideCount = 23
const baseSlideName = 'Dia'
const slideExt = '.jpg'
const baseUrl = './images/presentation/v2_min/'

const presentation = document.createElement('main')
presentation.setAttribute('id', 'presentation')

const container = document.querySelector('body')
if (!container) {
    throw new Error('Body element not found')
}

let currentSlide: number | null = null

function onIntersect(o: IntersectionObserverEntry[]): void {
    if (o[0]?.target) {
        currentSlide = Number(o[0].target.id.split('-')[1])
    }
}

// Intersection observer for observing the current slide index
const presentationElement = document.querySelector('#presentation')
const observer = new IntersectionObserver(onIntersect, {
    root: presentationElement,
    rootMargin: '20px',
    threshold: 0.9,
})

function parseSlideNumber(i: number): string {
    return String(i + 1).padStart(String(slideCount).length, '0')
}

const slideImages: HTMLImageElement[] = []

function createSlide(i: number): HTMLElement {
    const slide = document.createElement('section')

    slide.className = 'presentation-slide'

    const img = document.createElement('img')
    img.className = 'presentation-slide-image'
    img.src = baseUrl + baseSlideName + parseSlideNumber(i) + slideExt
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

// Add slides into presentation
for (let i = 0; i < slideCount; i++) {
    const slide = createSlide(i)
    presentation.appendChild(slide)
}

// Output presentation into DOM
container.appendChild(presentation)

function previousSlide(): void {
    if (currentSlide === null || currentSlide < 2) return
    slideImages[currentSlide - 2]?.scrollIntoView()
    if (slideImages[currentSlide - 3]) {
        currentSlide--
    }
}

function nextSlide(): void {
    if (currentSlide === null || currentSlide >= slideImages.length) return
    slideImages[currentSlide]?.scrollIntoView()
    if (slideImages[currentSlide + 1]) {
        currentSlide++
    }
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    e.preventDefault()
    if (e.repeat) return
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
        nextSlide()
    } else if (e.keyCode === 38 || e.keyCode === 37) {
        previousSlide()
    }
})

presentation.addEventListener('mouseup', (e: MouseEvent) => {
    e.preventDefault()
    if (e.button === 0) {
        nextSlide()
    }
})

presentation.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault()
    previousSlide()
})
