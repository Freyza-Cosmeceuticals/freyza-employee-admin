import { form, getRequestEvent } from "$app/server"
import { DayType } from "@db/client"
import { invalid } from "@sveltejs/kit"
import { DateTime } from "luxon"
import z from "zod"
import { requireAuthMaybeAdmin } from "./common"
import { createTravelPlan } from "@/server/db/travelplan"

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

  if (!travelPlanObject) {
    console.error("Failed to create travel plan", error)
    return { success: false, data: null, message: error }
  }

  console.debug("Travel Plan created successfully", travelPlanObject)

  return { data: travelPlanObject, success: true, message: "Travel plan created successfully" }
})
