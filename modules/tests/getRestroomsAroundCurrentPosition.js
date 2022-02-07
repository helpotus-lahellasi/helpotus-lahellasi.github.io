import { getCurrentLocation } from '../location/index.js'
import { getRestrooms } from '../api/osm/restrooms.js'

// Outputs HSL route from current location to Lauttasaari

getCurrentLocation()
    .then((location) => getRestrooms({ lat: location.coords.latitude, lon: location.coords.longitude }))
    .then((restrooms) => console.info(restrooms))
