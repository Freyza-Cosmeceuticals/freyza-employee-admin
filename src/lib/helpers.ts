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
