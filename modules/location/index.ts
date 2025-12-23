/**
 * Gets the current position as a promise
 */
function getCurrentLocation(): Promise<GeolocationPosition> {
    console.info('trying to get the current location')
    return new Promise((resolve, reject) => {
        function onSuccess(position: GeolocationPosition): void {
            resolve(position)
        }
        function onError(error: GeolocationPositionError): void {
            reject(error)
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError)
    })
}

export { getCurrentLocation }
