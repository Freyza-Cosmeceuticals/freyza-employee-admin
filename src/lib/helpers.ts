import { VisitType } from "./constants"
import type { RouteWithName, Visit, VisitFull } from "./types"

/**
 * Returns the formatted name of the route, based on the source and destination locations.
 * @param route
 * @returns The formatted name of the route.
 */
export function formatRouteName(route: RouteWithName): string {
  return `${route.srcLoc.name} → ${route.destLoc.name}`
}

/**
 * Returns the label for the visit type, based on the visit type.
 * @param visitType
 * @returns The label for the visit type, or "Unknown" if the visit type is not recognized.
 */
export function getVisitTypeLabel(visitType: VisitType): string {
  switch (visitType) {
    case VisitType.DOCTOR:
      return "Doctor"
    case VisitType.STOCKIST:
      return "Stockist"
    case VisitType.CHEMIST:
      return "Chemist"
    default:
      return "Unknown"
  }
}

/**
 * Calculates map center and zoom for visits.
 * @param visits The visits to calculate the camera for.
 * @returns The center (longitude, latitude) and zoom level of the map. Specific to MapGL
 */
export function findVisitsCamera(visits: Visit[]): {
  center: [number, number]
  zoom: number
} {
  // Default: India
  if (visits.length === 0) {
    return {
      center: [82.8, 22.5],
      zoom: 5
    }
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLong = Infinity
  let maxLong = -Infinity

  for (const visit of visits) {
    minLat = Math.min(minLat, visit.latitude)
    maxLat = Math.max(maxLat, visit.latitude)
    minLong = Math.min(minLong, visit.longitude)
    maxLong = Math.max(maxLong, visit.longitude)
  }

  const paddingFactor = 0.5

  const latPadding = (maxLat - minLat) * paddingFactor
  const longPadding = (maxLong - minLong) * paddingFactor

  minLat -= latPadding
  maxLat += latPadding
  minLong -= longPadding
  maxLong += longPadding

  const center: [number, number] = [(minLong + maxLong) / 2, (minLat + maxLat) / 2]

  const maxDiff = Math.max(maxLat - minLat, maxLong - minLong)

  let zoom = 12

  if (maxDiff > 20) zoom = 5
  else if (maxDiff > 10) zoom = 6
  else if (maxDiff > 5) zoom = 7
  else if (maxDiff > 2) zoom = 8
  else if (maxDiff > 1) zoom = 9
  else if (maxDiff > 0.5) zoom = 10
  else if (maxDiff > 0.2) zoom = 11
  else if (maxDiff > 0.05) zoom = 12
  else zoom = 13

  return {
    center,
    zoom
  }
}
