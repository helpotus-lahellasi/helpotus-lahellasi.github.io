import { safeFetch, validateArray } from '../util'
import { Coordinates, ORSRoute } from '../../types'

const baseUrl =
    'https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf62489ed94340f9f94cd7986b548f20950a89&'

interface ORSFeature {
    geometry: {
        type: string
        coordinates: number[][]
    }
    properties: {
        summary: {
            duration: number
            distance: number
        }
    }
}

interface ORSResponse {
    features: ORSFeature[]
}

export async function getOrsRoute({ from, to }: { from: Coordinates; to: Coordinates }): Promise<ORSRoute | null> {
    const params = `&start=${from.lon},${from.lat}&end=${to.lon},${to.lat}`
    const url = `${baseUrl}${params}`

    const result = await safeFetch<ORSResponse>(url, {}, { apiName: 'OpenRouteService API' })

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
