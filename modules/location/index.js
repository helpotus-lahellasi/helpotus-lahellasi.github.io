/**
 * Gets the current position as a promise
 * @returns {Promise<PositionCallback>} PositionCallback promise
 */
function getCurrentLocation() {
    console.info('trying to get the current location')
    return new Promise((resolve, reject) => {
        function onSuccess(position) {
            console.info('got location', position.coords.latitude, position.coords.longitude)
            resolve(position)
        }
        function onError(error) {
            console.error('failed to get the location', error)
            reject(error)
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    })
}

export { getCurrentLocation }
