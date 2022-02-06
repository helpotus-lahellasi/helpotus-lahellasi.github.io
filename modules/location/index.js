/**
 * Gets the current position as a promise
 * @returns {Promise<PositionCallback>} PositionCallback promise
 */
function getCurrentPosition() {
    console.info('trying to get current position')
    return new Promise((resolve, reject) => {
        function onSuccess(position) {
            console.info('got position', position.coords.latitude, position.coords.longtitude)
            resolve(position)
        }
        function onError(error) {
            console.error('failed to get position', error)
            reject(error)
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    })
}

export { getCurrentPosition }
