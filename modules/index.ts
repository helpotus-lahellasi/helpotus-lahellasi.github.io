import { App } from './app/index'
import { createPart, readSearchParams } from './util/index'
import { LOCATION_REFRESH_TIME } from './config'
import { setRestroomAmountElement } from './layout/restroomamount'
import { createSearchUrl } from './util/index'
import { Coordinates } from './types'

// Functionality for the map (sovellus.html)
;(async function () {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

    // Read the possible data from page url
    const searchParams = readSearchParams()
    const paramRestroom = searchParams.restroom

    let location: Coordinates
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

    // Detect and handle when the data in App changes
    // Update the "copy url" value by new app data
    app.addEventListener('informationChange', (e) => {
        const eventApp = e.currentTarget as App
        if (!eventApp || !eventApp.selectedRestroom) return
        const footer = document.querySelector('footer')
        const copyUrlInput = document.querySelector<HTMLInputElement>('#copy-url-input')
        if (footer) {
            footer.classList.remove('hidden')
        }
        if (copyUrlInput) {
            copyUrlInput.value = createSearchUrl(eventApp.location, eventApp.selectedRestroom)
        }
    })

    // Start searching location and restroom for updates
    function startUpdateLoop(): void {
        // Ignore the function call if the loop is already on
        if (updatingLoopOn) return
        updatingLoopOn = true
        setInterval(() => {
            console.log('new loop iteration')
            app.updateApp()
        }, LOCATION_REFRESH_TIME)
    }

    // Center map on user
    const focusUserBtn = document.querySelector('#focususer')
    if (focusUserBtn) {
        focusUserBtn.addEventListener('click', () => {
            app.setViewUserLocation()
        })
    }

    // Center map between user and selected restroom
    const focusRouteBtn = document.querySelector('#focusroute')
    if (focusRouteBtn) {
        focusRouteBtn.addEventListener('click', () => {
            if (app.selectedRestroom) {
                app.fitMapToLocations(app.location, app.selectedRestroom.location)
            }
        })
    }

    // Get route to the nearest restroom
    const routeNearestBtn = document.querySelector('#routenearest')
    if (routeNearestBtn) {
        routeNearestBtn.addEventListener('click', () => {
            const closest = app.getClosestRestroom()
            if (closest) {
                app.showRouteToRestroom(closest.id)
            }
        })
    }

    // Manually update the user location
    const updateLocationBtn = document.querySelector('#updatelocation')
    if (updateLocationBtn) {
        updateLocationBtn.addEventListener('click', async () => {
            if (!updatingLoopOn) {
                startUpdateLoop()
            }
            const loadingSpinner = document.getElementById('loading-spinner')
            if (loadingSpinner) {
                loadingSpinner.classList.toggle('hidden', false)
            }
            app.setViewUserLocation()
            await app.updateApp()
            if (loadingSpinner) {
                loadingSpinner.classList.toggle('hidden', true)
            }
        })
    }

    // Copy shareable url to clipboard
    const copyUrlButton = document.querySelector('#copy-url-button')
    if (copyUrlButton) {
        copyUrlButton.addEventListener('click', () => {
            const copyUrlInput = document.querySelector<HTMLInputElement>('#copy-url-input')
            if (copyUrlInput) {
                navigator.clipboard
                    .writeText(copyUrlInput.value)
                    .then(() => {
                        console.log('Text copied to clipboard...')
                    })
                    .catch((err) => {
                        console.log('Something went wrong', err)
                    })
            }
        })
    }

    app.setVisible()

    // Get restrooms from cache or new request based on current location
    const cachedRestrooms = App.getStoredRestrooms()
    const restrooms = cachedRestrooms || (await App.fetchRestroomsFromLocation(location))

    // Put restrooms into the app
    if (restrooms && restrooms.length > 0) {
        app.addRestrooms(restrooms)
        if (!paramRestroom) {
            const closest = app.getClosestRestroom()
            if (closest) {
                app.showRouteToRestroom(closest.id)
            }
        }
    } else {
        const container = document.createElement('div')
        const resultsTarget = document.querySelector<HTMLElement>('.app-restroom-info')
        container.className = 'info-container'
        container.appendChild(createPart({ heading: 'Lähialueeltasi ei löydy vessoja!' }))
        if (resultsTarget) {
            resultsTarget.appendChild(container)
        }
    }

    // Show how many restrooms were found around the location
    const restroomAmountInfo = document.querySelector<HTMLElement>('.restroom-amount-info')
    if (restroomAmountInfo) {
        setRestroomAmountElement(restroomAmountInfo, restrooms.length)
    }

    // Automatically start using the app updating loop if there is no data in the url
    if (!usingParamLocation) {
        startUpdateLoop()
    }

    // Handle visibilities after the initialization is complete
    const updateLocationEl = document.getElementById('updatelocation')
    const loadingSpinnerEl = document.getElementById('loading-spinner')
    if (updateLocationEl) {
        updateLocationEl.classList.remove('hidden')
    }
    if (loadingSpinnerEl) {
        loadingSpinnerEl.classList.add('hidden')
    }
})()
