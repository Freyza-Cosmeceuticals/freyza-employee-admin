import type { TravelPlan } from "@db/client"
import { requireAdminAuth } from "./common"
import prisma from "@/server/db/prisma"

/**
 * Get all TravelPlans from the db
 * Requires Admin
 */
export async function getAllTravelPlans(locals: App.Locals): Promise<TravelPlan[]> {
  const { user, session } = requireAdminAuth(locals)

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
