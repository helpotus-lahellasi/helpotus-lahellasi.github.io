import { RESTROOM_FETCH_DISTANCE } from '../../config.js'

const baseUrl = 'https://overpass-api.de/api/interpreter/'

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 *
 * @param {Coordinates} coordinates Coordinates to get the toilets around
 * @returns List of restrooms bro
 */
export async function getRestrooms(coordinates) {
    const params = `[out:json];node["amenity"="toilets"](around:${RESTROOM_FETCH_DISTANCE},${coordinates.lat}, ${coordinates.lon}); out meta;`
    const url = `${baseUrl}?data=${encodeURIComponent(params)}`
    const res = await fetch(url)
    const data = await res.json()
    return data.elements
}
