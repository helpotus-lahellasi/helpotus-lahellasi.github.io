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
    const restrooms = data.elements
    return restrooms.map((restroom) => ({
        id: restroom.id,
        timestamp: restroom.timestamp,
        location: {
            lat: restroom.lat,
            lon: restroom.lon
        },
        tags: Object.entries(restroom.tags).map((key, value) => {
            return getTranslation(key, value)
        }).filter(Boolean)
    }))
}


function getTranslation([originalKey, originalValue]) {
    if (!originalKey || !originalValue) return null
    const key = originalKey.toLowerCase()
    const value = originalValue.toLowerCase()



    console.log('getting translation for', key, value);

    switch (key) {
        case "fee":
            {
                if (value === "no") {
                    return {
                        heading: "Maksuton"
                    }
                } else if (value === "yes") {
                    return {
                        heading: "Maksullinen"
                    }

                } else {
                    return {
                        heading: "Maksu:",
                        text: originalValue
                    }
                }

            }
    }

}