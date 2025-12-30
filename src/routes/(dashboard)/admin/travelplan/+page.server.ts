import { TIMEZONE } from "@/constants"
import { getEmployeeCount } from "@/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  const employeeCount = getEmployeeCount(locals)

  return { today, employeeCount }
}
