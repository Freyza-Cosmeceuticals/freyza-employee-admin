import { error, json } from "@sveltejs/kit"

import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { getAllEmployees } from "@/lib/server/db/user"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "@/lib/server/api"

const getEmployeesSchema = v.object({
  hqId: v.optional(v.pipe(v.string(), v.uuid("Invalid HQ ID")))
})

/**
 * Returns a list of employees based on the passed parameters
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const TAG = "GET: /api/employees"
  console.time(TAG)

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)

    const params = Object.fromEntries(url.searchParams.entries())
    const parsed = v.safeParse(getEmployeesSchema, params)

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

    const { hqId } = parsed.output

    let employees = await getAllEmployees(locals)
    if (hqId) {
      employees = employees.filter((e) => e.hq?.id === hqId)
    }

    return json({ success: true, data: employees })
  } catch (e) {
    throw handleApiError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
