import { error, invalid } from "@sveltejs/kit"
import { createTravelPlan, getTravelPlansWithEmployeeForMonths } from "@/server/db/travelplan"
import type { TravelPlanWithEmployee } from "@/types"
import { DayType } from "@db/client"

import { DateTime } from "luxon"
import * as v from "valibot"

import { form, getRequestEvent, query } from "$app/server"

import { requireAuthMaybeAdmin } from "./common"

const addTravelPlanEntrySchema = v.pipe(
  v.object({
    date: v.pipe(v.string(), v.toDate("Invalid Date")),
    dayType: v.enum(DayType, "Invalid Day Type"),
    routeId: v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.empty()),
        v.pipe(v.string(), v.trim(), v.uuid("Invalid Route ID"))
      ])
    )
  }),
  v.transform((input) => ({ ...input, routeId: input.routeId || null })),
  v.forward(
    v.partialCheck(
      [["dayType"], ["routeId"]],
      (data) => {
        if (data.dayType === DayType.WORK && !data.routeId) {
          return false
        }

        return true
      },
      "Route ID is required for working days"
    ),
    ["routeId"]
  )
)

const addTravelPlanSchema = v.pipe(
  v.object({
    employeeId: v.pipe(v.string(), v.trim(), v.uuid("Invalid Employee ID")),
    month: v.pipe(v.string(), v.toDate("Invalid Month")),
    createdById: v.pipe(v.string(), v.trim(), v.uuid("Invalid Created By ID")),
    planEntries: v.array(addTravelPlanEntrySchema)
  }),
  v.check((data) => {
    if (DateTime.fromJSDate(data.month).daysInMonth !== data.planEntries.length) {
      return false
    }

    return true
  }, "Plan entries must match the number of days in the month")
)

export const addTravelPlan = form(addTravelPlanSchema, async (travelPlan, issue) => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  console.debug("Adding Travel Plan with data", travelPlan)

  // sanity check for all work days have routeId
  const invalidIdx = travelPlan.planEntries.findIndex(
    (entry) => entry.dayType === DayType.WORK && !entry.routeId
  )
  if (invalidIdx !== -1) {
    invalid(issue.planEntries[invalidIdx].routeId("Route ID is required for working days"))
  }

  // just check the creator userId
  if (user.id !== travelPlan.createdById) {
    return { success: false, data: null, message: "Cross user requests not allowed" }
  }

  const { data: travelPlanObject, error } = await createTravelPlan(locals, travelPlan)

  if (travelPlanObject === null) {
    console.error("Failed to create travel plan", error)
    return { success: false, data: null, message: error }
  }

  console.debug("Travel Plan created successfully", travelPlanObject)
  getTravelPlansForMonth(travelPlanObject.month.toISOString().split("T", 2)[0]).refresh()

  return { data: travelPlanObject, success: true, message: "Travel plan created successfully" }
})

export const getTravelPlansForMonth = query.batch(
  v.pipe(v.string(), v.toDate("Invalid Date")),
  async (months) => {
    const { locals } = getRequestEvent()
    const { user, session, supabase } = requireAuthMaybeAdmin(locals)
    console.debug("Fetching Travel Plans for months", months)

    if (months.length === 0) {
      error(400, "No months provided")
    }

    const { data: travelPlans, error: dbError } = await getTravelPlansWithEmployeeForMonths(
      locals,
      months
    )

    if (travelPlans === null) {
      console.error("Failed to fetch travel plans", dbError)
      error(500, dbError)
    }

    // console.debug("Fetched Travel Plans", travelPlans)
    const lookup = new Map<string, TravelPlanWithEmployee[]>(
      travelPlans.map((tp) => {
        // See line 122 below
        const key = tp.month.toISOString().split("T", 2)[0]
        let plans = travelPlans.filter((x) => x.month.toISOString() === tp.month.toISOString())

        return [key, plans]
      })
    )

    return (month) => {
      // todo, an error is present here, presumably with sveltekit remote fns
      // it is supposed to be a parsed Date, but is a string
      // console.log(typeof month, month, lookup)
      return lookup.get(month.toString())
    }
  }
)
