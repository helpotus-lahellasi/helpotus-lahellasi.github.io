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
 * @returns List of restrooms bro
 */
export async function getOrsRoute({ from, to }) {
    try {
        const params = `&start=${from.lon},${from.lat}&end=${to.lon},${to.lat}`
        const url = `${baseUrl}${params}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.error) {
            return null
        }
        const features = data.features[0]
        if (!features) {
            return null
        }
        if (
            !features.properties ||
            !features.properties.summary ||
            !features.properties.summary.duration ||
            !features.properties.summary.distance
        ) {
            return null
        }
        if (!features.geometry || !features.geometry.coordinates) {
            return null
        }

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
    } catch {
        return null
    }
}
