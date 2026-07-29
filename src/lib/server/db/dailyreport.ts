import * as s from "$lib/db/schema"

import { and, count, desc, eq, inArray } from "drizzle-orm"

import { db, handleDbError } from "./common"
import type {
  DailyReport,
  DailyReportCreate,
  DailyReportFull,
  EmployeeWithHQ,
  RouteWithName,
  Visit
} from "$lib/types"

export type GetDailyReportsOptions = {
  // Filters
  reportId?: string
  employeeId?: string
  dates?: Date[]

  // Relations (Joins)
  includeEmployee?: boolean
  includeRoute?: boolean
  includeVisits?: boolean
  includeNumVisits?: boolean
  includeTravellingWith?: boolean
}

/**
 * Fetches daily reports from database using provided options
 * Requires Admin
 * @param locals
 * @param opts GetDailyReportsOptions
 */
export async function fetchDailyReports(
  locals: App.Locals,
  opts: GetDailyReportsOptions
): Promise<{ data: DailyReportFull[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: getDailyReports(opts: ${JSON.stringify(opts)})`
  console.time(TAG)

  try {
    const conditions = []

    if (opts.reportId) conditions.push(eq(s.dailyReport.id, opts.reportId))
    if (opts.employeeId) conditions.push(eq(s.dailyReport.employeeId, opts.employeeId))
    if (opts.dates) {
      if (opts.dates.length === 1) conditions.push(eq(s.dailyReport.date, opts.dates[0]))
      else if (opts.dates.length > 1) conditions.push(inArray(s.dailyReport.date, opts.dates))
    }

    const rawReports = await db.query.dailyReport.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(s.dailyReport.date)],

      with: {
        employee: opts.includeEmployee ? { with: { hq: true } } : undefined,
        route: opts.includeRoute ? { with: { srcLoc: true, destLoc: true } } : undefined,
        visits: opts.includeVisits ? true : undefined,
        travellingWith: opts.includeTravellingWith ? { with: { hq: true } } : undefined
      }
    })

    if (rawReports.length === 0) {
      return { data: [], error: null }
    }

    const countMap = new Map<string, number>()
    if (opts.includeNumVisits) {
      const reportIds = rawReports.map((r) => r.id)

      const visitCounts = await db
        .select({
          reportId: s.visit.reportId,
          count: count()
        })
        .from(s.visit)
        .where(inArray(s.visit.reportId, reportIds))
        .groupBy(s.visit.reportId)

      for (const vc of visitCounts) {
        countMap.set(vc.reportId, vc.count)
      }
    }

    const reports = rawReports.map((r) => ({
      ...r,
      numVisits: countMap.get(r.id) ?? 0,
      employee: r.employee as EmployeeWithHQ | null,
      route: r.route as RouteWithName | null,
      travellingWith: r.travellingWith as EmployeeWithHQ | null
    }))

    return { data: reports, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createDailyReport(
  locals: App.Locals,
  reportData: DailyReportCreate
): Promise<{ data: DailyReport; error: null } | { data: null; error: string }> {
  const TAG = "DB: createDailyReport()"
  console.time(TAG)

  try {
    const [report] = await db.insert(s.dailyReport).values(reportData).returning()

    return { data: report, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get Visit by Id
 * @param locals
 * @param visitId
 * @returns Visit or error
 */
export async function getVisitById(
  locals: App.Locals,
  visitId: string
): Promise<{ data: Visit | null; error: null } | { data: null; error: string }> {
  let TAG = `DB: getVisitById(${visitId})`
  console.time(TAG)

  try {
    const [visit] = await db.select().from(s.visit).where(eq(s.visit.id, visitId)).limit(1)
    return { data: visit, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
