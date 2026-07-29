import { getRequestEvent, query } from "$app/server"
import { error } from "@sveltejs/kit"

import {
  fetchDailyReports as fetchDailyReportsDb,
  getVisitById as getVisitByIdDb
} from "$lib/server/db/dailyreport"

import {
  getDailyReportByIdSchema,
  getDailyReportForDatesSchema,
  getVisitSchema
} from "@/lib/formSchemas"
import { DateTime } from "luxon"

import { requireAuthMaybeAdmin } from "./common"

/**
 * Remote query function to get all daily reports with employee info
 */
export const getAllDailyReports = query(async () => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  const { data: dailyReports, error: dbError } = await fetchDailyReportsDb(locals, {
    includeEmployee: true,
    includeRoute: true,
    includeNumVisits: true,
    includeTravellingWith: true
  })

  if (dbError !== null) {
    console.error("Failed to fetch daily reports", dbError)
    error(500, dbError)
  }

  return dailyReports
})

/**
 * Remote query function to get a daily report by Id
 */
export const getDailyReportById = query(getDailyReportByIdSchema, async (reportId) => {
  let TAG = `Remote: getDailyReportById(${reportId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: reports, error: dbError } = await fetchDailyReportsDb(locals, {
    reportId,
    includeEmployee: true
  })

  if (dbError !== null) {
    console.error("Failed to fetch daily report", dbError)
    error(500, "Failed to fetch daily report")
  }

  console.timeEnd(TAG)
  return reports && reports.length > 0 ? reports[0] : null
})

/**
 * Remote query function to get a daily report by Id with visits
 */
export const getDailyReportByIdWithVisits = query(getDailyReportByIdSchema, async (reportId) => {
  let TAG = `Remote: getDailyReportByIdWithVisits(${reportId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: reports, error: dbError } = await fetchDailyReportsDb(locals, {
    reportId: reportId,
    includeEmployee: true,
    includeVisits: true,
    includeTravellingWith: true
  })

  if (dbError !== null) {
    console.error("Failed to fetch daily report", dbError)
    error(500, "Failed to fetch daily report")
  }

  console.timeEnd(TAG)
  return reports && reports.length > 0 ? reports[0] : null
})

/**
 * Remote batch query function to get daily reports for a specific date
 * Requires Admin
 */
export const getDailyReportsForDate = query.batch(getDailyReportForDatesSchema, async (dates) => {
  let TAG = `Remote: getDailyReportsForDate(${dates.map((month) => DateTime.fromJSDate(month).toISODate()).join(", ")})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  if (dates.length === 0) {
    error(400, "No dates provided")
  }

  const { data: reports, error: dbError } = await fetchDailyReportsDb(locals, {
    includeEmployee: true,
    dates: dates
  })

  if (dbError !== null) {
    console.error("Failed to fetch daily reports", dbError)
    error(500, dbError)
  }

  const dailyReportsGrouped = new Map<string, typeof reports>()
  for (const report of reports) {
    const key = report.date.toISOString().split("T")[0]

    if (!dailyReportsGrouped.has(key)) dailyReportsGrouped.set(key, [])
    dailyReportsGrouped.get(key)!.push(report)
  }

  console.timeEnd(TAG)
  return (date) => dailyReportsGrouped.get(date.toISOString().split("T")[0]) || []
})

/**
 * Remote batch query function to get daily reports with visits for a specific date
 * Requires Admin
 */
export const getDailyReportsWithVisitsForDate = query.batch(
  getDailyReportForDatesSchema,
  async (dates) => {
    let TAG = `Remote: getDailyReportsWithVisitsForDate(${dates.map((date) => date.toISOString().split("T", 1)[0]).join(", ")})`
    console.time(TAG)

    const { locals } = getRequestEvent()
    const { user, session, supabase } = requireAuthMaybeAdmin(locals)

    if (dates.length === 0) {
      error(400, "No dates provided")
    }

    const { data: reports, error: dbError } = await fetchDailyReportsDb(locals, {
      dates: dates,
      includeEmployee: true,
      includeVisits: true
    })

    if (dbError !== null) {
      console.error("Failed to fetch daily reports", dbError)
      error(500, dbError)
    }

    const dailyReportsGrouped = new Map<string, typeof reports>()
    for (const report of reports) {
      const key = report.date.toISOString().split("T", 1)[0]

      if (!dailyReportsGrouped.has(key)) dailyReportsGrouped.set(key, [])
      dailyReportsGrouped.get(key)!.push(report)
    }

    console.timeEnd(TAG)
    return (date) => {
      // TODO: Convert this to luxon DateTime so that I can use .toISODate({precision: "month"})
      return dailyReportsGrouped.get(date.toISOString().split("T", 1)[0])
    }
  }
)

/**
 * Remote query function to get a visit by Id
 * Requires Admin
 */
export const getVisit = query(getVisitSchema, async (visitId) => {
  let TAG = `Remote: getVisit(${visitId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  const { data: visit, error: dbError } = await getVisitByIdDb(locals, visitId)

  if (dbError !== null) {
    console.error("Failed to fetch visit", dbError)
    error(500, dbError)
  }

  console.timeEnd(TAG)
  return visit
})
