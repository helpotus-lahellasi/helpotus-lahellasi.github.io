import { RESTROOM_FETCH_DISTANCE } from '../../config.js'

const baseUrl = 'https://overpass-api.de/api/interpreter/'

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
 *
 * @param {Coordinates} coordinates Coordinates to get the toilets around
 * @returns {Restroom[]} List of restrooms bro
 */
export async function getRestrooms(coordinates) {
    const params = `[out:json];node["amenity"="toilets"](around:${RESTROOM_FETCH_DISTANCE},${coordinates.lat}, ${coordinates.lon}); out meta;`
    const url = `${baseUrl}?data=${encodeURIComponent(params)}`
    const res = await fetch(url)
    const data = await res.json()
    const restrooms = data.elements
    return restrooms.map((restroom) => ({
        id: restroom.id,
        timestamp: restroom.timestamp,
        location: {
            lat: restroom.lat,
            lon: restroom.lon,
        },
        name: restroom.tags["name"] || undefined,
        tags: Object.entries(restroom.tags)
            .map((pair) => {
                return getTranslation(pair)
            })
            .filter(Boolean),
    }))
}

function getTranslation([originalKey, originalValue]) {
    if (!originalKey || !originalValue) return null
    const key = originalKey.toLowerCase()
    const value = originalValue.toLowerCase()

    switch (key) {
        case 'fee':
            {
                if (value === 'no') {
                    return {
                        heading: 'Maksu:',
                        text: "Ei"
                    }
                } else if (value === 'yes') {
                    return {
                        heading: 'Maksu:',
                        text: "Kyllä"
                    }
                } else {
                    return {
                        heading: 'Maksu:',
                        text: originalValue,
                    }
                }
            }
        case 'access':
            {
                if (value === "customers") {
                    return {
                        heading: 'Pääsy:',
                        text: 'asiakkaille'
                    }
                } else {
                    return null
                }
            }
        case 'wheelchair':
            {
                if (value === "yes") {
                    return {
                        heading: 'Pääsy pyörätuolilla:',
                        text: 'Kyllä'
                    }
                } else if (value === "no") {
                    return {
                        heading: 'Pääsy pyörätuolilla:',
                        text: 'Ei'
                    }
                } else {
                    return null
                }
            }
        default:
            {
                return null
            }

    }
}