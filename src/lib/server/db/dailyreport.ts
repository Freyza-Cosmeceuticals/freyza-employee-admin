import * as s from "$lib/db/schema"

import { and, desc, eq, inArray } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, handleDbError, requireAuthMaybeAdmin } from "./common"
import type {
  DailyReport,
  DailyReportWithEmployee,
  DailyReportWithEmployeeWithVisits,
  DailyReportWithRoute,
  Visit
} from "$lib/types"

const sEmployee = alias(s.user, "employee")
const sHq = alias(s.location, "hq")

/**
 * Get all DailyReports from the db
 * Requires Admin
 */
export async function getAllDailyReports(
  locals: App.Locals
): Promise<{ data: DailyReport[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: getAllDailyReports()`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const dailyReports: DailyReport[] = await db
      .select()
      .from(s.dailyReport)
      .orderBy(desc(s.dailyReport.date))

    return { data: dailyReports, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get a DailyReport by ID with Employee Data optionally with visits
 * @param locals
 * @param reportId
 * @returns
 */
export async function getDailyReportWithEmployeeOptionalVisitsById(
  locals: App.Locals,
  reportId: string,
  includeVisits: boolean = false
): Promise<
  | { data: DailyReportWithEmployee | DailyReportWithEmployeeWithVisits | null; error: null }
  | { data: null; error: string }
> {
  const TAG = `DB: getDailyReportById(${reportId}, includeVisits: ${includeVisits})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const [rawDailyReport] = await db
      .select()
      .from(s.dailyReport)
      .innerJoin(sEmployee, eq(s.dailyReport.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(eq(s.dailyReport.id, reportId))
      .limit(1)

    const dailyReport: DailyReportWithEmployee | null = rawDailyReport
      ? {
          ...rawDailyReport.dailyReport,
          employee: {
            ...rawDailyReport.employee,
            hq: rawDailyReport.hq
          }
        }
      : null

    if (!dailyReport || !includeVisits) {
      return { data: dailyReport, error: null }
    }

    // If visits included, fetch them separately
    const rawVisits = await db
      .select({
        visit: s.visit
      })
      .from(s.visit)
      .where(eq(s.visit.reportId, reportId))

    const visits: Visit[] = rawVisits.map((visit) => ({ ...visit.visit }))

    return { data: { ...dailyReport, visits: visits }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all DailyReports for the given date from the db
 * Requires Admin
 */
export async function getDailyReportsForDate(
  locals: App.Locals,
  date: Date
): Promise<{ data: DailyReport[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: getDailyReportsForDate(${date.toISOString().split("T", 1)[0]})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const dailyReports: DailyReport[] = await db
      .select()
      .from(s.dailyReport)
      .where(eq(s.dailyReport.date, date))
      .orderBy(desc(s.dailyReport.date))

    return { data: dailyReports, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all DailyReports with employee information for the given dates from the db
 * Requires Admin
 */
export async function getDailyReportsWithEmployeeForDates(
  locals: App.Locals,
  dates: Date[]
): Promise<
  { data: Map<string, DailyReportWithEmployee[]>; error: null } | { data: null; error: string }
> {
  let TAG = `DB: getDailyReportsWithEmployeeForDates(${dates.length} DATES)`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const rawDailyReports = await db
      .select()
      .from(s.dailyReport)
      .innerJoin(sEmployee, eq(s.dailyReport.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(inArray(s.dailyReport.date, dates))
      .orderBy(desc(s.dailyReport.date))

    const dailyReports: DailyReportWithEmployee[] = rawDailyReports.map((dr) => ({
      ...dr.dailyReport,
      employee: {
        ...dr.employee,
        hq: dr.hq
      }
    }))

    const grouped: Map<string, DailyReportWithEmployee[]> = dailyReports.reduce(
      (map, dailyReport) => {
        const key = dailyReport.date.toISOString().split("T", 1)[0]
        if (!map.has(key)) map.set(key, [])

        map.get(key)!.push(dailyReport)
        return map
      },
      new Map<string, DailyReportWithEmployee[]>()
    )

    return { data: grouped, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get all DailyReports with employee information and visits for the given dates from the db
 * Requires Admin
 */
export async function getDailyReportsWithEmployeeWithVisitsForDates(
  locals: App.Locals,
  dates: Date[]
): Promise<
  | { data: Map<string, DailyReportWithEmployeeWithVisits[]>; error: null }
  | { data: null; error: string }
> {
  let TAG = `DB: getDailyReportsWithEmployeeWithVisitsForDates(${dates.length} DATES)`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    // 1) Fetch all daily reports with employee info in one query
    const reports = await db
      .select()
      .from(s.dailyReport)
      .innerJoin(sEmployee, eq(s.dailyReport.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(inArray(s.dailyReport.date, dates))
      .orderBy(desc(s.dailyReport.date))

    // Map of reports by planId
    const reportMap = new Map<string, DailyReportWithEmployeeWithVisits>()

    reports.forEach((p) => {
      reportMap.set(p.dailyReport.id, {
        ...p.dailyReport,
        employee: {
          ...p.employee,
          hq: p.hq
        },
        visits: []
      })
    })

    // If no plans, return empty
    if (reportMap.size === 0) {
      return { data: new Map<string, DailyReportWithEmployeeWithVisits[]>(), error: null }
    }

    // 2) Fetch all visits for these reports
    const visitRows = await db
      .select({
        visit: s.visit
      })
      .from(s.visit)
      .where(inArray(s.visit.reportId, [...reportMap.keys()]))

    // 3) Attach entries to matching plans in planMap
    visitRows.forEach((vst) => {
      const report = reportMap.get(vst.visit.reportId)
      if (report) {
        report.visits.push({ ...vst.visit })
      }
    })

    // 4) Group plans by date key
    const grouped = new Map<string, DailyReportWithEmployeeWithVisits[]>()

    for (const report of reportMap.values()) {
      const key = report.date.toISOString().split("T", 1)[0]
      const bucket = grouped.get(key) ?? []
      bucket.push(report)
      grouped.set(key, bucket)
    }

    return { data: grouped, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get daily report with employee for an employee and date
 * Requires Admin
 */
export async function getDailyReportWithEmployeeForEmployeeAndDate(
  locals: App.Locals,
  employeeId: string,
  date: Date
): Promise<{ data: DailyReportWithEmployee | null; error: null } | { data: null; error: string }> {
  let TAG = `DB: getDailyReportWithEmployeeForEmployeeAndDate(${employeeId}, date: ${date.toISOString().split("T", 1)[0]})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const [rawDailyReport] = await db
      .select()
      .from(s.dailyReport)
      .innerJoin(sEmployee, eq(s.dailyReport.employeeId, sEmployee.id))
      .innerJoin(sHq, eq(sEmployee.hqId, sHq.id))
      .where(and(eq(sEmployee.id, employeeId), eq(s.dailyReport.date, date)))
      .orderBy(desc(s.dailyReport.date))
      .limit(1)

    const dailyReport: DailyReportWithEmployee | null = rawDailyReport
      ? {
          ...rawDailyReport.dailyReport,
          employee: {
            ...rawDailyReport.employee,
            hq: rawDailyReport.hq
          }
        }
      : null

    return { data: dailyReport, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
