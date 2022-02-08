import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { getCurrentLocation } from '../location/index.js'
import { getMap } from '../map/index.js'
import { getStreetName } from '../tests/streetNameFromPosition.js'

// Creates a map around the device location

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

async function test() {
    console.info('fetching location')
    const location = await getCurrentLocation()
    console.info('creating map')
    const map = getMap({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.info('fetching restrooms')
    const restrooms = await getRestrooms({ lat: location.coords.latitude, lon: location.coords.longitude })
    console.log('outputting restrooms with restroom length of', restrooms.length)
    console.log(restrooms)
    for (const restroom of restrooms) {
        if (!restroom.lat || !restroom.lon) return
        L.marker({ lat: restroom.lat, lon: restroom.lon })
            .bindPopup(`${await getStreetName(restroom.lat, restroom.lon)}`)
            .openPopup()
            .addTo(map)
    }
    L.marker({ lat: location.coords.latitude, lon: location.coords.longitude }, { icon: redIcon })
        .bindPopup(`Olet tässä: <br> ${await getStreetName(location.coords.latitude, location.coords.longitude)}`)
        .openPopup()
        .addTo(map) // punaisen markkerin lisäys käyttäjän sijainnin kohdalle
}
test()
