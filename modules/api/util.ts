import { SafeFetchResult, SafeFetchConfig } from '../types'

/**
 * Shared utility functions for API error handling
 */

/**
 * Safely fetch and parse JSON from an API endpoint
 */
export async function safeFetch<T = unknown>(
    url: string,
    options: RequestInit = {},
    config: SafeFetchConfig = {}
): Promise<SafeFetchResult<T>> {
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
 */
export function validateArray<T>(array: unknown, minLength = 1): array is Array<T> {
    return Array.isArray(array) && array.length >= minLength
}
