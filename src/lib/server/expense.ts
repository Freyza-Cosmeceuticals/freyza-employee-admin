// Daily Allowance in HQ
const DA_HQ = 100
// Daily Allowance in non-HQ
const DA_NON_HQ = 200

// Travel Allowance per km in HQ
const TA_HQ_PER_KM = 0
// Travel Allowance per km in non-HQ
const TA_NON_HQ_PER_KM = 2.5

// Petrol Allowance
const PA = 90

/**
 * Calculates the expenses based on the distance and HQ status
 * @param isHQ Whether the report route destination is HQ or not
 * @param distanceKm The distance in kilometers of the route. Ignored if isHQ is true
 * @returns da: number; ta: number; pa: number; total: number
 */
export function calculateExpenses(
  isHQ: boolean,
  distanceKm: number
): { da: number; ta: number; pa: number; total: number } {
  const pa = PA

  const da = isHQ ? DA_HQ : DA_NON_HQ

  const taRate = isHQ ? TA_HQ_PER_KM : TA_NON_HQ_PER_KM
  const ta = taRate * distanceKm

  const total = pa + da + ta

  return { da, ta, pa, total }
}
