import { App } from './app/index.js'
import { createPart, readSearchParams } from './util/index.js'
import { LOCATION_REFRESH_TIME } from './config.js'
import { setRestroomAmountElement } from './layout/restroomamount.js'
;(async function () {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

    const searchParams = readSearchParams()

    const paramRestroom = searchParams.restroom

    let location
    let usingParamLocation = false
    let updatingLoopOn = false

    if (searchParams.from && searchParams.from.lat && searchParams.from.lon) {
        location = searchParams.from
        usingParamLocation = true
    } else {
        location = await App.fetchLocation()
    }

    const app = new App({ location, restroom: searchParams.restroom })

    function startUpdateLoop() {
        console.log('in updateloop')
        if (updatingLoopOn) return
        console.log('started loop')
        updatingLoopOn = true
        setInterval(() => {
            console.log('new loop iteration')
            app.updateApp()
        }, LOCATION_REFRESH_TIME)
    }

    document.querySelector('#focususer').addEventListener('click', () => {
        app.setViewUserLocation()
    })

    document.querySelector('#focusroute').addEventListener('click', () => {
        app.fitMapToLocations(app.location, app.selectedRestroom.location)
    })

    document.querySelector('#routenearest').addEventListener('click', () => {
        app.showRouteToRestroom(app.getClosestRestroom().id)
    })

    document.querySelector('#updatelocation').addEventListener('click', async () => {
        if (!startUpdateLoop) {
            startUpdateLoop()
        }
        document.getElementById('loading-spinner').classList.toggle('hidden', false)
        app.setViewUserLocation()
        await app.updateApp()
        document.getElementById('loading-spinner').classList.toggle('hidden', true)
    })

    app.setVisible()

    let restrooms

    const cachedRestrooms = App.getStoredRestrooms()
    if (cachedRestrooms) {
        restrooms = cachedRestrooms
    } else {
        restrooms = await App.fetchRestroomsFromLocation(location)
    }

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

    setRestroomAmountElement(document.querySelector('.restroom-amount-info'), restrooms.length)

    if (!usingParamLocation) {
        startUpdateLoop()
    }

    document.getElementById('loading-spinner').classList.add('hidden')
})()
