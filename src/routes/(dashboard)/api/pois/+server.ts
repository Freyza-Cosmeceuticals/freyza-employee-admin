import { error, json } from "@sveltejs/kit"

import * as s from "@/lib/db/schema"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { db } from "@/lib/server/db/common"
import { VisitType } from "@/lib/types"
import { and, asc, eq, inArray } from "drizzle-orm"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "@/lib/server/api"

const getPoiSchema = v.object({
  locationIds: v.pipe(
    v.string("locationIds is required"),
    v.transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
    v.array(v.pipe(v.string(), v.uuid("Invalid location ID"))),
    v.minLength(1, "At least one location ID is required")
  ),
  visitType: v.optional(v.enum(VisitType, "Invalid visit type"))
})

/**
 * Returns all POIs for a given location and visit type
 * Returns all POIs for the location only if type is omitted
 * @returns list of POIs
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const TAG = "GET: /api/pois"
  console.time(TAG)

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)

    const params = {
      locationIds: url.searchParams.get("locationIds") ?? "",
      visitType: url.searchParams.get("visitType") ?? undefined
    }
    const parsed = v.safeParse(getPoiSchema, params)

    if (!parsed.success) {
      const issues: ApiIssue[] = []

      for (const iss of parsed.issues) {
        issues.push({
          kind: iss.kind,
          input: iss.input,
          received: iss.received,
          message: iss.message,
          path: iss.path?.map((p) => ({ key: p.key })) ?? []
        })
      }

      console.error(parsed.issues)
      throw error(400, { message: "Invalid payload", data: issues })
    }

    const { locationIds, visitType } = parsed.output

    const conditions = [inArray(s.poi.locationId, locationIds)]
    if (visitType) conditions.push(eq(s.poi.type, visitType))

    const pois = await db.query.poi.findMany({
      where: and(...conditions),
      orderBy: [asc(s.poi.locationId), asc(s.poi.name)],
      with: { location: { columns: { id: true, name: true } } }
    })

    return json({ success: true, data: pois })
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
