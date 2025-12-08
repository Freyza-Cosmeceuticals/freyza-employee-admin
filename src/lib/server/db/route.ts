import type { Route } from "@db/client"
import { requireAdminAuth } from "./common"
import prisma from "./prisma"

/**
 * Get all Routes from the db
 * Does not require ADMIN
 */
export async function getAllRoutes(locals: App.Locals): Promise<Route[]> {
  const { user, session } = requireAdminAuth(locals, false)

  try {
    const routes: Route[] = await prisma.route.findMany()

    console.debug(`Found ${routes.length} routes`)
    return routes
  } catch (e) {
    console.error(e)
    return []
  }
}
