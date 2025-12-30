import prisma from "@/server/db/prisma"
import { type TravelPlan } from "@db/client"

import { handleDbError, requireAuthMaybeAdmin } from "./common"
import type { TravelPlanCreate, TravelPlanWithEmployee } from "@/types"

/**
 * Get all TravelPlans from the db
 * Requires Admin
 */
export async function getAllTravelPlans(
  locals: App.Locals
): Promise<{ data: TravelPlan[]; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      orderBy: {
        month: "desc"
      }
    })

    console.debug(`Found ${travelPlans.length} TravelPlans`)
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
  months: Date[]
): Promise<
  { data: Map<string, TravelPlanWithEmployee[]>; error: null } | { data: null; error: string }
> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  // TODO Add stats
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

    const grouped = travelPlans.reduce((map, travelPlan) => {
      const key = travelPlan.month.toISOString().split("T", 2)[0]
      if (!map.has(key)) map.set(key, [])

      map.get(key)!.push({ ...travelPlan, stats: { holidayDays: 12, leaveDays: 13, workDays: 14 } })
      return map
    }, new Map<string, TravelPlanWithEmployee[]>())

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
  employeeId: string,
  month: Date
): Promise<{ data: TravelPlanWithEmployee; error: null } | { data: null; error: string }> {
  try {
    const travelPlan = await prisma.travelPlan.findFirst({
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

    // @ts-ignore
    travelPlan.stats = {
      holidayDays: 12,
      leaveDays: 13,
      workDays: 14
    }

    // @ts-ignore
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

    console.debug("Created Successfully")
    return { data: travelPlanObject, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}
