import { error, json } from "@sveltejs/kit"

import * as s from "@/lib/db/schema"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { db } from "@/lib/server/db/common"
import { eq } from "drizzle-orm"

import type { RequestHandler } from "./$types"

/**
 * Returns POI by ID
 * @returns POI
 */
export const GET: RequestHandler = async ({ request, locals, params }) => {
  const TAG = `GET: /api/poi/${params.poiId}`
  console.time(TAG)

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)

    const poiId = params.poiId
    if (!poiId) throw error(400, "Invalid POI ID")

    const poi = await db.query.poi.findFirst({
      where: eq(s.poi.id, poiId)
    })

    return json({ success: true, data: poi })
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
