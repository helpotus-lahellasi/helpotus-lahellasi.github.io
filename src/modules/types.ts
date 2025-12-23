/**
 * Shared TypeScript type definitions for the application
 */

export interface Coordinates {
    lat: number
    lon: number
}

export interface Tag {
    heading: string
    text: string
}

export interface Restroom {
    id: number
    timestamp: string | Date
    location: Coordinates
    tags: Tag[]
    name?: string
    streetName?: string
    distance?: {
        from: Coordinates
        value: number
    }
}

export interface AppOptions {
    location?: Coordinates
    restroom?: Restroom
}

export interface PartOptions {
    heading?: string
    text?: string
    inline?: boolean
    icon?: string
}

export interface ReadSearchParamsOutput {
    from: Coordinates | null
    restroom: Restroom | null
}

export interface ORSRoute {
    data: {
        duration: number
        endTime: number
        walkDistance: number
        geometry: {
            type: string
            coordinates: number[][]
        }
    }
    type: 'ors'
}

export interface HSLRoute {
    data: {
        walkDistance: number
        duration: number
        endTime: number
        legs: Array<{
            startTime: number
            endTime: number
            mode: string
            duration: number
            distance: number
            legGeometry: {
                points: string
            }
        }>
    }
    type: 'hsl'
}

export type Route = ORSRoute | HSLRoute

export interface SearchResult {
    display_name: string
    lat: string
    lon: string
    [key: string]: unknown
}

export interface SearchResultWithQuery {
    results: SearchResult[]
    query: string
}

export interface PopupOptions {
    heading?: string
    text?: string
    infinite?: boolean
    time?: number
    target: HTMLElement
    onAccept?: () => void
    onCancel?: () => void
    acceptText?: string
    cancelText?: string
}

export interface SafeFetchResult<T = unknown> {
    success: boolean
    data: T | null
    error: string | null
}

export interface SafeFetchConfig {
    logErrors?: boolean
    apiName?: string
}
