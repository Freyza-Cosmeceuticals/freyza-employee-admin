import { Prisma, type TravelPlan } from "@db/client"
import { requireAuthMaybeAdmin } from "./common"
import prisma from "@/server/db/prisma"
import type { TravelPlanCreate } from "@/types"

/**
 * Get all TravelPlans from the db
 * Requires Admin
 */
export async function getAllTravelPlans(locals: App.Locals): Promise<TravelPlan[]> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const travelPlans: TravelPlan[] = await prisma.travelPlan.findMany({
      orderBy: {
        month: "desc",
      },
    })

    console.debug(`Found ${travelPlans.length} TravelPlans`)
    return travelPlans
  } catch (e) {
    console.error(e)
    return []
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(e)
      return { data: null, error: e.message }
    }

    console.error(e)
    return { data: null, error: "An unknown error has occurred" }
  }
}
