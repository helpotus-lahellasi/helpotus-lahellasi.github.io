import { App } from './app/index.js'

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