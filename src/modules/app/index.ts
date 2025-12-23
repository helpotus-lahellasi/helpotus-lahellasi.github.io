import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Polyline from '@mapbox/polyline'
import { getRestrooms } from '../api/osm/restrooms'
import { getOrsRoute } from '../api/osm/routing'
import { setRouteInfoElement } from '../layout/routeInfo'
import { setRestroomElement } from '../layout/restroomInfo'
import { getHSLRoute } from '../api/hsl/routing'
import { getStreetName } from '../api/routereverse/streetNameFromPosition'
import { getCurrentLocation } from '../location/index'
import { icons } from '../map/markers'
import { clearElement } from '../util/index'
import { LOCATION_EXPIRATION_TIME, RESTROOM_EXPIRATION_TIME, SEARCH_EXPIRATION_TIME } from '../config'
import { getSearch } from '../api/osm/search'
import { Coordinates, Restroom, AppOptions, Route, SearchResultWithQuery } from '../types'

interface StoredRoute {
    from: Coordinates
    value: Route
}

// Class for combining app functionality
export class App extends EventTarget {
    map: L.Map | null = null
    locationMarker: L.Marker | null = null
    selectedRestroom: Restroom | null = null
    routePolyline: L.Polyline | null = null
    restroomLayerGroup: L.LayerGroup
    location: Coordinates

    routes = new Map<number, StoredRoute>()
    restrooms = new Map<number, Restroom>()
    searches = new Map<string, SearchResultWithQuery>()

    visible = false

    constructor(options?: AppOptions) {
        super()
        this.restroomLayerGroup = L.layerGroup()

        if (options?.location) {
            this.location = options.location
        } else {
            // Default location (will be overridden when location is fetched)
            this.location = { lat: 0, lon: 0 }
        }

        if (options?.restroom) {
            this.addRestrooms([options.restroom])
            this.selectRestroom(options.restroom)
        }
    }

    /**
     * Set the current app visible instance visible
     *
     * This method has to be called before using any functionality that requires the leaflet map
     */
    setVisible(): void {
        this.visible = true
        this.map = L.map('map').setView([this.location.lat, this.location.lon], 14)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map)
        this.locationMarker = L.marker([this.location.lat, this.location.lon], { icon: icons.userMarker })
            .bindPopup(`Olet tässä`)
            .openPopup()
            .addTo(this.map)

        this.showAllCurrent()
    }

    static pointBetween(a: Coordinates, b: Coordinates): Coordinates {
        return {
            lat: (a.lat + b.lat) / 2,
            lon: (a.lon + b.lon) / 2,
        }
    }

    static distanceBetween(a: Coordinates, b: Coordinates): number {
        return Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2))
    }

    static locationsEqual(a: Coordinates, b: Coordinates): boolean {
        if (a.lat === b.lat && b.lon === a.lon) {
            return true
        }
        return false
    }

    static async fetchLocation(): Promise<Coordinates> {
        const locationObject = await getCurrentLocation()
        return {
            lat: locationObject.coords.latitude,
            lon: locationObject.coords.longitude,
        }
    }

    static async fetchRestroomsFromLocation(location: Coordinates): Promise<Restroom[]> {
        return getRestrooms(location)
    }

    static setStoredLocation(location: Coordinates): void {
        sessionStorage.setItem('restroom-app-location', JSON.stringify({ value: location, modified: Date.now() }))
    }

    static setStoredRestrooms(restrooms: Restroom[] | Map<number, Restroom>): void {
        if (Array.isArray(restrooms)) {
            sessionStorage.setItem('restroom-app-restrooms', JSON.stringify({ value: restrooms, modified: Date.now() }))
        } else {
            sessionStorage.setItem(
                'restroom-app-restrooms',
                JSON.stringify({ value: [...restrooms.values()], modified: Date.now() }),
            )
        }
    }

    static setStoredSearches(searches: SearchResultWithQuery[]): void {
        sessionStorage.setItem('restroom-app-searches', JSON.stringify({ value: searches, modified: Date.now() }))
    }

    static getStoredLocation(): Coordinates | null {
        const stored = sessionStorage.getItem('restroom-app-location')
        if (!stored) return null
        const location = JSON.parse(stored)
        const isInvalid =
            !location ||
            !location.value ||
            !location.value.lat ||
            !location.value.lon ||
            location.modified < Date.now() - LOCATION_EXPIRATION_TIME

        if (isInvalid) return null

        return location.value
    }

    static getStoredRestrooms(): Restroom[] | null {
        const stored = sessionStorage.getItem('restroom-app-restrooms')
        if (!stored) return null
        const restrooms = JSON.parse(stored)
        const isInvalid =
            !restrooms || !Array.isArray(restrooms.value) || restrooms.modified < Date.now() - RESTROOM_EXPIRATION_TIME

        if (isInvalid) return null

        return restrooms.value
    }

    static getStoredSearches(): SearchResultWithQuery[] | null {
        const stored = sessionStorage.getItem('restroom-app-searches')
        if (!stored) return null
        const searches = JSON.parse(stored)
        const isInvalid =
            !searches || !Array.isArray(searches.value) || searches.modified < Date.now() - SEARCH_EXPIRATION_TIME

        if (isInvalid) return null

        return searches.value
    }

    async updateApp(): Promise<void> {
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

        this.dispatchEvent(new Event('informationChange'))
    }

    static async getRouteBetweenLocations(a: Coordinates, b: Coordinates): Promise<Route | null> {
        if (!a || !b) return null
        return (
            (await getHSLRoute({
                from: a,
                to: b,
            })) || (await getOrsRoute({ from: a, to: b }))
        )
    }

    async getSearchResult(text: string): Promise<SearchResultWithQuery | null> {
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

    async getRoute(id: number): Promise<Route | null> {
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
            if (this.map && this.routePolyline) {
                this.map.removeLayer(this.routePolyline)
            }
            return null
        }

        this.routes.set(id, {
            from: this.location,
            value: updatedRoute,
        })

        return updatedRoute
    }

    showLocation(location: Coordinates): void {
        if (!this.visible || !this.locationMarker)
            return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        const newLatLng = new L.LatLng(location.lat, location.lon)
        this.locationMarker.setLatLng(newLatLng)
    }

    selectRestroom(restroom: Restroom): void {
        this.selectedRestroom = restroom
        this.dispatchEvent(new Event('informationChange'))
    }

    async showRouteToRestroom(id: number): Promise<Route | void> {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        let restroom = this.restrooms.get(id)
        if (!restroom) return

        if (!restroom.streetName) {
            const streetName = await getStreetName(restroom.location.lat, restroom.location.lon)
            restroom = {
                ...restroom,
                streetName: streetName || undefined,
            }
            this.restrooms.set(id, restroom)
        }

        this.fitMapToLocations(this.location, restroom.location)

        const restroomInfoEl = document.querySelector<HTMLElement>('.app-restroom-info')
        const routeInfoEl = document.querySelector<HTMLElement>('.app-route-info')
        if (restroomInfoEl) {
            setRestroomElement(restroomInfoEl, restroom)
        }
        const route = await this.getRoute(id)

        if (!route) {
            if (routeInfoEl) {
                clearElement(routeInfoEl)
            }
            this.selectRestroom(restroom)
            return
        }

        if (routeInfoEl) {
            setRouteInfoElement(routeInfoEl, route)
        }

        this.selectRestroom(restroom)

        if (this.routePolyline && this.map) {
            this.map.removeLayer(this.routePolyline)
        }

        if (!this.map) return route

        if (route.type === 'ors') {
            const points = route.data.geometry.coordinates.map((coord) => [coord[1], coord[0]] as [number, number])

            if (this.map) {
                this.routePolyline = L.polyline(points)
                    .setStyle({
                        color: 'blue',
                    })
                    .addTo(this.map)
            }
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

    showRestrooms(restrooms: Map<number, Restroom>): void {
        if (!this.visible || !this.map) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')

        this.restroomLayerGroup.clearLayers()
        for (const restroom of restrooms.values()) {
            const fee = restroom.tags.find((tag) => tag.heading.toLowerCase() === 'maksu:')

            let icon

            if (!fee || !fee.text) {
                icon = icons.unknownFeeRestroom
            } else if (fee.text.toLowerCase() === 'kyllä') {
                icon = icons.moneyRestroom
            } else if (fee.text.toLowerCase() === 'ei') {
                icon = icons.freeRestroom
            } else {
                icon = icons.unknownFeeRestroom
            }

            const marker = L.marker([restroom.location.lat, restroom.location.lon], { icon })
                .addTo(this.map)
                .on('click', () => this.showRouteToRestroom(restroom.id))
            this.restroomLayerGroup.addLayer(marker)
        }
        this.restroomLayerGroup.addTo(this.map)
    }

    showAllCurrent(): void {
        if (!this.visible) return console.error('Trying to use map commands when the APP IS NOT VISIBLE!')
        this.showRestrooms(this.restrooms)
        this.showLocation(this.location)
        if (this.selectedRestroom) {
            this.showRouteToRestroom(this.selectedRestroom.id)
        }
    }

    addRestrooms(restrooms: Restroom[]): void {
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

        if (this.visible) {
            this.showRestrooms(this.restrooms)
        }
    }

    addSearches(searches: SearchResultWithQuery[]): void {
        for (const search of searches) {
            if (this.searches.has(search.query)) continue
            this.searches.set(search.query, search)
        }
        App.setStoredSearches([...this.searches.values()])
    }

    /**
     * Get distance to restroom
     * !!! NOT IN METERS
     * @returns {number} as coordinate points
     */
    getDistanceToRestroom(id: number): number {
        const restroom = this.restrooms.get(id)
        if (!restroom) throw new Error('Restroom was not stored in memory')
        if (restroom.distance && App.locationsEqual(restroom.distance.from, this.location)) {
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

    getClosestRestroom(): Restroom | undefined {
        let closestRestroom: Restroom | undefined
        let closestDistance: number | undefined

        this.restrooms.forEach((restroom) => {
            const restroomDistance = this.getDistanceToRestroom(restroom.id)
            if (!closestRestroom || closestDistance === undefined || restroomDistance < closestDistance) {
                closestRestroom = restroom
                closestDistance = restroomDistance
                return
            }
        })

        return closestRestroom
    }

    setViewUserLocation(): void {
        if (!this.map) return
        this.map.setView([this.location.lat, this.location.lon], 14)
    }

    fitMapToLocations(a: Coordinates, b: Coordinates): void {
        if (!a || !b || !this.map) {
            this.setViewUserLocation()
            return
        }
        const bounds = L.latLngBounds([a.lat, a.lon], [b.lat, b.lon])
        this.map.fitBounds(bounds)
    }
}
