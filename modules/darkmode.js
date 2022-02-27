let darkModeState = false

const button = document.querySelector('.dark-mode-button')

const useDark = window.matchMedia("(prefers-color-scheme: dark)")

function toggleDarkMode(state) {
    document.documentElement.classList.toggle('dark-mode', state)
    darkModeState = state
}

function setDarkModeLocalStorage(state) {
    localStorage.setItem('dark-mode', state)
}

toggleDarkMode(localStorage.getItem('dark-mode') == 'true')

useDark.addListener((evt) => toggleDarkMode(evt.matches))

button.addEventListener('click', () => {
    darkModeState = !darkModeState

    toggleDarkMode(darkModeState)
    setDarkModeLocalStorage(darkModeState)
})