import { db, requireAuthMaybeAdmin } from "./common"
import type { LocationWithName } from "$lib/types"

/**
 * Get all Locations from the db
 * Does not require ADMIN
 */
export async function getAllLocations(locals: App.Locals): Promise<LocationWithName[]> {
  const TAG = "DB: getAllLocations()"
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const locations: LocationWithName[] = await db.query.location.findMany({
      where: (location, { eq }) => eq(location.operational, true),
      columns: {
        id: true,
        name: true
      },
      orderBy: (location, { asc }) => asc(location.name)
    })

    return locations
  } catch (e) {
    console.error(e)
    return []
  } finally {
    console.timeEnd(TAG)
  }
}
