import { error, json } from "@sveltejs/kit"

import { UserRole } from "@/lib/constants"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { getPlanMetrics as getPlanMetricsDb } from "@/lib/server/db/travelplan"

import type { RequestHandler } from "./$types"

/**
 * GET /api/plans/[id=uuid]/metrics
 * @param id The ID of the travel plan to fetch metrics for
 * @returns Calculated goal metrics for the specified travel plan until now based on all submitted reports
 */
export const GET: RequestHandler = async ({ request, locals, params }) => {
  const TAG = `GET: /api/plans/${params.id}/metrics`
  console.time(TAG)

  try {
    const { user } = await requireApiAuth(request, locals.supabase)
    const { id } = params

    if (!id) {
      throw error(400, "Invalid Travel Plan ID")
    }

    const { data, error: dbError } = await getPlanMetricsDb(id)

    if (dbError) {
      throw error(500, dbError ?? "Error generating metrics")
    }

    if (!data) {
      throw error(404, "Metrics not found")
    }

    // ownership / admin check
    if (user.app_metadata?.app_role !== UserRole.ADMIN && data.employeeId !== user.id) {
      throw error(403, "Forbidden: You cannot view metrics for this travel plan")
    }

    return json({
      success: true,
      data
    })
  } catch (e) {
    throw handleApiError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
