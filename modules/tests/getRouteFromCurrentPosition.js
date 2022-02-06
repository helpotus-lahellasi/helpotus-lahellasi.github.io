import { getCurrentPosition } from '../location/index.js'
import { fromTo } from '../api/hsl/routing.js'

// Outputs HSL route from current location to Lauttasaari

getCurrentPosition()
    .then((position) =>
        fromTo({
            from: { lat: position.coords.latitude, lon: position.coords.longitude },
            to: { lat: 60.1884, lon: 25.00744 }
        })
    )
    .then((graphQl) => console.log(graphQl))
