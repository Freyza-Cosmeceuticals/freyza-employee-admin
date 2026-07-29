import { SUPABASE_AUTH_TAG, TIMEZONE } from "$lib/constants"
import { getUserById } from "$lib/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const claims = await locals.requireAuth()

  const userProfile = getUserById(locals, claims.sub)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  const thisMonth = today.startOf("month")
  const upcomingMonth = thisMonth.plus({ months: 1 }).startOf("month")

  const tasks: Promise<{ id: number; task: string; urgency: string }[]> = new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 0,
          task: "Create Travel Plan for XYZ - (DEMO)",
          urgency: "HIGH"
        }
      ])
    }, 1000)
  })

  // stream promises for faster response
  return { userProfile, today, thisMonth, upcomingMonth, tasks }
}
