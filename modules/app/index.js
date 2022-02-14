import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import Polyline from '../../vendor/polyline/index.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { setRouteInfoElement } from '../layout/routeInfo.js'
import { setRestroomElement } from '../layout/restroomInfo.js'
import { getHSLRoute } from '../api/hsl/routing.js'
import { getStreetName } from '../tests/streetNameFromPosition.js'
import { getCurrentLocation } from '../location/index.js'
import { icons } from '../map/markers.js'
import { clearElement } from '../util/index.js'
import { LOCATION_EXPIRATION_TIME, RESTROOM_EXPIRATION_TIME } from '../config.js'

export class App {
    constructor({ location: { lat, lon } }) {
        if (!document.getElementById('map')) throw new Error('Page does not have an element with the id of "map"')
        this.map
        this.locationMarker
        this.selectedRestroom
        this.routePolyline

        this.routes = new Map()
        this.restrooms = new Map()

        this.visible = false

        this.location = { lat, lon }
        App.setStoredLocation(this.location)

        this.restroomLayerGroup = L.layerGroup()
    }

    setVisible() {
        this.visible = true
        this.map = L.map('map').setView(this.location, 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map)
        this.locationMarker = L.marker(this.location, { icon: icons.red })
            .bindPopup(`Olet tässä`)
            .openPopup(this.map)
            .addTo(this.map)

        this.showAllCurrent()
    }

    static pointBetween(a, b) {
        return {
            lat: (a.lat + b.lat) / 2,
            lon: (a.lon + b.lon) / 2
        }
    }

    static distanceBetween(a, b) {
        return Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2))
    }

    static locationsEqual(a, b) {
        if (a.lat === b.lat && b.lon === a.lon) {
            return true
        }
        return false
    }

    static async fetchLocation() {
        const locationObject = await getCurrentLocation()
        return await {
            lat: locationObject.coords.latitude,
            lon: locationObject.coords.longitude
        }
    }

    static async fetchRestroomsFromLocation(location) {
        return await getRestrooms(location)
    }

    static setStoredLocation(location) {
        sessionStorage.setItem('restroom-app-location', JSON.stringify({ value: location, modified: Date.now() }))
    }
    static setStoredRestrooms(restrooms) {
        if (Array.isArray(restrooms)) {
            sessionStorage.setItem('restroom-app-restrooms', JSON.stringify({ value: restrooms, modified: Date.now() }))
        } else {
            sessionStorage.setItem(
                'restroom-app-restrooms',
                JSON.stringify({ value: [...restrooms.values()], modified: Date.now() })
            )
        }
    }
    static getStoredLocation() {
        const location = JSON.parse(sessionStorage.getItem('restroom-app-location'))
        const isInvalid =
            !location ||
            !location.value ||
            !location.value.lat ||
            !location.value.lon ||
            location.modified < Date.now() - LOCATION_EXPIRATION_TIME

        if (isInvalid) return null

        return location.value
    }
    static getStoredRestrooms() {
        const restrooms = JSON.parse(sessionStorage.getItem('restroom-app-restrooms'))
        const isInvalid =
            !restrooms || !Array.isArray(restrooms.value) || location.modified < Date.now() - RESTROOM_EXPIRATION_TIME

        if (isInvalid) return null

        return restrooms.value
    }

    async updateApp() {
        console.info('updating app')
        const location = await App.fetchLocation()
        const latDelta = Math.abs(location.lat - this.location.lat)
        const lonDelta = Math.abs(location.lon - this.location.lon)
        if (latDelta < 0.0001 && lonDelta < 0.0001) return console.info('rejected update - too minor change')
        const restrooms = await App.fetchRestroomsFromLocation(location)

        this.location = location
        App.setStoredLocation(location)

        this.addRestrooms(restrooms)

        if (!this.visible) return

        this.showAllCurrent()

        console.info('app update finished')
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

        if (!updatedRoute) {
            if (this.routePolyline) this.map.removeLayer(this.routePolyline)

            return
        }

        this.routes.set(id, {
            from: this.location,
            value: updatedRoute
        })

        return updatedRoute
    }

    showLocation(location) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        const newLatLng = new L.LatLng(location.lat, location.lon)
        this.locationMarker.setLatLng(newLatLng)
    }

    async showRouteToRestroom(id) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        let restroom = this.restrooms.get(id)

        if (!restroom.streetName) {
            restroom = {
                ...restroom,
                streetName: await getStreetName(restroom.location.lat, restroom.location.lon)
            }
            this.restrooms.set(id, restroom)
        }
        const bounds = L.latLngBounds(this.location, restroom.location)
        this.map.fitBounds(bounds)

        setRestroomElement(document.querySelector('.app-restroom-info'), restroom)
        const route = await this.getRoute(id)
        if (!route) {
            clearElement(document.querySelector('.app-route-info'))
            this.selectedRestroom = restroom
            return
        }
        setRouteInfoElement(document.querySelector('.app-route-info'), route)

        this.selectedRestroom = restroom

        for (const leg of route.legs) {
            const points = leg.legGeometry.points
            const decoded = Polyline.decode(points)

            if (this.routePolyline) {
                this.map.removeLayer(this.routePolyline)
            }

            this.routePolyline = L.polyline(decoded)
                .setStyle({
                    color: 'blue'
                })
                .addTo(this.map)
        }
        return route
    }

    showRestrooms(restrooms) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        this.restroomLayerGroup.clearLayers()
        for (const restroom of restrooms.values()) {
            const marker = L.marker(restroom.location)
                .addTo(this.map)
                .on('click', () => this.showRouteToRestroom(restroom.id))
            this.restroomLayerGroup.addLayer(marker)
        }
        this.restroomLayerGroup.addTo(this.map)
    }

    showAllCurrent() {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        this.showRestrooms(this.restrooms)
        this.showLocation(this.location)
        if (this.selectedRestroom) {
            this.showRouteToRestroom(this.selectedRestroom.id)
        }
    }

    addRestrooms(restrooms) {
        for (const restroom of restrooms) {
            if (this.restrooms.has(restroom.id)) continue
            this.restrooms.set(restroom.id, {
                ...restroom,
                distance: {
                    from: this.location,
                    value: App.distanceBetween(this.location, restroom.location)
                }
            })
        }
        App.setStoredRestrooms(this.restrooms)
        if (this.visible) {
            this.showRestrooms(this.restrooms)
        }
    }

    getDistanceToRestroom(id) {
        const restroom = this.restrooms.get(id)
        if (!restroom) throw new Error('Restroom was not stored in memory')
        if (App.locationsEqual(restroom.distance.from, this.location)) {
            return restroom.distance.value
        }

        const updatedRestroom = {
            ...restroom,
            distance: {
                from: this.location,
                value: App.distanceBetween(this.location, restroom.location)
            }
        }
        this.restrooms.set(id, updatedRestroom)
        return updatedRestroom.distance.value
    }

    getClosestRestroom() {
        let closestRestroom
        let closestDistance

        this.restrooms.forEach((restroom) => {
            const restroomDistance = this.getDistanceToRestroom(restroom.id)
            if (!closestRestroom || restroomDistance < closestDistance) {
                closestRestroom = restroom
                closestDistance = restroomDistance
                return
            }
        })

        return closestRestroom
    }

    setViewUserLocation() {
        this.map.setView(this.location, 13);
    }

    fitMapToLocations(a, b) {
        if (!a || !b) {
            this.setViewUserLocation()
            return
        }
        const bounds = L.latLngBounds(a, b)
        this.map.fitBounds(bounds)
    }
}