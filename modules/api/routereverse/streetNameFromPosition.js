/**
 * Gets streetname from given location
 * @param {number} lat
 * @param {number} lon
 * @returns {string} name of the street
 */
export async function getStreetName(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${lon}&key=f39175ee4fad4dfa952c4f207a3667ab&language=fi&pretty=1`
    const res = await fetch(url)
    const data = await res.json()
    return data.results[0].formatted
}
