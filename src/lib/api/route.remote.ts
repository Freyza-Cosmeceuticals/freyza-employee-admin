import { getRequestEvent, query } from "$app/server"

import { getAllRoutes } from "$lib/server/db/route"

import { requireAuthMaybeAdmin } from "./common"
import type { RouteWithName } from "$lib/types"

/**
 * Fetch all routes
 * Does not require ADMIN
 */
export const fetchRoutes = query(async () => {
  const { locals } = getRequestEvent()
  const { claims, supabase } = await requireAuthMaybeAdmin(locals, false)

  const routes: RouteWithName[] = await getAllRoutes(locals)
  return routes
})
