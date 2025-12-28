import { SUPABASE_AUTH_TAG, TIMEZONE } from "@/constants"
import { DateTime } from "luxon"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>

  return { today }
}
