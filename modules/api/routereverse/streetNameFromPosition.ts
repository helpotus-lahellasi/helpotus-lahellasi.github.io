import { safeFetch, validateArray } from '../util'

/**
 * Gets streetname from given location
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string|null>} name of the street, or null if fetching fails
 */
export async function getStreetName(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${lon}&key=f39175ee4fad4dfa952c4f207a3667ab&language=fi&pretty=1`

    const result = await safeFetch(url, {}, { apiName: 'OpenCage Geocoding API' })

    if (!result.success || !result.data) {
        return null
    }

    const { data } = result

    if (!validateArray(data.results)) {
        return null
    }

    const routename = data.results[0].formatted

    if (!routename || typeof routename !== 'string') {
        return null
    }

    if (routename.startsWith('unnamed road,')) {
        return routename.substring('unnamed road'.length)
    }

    return routename
}
