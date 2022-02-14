import { App } from '../app/index.js'

async function test() {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

    let location

    const cachedLocation = App.getStoredLocation()
    if (cachedLocation) {
        location = cachedLocation
    } else {
        location = await App.fetchLocation()
    }

    document.getElementById('loading-spinner').classList.add('hidden')
    const app = new App({ location })

    app.setVisible()

    let restrooms

    const cachedRestrooms = App.getStoredRestrooms()
    if (cachedRestrooms) {
        restrooms = cachedRestrooms
    } else {
        restrooms = await App.fetchRestroomsFromLocation(location)
    }

    app.addRestrooms(restrooms)

    const closest = app.getClosestRestroom()
    app.showRouteToRestroom(closest.id)

    // Update app every 35 seconds
    setInterval(() => {
        app.updateApp()
    }, 1000 * 35)

    app.updateApp()

    // window.app = app
    // window.App = App


    document.querySelector('#focususer').addEventListener('click', () => {
        app.setViewUserLocation();
    })

    document.querySelector('#focusroute').addEventListener('click', () => {
        app.fitMapToLocations(app.location, app.selectedRestroom.location)
    })

    document.querySelector('#routenearest').addEventListener('click', () => {
        app.getRoute(app.getClosestRestroom().id)
    })
}

test()