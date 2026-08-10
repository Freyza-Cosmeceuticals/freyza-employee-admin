import { error, json } from "@sveltejs/kit"

import { DayType } from "@/lib/constants"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { createDailyReport } from "@/lib/server/db/dailyreport"
import { getRouteById } from "@/lib/server/db/route"
import { getEmployeeById } from "@/lib/server/db/user"
import { calculateExpenses } from "@/lib/server/expense"
import { DateTime } from "luxon"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "@/lib/server/api"

const beginReportSchema = v.object({
  date: v.pipe(v.string(), v.toDate("Invalid date")),
  dayType: v.enum(DayType, "Invalid day type"),
  routeId: v.nullable(v.optional(v.pipe(v.string(), v.uuid("Invalid route ID")))),
  travellingWithId: v.nullable(v.optional(v.pipe(v.string(), v.uuid("Invalid travelling with ID"))))
})

/**
 * Begins a daily report with required data after validation. Also calculates expenses.
 * @returns Created DailyReport
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const TAG = "POST: /api/reports/begin"
  console.time(TAG)

  try {
    const user = await requireApiAuth(request, locals.supabase)
    const employeeId = user.id

    const body = await request.json()
    const parsed = v.safeParse(beginReportSchema, body)

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
      throw error(400, { message: `Invalid payload`, data: issues })
    }

    const { date, dayType, routeId, travellingWithId } = parsed.output

    let expenses = { da: 0, ta: 0, total: 0 }

    if (dayType === DayType.WORK) {
      if (!routeId) throw error(400, "routeId is required for WORK days")

      const { data: employee, error: dbErrorEmp } = await getEmployeeById(locals, employeeId)

      if (dbErrorEmp !== null) throw error(400, dbErrorEmp)
      if (!employee) throw error(404, "Employee not found")

      const { data: route, error: dbErrorRt } = await getRouteById(locals, routeId)

      if (dbErrorRt !== null) throw error(400, dbErrorRt)
      if (!route) throw error(404, "Route not found")

      expenses = calculateExpenses(route.destLoc.id === employee.hqId, route.distanceKm)
      console.debug(
        "Expense calculated isHQ:",
        route.destLoc.id === employee.hqId,
        ", distance:",
        route.distanceKm,
        ", expenses:",
        expenses
      )
    }

    const reportData = {
      employeeId,
      date: date,
      dayType,
      routeId: dayType === DayType.WORK ? routeId : null,
      travellingWithId: dayType === DayType.WORK ? travellingWithId || null : null,
      da: expenses.da,
      ta: expenses.ta,
      // combined DA + TA
      totalExpense: expenses.total
    }

    const { data: insertedReport, error: dbErrorRep } = await createDailyReport(locals, reportData)

    if (dbErrorRep !== null) throw error(400, dbErrorRep)

    return json(
      {
        success: true,
        data: {
          ...insertedReport,
          date: DateTime.fromJSDate(insertedReport.date).toISODate()
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
