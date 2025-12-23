//Darkmode toggle for website

let darkModeState: boolean =
    localStorage.getItem('dark-mode') === 'true' ||
    (localStorage.getItem('dark-mode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches) // get current darkmode state from local storage or from browser selection

const button = document.getElementById('dark-mode-button') // get dark-mode toggle button from website

function toggleDarkMode(state: boolean): void {
    const root = document.firstElementChild
    if (!root) return

    if (state) {
        root.setAttribute('color-scheme', 'dark') // if state is true change site to use darkmode css
    } else {
        root.setAttribute('color-scheme', 'light') // if state is false change site to use lightmode css
    }

    darkModeState = state
}

function setDarkModeLocalStorage(state: boolean): void {
    localStorage.setItem('dark-mode', String(state)) // save darkmode state (true/false) to local storage with 'dark-mode' key
}

if (localStorage.getItem('dark-mode') !== null) {
    toggleDarkMode(localStorage.getItem('dark-mode') === 'true')
}

if (button) {
    button.addEventListener('click', () => {
        // event listener for button click
        darkModeState = !darkModeState

        toggleDarkMode(darkModeState)
        setDarkModeLocalStorage(darkModeState)
    })
}
