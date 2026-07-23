import { NUM_PAST_MONTHS_TRAVEL_PLAN, TIMEZONE } from "$lib/constants"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  const nextMonth = today.plus({ months: 1 }).startOf("month")
  const months = []
  months.push(nextMonth)

  for (let i = 0; i < NUM_PAST_MONTHS_TRAVEL_PLAN; i++) {
    months.push(today.minus({ months: i }).startOf("month"))
  }

  return { today, nextMonth, months }
}
