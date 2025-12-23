import { safeFetch, validateArray } from '../util.js'

const baseUrl =
    'https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf62489ed94340f9f94cd7986b548f20950a89&'

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 *
 * @param {Coordinates} coordinates Coordinates to get the toilets around
 * @returns {Promise<OrsRoute|null>}
 */
export async function getOrsRoute({ from, to }) {
    const params = `&start=${from.lon},${from.lat}&end=${to.lon},${to.lat}`
    const url = `${baseUrl}${params}`
    
    const result = await safeFetch(url, {}, { apiName: 'OpenRouteService API' })
    
    if (!result.success || !result.data) {
        return null
    }

    const { data } = result
    
    if (!validateArray(data.features)) {
        return null
    }

    const features = data.features[0]
    
    return {
        data: {
            duration: features.properties.summary.duration,
            endTime: Date.now() + features.properties.summary.duration * 1000,
            walkDistance: features.properties.summary.distance,
            geometry: {
                ...features.geometry,
                coordinates: features.geometry.coordinates.map((point) => {
                    return point.reverse()
                }),
            },
        },
        type: 'ors',
    }
}
