import { App } from '../app/index.js'
import { getCurrentLocation } from '../location/index.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { fakeLocation, fakeRestrooms } from '../util/fakedata.js'

async function test() {
    if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')
        //    const location = await getCurrentLocation()
    const location = fakeLocation
        //    const restrooms = await getRestrooms({ lat: location.coords.latitude, lon: location.coords.longitude })
    const restrooms = fakeRestrooms

    document.getElementById('loading-spinner').classList.add('hidden')

    const app = new App({ location: { lat: location.coords.latitude, lon: location.coords.longitude }, restrooms })

    app.showRestrooms()

    const closest = app.findClosest()
    app.showRoute(closest.id)
}

test()