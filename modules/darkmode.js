let darkModeState = localStorage.getItem('dark-mode') ?? window.matchMedia('(prefers-color-scheme: dark)').matches

const button = document.getElementById('dark-mode-button')

function toggleDarkMode(state) {
    if (state) {
        document.firstElementChild.setAttribute('color-scheme', 'dark')
    } else {
        document.firstElementChild.setAttribute('color-scheme', 'light')
    }

    darkModeState = state
}

function setDarkModeLocalStorage(state) {
    localStorage.setItem('dark-mode', state)
}

if (localStorage.getItem('dark-mode') !== null) {
    toggleDarkMode(localStorage.getItem('dark-mode') === 'true')
}

button.addEventListener('click', () => {
    darkModeState = !darkModeState

    toggleDarkMode(darkModeState)
    setDarkModeLocalStorage(darkModeState)
})
