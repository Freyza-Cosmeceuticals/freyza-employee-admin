import { TIMEZONE } from "$lib/constants"
import { getAllRoutes } from "$lib/server/db/route"
import { getTravelPlansForMonth } from "$lib/server/db/travelplan"
import { getAllEmployees } from "$lib/server/db/user"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals, url }) => {
  // depends(SUPABASE_AUTH_TAG)

  const today = DateTime.now().setZone(TIMEZONE) as DateTime<true>
  let nextMonth: DateTime<true> = today.plus({ months: 1 }).startOf("month") as DateTime<true>

  // check if nextMonth is provided in the URL
  const nextMonthParam = url.searchParams.get("month")
  if (nextMonthParam) {
    const maybeNextMonth = DateTime.fromISO(nextMonthParam)
    if (maybeNextMonth.isValid) {
      nextMonth = maybeNextMonth.setZone(TIMEZONE).set({ day: 1 }) as DateTime<true>
    }
  }

  const nextMonthForDB = nextMonth.setZone("UTC", { keepLocalTime: true }).toJSDate()

  const travelPlansForMonth = await getTravelPlansForMonth(locals, nextMonthForDB)
  if (travelPlansForMonth.error !== null) {
    console.error("Error fetching travel plans for filtering employees:", travelPlansForMonth.error)
  }

  const employeesDone = travelPlansForMonth.data?.map((plan) => plan.employeeId) ?? []
  const [employees, routes] = await Promise.all([
    getAllEmployees(locals, undefined, employeesDone),
    getAllRoutes(locals)
  ])

  return { employees, routes, today, nextMonth }
}
