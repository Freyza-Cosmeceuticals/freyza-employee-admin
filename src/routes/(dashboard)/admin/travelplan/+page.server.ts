import { SUPABASE_AUTH_TAG, TIMEZONE } from "@/constants"
import { getAllTravelPlans } from "@/server/db/travelplan"
import type { PageServerLoad } from "./$types"
import { DateTime } from "luxon"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const travelPlans = getAllTravelPlans(locals)
  const today = DateTime.now().setZone(TIMEZONE)

  return { travelPlans, today }
}
