import { N_EMPLOYEES_HOME, SUPABASE_AUTH_TAG, TIMEZONE } from "@/constants"
import { getAllEmployees, getUser } from "@/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const userProfile = getUser(locals)
  const employees = getAllEmployees(locals, N_EMPLOYEES_HOME)
  const upcomingMonth = DateTime.now()
    .setZone(TIMEZONE)
    .plus({ months: 1 })
    .startOf("month") as DateTime<true>

  const tasks: Promise<{ id: number; task: string; urgency: string }[]> = new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 0,
          task: "Create Travel Plan for XYZ",
          urgency: "HIGH"
        }
      ])
    }, 1000)
  })

  // stream promises for faster response
  return { userProfile, employees, upcomingMonth, tasks }
}
