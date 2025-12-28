import prisma from "@/server/db/prisma"
import type { Location } from "@db/client"
import { requireAuthMaybeAdmin } from "./common"

/**
 * Get all Locations from the db
 * Does not require ADMIN
 */
export async function getAllLocations(locals: App.Locals): Promise<Location[]> {
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const locations: Location[] = await prisma.location.findMany({
      where: {
        operational: true
      },
      orderBy: {
        name: "asc"
      }
    })

    console.debug(`Found ${locations.length} locations`)
    return locations
  } catch (e) {
    console.error(e)
    return []
  }
}
