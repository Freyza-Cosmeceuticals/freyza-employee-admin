import { VisitType } from "./constants"
import type { Visit } from "./types"

/**
 * Returns the name of the visit, based on the visit type and the relevant name field.
 * @param visit
 * @returns The name of the visit, or "Unknown" if the visit type is not recognized.
 */
export function getVisitName(visit: Visit): string {
  switch (visit.visitType) {
    case VisitType.DOCTOR:
      return visit.doctorName ?? "???"
    case VisitType.STOCKIST:
      return visit.stockistName ?? "???"
    case VisitType.CHEMIST:
      return visit.chemistName ?? "???"
    default:
      return "Unknown"
  }
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
 * Returns the center of all visits, based on the average latitude and longitude of them
 * TOOD: Check if the map auto centers all markers, this might not be needed at all
 * @param visits
 * @returns The center of the visits, as an object with `latitude` and `longitude` properties.
 */
export function findVisitsCenter(visits: Visit[]): {
  latitude: number
  longitude: number
} {
  if (visits.length === 0) return { latitude: 0, longitude: 0 }
  const latitude = visits.reduce((acc, visit) => acc + visit.latitude, 0) / visits.length
  const longitude = visits.reduce((acc, visit) => acc + visit.longitude, 0) / visits.length

  return { latitude, longitude }
}
