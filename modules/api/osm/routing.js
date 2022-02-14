import { RESTROOM_FETCH_DISTANCE } from '../../config.js'

const baseUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf62489ed94340f9f94cd7986b548f20950a89&'

/**
 * @typedef {Object} FuckedUpCoordinates
 * @property {number} lon The latitude of the coordinates
 * @property {number} lat The longtitude of the coordinates
 */

/**
 *
 * @param {FuckedUpCoordinates} coordinates Coordinates to get the toilets around
 * @returns List of restrooms bro
 */
export async function getOprRoute({ from, to }) {
    try {
        const params = `&start=${from.lon},${from.lat}&end=${to.lon},${to.lat}`
        const url = `${baseUrl}${params}`
        const res = await fetch(url)
        const data = await res.json()

        return data
    } catch {
        return null
    }
}