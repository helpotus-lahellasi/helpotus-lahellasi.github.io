import { App } from './app/index.js'
import { createPart } from './util/index.js'
import { LOCATION_REFRESH_TIME } from './config.js'

async function test() {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

    const location = await App.fetchLocation()

    const app = new App({ location })

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

        const closest = app.getClosestRestroom()
        app.showRouteToRestroom(closest.id)
    } else {
        const container = document.createElement('div')
        const resultsTarget = document.querySelector('.app-restroom-info')
        container.className = 'info-container'
        container.appendChild(createPart({ heading: 'Lähialueeltasi ei löydy vessoja!' }))
        resultsTarget.appendChild(container)
    }

    setInterval(() => {
        app.updateApp()
    }, LOCATION_REFRESH_TIME)

    app.updateApp()

    // window.app = app
    // window.App = App

    document.querySelector('#focususer').addEventListener('click', () => {
        app.setViewUserLocation()
    })

    document.querySelector('#focusroute').addEventListener('click', () => {
        app.fitMapToLocations(app.location, app.selectedRestroom.location)
    })

    document.querySelector('#routenearest').addEventListener('click', () => {
        app.showRouteToRestroom(app.getClosestRestroom().id)
    })

    document.getElementById('loading-spinner').classList.add('hidden')
}

test()
