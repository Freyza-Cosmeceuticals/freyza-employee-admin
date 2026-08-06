import { getRequestEvent, query } from "$app/server"

import { getAllPois } from "$lib/server/db/poi"

import { requireAuthMaybeAdmin } from "./common"
import type { POIWithLocation } from "$lib/types"

/**
 * Fetch all POIs
 * Does not require ADMIN
 */
export const fetchPois = query(async () => {
  const { locals } = getRequestEvent()
  await requireAuthMaybeAdmin(locals, false)

  const pois: POIWithLocation[] = await getAllPois(locals)
  return pois
})
