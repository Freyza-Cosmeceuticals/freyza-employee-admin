import { NUM_PAST_DAYS_DAILY_REPORT, TIMEZONE } from "$lib/constants"
import { getEmployeeCount } from "$lib/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  const days = []

  for (let i = 0; i < NUM_PAST_DAYS_DAILY_REPORT; i++) {
    days.push(today.minus({ days: i }).startOf("day"))
  }

  const employeeCount = getEmployeeCount(locals)

  return { today, days, employeeCount }
}
