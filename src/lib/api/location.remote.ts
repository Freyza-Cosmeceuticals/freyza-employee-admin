import { getRequestEvent, query } from "$app/server"

import { getAllLocations } from "$lib/server/db/location"

import { requireAuthMaybeAdmin } from "./common"
import type { LocationWithName } from "$lib/types"

/**
 * Fetch all locations
 * Does not require ADMIN
 */
export const fetchLocations = query(async () => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const locations: LocationWithName[] = await getAllLocations(locals)
  return locations
})
