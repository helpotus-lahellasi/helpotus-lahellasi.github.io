import { summonPopup } from './layout/popup'

const acceptedHostnames = ['helpotus-lahellasi.github.io']

// Only use service workers in "production"
if ('serviceWorker' in navigator && acceptedHostnames.includes(location.hostname)) {
    window.addEventListener('load', () => work())
}

// Inform the new worker to skip waiting
async function useNewestWorker(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration || !registration.waiting) return
    registration.waiting.postMessage('skipWaiting')
}

function promptOfUpdate(): void {
    const body = document.querySelector('body')
    if (!body) return

    summonPopup({
        heading: 'Päivitys havaittu',
        text: 'Asenna uusin versio',
        target: body,
        infinite: true,
        onAccept: () => useNewestWorker(),
        acceptText: 'Asenna',
        cancelText: 'Hylkää',
    })
}

async function work(): Promise<void> {
    console.log('Working big time to make the service worker work')
    navigator.serviceWorker.register('/sw.js')

    // If first time visiting the site, the controller will not be available
    const firstInstall = !navigator.serviceWorker.controller

    navigator.serviceWorker.addEventListener('controllerchange', async () => {
        // Controllerchange happens also during first install
        if (firstInstall) return
        location.reload()
    })

    if (firstInstall) return

    const registration = await navigator.serviceWorker.getRegistration()

    if (!registration) return

    if (registration.waiting) return promptOfUpdate()

    // Get the installing worker
    const installingWorker: ServiceWorker | null =
        registration.installing ||
        (await new Promise<ServiceWorker | null>((resolve) => {
            registration.addEventListener('updatefound', () => resolve(registration.installing), {
                once: true,
            })
        }))

    // Wait for new possible update to be installed
    if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') promptOfUpdate()
        })
    }
}
