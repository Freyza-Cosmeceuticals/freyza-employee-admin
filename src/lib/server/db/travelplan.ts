import prisma from "@/server/db/prisma"
import { DayType } from "@db/client"

import { handleDbError, requireAuthMaybeAdmin } from "./common"
import type { TravelPlanCreate, TravelPlanStats, TravelPlanWithEmployee } from "@/types"
import type { TravelPlan } from "@db/client"

/**
 * Calculate travel plan stats. Requires Admin
 * @param travelPlanId
 * @returns
 */
export async function getTravelPlanStats(
  locals: App.Locals,
  travelPlanId: string
): Promise<{ data: TravelPlanStats; error: null } | { data: null; error: string }> {
  try {
    let TAG = `DB: getTravelPlanStats(${travelPlanId})`
    console.time(TAG)
    const { user, session } = requireAuthMaybeAdmin(locals)

    const stats = await prisma.travelPlanEntry.groupBy({
      by: ["tpId", "dayType"],
      where: { tpId: travelPlanId },
      _count: { id: true }
    })

    const properStats = {
      workDays: stats.find((stat) => stat.dayType === DayType.WORK)?._count.id || 0,
      holidayDays: stats.find((stat) => stat.dayType === DayType.HOLIDAY)?._count.id || 0,
      leaveDays: stats.find((stat) => stat.dayType === DayType.LEAVE)?._count.id || 0
    }

    console.timeEnd(TAG)
    return { data: properStats, error: null }
  } catch (e) {
    return handleDbError(e)
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
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      orderBy: {
        month: "desc"
      }
    })

    console.debug(`Found ${travelPlans.length} TravelPlans`)
    console.timeEnd(TAG)
    return { data: travelPlans, error: null }
  } catch (e) {
    return handleDbError(e)
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
  const TAG = `DB: getTravelPlansForMonth(${month})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      where: {
        month
      },
      orderBy: {
        month: "desc"
      }
    })

    console.debug(
      `Found ${travelPlans.length} TravelPlans for month ${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, "0")}`
    )
    console.timeEnd(TAG)
    return { data: travelPlans, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}

/**
 * Get all TravelPlans with employee information for the given months from the db
 * Requires Admin
 */
export async function getTravelPlansWithEmployeeForMonths(
  locals: App.Locals,
  months: Date[],
  includeStats = false
): Promise<
  { data: Map<string, TravelPlanWithEmployee[]>; error: null } | { data: null; error: string }
> {
  let TAG = `DB: getTravelPlansWithEmployeeForMonths(${months.length} MONTHS)`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans = await prisma.travelPlan.findMany({
      where: {
        month: {
          in: months
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            tier: true
          }
        }
      },
      orderBy: {
        month: "desc"
      }
    })

    let grouped: Map<string, TravelPlanWithEmployee[]>

    if (includeStats) {
      grouped = await travelPlans.reduce(async (map, travelPlan) => {
        const key = travelPlan.month.toISOString().split("T", 2)[0]
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

    console.timeEnd(TAG)
    return { data: grouped, error: null }
  } catch (e) {
    return handleDbError(e)
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
  try {
    let TAG = `DB: getTravelPlanWithEmployeeForEmployeeAndMonth(${employeeId}, ${month.toISOString().split("T", 2)[0]})`
    console.time(TAG)
    const { user, session } = requireAuthMaybeAdmin(locals)

    const travelPlan: TravelPlanWithEmployee | null = await prisma.travelPlan.findFirst({
      where: {
        employeeId,
        month
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            tier: true
          }
        }
      },
      orderBy: {
        month: "desc"
      }
    })

    if (includeStats && travelPlan) {
      const stats = await getTravelPlanStats(locals, travelPlan.id)
      if (stats.data !== null) travelPlan.stats = stats.data
    }

    console.timeEnd(TAG)
    return { data: travelPlan, error: null }
  } catch (e) {
    return handleDbError(e)
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

  console.debug("Creating TravelPlan", travelPlan)
  console.assert(user.id === travelPlan.createdById, "User ID does not match")

  if (user.id !== travelPlan.createdById) {
    return { data: null, error: "Cross user requests not allowed" }
  }

  try {
    const travelPlanObject = await prisma.travelPlan.create({
      data: {
        month: travelPlan.month,
        employeeId: travelPlan.employeeId,
        createdById: travelPlan.createdById,
        planEntries: {
          createMany: {
            data: travelPlan.planEntries.map((entry) => ({
              date: entry.date,
              dayType: entry.dayType,
              routeId: entry.routeId
            }))
          }
        }
      }
    })

    console.debug("Travel Plan Created Successfully")
    console.timeEnd(TAG)
    return { data: travelPlanObject, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}
