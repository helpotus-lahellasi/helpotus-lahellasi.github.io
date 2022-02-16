import * as L from '../../vendor/leaflet/leaflet-src.esm.js'
import Polyline from '../../vendor/polyline/index.js'
import { getRestrooms } from '../api/osm/restrooms.js'
import { getOrsRoute } from '../api/osm/routing.js'
import { setRouteInfoElement } from '../layout/routeInfo.js'
import { setRestroomElement } from '../layout/restroomInfo.js'
import { getHSLRoute } from '../api/hsl/routing.js'
import { getStreetName } from '../api/routereverse/streetNameFromPosition.js'
import { getCurrentLocation } from '../location/index.js'
import { icons } from '../map/markers.js'
import { clearElement } from '../util/index.js'
import { LOCATION_EXPIRATION_TIME, RESTROOM_EXPIRATION_TIME, SEARCH_EXPIRATION_TIME } from '../config.js'
import { getSearch } from '../api/osm/search.js'

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 * @typedef {Object} Tag
 * @property {string} heading
 * @property {string} text
 */

/**
 * @typedef {Object} Restroom
 * @property {number} id
 * @property {Date} timestamp
 * @property {Coordinates} location
 * @property {Tag[]} tags
 */

/**
 * @typedef {Object} AppOptions
 * @property {Coordinates} location Location to initiate the app with
 */

// Class for combining app functionality
export class App {
    /**
     *
     * @param {AppOptions} options
     */
    constructor(options) {
        this.map = null
        this.locationMarker = null
        this.selectedRestroom = null
        this.routePolyline = null
        this.restroomLayerGroup = null

        this.routes = new Map()
        this.restrooms = new Map()
        this.searches = new Map()

        this.visible = false

        if (options && options.location) {
            this.location = options.location
            App.setStoredLocation(this.location)
        }

        this.restroomLayerGroup = L.layerGroup()
    }

    /**
     * Set the current app visible instance visible
     *
     * This method has to be called before using any functionality that requires the leaflet map
     */
    setVisible() {
        this.visible = true
        this.map = L.map('map').setView(this.location, 14)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map)
        this.locationMarker = L.marker(this.location, { icon: icons.black })
            .bindPopup(`Olet tässä`)
            .openPopup(this.map)
            .addTo(this.map)

        this.showAllCurrent()
    }

    /**
     *
     * @param {Coordinates} a
     * @param {Coordinates} b
     * @returns {Coordinates} location between the two given coordinates
     */
    static pointBetween(a, b) {
        return {
            lat: (a.lat + b.lat) / 2,
            lon: (a.lon + b.lon) / 2,
        }
    }

    /**
     *
     * @param {Coordinates} a
     * @param {Coordinates} b
     * @returns {number} distance between the coordinates
     */
    static distanceBetween(a, b) {
        return Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2))
    }

    /**
     * Check if locations equal
     * @param {Coordinates} a
     * @param {Coordinates} b
     * @returns {boolean}
     */
    static locationsEqual(a, b) {
        if (a.lat === b.lat && b.lon === a.lon) {
            return true
        }
        return false
    }

    /**
     * Fetches the current user location
     * @returns {Coordinates}
     */
    static async fetchLocation() {
        const locationObject = await getCurrentLocation()
        return await {
            lat: locationObject.coords.latitude,
            lon: locationObject.coords.longitude,
        }
    }

    /**
     * Fetches restrooms around location
     * @param {Coordinates} location
     * @returns {Restroom[]}
     */
    static async fetchRestroomsFromLocation(location) {
        return await getRestrooms(location)
    }

    /**
     * Store location into session storage
     * @param {Coordinates} location
     */
    static setStoredLocation(location) {
        sessionStorage.setItem('restroom-app-location', JSON.stringify({ value: location, modified: Date.now() }))
    }

    /**
     * Set restrooms into session storage
     * @param {Restrooms[]|Map<number,Restroom>} restrooms
     */
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

    /**
     * Store location into session storage
     * @param {Coordinates} location
     */
    static setStoredSearches(searches) {
        sessionStorage.setItem('restroom-app-searches', JSON.stringify({ value: searches, modified: Date.now() }))
    }

    /**
     *  Get location from session storage
     * @returns {Coordinates} location
     */
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

    /**
     * Get restrooms from session storage
     * @returns {Restroom[]}
     */
    static getStoredRestrooms() {
        const restrooms = JSON.parse(sessionStorage.getItem('restroom-app-restrooms'))
        const isInvalid =
            !restrooms || !Array.isArray(restrooms.value) || location.modified < Date.now() - RESTROOM_EXPIRATION_TIME

        if (isInvalid) return null

        return restrooms.value
    }

    /**
     * Get restrooms from session storage
     * @returns {Restroom[]}
     */
    static getStoredSearches() {
        const searches = JSON.parse(sessionStorage.getItem('restroom-app-searches'))
        const isInvalid =
            !searches || !Array.isArray(searches.value) || searches.modified < Date.now() - SEARCH_EXPIRATION_TIME

        if (isInvalid) return null

        return searches.value
    }

    /**
     * Update app
     * updates location, restrooms, and visible map
     * @returns {void}
     */
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

    /**
     * Fetches a route between two locations
     * @param {Coordinates} a
     * @param {Coordinates} b
     * @returns {HSLRoute|ORSRoute|null}
     */
    static async getRouteBetweenLocations(a, b) {
        if (!a || !b) return null
        return (
            (await getHSLRoute({
                from: a,
                to: b,
            })) || (await getOrsRoute({ from: a, to: b }))
        )
    }

    /**
     * Get searchresults from string
     * @param {string} text
     * @returns {SearchResult[]|null}
     */
    async getSearchResult(text) {
        const query = text.toLowerCase()
        const storedSearch = this.searches.get(query)
        if (storedSearch) {
            return storedSearch
        }

        const updatedSearch = await getSearch(text)
        if (!updatedSearch) return null

        const searchWithQuery = { results: updatedSearch, query: query }
        this.addSearches([searchWithQuery])
        App.setStoredSearches([...this.searches.values()])

        return searchWithQuery
    }

    /**
     * Get and display route to given restroom
     * @param {number} id
     * @returns {HSLRoute|ORSRoute|null}
     */
    async getRoute(id) {
        const restroom = this.restrooms.get(id)
        if (!restroom) throw new Error('Restroom was not stored in memory')
        const storedRoute = this.routes.get(id)
        if (storedRoute && App.locationsEqual(storedRoute.from, this.location)) {
            return storedRoute.value
        }

        const updatedRoute =
            (await getHSLRoute({
                from: this.location,
                to: restroom.location,
            })) || (await getOrsRoute({ from: this.location, to: restroom.location }))

        if (!updatedRoute) {
            this.map.removeLayer(this.routePolyline)
            return null
        }

        this.routes.set(id, {
            from: this.location,
            value: updatedRoute,
        })

        return updatedRoute
    }

    /**
     * Display location on map
     * @param {Coordinates} location
     * @returns {void}
     */
    showLocation(location) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        const newLatLng = new L.LatLng(location.lat, location.lon)
        this.locationMarker.setLatLng(newLatLng)
    }

    /**
     * Show route to restroom
     * @param {number} id
     * @returns {HSLRoute|ORSRoute|void}
     */
    async showRouteToRestroom(id) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        let restroom = this.restrooms.get(id)

        if (!restroom.streetName) {
            restroom = {
                ...restroom,
                streetName: await getStreetName(restroom.location.lat, restroom.location.lon),
            }
            this.restrooms.set(id, restroom)
        }

        this.fitMapToLocations(this.location, restroom.location)

        setRestroomElement(document.querySelector('.app-restroom-info'), restroom)
        const route = await this.getRoute(id)

        if (!route) {
            clearElement(document.querySelector('.app-route-info'))
            this.selectedRestroom = restroom
            return
        }

        setRouteInfoElement(document.querySelector('.app-route-info'), route)

        this.selectedRestroom = restroom

        if (this.routePolyline) {
            console.log()
            this.map.removeLayer(this.routePolyline)
        }

        if (route.type === 'ors') {
            const points = route.data.geometry.coordinates

            this.routePolyline = L.polyline(points)
                .setStyle({
                    color: 'blue',
                })
                .addTo(this.map)
        } else if (route.type === 'hsl') {
            for (const leg of route.data.legs) {
                const points = leg.legGeometry.points
                const decoded = Polyline.decode(points)

                this.routePolyline = L.polyline(decoded)
                    .setStyle({
                        color: 'blue',
                    })
                    .addTo(this.map)
            }
        }
        return route
    }

    /**
     * Display restroom on map
     * @param {Map<number,Restroom>} restrooms
     * @returns {void}
     */
    showRestrooms(restrooms) {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        this.restroomLayerGroup.clearLayers()
        for (const restroom of restrooms.values()) {
            const fee = restroom.tags.find((tag) => tag.heading.toLowerCase() === 'maksu:')

            if (!restrooms || restrooms.length === 0) {
                const container = document.createElement('div')
                container.className = 'info-container'
                container.appendChild(createPart({ heading: 'Hakemaltasi alueelta ei löytynyt vessoja!' }))
                resultsTarget.appendChild(container)
                return
            }

            let icon

            if (!fee || !fee.text) {
                icon = icons.gold
            } else if (fee.text.toLowerCase() === 'kyllä') {
                icon = icons.red
            } else if (fee.text.toLowerCase() === 'ei') {
                icon = icons.green
            } else {
                icon = icons.gold
            }

            const marker = L.marker(restroom.location, { icon })
                .addTo(this.map)
                .on('click', () => this.showRouteToRestroom(restroom.id))
            this.restroomLayerGroup.addLayer(marker)
        }
        this.restroomLayerGroup.addTo(this.map)
    }

    /**
     * Display everything
     * @returns {void}
     */
    showAllCurrent() {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        this.showRestrooms(this.restrooms)
        this.showLocation(this.location)
        if (this.selectedRestroom) {
            this.showRouteToRestroom(this.selectedRestroom.id)
        }
    }

    /**
     * Add new restrooms to App
     * @param {Restroom[]} restrooms
     * @returns {void}
     */
    addRestrooms(restrooms) {
        for (const restroom of restrooms) {
            if (this.restrooms.has(restroom.id)) continue
            this.restrooms.set(restroom.id, {
                ...restroom,
                distance: {
                    from: this.location,
                    value: App.distanceBetween(this.location, restroom.location),
                },
            })
        }
        App.setStoredRestrooms([...this.restrooms.values()])
        if (this.visible) {
            this.showRestrooms(this.restrooms)
        }
    }

    /**
     * Add new searchresults to App
     * @param {SearchResult[]} restrooms
     * @returns {void}
     */
    addSearches(searches) {
        for (const search of searches) {
            if (this.searches.has(search.query)) continue
            this.searches.set(search.query, search)
        }
        App.setStoredSearches([...this.searches.values()])
    }

    /**
     * Get distance to restroom
     * !!! NOT IN METERS
     * @param {number} id
     * @returns {number} as coordinate points
     */
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
                value: App.distanceBetween(this.location, restroom.location),
            },
        }
        this.restrooms.set(id, updatedRestroom)
        return updatedRestroom.distance.value
    }

    /**
     * Get closest restroom from stored restrooms
     * @returns {Restroom}
     */
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

    /**
     * Focus map on user location
     * @returns {void}
     */
    setViewUserLocation() {
        this.map.setView(this.location, 14)
    }

    /**
     * Focus map between two locations
     * @param {Coordinates} a
     * @param {Coordinates} b
     * @returns {void}
     */
    fitMapToLocations(a, b) {
        if (!a || !b) {
            this.setViewUserLocation()
            return
        }
        const bounds = L.latLngBounds(a, b)
        this.map.fitBounds(bounds)
    }
}
