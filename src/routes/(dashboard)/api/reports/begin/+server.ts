import { error, json } from "@sveltejs/kit"

import { DayType } from "@/lib/constants"
import { handleApiError } from "@/lib/server/api"
import { createDailyReport } from "@/lib/server/db/dailyreport"
import { getRouteById } from "@/lib/server/db/route"
import { getEmployeeById } from "@/lib/server/db/user"
import { calculateExpenses } from "@/lib/server/expense"
import * as v from "valibot"

import type { RequestHandler } from "./$types"

const beginReportSchema = v.object({
  date: v.pipe(v.string(), v.toDate()),
  dayType: v.enum(DayType),
  routeId: v.nullable(v.optional(v.pipe(v.string(), v.uuid()))),
  travellingWithId: v.nullable(v.optional(v.pipe(v.string(), v.uuid())))
})

/**
 * Begins a daily report with required data after validation. Also calculates expenses.
 * @returns Created DailyReport
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const TAG = "POST: /api/reports/begin"
  console.time(TAG)

  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      throw error(401, "Missing Authorization header")
    }

    const {
      data: { user },
      error: authError
    } = await locals.supabase.auth.getUser(token)
    if (authError || !user) {
      throw error(401, "Invalid token")
    }

    const employeeId = user.id

    const body = await request.json()
    const parsed = v.safeParse(beginReportSchema, body)

    if (!parsed.success) {
      console.error(parsed.issues)
      throw error(400, `Invalid payload`)
    }

    const { date, dayType, routeId, travellingWithId } = parsed.output

    let expenses = { da: 0, ta: 0, pa: 0, total: 0 }

    if (dayType === DayType.WORK) {
      if (!routeId) throw error(400, "routeId is required for WORK days")

      const { data: employee, error: dbErrorEmp } = await getEmployeeById(locals, employeeId)
      if (dbErrorEmp !== null) {
        console.error(dbErrorEmp)
        throw error(500, "Internal Server Error")
      }

      const { data: route, error: dbErrorRt } = await getRouteById(locals, routeId)
      if (dbErrorRt !== null) {
        console.error(dbErrorRt)
        throw error(500, "Internal Server Error")
      }

      if (!employee || !route) {
        throw error(404, "Employee or Route not found")
      }

      expenses = calculateExpenses(route.destLoc.id === employee.hqId, route.distanceKm)
    }

    const reportData = {
      employeeId,
      date: new Date(date),
      dayType,
      routeId: dayType === DayType.WORK ? routeId : null,
      travellingWithId: dayType === DayType.WORK ? travellingWithId || null : null,
      da: expenses.da,
      ta: expenses.ta,
      // PA is combined into total
      totalExpense: expenses.total
    }

    // return json({
    //   success: false,
    //   data: reportData
    // })

    const { data: insertedReport, error: dbErrorRep } = await createDailyReport(locals, reportData)

    if (dbErrorRep !== null) {
      console.error(dbErrorRep)
      throw error(500, "Internal Server Error")
    }

    return json(
      {
        success: true,
        data: {
          ...insertedReport,
          date: insertedReport.date.toISOString().split("T", 1)[0]
        }
      },
      { status: 201 }
    )
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
