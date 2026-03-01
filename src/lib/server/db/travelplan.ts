import * as s from "$lib/db/schema"
import { DayType } from "$lib/types"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, handleDbError, requireAuthMaybeAdmin } from "./common"
import type {
  TravelPlan,
  TravelPlanCreate,
  TravelPlanEntryWithRoute,
  TravelPlanStats,
  TravelPlanWithEmployee,
  TravelPlanWithEmployeeWithEntries
} from "$lib/types"

const sEmployee = alias(s.user, "employee")
const sHq = alias(s.location, "hq")
const sSrc = alias(s.location, "srcLoc")
const sDest = alias(s.location, "destLoc")

/**
 * Calculate travel plan stats. Requires Admin
 * @param travelPlanId
 * @returns
 */
export async function getTravelPlanStats(
  locals: App.Locals,
  travelPlanId: string
): Promise<{ data: TravelPlanStats; error: null } | { data: null; error: string }> {
  let TAG = `DB: getTravelPlanStats(${travelPlanId})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const stats = await db
      .select({
        dayType: s.travelPlanEntry.dayType,
        count: sql<number>`count(${s.travelPlanEntry.id})`.mapWith(Number)
      })
      .from(s.travelPlanEntry)
      .where(eq(s.travelPlanEntry.tpId, travelPlanId))
      .groupBy(s.travelPlanEntry.dayType)

    const properStats = {
      workDays: stats.find((stat) => stat.dayType === DayType.WORK)?.count || 0,
      holidayDays: stats.find((stat) => stat.dayType === DayType.HOLIDAY)?.count || 0,
      leaveDays: stats.find((stat) => stat.dayType === DayType.LEAVE)?.count || 0
    }

    return { data: properStats, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all TravelPlans from the db
 * Requires Admin
 */
export async function getAllTravelPlans(
  locals: App.Locals
): Promise<{ data: TravelPlan[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: getAllTravelPlans()`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await db
      .select()
      .from(s.travelPlan)
      .orderBy(desc(s.travelPlan.month))

    return { data: travelPlans, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get a TravelPlan by ID with Employee Data optionally with entries
 * @param locals
 * @param tpId
 * @returns
 */
export async function getTravelPlanWithEmployeeOptionalEntriesById(
  locals: App.Locals,
  tpId: string,
  includeEntries: boolean = false
): Promise<
  | { data: TravelPlanWithEmployee | TravelPlanWithEmployeeWithEntries | null; error: null }
  | { data: null; error: string }
> {
  const TAG = `DB: getTravelPlanById(${tpId}, includeEntries: ${includeEntries})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const [rawTravelPlan] = await db
      .select()
      .from(s.travelPlan)
      .innerJoin(sEmployee, eq(s.travelPlan.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(eq(s.travelPlan.id, tpId))
      .limit(1)

    const travelPlan: TravelPlanWithEmployee | null = rawTravelPlan
      ? {
          ...rawTravelPlan.travelPlan,
          employee: {
            ...rawTravelPlan.employee,
            hq: rawTravelPlan.hq
          }
        }
      : null

    if (!travelPlan || !includeEntries) {
      return { data: travelPlan, error: null }
    }

    // TODO: I like the SQL syntax, but maybe migrate to this syntax for complex queries
    // console.log(
    //   await db.query.travelPlan.findMany({
    //     with: {
    //       travelPlanEntries: {
    //         with: {
    //           route: {
    //             with: {
    //               srcLoc: true,
    //               destLoc: true
    //             }
    //           }
    //         }
    //       }
    //     }
    //   })
    // )

    // If entries included, fetch them separately
    const rawPlanEntries = await db
      .select({
        entry: s.travelPlanEntry,
        route: s.route,

        srcLoc: sSrc,
        destLoc: sDest
      })
      .from(s.travelPlanEntry)
      .leftJoin(s.route, eq(s.travelPlanEntry.routeId, s.route.id))
      .leftJoin(sSrc, eq(s.route.srcLocId, sSrc.id))
      .leftJoin(sDest, eq(s.route.destLocId, sDest.id))
      .where(eq(s.travelPlanEntry.tpId, tpId))
      .orderBy(s.travelPlanEntry.date)

    const planEntries: TravelPlanEntryWithRoute[] = rawPlanEntries.map((entry) => ({
      ...entry.entry,
      route:
        entry.route && entry.srcLoc && entry.destLoc
          ? {
              ...entry.route,
              srcLoc: entry.srcLoc,
              destLoc: entry.destLoc
            }
          : null
    }))

    return { data: { ...travelPlan, planEntries }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all TravelPlans for the given month from the db
 * Requires Admin
 */
export async function getTravelPlansForMonth(
  locals: App.Locals,
  month: Date
): Promise<{ data: TravelPlan[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: getTravelPlansForMonth(${month.toISOString().split("T", 2)[0]})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await db
      .select()
      .from(s.travelPlan)
      .where(eq(s.travelPlan.month, month))
      .orderBy(desc(s.travelPlan.month))

    return { data: travelPlans, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all TravelPlans with employee information for the given months from the db, optionally including stats (expensive)
 * Requires Admin
 */
export async function getTravelPlansWithEmployeeForMonths(
  locals: App.Locals,
  months: Date[],
  includeStats = false
): Promise<
  { data: Map<string, TravelPlanWithEmployee[]>; error: null } | { data: null; error: string }
> {
  let TAG = `DB: getTravelPlansWithEmployeeForMonths(${months.length} MONTHS, includeStats: ${includeStats})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const rawTravelPlans = await db
      .select()
      .from(s.travelPlan)
      .innerJoin(sEmployee, eq(s.travelPlan.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(inArray(s.travelPlan.month, months))
      .orderBy(desc(s.travelPlan.month))

    const travelPlans: TravelPlanWithEmployee[] = rawTravelPlans.map((tp) => ({
      ...tp.travelPlan,
      employee: {
        ...tp.employee,
        hq: tp.hq
      }
    }))

    let grouped: Map<string, TravelPlanWithEmployee[]>

    if (includeStats) {
      grouped = await travelPlans.reduce(async (map, travelPlan) => {
        const key = travelPlan.month.toISOString().split("T", 1)[0]
        const acc = await map
        if (!acc.has(key)) acc.set(key, [])

        const stats = await getTravelPlanStats(locals, travelPlan.id)
        if (stats.data !== null) {
          acc.get(key)!.push({ ...travelPlan, stats: stats.data })
        }

        return acc
      }, Promise.resolve(new Map<string, TravelPlanWithEmployee[]>()))
    } else {
      grouped = travelPlans.reduce((map, travelPlan) => {
        const key = travelPlan.month.toISOString().split("T", 2)[0]
        if (!map.has(key)) map.set(key, [])

        map.get(key)!.push(travelPlan)

        return map
      }, new Map<string, TravelPlanWithEmployee[]>())
    }

    return { data: grouped, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all TravelPlans with employee information and entries for the given months from the db
 * Requires Admin
 */
export async function getTravelPlansWithEmployeeWithEntriesForMonths(
  locals: App.Locals,
  months: Date[]
): Promise<
  | { data: Map<string, TravelPlanWithEmployeeWithEntries[]>; error: null }
  | { data: null; error: string }
> {
  let TAG = `DB: getTravelPlansWithEmployeeForMonths(${months.length} MONTHS)`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    // 1) Fetch all travel plans with employee info in one query
    const plans = await db
      .select()
      .from(s.travelPlan)
      .innerJoin(sEmployee, eq(s.travelPlan.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(inArray(s.travelPlan.month, months))
      .orderBy(desc(s.travelPlan.month))

    // Map of plans by planId
    const planMap = new Map<string, TravelPlanWithEmployeeWithEntries>()

    plans.forEach((p) => {
      planMap.set(p.travelPlan.id, {
        ...p.travelPlan,
        employee: {
          ...p.employee,
          hq: p.hq
        },
        planEntries: []
      })
    })

    // If no plans, return empty
    if (planMap.size === 0) {
      return { data: new Map<string, TravelPlanWithEmployeeWithEntries[]>(), error: null }
    }

    // 2) Fetch all entries for these plans joined with route + locations
    const entryRows = await db
      .select({
        entry: s.travelPlanEntry,
        route: s.route,

        srcLoc: sSrc,
        destLoc: sDest
      })
      .from(s.travelPlanEntry)
      .leftJoin(s.route, eq(s.travelPlanEntry.routeId, s.route.id))
      .leftJoin(sSrc, eq(s.route.srcLocId, sSrc.id))
      .leftJoin(sDest, eq(s.route.destLocId, sDest.id))
      .where(inArray(s.travelPlanEntry.tpId, [...planMap.keys()]))
      .orderBy(asc(s.travelPlanEntry.date))

    // 3) Attach entries to matching plans in planMap
    entryRows.forEach((er) => {
      const plan = planMap.get(er.entry.tpId)
      if (plan) {
        plan.planEntries.push({
          ...er.entry,
          route:
            er.route && er.srcLoc && er.destLoc
              ? {
                  ...er.route,
                  srcLoc: er.srcLoc,
                  destLoc: er.destLoc
                }
              : null
        })
      }
    })

    // 4) Group plans by month key
    const grouped = new Map<string, TravelPlanWithEmployeeWithEntries[]>()

    for (const plan of planMap.values()) {
      const key = plan.month.toISOString().split("T", 1)[0]
      const bucket = grouped.get(key) ?? []
      bucket.push(plan)
      grouped.set(key, bucket)
    }

    return { data: grouped, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get travel plan with employee for an employee and month
 * Requires Admin
 */
export async function getTravelPlanWithEmployeeForEmployeeAndMonth(
  locals: App.Locals,
  employeeId: string,
  month: Date,
  includeStats = false
): Promise<{ data: TravelPlanWithEmployee | null; error: null } | { data: null; error: string }> {
  let TAG = `DB: getTravelPlanWithEmployeeForEmployeeAndMonth(${employeeId}, month: ${month.toISOString().split("T", 2)[0]}, includeStats: ${includeStats})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const [rawTravelPlan] = await db
      .select()
      .from(s.travelPlan)
      .innerJoin(sEmployee, eq(s.travelPlan.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(and(eq(sEmployee.id, employeeId), eq(s.travelPlan.month, month)))
      .orderBy(desc(s.travelPlan.month))
      .limit(1)

    const travelPlan: TravelPlanWithEmployee | null = rawTravelPlan
      ? {
          ...rawTravelPlan.travelPlan,
          employee: {
            ...rawTravelPlan.employee,
            hq: rawTravelPlan.hq
          }
        }
      : null

    if (includeStats && travelPlan) {
      const stats = await getTravelPlanStats(locals, travelPlan.id)
      if (stats.data !== null) travelPlan.stats = stats.data
    }

    return { data: travelPlan, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Create a new TravelPlan in the db
 * Requires Admin
 */
export async function createTravelPlan(
  locals: App.Locals,
  travelPlan: TravelPlanCreate
): Promise<{ data: TravelPlan; error: null } | { data: null; error: string }> {
  let TAG = `DB: createTravelPlan(${travelPlan.employeeId}, ${travelPlan.month.toISOString().split("T", 2)[0]})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  console.assert(user.id === travelPlan.createdById, "User ID does not match")

  if (user.id !== travelPlan.createdById) {
    return { data: null, error: "Cross user requests not allowed" }
  }

  try {
    const travelPlanObject = await db.transaction(async (tx) => {
      const [insertedPlan] = await tx
        .insert(s.travelPlan)
        .values({
          month: travelPlan.month,
          employeeId: travelPlan.employeeId,
          createdById: travelPlan.createdById
        })
        .returning()

      const newPlanId = insertedPlan.id

      await tx.insert(s.travelPlanEntry).values(
        travelPlan.planEntries.map((entry) => ({
          tpId: newPlanId,
          date: entry.date,
          dayType: entry.dayType,
          routeId: entry.routeId
        }))
      )

      return insertedPlan
    })

    return { data: travelPlanObject, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
