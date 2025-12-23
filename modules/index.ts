import { App } from './app/index'
import { createPart, readSearchParams } from './util/index'
import { LOCATION_REFRESH_TIME } from './config'
import { setRestroomAmountElement } from './layout/restroomamount'
import { createSearchUrl } from './util/index'

// Functionality for the map (sovellus.html)
;(async function () {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

    // Read the possible data from page url
    const searchParams = readSearchParams()
    const paramRestroom = searchParams.restroom

    let location
    let usingParamLocation = false
    let updatingLoopOn = false

    // If page url contains location to use, use that instead of current user location
    if (searchParams.from && searchParams.from.lat && searchParams.from.lon) {
        location = searchParams.from
        usingParamLocation = true
    } else {
        location = await App.fetchLocation()
    }

    // Create App that serves as a great abstraction over API calls and such
    const app = new App({ location, restroom: searchParams.restroom })

    // Detect and handle hen the data in App changes
    // Update the "copy url" value by new app data
    app.addEventListener('informationChange', (e) => {
        const eventApp = e.currentTarget
        window.eventApp = eventApp
        if (!eventApp || !eventApp.selectedRestroom) return
        document.querySelector('footer').classList.remove('hidden')

        document.querySelector('#copy-url-input').value = createSearchUrl(eventApp.location, eventApp.selectedRestroom)
    })

    // Start searching location and restroom for updates
    function startUpdateLoop() {
        // Ignore the function call if the loop is already on
        if (updatingLoopOn) return
        updatingLoopOn = true
        setInterval(() => {
            console.log('new loop iteration')
            app.updateApp()
        }, LOCATION_REFRESH_TIME)
    }

    // Center map on user
    document.querySelector('#focususer').addEventListener('click', () => {
        app.setViewUserLocation()
    })

    // Center map between user and selected restroom
    document.querySelector('#focusroute').addEventListener('click', () => {
        app.fitMapToLocations(app.location, app.selectedRestroom.location)
    })

    // Get route to the nearest restroom
    document.querySelector('#routenearest').addEventListener('click', () => {
        app.showRouteToRestroom(app.getClosestRestroom().id)
    })

    // Manually update the user location
    document.querySelector('#updatelocation').addEventListener('click', async () => {
        if (!startUpdateLoop) {
            startUpdateLoop()
        }
        document.getElementById('loading-spinner').classList.toggle('hidden', false)
        app.setViewUserLocation()
        await app.updateApp()
        document.getElementById('loading-spinner').classList.toggle('hidden', true)
    })

    // Copy shareable url to clipboard
    document.querySelector('#copy-url-button').addEventListener('click', () => {
        navigator.clipboard
            .writeText(document.querySelector('#copy-url-input').value)
            .then(() => {
                console.log('Text copied to clipboard...')
            })
            .catch((err) => {
                console.log('Something went wrong', err)
            })
    })

    app.setVisible()

    let restrooms

    // Get restrooms from cache or new request based on current location
    const cachedRestrooms = App.getStoredRestrooms()
    if (cachedRestrooms) {
        restrooms = cachedRestrooms
    } else {
        restrooms = await App.fetchRestroomsFromLocation(location)
    }

    // Put restrooms into the app
    if (restrooms && restrooms.length > 0) {
        app.addRestrooms(restrooms)
        if (!paramRestroom) {
            const closest = app.getClosestRestroom()
            app.showRouteToRestroom(closest.id)
        }
    } else {
        const container = document.createElement('div')
        const resultsTarget = document.querySelector('.app-restroom-info')
        container.className = 'info-container'
        container.appendChild(createPart({ heading: 'Lähialueeltasi ei löydy vessoja!' }))
        resultsTarget.appendChild(container)
    }

    // Show how many restrooms were found around the location
    setRestroomAmountElement(document.querySelector('.restroom-amount-info'), restrooms.length)

    // Automatically start using the app updating loop if there is no data in the url
    if (!usingParamLocation) {
        startUpdateLoop()
    }

    // Handle visibilites after the initialization is complete
    document.getElementById('updatelocation').classList.remove('hidden')
    document.getElementById('loading-spinner').classList.add('hidden')
})()
