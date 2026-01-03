import prisma from "$lib/server/db/prisma"

import { requireAuthMaybeAdmin } from "./common"
import type { LocationWithName } from "$lib/types"

/**
 * Get all Locations from the db
 * Does not require ADMIN
 */
export async function getAllLocations(locals: App.Locals): Promise<LocationWithName[]> {
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const locations: LocationWithName[] = await prisma.location.findMany({
      where: {
        operational: true
      },
      select: { name: true, id: true },
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
