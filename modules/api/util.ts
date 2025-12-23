/**
 * Shared utility functions for API error handling
 */

/**
 * Safely fetch and parse JSON from an API endpoint
 * @param {string} url - The URL to fetch from
 * @param {RequestInit} [options] - Optional fetch options (method, headers, body, etc.)
 * @param {Object} [config] - Additional configuration
 * @param {boolean} [config.logErrors=true] - Whether to log errors to console
 * @param {string} [config.apiName] - Name of the API for error messages
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
export async function safeFetch(url, options = {}, config = {}) {
    const { logErrors = true, apiName = 'API' } = config

    try {
        const res = await fetch(url, options)

        if (!res.ok) {
            const errorMsg = `${apiName} request failed: HTTP ${res.status} ${res.statusText}`
            if (logErrors) {
                console.error(errorMsg)
            }
            return {
                success: false,
                data: null,
                error: errorMsg,
            }
        }

        const data = await res.json()

        if (data.error || (data.status && data.status.code && data.status.code !== 200)) {
            const errorMsg = data.error?.message || data.status?.message || `${apiName} returned an error`
            if (logErrors) {
                console.error(`${apiName} error:`, errorMsg)
            }
            return {
                success: false,
                data: null,
                error: errorMsg,
            }
        }

        return {
            success: true,
            data,
            error: null,
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
        if (logErrors) {
            console.error(`Error fetching from ${apiName}:`, error)
        }
        return {
            success: false,
            data: null,
            error: errorMsg,
        }
    }
}

/**
 * Validate that an array exists and has at least one element
 * @param {any} array - The array to validate
 * @param {number} [minLength=1] - Minimum required length
 * @returns {boolean}
 */
export function validateArray(array, minLength = 1) {
    return Array.isArray(array) && array.length >= minLength
}
