import prisma from "@/server/db/prisma"
import type { TravelPlanCreate, TravelPlanWithEmployee } from "@/types"
import { type TravelPlan } from "@db/client"
import { handleDbError, requireAuthMaybeAdmin } from "./common"

/**
 * Get all TravelPlans from the db
 * Requires Admin
 */
export async function getAllTravelPlans(
  locals: App.Locals,
): Promise<{ data: TravelPlan[]; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      orderBy: {
        month: "desc",
      },
    })

    console.debug(`Found ${travelPlans.length} TravelPlans`)
    return { data: travelPlans, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}

/**
 * Get all TravelPlans for the given months from the db
 * Requires Admin
 */
export async function getTravelPlansForMonths(
  locals: App.Locals,
  months: Date[],
): Promise<{ data: TravelPlan[]; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      where: {
        month: {
          in: months,
        },
      },
      orderBy: {
        month: "desc",
      },
    })

    console.debug(
      `Found ${travelPlans.length} TravelPlans for months ${months.map(m => m.toISOString()).join(" ")}`,
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
  months: Date[],
): Promise<{ data: TravelPlanWithEmployee[]; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans = await prisma.travelPlan.findMany({
      where: {
        month: {
          in: months,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
      orderBy: {
        month: "desc",
      },
    })

    console.debug(
      `Found ${travelPlans.length} TravelPlans for months ${months.map(m => m.toISOString()).join(" ")}`,
    )
    return { data: travelPlans, error: null }
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
  travelPlan: TravelPlanCreate,
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
            data: travelPlan.planEntries.map(entry => ({
              date: entry.date,
              dayType: entry.dayType,
              routeId: entry.routeId,
            })),
          },
        },
      },
    })

    console.debug("Created Successfully")
    return { data: travelPlanObject, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}
