import { requireAuthMaybeAdmin } from "./common"
import prisma from "./prisma"
import type { RouteWithName } from "@/types"

/**
 * Get all Routes from the db
 * Does not require ADMIN
 */
export async function getAllRoutes(locals: App.Locals): Promise<RouteWithName[]> {
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    // find routes with operational locations with names
    const routes: RouteWithName[] = await prisma.route.findMany({
      where: {
        srcLoc: { operational: true },
        destLoc: { operational: true },
      },
      include: {
        srcLoc: { select: { name: true, id: true } },
        destLoc: { select: { name: true, id: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.debug(`Found ${routes.length} routes`)
    return routes
  } catch (e) {
    console.error(e)
    return []
  }
}
