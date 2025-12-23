import { RESTROOM_FETCH_DISTANCE } from '../../config'
import { safeFetch, validateArray } from '../util'
import { Coordinates, Restroom, Tag } from '../../types'

const baseUrl = 'https://overpass-api.de/api/interpreter/'

interface OverpassElement {
    id: number
    lat: number
    lon: number
    timestamp: string
    tags?: Record<string, string>
}

interface OverpassResponse {
    elements: OverpassElement[]
}

export async function getRestrooms(coordinates: Coordinates): Promise<Restroom[]> {
    const params = `[out:json];node["amenity"="toilets"](around:${RESTROOM_FETCH_DISTANCE},${coordinates.lat}, ${coordinates.lon}); out meta;`
    const url = `${baseUrl}?data=${encodeURIComponent(params)}`

    const result = await safeFetch<OverpassResponse>(url, {}, { apiName: 'Overpass API' })

    if (!result.success || !result.data) {
        return []
    }

    const { data } = result

    if (!validateArray(data.elements)) {
        return []
    }

    const restrooms = data.elements
    return restrooms.map((restroom) => ({
        id: restroom.id,
        timestamp: restroom.timestamp,
        location: {
            lat: restroom.lat,
            lon: restroom.lon,
        },
        name: restroom.tags?.['name'] || undefined,
        tags: Object.entries(restroom.tags || {})
            .map((pair) => {
                return getTranslation(pair)
            })
            .filter((tag): tag is Tag => tag !== null),
    }))
}

function getTranslation([originalKey, originalValue]: [string, string]): Tag | null {
    if (!originalKey || !originalValue) return null
    const key = originalKey.toLowerCase()
    const value = originalValue.toLowerCase()

    switch (key) {
        case 'fee': {
            if (value === 'no') {
                return {
                    heading: 'Maksu:',
                    text: 'Ei',
                }
            } else if (value === 'yes') {
                return {
                    heading: 'Maksu:',
                    text: 'Kyllä',
                }
            } else {
                return {
                    heading: 'Maksu:',
                    text: originalValue,
                }
            }
        }
        case 'access': {
            if (value === 'customers') {
                return {
                    heading: 'Pääsy:',
                    text: 'asiakkaille',
                }
            } else {
                return null
            }
        }
        case 'wheelchair': {
            if (value === 'yes') {
                return {
                    heading: 'Pääsy pyörätuolilla:',
                    text: 'Kyllä',
                }
            } else if (value === 'no') {
                return {
                    heading: 'Pääsy pyörätuolilla:',
                    text: 'Ei',
                }
            } else {
                return null
            }
        }
        default: {
            return null
        }
    }
}
