/**
 * Gets the current position as a promise
 * @returns {Promise<PositionCallback>} PositionCallback promise
 */
function getCurrentLocation() {
    console.info('trying to get the current location')
    return new Promise((resolve, reject) => {
        function onSuccess(position) {
            resolve(position)
        }
        function onError(error) {
            reject(error)
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    })
}

export { getCurrentLocation }
