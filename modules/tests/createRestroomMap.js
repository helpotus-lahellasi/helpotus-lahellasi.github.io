import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { getCurrentLocation } from '../location/index.js'
import { getMap } from '../map/index.js'
import { getStreetName } from '../tests/streetNameFromPosition.js'
import { icons } from '../map/markers.js'

// Creates a map around the device location



async function test() {
    console.info('fetching location')
    const location = await getCurrentLocation()
    console.info('creating map')
    const map = getMap({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.info('fetching restrooms')
    const restrooms = await getRestrooms({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.info('outputting restrooms with restroom length of', restrooms.length)
    console.info(restrooms)
    for (const restroom of restrooms) {
        L.marker(restroom.location)
            //            .bindPopup(`${await getStreetName(restroom.location.lat, restroom.location.lon)}`)
            .openPopup()
            .addTo(map)
    }
    L.marker({ lat: location.coords.latitude, lon: location.coords.longitude }, { icon: icons.red })
        //        .bindPopup(`Olet tässä: <br> ${await getStreetName(location.coords.latitude, location.coords.longitude)}`)
        .openPopup()
        .addTo(map) // punaisen markkerin lisäys käyttäjän sijainnin kohdalle
}
test()