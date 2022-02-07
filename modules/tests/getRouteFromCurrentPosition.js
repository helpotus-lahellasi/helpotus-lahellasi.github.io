import { getCurrentLocation } from '../location/index.js'
import { getRoute } from '../api/hsl/routing.js'

// Outputs HSL route from current location to Lauttasaari

getCurrentLocation()
    .then((position) =>
        getRoute({
            from: { lat: position.coords.latitude, lon: position.coords.longitude },
            to: { lat: 60.1884, lon: 25.00744 }
        })
    )
    .then((route) => console.log(route))
