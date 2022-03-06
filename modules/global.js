const acceptedHostnames = ['helpotus-lahellasi.github.io']

if ('serviceWorker' in navigator && acceptedHostnames.includes(location.hostname)) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
            function (registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope)
            },
            function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err)
            }
        )
    })
}
