const acceptedHostnames = ['helpotus-lahellasi.github.io']

if ('serviceWorker' in navigator /*&& acceptedHostnames.includes(location.hostname)*/) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('ServiceWorker registered succesfully with scope: ', registration.scope)
        } catch (e) {
            console.log('ServiceWorker registration failed: ', e)
        }
    })
}
