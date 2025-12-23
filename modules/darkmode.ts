//Darkmode toggle for website

let darkModeState = localStorage.getItem('dark-mode') ?? window.matchMedia('(prefers-color-scheme: dark)').matches // get current darkmode state from local storage or from browser selection

const button = document.getElementById('dark-mode-button') // get dark-mode toggle button from website

function toggleDarkMode(state) {
    if (state) {
        document.firstElementChild.setAttribute('color-scheme', 'dark') // if state is true change site to use darkmode css
    } else {
        document.firstElementChild.setAttribute('color-scheme', 'light') // if state is false change site to use lightmode css
    }

    darkModeState = state
}

function setDarkModeLocalStorage(state) {
    localStorage.setItem('dark-mode', state) // save darkmode state (true/false) to local storage with 'dark-mode' key
}

if (localStorage.getItem('dark-mode') !== null) {
    toggleDarkMode(localStorage.getItem('dark-mode') === 'true')
}

button.addEventListener('click', () => {
    // event listener for button click
    darkModeState = !darkModeState

    toggleDarkMode(darkModeState)
    setDarkModeLocalStorage(darkModeState)
})
