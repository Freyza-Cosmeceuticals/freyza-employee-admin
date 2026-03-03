import { getRequestEvent, query } from "$app/server"
import { error } from "@sveltejs/kit"

import {
  getDailyReportsWithEmployeeForDates as getDailyReportsWithEmployeeForDatesDb,
  getDailyReportsWithEmployeeWithVisitsForDates as getDailyReportsWithEmployeeWithVisitsForDatesDb,
  getDailyReportWithEmployeeOptionalVisitsById as getDailyReportWithEmployeeOptionalVisitsByIdDb
} from "$lib/server/db/dailyreport"

import { getDailyReportByIdSchema, getDailyReportForDatesSchema } from "@/lib/formSchemas"

import { requireAuthMaybeAdmin } from "./common"
import type { DailyReportWithEmployeeWithVisits } from "$lib/types"

/**
 * Remote query function to get a daily report by Id
 */
export const getDailyReportById = query(getDailyReportByIdSchema, async (tpId) => {
  let TAG = `Remote: getDailyReportById(${tpId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: dailyReport, error: dbError } =
    await getDailyReportWithEmployeeOptionalVisitsByIdDb(locals, tpId)

  if (dbError !== null) {
    console.error("Failed to fetch daily report", dbError)
    error(500, "Failed to fetch daily report")
  }

  console.timeEnd(TAG)
  return dailyReport
})

/**
 * Remote query function to get a daily report by Id with visits
 */
export const getDailyReportByIdWithVisits = query(getDailyReportByIdSchema, async (reportId) => {
  let TAG = `Remote: getDailyReportByIdWithVisits(${reportId})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals, false)

  const { data: dailyReport, error: dbError } =
    await getDailyReportWithEmployeeOptionalVisitsByIdDb(locals, reportId, true)

  if (dbError !== null) {
    console.error("Failed to fetch daily report", dbError)
    error(500, "Failed to fetch daily report")
  }

  console.timeEnd(TAG)
  return dailyReport as DailyReportWithEmployeeWithVisits | null
})

/**
 * Remote batch query function to get daily reports for a specific date
 * Requires Admin
 */
export const getDailyReportsForDate = query.batch(getDailyReportForDatesSchema, async (dates) => {
  let TAG = `Remote: getDailyReportsForDate(${dates.map((month) => month.toISOString().split("T", 1)[0]).join(", ")})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  if (dates.length === 0) {
    error(400, "No dates provided")
  }

  const { data: dailyReports, error: dbError } = await getDailyReportsWithEmployeeForDatesDb(
    locals,
    dates
  )

  if (dbError !== null) {
    console.error("Failed to fetch daily reports", dbError)
    error(500, dbError)
  }

  console.timeEnd(TAG)
  return (date) => {
    // TODO: Convert this to luxon DateTime so that I can use .toISODate()
    return dailyReports.get(date.toISOString().split("T", 1)[0])
  }
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

    const { data: dailyReports, error: dbError } =
      await getDailyReportsWithEmployeeWithVisitsForDatesDb(locals, dates)

    if (dbError !== null) {
      console.error("Failed to fetch daily reports", dbError)
      error(500, dbError)
    }

    console.timeEnd(TAG)
    return (date) => {
      // TODO: Convert this to luxon DateTime so that I can use .toISODate({precision: "month"})
      return dailyReports.get(date.toISOString().split("T", 1)[0])
    }
  }
)
