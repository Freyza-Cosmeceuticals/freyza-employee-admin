import { getRequestEvent, query } from "$app/server"
import { requireAdminAuth } from "./common"
import { getAllLocations } from "@/server/db/location"
import type { Location } from "@prisma/client"

/**
 * Fetch all locations
 * Does not require ADMIN
 */
export const fetchLocations = query(async () => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAdminAuth(locals, false)

  const locations: Location[] = await getAllLocations(locals)
  return locations
})
