import * as s from "$lib/db/schema"

import { and, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, requireAuthMaybeAdmin } from "./common"
import type { RouteWithName } from "$lib/types"

const sSrc = alias(s.location, "srcLoc")
const sDest = alias(s.location, "destLoc")

/**
 * Get all Routes from the db
 * Does not require ADMIN
 */
export async function getAllRoutes(locals: App.Locals): Promise<RouteWithName[]> {
  const TAG = "DB: getAllRoutes()"
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    // find routes with operational locations with names
    const routes: RouteWithName[] = await db
      .select({
        id: s.route.id,
        distanceKm: s.route.distanceKm,
        srcLoc: {
          id: sSrc.id,
          name: sSrc.name
        },
        destLoc: {
          id: sDest.id,
          name: sDest.name
        }
      })
      .from(s.route)
      .innerJoin(sSrc, eq(s.route.srcLocId, sSrc.id))
      .innerJoin(sDest, eq(s.route.destLocId, sDest.id))
      .where(and(eq(sSrc.operational, true), eq(sDest.operational, true)))
      .orderBy(desc(s.route.createdAt))

    return routes
  } catch (e) {
    console.error(e)
    return []
  } finally {
    console.timeEnd(TAG)
  }
}
