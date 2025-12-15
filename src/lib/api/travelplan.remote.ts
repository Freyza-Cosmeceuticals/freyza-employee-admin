import { form, getRequestEvent, query } from "$app/server"
import { createTravelPlan, getTravelPlansWithEmployeeForMonths } from "@/server/db/travelplan"
import type { TravelPlanWithEmployee } from "@/types"
import { DayType } from "@db/client"
import { error, invalid } from "@sveltejs/kit"
import { DateTime } from "luxon"
import z from "zod"
import { requireAuthMaybeAdmin } from "./common"

const addTravelPlanEntrySchema = z
  .object({
    date: z.coerce.date<string>(),
    dayType: z.enum(DayType),
    routeId: z
      .string()
      .optional()
      .transform(val => {
        if (!val) return null
        if (val.length === 0) return null

        return val
      }),
  })
  .refine(
    data => {
      if (data.dayType === DayType.WORK && !data.routeId) {
        return false
      }

      return true
    },
    {
      message: "Route ID is required for working days",
      path: ["routeId"],
    },
  )

const addTravelPlanSchema = z
  .object({
    employeeId: z.string().min(1),
    month: z.coerce.date<string>(),
    createdById: z.string().min(1),
    planEntries: z.array(addTravelPlanEntrySchema),
  })
  .refine(
    data => {
      if (DateTime.fromJSDate(data.month).daysInMonth !== data.planEntries.length) {
        return false
      }

      return true
    },
    {
      message: "Plan entries must match the number of days in the month",
    },
  )

export const addTravelPlan = form(addTravelPlanSchema, async (travelPlan, issue) => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  console.debug("Adding Travel Plan with data", travelPlan)

  // sanity check
  const invalidIdx = travelPlan.planEntries.findIndex(
    entry => entry.dayType === DayType.WORK && !entry.routeId,
  )
  if (invalidIdx !== -1) {
    invalid(issue.planEntries[invalidIdx].routeId("Route ID is required for working days"))
  }

  if (user.id !== travelPlan.createdById) {
    return { success: false, data: null, message: "Cross user requests not allowed" }
  }

  const { data: travelPlanObject, error } = await createTravelPlan(locals, travelPlan)

  if (travelPlanObject === null) {
    console.error("Failed to create travel plan", error)
    return { success: false, data: null, message: error }
  }

  console.debug("Travel Plan created successfully", travelPlanObject)

  getTravelPlansForMonth(
    DateTime.fromJSDate(travelPlanObject.month).toISODate() ??
      `${travelPlanObject.month.toISOString().split("T", 2)[0]}`,
  ).refresh()

  return { data: travelPlanObject, success: true, message: "Travel plan created successfully" }
})

export const getTravelPlansForMonth = query.batch(z.coerce.date<string>(), async months => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)
  // console.debug("Fetching Travel Plans for months", months)

  if (months.length === 0) {
    error(400, "No months provided")
  }

  const { data: travelPlans, error: dbError } = await getTravelPlansWithEmployeeForMonths(
    locals,
    months,
  )

  if (travelPlans === null) {
    console.error("Failed to fetch travel plans", dbError)
    error(500, dbError)
  }

  // console.debug("Fetched Travel Plans", travelPlans)
  const lookup = new Map<string, TravelPlanWithEmployee[]>(
    travelPlans.map(tp => {
      const key =
        DateTime.fromJSDate(tp.month).toISODate() ?? `${tp.month.toISOString().split("T", 2)[0]}`

      let plans = travelPlans.filter(x => x.month.toISOString() === tp.month.toISOString())

      plans = plans.map(plan => {
        plan.stats = {
          holidayDays: 12,
          leaveDays: 13,
          workDays: 14,
        }
        return plan
      })

      return [key, plans]
    }),
  )

  // console.log("Lookup", lookup)
  // console.log("What I get here: ", months[0].toString())

  return month => {
    // console.log(month, typeof month, month.toString(), lookup.get(month.toString()))
    return lookup.get(month.toString())
  }
})
