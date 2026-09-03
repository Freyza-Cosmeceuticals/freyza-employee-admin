import { getRequestEvent, query } from "$app/server"

import { getAllPois } from "$lib/server/db/poi"

import { requireAuthMaybeAdmin } from "./common"
import type { POIWithDetails, POIWithLocation } from "$lib/types"

/**
 * Fetch all POIs with location
 * Does not require ADMIN
 */
export const fetchPois = query(async () => {
  const { locals } = getRequestEvent()
  await requireAuthMaybeAdmin(locals, false)

  const pois: POIWithLocation[] = await getAllPois(locals)
  return pois
})

/**
 * Fetch all POIs with location, details and aggregated metrics
 * Does not require ADMIN
 */
export const fetchPoisWithDetails = query(async () => {
  const { locals } = getRequestEvent()
  await requireAuthMaybeAdmin(locals, false)

  const pois: POIWithDetails[] = await getAllPois(locals, { withDetails: true })
  return pois
})
