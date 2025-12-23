// https://digitransit.fi/en/developers/apis/1-routing-api/

import { safeFetch, validateArray } from '../util'
import { Coordinates, HSLRoute } from '../../types'

const baseUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql'

interface GraphQLQueryBody {
    query: string
}

function getGraphQLRouteQueryBody(from: Coordinates, to: Coordinates): GraphQLQueryBody {
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

interface HSLGraphQLResponse {
    data: {
        plan: {
            itineraries: Array<HSLRoute['data']>
        }
    }
}

async function apiPost(body: GraphQLQueryBody) {
    const result = await safeFetch<HSLGraphQLResponse>(
        baseUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
        { apiName: 'HSL Digitransit API' },
    )
    return result
}

async function getHSLRoute({ from, to }: { from: Coordinates; to: Coordinates }): Promise<HSLRoute | null> {
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
