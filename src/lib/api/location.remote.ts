import { getRequestEvent, query } from "$app/server"
import { getAllLocations } from "@/server/db/location"
import type { Location } from "@db/client"
import { requireAuthMaybeAdmin } from "./common"

/**
 * Fetch all locations
 * Does not require ADMIN
 */
export const fetchLocations = query(async () => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const locations: Location[] = await getAllLocations(locals)
  return locations
})
