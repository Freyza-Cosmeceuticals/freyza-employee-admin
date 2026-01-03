import { TIMEZONE } from "$lib/constants"
import { getAllRoutes } from "$lib/server/db/route"
import { getTravelPlansForMonth } from "$lib/server/db/travelplan"
import { getAllEmployees } from "$lib/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  const nextMonthForDB = today
    .plus({ months: 1 })
    .startOf("month")
    .setZone("UTC", { keepLocalTime: true })
    .toJSDate()

  const travelPlansForMonth = await getTravelPlansForMonth(locals, nextMonthForDB)
  if (travelPlansForMonth.error !== null) {
    console.error("Error fetching travel plans for filtering employees:", travelPlansForMonth.error)
  }

  const employeesDone = travelPlansForMonth.data?.map((plan) => plan.employeeId) ?? []
  const [employees, routes] = await Promise.all([
    getAllEmployees(locals, undefined, employeesDone),
    getAllRoutes(locals)
  ])

  const nextMonth = today.plus({ months: 1 }).startOf("month")

  return { employees, routes, today, nextMonth }
}
