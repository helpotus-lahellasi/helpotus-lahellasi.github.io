import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import Polyline from '../../vendor/polyline/index.js'
import { setRouteInfoElement } from '../layout/routeInfo.js'
import { setRestroomElement } from '../layout/restroomInfo.js'
import { getHSLRoute } from '../api/hsl/routing.js'
import { getStreetName } from '../tests/streetNameFromPosition.js'
import { icons } from '../map/markers.js'


export class App {
    constructor({ location: { lat, lon }, restrooms }) {
        if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')

        this.location = { lat, lon }
        this.routes = new Map()
        this.restrooms = new Map()

        this.addRestrooms(restrooms)

        this.map = L.map('map').setView({ lat, lon }, 13)
        this.locationMarker = L.marker(this.location, { icon: icons.red })
            .bindPopup(`Olet tässä`)
            .openPopup(this.map)
            .addTo(this.map)
        this.currentRoute
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map)
    }

    static calculateDistance(a, b) {
        return Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2))
    }

    static locationsEqual(a, b) {
        if (a.lat === b.lat && b.lon === a.lon) {
            return true
        }
        return false
    }

    async getRoute(id) {
        const restroom = this.restrooms.get(id)
        if (!restroom) throw new Error('Restroom was not stored in memory')
        const storedRoute = this.routes.get(id)

        if (storedRoute && App.locationsEqual(storedRoute.from, this.location)) {
            return storedRoute.value
        }

        const updatedRoute = await getHSLRoute({
            from: this.location,
            to: restroom.location
        })

        this.routes.set(id, {
            from: this.location,
            value: updatedRoute
        })

        return updatedRoute
    }

    async showRoute(id) {
        let restroom = this.restrooms.get(id)

        if (!restroom.streetName) {
            restroom = {
                ...restroom,
                streetName: await getStreetName(restroom.location.lat, restroom.location.lon)
            }
            this.restrooms.set(id, restroom)
        }

        setRestroomElement(document.querySelector('.app-restroom-info'), restroom)
        const route = await this.getRoute(id)
        setRouteInfoElement(document.querySelector('.app-route-info'), route)

        for (const leg of route.legs) {
            const points = leg.legGeometry.points
            const decoded = Polyline.decode(points)

            if (this.currentRoute) {
                this.map.removeLayer(this.currentRoute)
            }
            this.currentRoute = L.polyline(decoded)
                .setStyle({
                    color: 'blue'
                })
                .addTo(this.map)
        }
        return route
    }

    showRestrooms() {
        for (const restroom of this.restrooms.values()) {
            const marker = L.marker(restroom.location).addTo(this.map)
            marker.on('click', () => this.showRoute(restroom.id))
        }
    }

    addRestrooms(restrooms) {
        for (const restroom of restrooms) {
            if (this.restrooms.has(restroom.id)) continue
            this.restrooms.set(restroom.id, {
                ...restroom,
                distance: {
                    from: this.location,
                    value: App.calculateDistance(this.location, restroom.location)
                }
            })
        }
    }

    findDistance(id) {
        const restroom = this.restrooms.get(id)
        if (!restroom) throw new Error('Restroom was not stored in memory')
        if (App.locationsEqual(restroom.distance.from, this.location)) {
            return restroom.distance.value
        }

        const updatedRestroom = {
            ...restroom,
            distance: {
                from: this.location,
                value: App.calculateDistance(this.location, restroom.location)
            }
        }
        this.restrooms.set(id, updatedRestroom)
        return updatedRestroom.distance.value
    }

    findClosest() {
        let closestRestroom
        let closestDistance

        this.restrooms.forEach((restroom) => {
            const restroomDistance = this.findDistance(restroom.id)
            if (!closestRestroom || restroomDistance < closestDistance) {
                closestRestroom = restroom
                closestDistance = restroomDistance
                return
            }
        })

        return closestRestroom
    }
}

// export async function appPollingFunction(app) {
//     const newLocation = await getCurrentLocation()
//     const lat = newLocation.coords.latitude
//     const lon = newLocation.coords.longitude
//     const latChange = Math.abs(lat - app.location.lat)
//     const lonChange = Math.abs(lon - app.location.lon)
//     if (latChange > 0.0001 || lonChange > 0.0001) {
//         console.log('updating')
//         app.updateLocation({ lat: newLocation.coords.latitude, lon: newLocation.coords.longitude })
//     } else {
//         console.log('change too litle')
//     }
// }