import * as s from "$lib/db/schema"

import { asc, eq } from "drizzle-orm"

import { db } from "./common"
import type { POIWithLocation } from "$lib/types"

/**
 * Get all POIs from the db with their location name
 * Does not require ADMIN
 */
export async function getAllPois(locals: App.Locals): Promise<POIWithLocation[]> {
  const TAG = "DB: getAllPois()"
  console.time(TAG)

  try {
    const pois: POIWithLocation[] = await db
      .select({
        id: s.poi.id,
        name: s.poi.name,
        type: s.poi.type,
        locationId: s.poi.locationId,
        latitude: s.poi.latitude,
        longitude: s.poi.longitude,
        createdAt: s.poi.createdAt,
        updatedAt: s.poi.updatedAt,
        location: {
          id: s.location.id,
          name: s.location.name
        }
      })
      .from(s.poi)
      .innerJoin(s.location, eq(s.poi.locationId, s.location.id))
      .orderBy(asc(s.poi.name))

    return pois
  } catch (e) {
    console.error(e)
    return []
  } finally {
    console.timeEnd(TAG)
  }
}
