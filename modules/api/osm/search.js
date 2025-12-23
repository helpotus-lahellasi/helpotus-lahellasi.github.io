import { safeFetch } from '../util.js'

const baseUrl = 'https://nominatim.openstreetmap.org/search'

export async function getSearch(searchString) {
    const params = `format=json&addressdetails=1&limit=4`
    const url = `${baseUrl}?q=${encodeURIComponent(searchString)}&${params}`
    
    const result = await safeFetch(url, {}, { apiName: 'Nominatim API' })
    
    if (!result.success || !result.data) {
        return []
    }

    return Array.isArray(result.data) ? result.data : []
}
