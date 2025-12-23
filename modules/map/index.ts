import * as L from 'leaflet
/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 *
 * @param {Coordinates} coordinates Coordinates to get the map around
 * @returns
 */
export function getMap(coordinates) {
    const map = L.map('map').setView([coordinates.lat, coordinates.lon], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    return map
}
