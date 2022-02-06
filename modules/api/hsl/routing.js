// https://digitransit.fi/en/developers/apis/1-routing-api/

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
function getGraphqlFromToQueryBody(from, to) {
    console.log(from, to)
    return {
        query: `{
  plan(from: {lat: ${from.lat}, lon: ${from.lon}}, to: {lat: ${to.lat}, lon: ${to.lon}}) {
    itineraries {
      walkDistance
      duration
      legs {
        mode
        startTime
        endTime
        from {
          lat
          lon
          name
          stop {
            code
            name
            gtfsId
            stoptimesForPatterns(omitNonPickups: true, timeRange: 1800) {
              pattern {
                code
              }
              stoptimes {
                scheduledDeparture
              }
            }
          }
        }
        to {
          lat
          lon
          name
          stop {
            patterns {
              code
            }
          }
        }
        trip {
          gtfsId
          pattern {
            code
          }
          tripHeadsign
        }
      }
    }
  }
}`,
        variables: null
    }
}

async function apiPost(body) {
    const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    return response.json()
}

/**
 *
 * @param {Coordinates} from Coordinates to get the routes from
 * @param {Coordinates} to Coordinates to get the routes to
 * @returns {Object} GraphQL data from hsl
 */
async function fromTo({ from, to }) {
    const body = getGraphqlFromToQueryBody(from, to)
    return await apiPost(body)
}

export { fromTo }
