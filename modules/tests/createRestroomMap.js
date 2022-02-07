import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { getCurrentLocation } from '../location/index.js'
import { getMap } from '../map/index.js'

// Creates a map around the device location

async function test() {
    console.log('fetching location')
    const location = await getCurrentLocation()
    console.log('creating map')
    const map = getMap({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.log('fetching restrooms')
    const restrooms = await getRestrooms({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.log('outputting restrooms with restroom length of', restrooms.length)
    restrooms.forEach((restroom) => {
        if (!restroom.lat || !restroom.lon) return
        L.marker({ lat: restroom.lat, lon: restroom.lon }).addTo(map)
    })
}

test()
