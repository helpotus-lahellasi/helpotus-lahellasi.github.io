import { getCurrentLocation } from '../location/index.js'
import { getMap } from '../map/index.js'

// Creates a map around the device location

getCurrentLocation()
    .then((location) => getMap({ lat: location.coords.latitude, lon: location.coords.longitude }))
    .then((map) => console.info(map))
