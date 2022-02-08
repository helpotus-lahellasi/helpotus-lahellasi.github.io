import { App } from '../app/index.js'
import { fakeAppTypeLocation, fakeRestrooms } from '../util/fakedata.js'

async function test() {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')
    const location = await App.fetchLocation()
    // const location = fakeAppTypeLocation
    const restrooms = await App.fetchRestroomsFromLocation(location)
    // const restrooms = fakeRestrooms

    document.getElementById('loading-spinner').classList.add('hidden')

    const app = new App({ location })
    app.addRestrooms(restrooms)
    app.setVisible()

    const closest = app.getClosestRestroom()
    app.showRouteToRestroom(closest.id)

    // Update app every 35 seconds
    setInterval(() => {
        app.updateApp()
    }, 1000 * 35)

    window.app = app
    window.App = App
}

test()
