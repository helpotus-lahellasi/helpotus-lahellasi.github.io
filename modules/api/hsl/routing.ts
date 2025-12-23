// https://digitransit.fi/en/developers/apis/1-routing-api/

import { safeFetch, validateArray } from '../util'

const baseUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'

/**
 * @typedef {Object} Coordinates
 * @property {number} lat The latitude of the coordinates
 * @property {number} lon The longtitude of the coordinates
 */

/**
 *
 * @param {Coordinates} from Coordinates to get the routes from
 * @param {Coordinates} to Coordinates to get the routes to
 * @returns {Object} GraphQL data from hsl
 */
function getGraphQLRouteQueryBody(from, to) {
    return {
        query: `
{
  plan(
    from: {lat: ${from.lat}, lon: ${from.lon}},
    to: {lat: ${to.lat}, lon: ${to.lon}},
    numItineraries: 1,
    transportModes: {mode:WALK}
  ) {
    itineraries {
      walkDistance
      duration
      endTime
      legs {
        startTime
        endTime
        mode
        duration
        distance
        legGeometry {
          points
        }
      }
    }
  }
}
`,
    }
}

/**
 * Intermediary function used for posting the request
 * @param {any} body
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
async function apiPost(body) {
    const result = await safeFetch(
        baseUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
        { apiName: 'HSL Digitransit API' }
    )
    return result
}

/**
 *
 * @param {Coordinates} from Coordinates to get the routes from
 * @param {Coordinates} to Coordinates to get the routes to
 * @returns {Promise<Object>} GraphQL data from hsl
 */
async function getHSLRoute({ from, to }) {
    const body = getGraphQLRouteQueryBody(from, to)
    const result = await apiPost(body)

    if (!result.success || !result.data) {
        return null
    }

    const { data } = result

    if (!validateArray(data.data.plan.itineraries)) {
        return null
    }

    if (!data.data.plan.itineraries[0]) {
        return null
    }

    return {
        data: data.data.plan.itineraries[0],
        type: 'hsl',
    }
}

export { getHSLRoute }
