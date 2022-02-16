const baseUrl = 'https://nominatim.openstreetmap.org/search/'
let i = 0
export async function getSearch(searchString) {
    const params = `format=json&addressdetails=1&limit=4`
    const url = `${baseUrl}${encodeURIComponent(searchString)}?${params}`
    const res = await fetch(url)
    const data = await res.json()
    return data
}
