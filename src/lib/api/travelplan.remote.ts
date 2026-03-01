import { form, getRequestEvent, query } from "$app/server"
import { error, invalid } from "@sveltejs/kit"

import {
  createTravelPlan as createTravelPlanDb,
  getTravelPlansWithEmployeeForMonths as getTravelPlansWithEmployeeForMonthsDb,
  getTravelPlansWithEmployeeWithEntriesForMonths as getTravelPlansWithEmployeeWithEntriesForMonthsDb,
  getTravelPlanWithEmployeeForEmployeeAndMonth as getTravelPlanWithEmployeeForEmployeeAndMonthDb,
  getTravelPlanWithEmployeeOptionalEntriesById as getTravelPlanWithEmployeeOptionalEntriesByIdDb
} from "$lib/server/db/travelplan"
import { DayType } from "$lib/types"

import {
  addTravelPlanSchema,
  getTravelPlanByIdSchema,
  getTravelPlanForMonthsSchema
} from "@/lib/formSchemas"
import { DateTime } from "luxon"

import { requireAuthMaybeAdmin } from "./common"
import type { TravelPlanWithEmployeeWithEntries } from "$lib/types"

/**
 * Remote form function to add a new Travel Plan given the travel plan data
 * It first checks for common errors and if a plan already exists for the employee for this month
 * and then creates the plan.
 * Requires Admin
 */
export const addTravelPlan = form(addTravelPlanSchema, async (travelPlan, issue) => {
  let TAG = `Remote: addTravelPlan(${{ ...travelPlan }})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

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

  // check if a plan already exists for the employee for this month
  const { data: potentialPlan, error: dbError } =
    await getTravelPlanWithEmployeeForEmployeeAndMonthDb(
      locals,
      travelPlan.employeeId,
      travelPlan.month
    )

  // if a plan already exists return error, or continue creation if this query failed for some reason
  if (potentialPlan !== null && !dbError) {
    console.error("A Travel plan already exists for this employee.")
    const monthName = DateTime.fromISO(potentialPlan.month.toISOString()).monthLong
    return {
      success: false,
      data: null,
      message: `A Travel plan for ${monthName} already exists for this employee.`
    }
  }

  if (dbError) {
    console.error("Failed to check for existing travel plan", dbError)
  }

  const { data: travelPlanObject, error } = await createTravelPlanDb(locals, travelPlan)

  if (travelPlanObject === null) {
    console.error("Failed to create travel plan", error)
    return { success: false, data: null, message: error }
  }

  // refresh the get plans for month
  getTravelPlansForMonth(travelPlanObject.month.toISOString().split("T", 1)[0]).refresh()

  console.timeEnd(TAG)
  return { data: travelPlanObject, success: true, message: "Travel plan created successfully" }
})

/**
 * Remote query function to get a travel plan by Id
 */
export const getTravelPlanById = query(getTravelPlanByIdSchema, async (tpId) => {
  let TAG = `Remote: getTravelPlanById(${tpId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: travelPlan, error: dbError } = await getTravelPlanWithEmployeeOptionalEntriesByIdDb(
    locals,
    tpId
  )

  if (dbError !== null) {
    console.error("Failed to fetch travel plan", dbError)
    error(500, "Failed to fetch travel plan")
  }

  console.timeEnd(TAG)
  return travelPlan
})

/**
 * Remote query function to get a travel plan by Id with Entries
 */
export const getTravelPlanByIdWithEntries = query(getTravelPlanByIdSchema, async (tpId) => {
  let TAG = `Remote: getTravelPlanByIdWithEntries(${tpId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: travelPlan, error: dbError } = await getTravelPlanWithEmployeeOptionalEntriesByIdDb(
    locals,
    tpId,
    true
  )

  if (dbError !== null) {
    console.error("Failed to fetch travel plan", dbError)
    error(500, "Failed to fetch travel plan")
  }

  console.timeEnd(TAG)
  return travelPlan as TravelPlanWithEmployeeWithEntries | null
})

/**
 * Remote batch query function to get travel plans for a specific month
 * Requires Admin
 */
export const getTravelPlansForMonth = query.batch(getTravelPlanForMonthsSchema, async (months) => {
  let TAG = `Remote: getTravelPlansForMonth(${months.map((month) => month.toISOString().split("T", 1)[0]).join(", ")})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  if (months.length === 0) {
    error(400, "No months provided")
  }

  const { data: travelPlans, error: dbError } = await getTravelPlansWithEmployeeForMonthsDb(
    locals,
    months,
    true
  )

  if (dbError !== null) {
    console.error("Failed to fetch travel plans", dbError)
    error(500, dbError)
  }

  console.timeEnd(TAG)
  return (month) => {
    // TODO: Convert this to luxon DateTime so that I can use .toISODate({precision: "month"})
    return travelPlans.get(month.toISOString().split("T", 1)[0])
  }
})

/**
 * Remote batch query function to get travel plans for a specific month
 * Requires Admin
 */
export const getTravelPlansWithEntriesForMonth = query.batch(
  getTravelPlanForMonthsSchema,
  async (months) => {
    let TAG = `Remote: getTravelPlansWithEntriesForMonth(${months.map((month) => month.toISOString().split("T", 1)[0]).join(", ")})`
    console.time(TAG)

    const { locals } = getRequestEvent()
    const { user, session, supabase } = requireAuthMaybeAdmin(locals)

    if (months.length === 0) {
      error(400, "No months provided")
    }

    const { data: travelPlans, error: dbError } =
      await getTravelPlansWithEmployeeWithEntriesForMonthsDb(locals, months)

    if (dbError !== null) {
      console.error("Failed to fetch travel plans", dbError)
      error(500, dbError)
    }

    console.timeEnd(TAG)
    return (month) => {
      // TODO: Convert this to luxon DateTime so that I can use .toISODate({precision: "month"})
      return travelPlans.get(month.toISOString().split("T", 1)[0])
    }
  }
)
