import { error, json } from "@sveltejs/kit"

import * as s from "@/lib/db/schema"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { db } from "@/lib/server/db/common"
import { VisitType } from "@/lib/types"
import { and, asc, eq } from "drizzle-orm"
import * as v from "valibot"

import type { RequestHandler } from "./$types"

const getPoiSchema = v.object({
  locationId: v.pipe(v.string(), v.uuid("Invalid location ID")),
  visitType: v.enum(VisitType, "Invalid visit type")
})

/**
 * Returns all POIs for a given location and visit type
 * @returns list of POIs
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const TAG = "GET: /api/pois"
  console.time(TAG)

  try {
    const user = await requireApiAuth(request, locals.supabase)

    const employeeId = user.id

    const params = Object.fromEntries(url.searchParams.entries())
    const parsed = v.safeParse(getPoiSchema, params)

    if (!parsed.success) {
      console.error(parsed.issues)
      throw error(400, `Invalid payload`)
    }

    const { locationId, visitType } = parsed.output

    const pois = await db.query.poi.findMany({
      where: and(...conditions),
      orderBy: [asc(s.poi.name)]
    })

    return json({ success: true, data: pois })
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
