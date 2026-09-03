import * as s from "$lib/db/schema"
import { DayType } from "$lib/types"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"

import { db, handleDbError } from "./common"
import type {
  EmployeeWithHQ,
  TravelPlan,
  TravelPlanCreate,
  TravelPlanEntryWithRoute,
  TravelPlanFull,
  TravelPlanMetrics,
  TravelPlanStats
} from "$lib/types"

export type GetTravelPlansOptions = {
  // Filters
  planId?: string
  employeeId?: string
  months?: Date[]

  // Relations (Joins)
  includeEmployee?: boolean
  includeEntries?: boolean
  includeStats?: boolean
  includeMetrics?: boolean
}

/**
 * Fetches travel plans from database using provided options
 * Requires Admin
 * @param locals
 * @param opts GetTravelPlansOptions
 */
export async function fetchTravelPlans(
  locals: App.Locals,
  opts: GetTravelPlansOptions
): Promise<{ data: TravelPlanFull[]; error: null } | { data: null; error: string }> {
  const TAG = `DB: fetchTravelPlans(opts: ${JSON.stringify(opts)})`
  console.time(TAG)

  try {
    const conditions = []

    if (opts.planId) conditions.push(eq(s.travelPlan.id, opts.planId))
    if (opts.employeeId) conditions.push(eq(s.travelPlan.employeeId, opts.employeeId))
    if (opts.months) {
      if (opts.months.length === 1) conditions.push(eq(s.travelPlan.month, opts.months[0]))
      else if (opts.months.length > 1) conditions.push(inArray(s.travelPlan.month, opts.months))
    }

    const rawPlans = await db.query.travelPlan.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(s.travelPlan.month)],

      with: {
        assignedEmployee: opts.includeEmployee
          ? {
              with: {
                hq: true
              }
            }
          : undefined,
        travelPlanEntries: opts.includeEntries
          ? {
              with: {
                route: {
                  with: {
                    srcLoc: true,
                    destLoc: true
                  }
                }
              },
              orderBy: [asc(s.travelPlanEntry.date)]
            }
          : undefined
      }
    })

    if (rawPlans.length === 0) {
      return { data: [], error: null }
    }

    const statsMap = new Map<string, TravelPlanStats>()
    if (opts.includeStats) {
      const planIds = rawPlans.map((p) => p.id)

      const rawStats = await db
        .select({
          tpId: s.travelPlanEntry.tpId,
          dayType: s.travelPlanEntry.dayType,
          count: sql<number>`count(${s.travelPlanEntry.id})`.mapWith(Number)
        })
        .from(s.travelPlanEntry)
        .where(inArray(s.travelPlanEntry.tpId, planIds))
        .groupBy(s.travelPlanEntry.tpId, s.travelPlanEntry.dayType)

      for (const pId of planIds) {
        statsMap.set(pId, { workDays: 0, holidayDays: 0, leaveDays: 0 })
      }

      for (const stat of rawStats) {
        const stats = statsMap.get(stat.tpId)
        if (stats) {
          if (stat.dayType === DayType.WORK) stats.workDays = stat.count
          else if (stat.dayType === DayType.HOLIDAY) stats.holidayDays = stat.count
          else if (stat.dayType === DayType.LEAVE) stats.leaveDays = stat.count
        }
      }
    }

    let metricsMap = new Map<string, TravelPlanMetrics>()
    if (opts.includeMetrics) {
      const planIds = rawPlans.map((p) => p.id)
      metricsMap = await getPlansMetricsMap(planIds)
    }

    const plans = rawPlans.map((r) => {
      const { assignedEmployee, travelPlanEntries, ...rest } = r
      return {
        ...rest,
        employee: (assignedEmployee as EmployeeWithHQ) ?? null,
        planEntries: (travelPlanEntries as TravelPlanEntryWithRoute[]) ?? null,
        stats: statsMap.get(r.id) ?? null,
        metrics: metricsMap.get(r.id) ?? null
      }
    })

    return { data: plans, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Create a new TravelPlan in the db
 * Requires Admin
 */
export async function createTravelPlan(
  locals: App.Locals,
  travelPlan: TravelPlanCreate
): Promise<{ data: TravelPlan; error: null } | { data: null; error: string }> {
  const TAG = `DB: createTravelPlan(${travelPlan.employeeId}, ${travelPlan.month.toISOString().split("T", 2)[0]})`
  console.time(TAG)

  try {
    const travelPlanObject = await db.transaction(async (tx) => {
      const [insertedPlan] = await tx
        .insert(s.travelPlan)
        .values({
          month: travelPlan.month,
          employeeId: travelPlan.employeeId,
          createdById: travelPlan.createdById
        })
        .returning()

      const newPlanId = insertedPlan.id

      await tx.insert(s.travelPlanEntry).values(
        travelPlan.planEntries.map((entry) => ({
          tpId: newPlanId,
          date: entry.date,
          dayType: entry.dayType,
          routeId: entry.routeId
        }))
      )

      return insertedPlan
    })

    return { data: travelPlanObject, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Batch fetches metrics for an array of travel plan IDs
 */
export async function getPlansMetricsMap(
  planIds: string[]
): Promise<Map<string, TravelPlanMetrics>> {
  if (planIds.length === 0) return new Map()

  const rawMetrics = await db
    .select({
      tpId: s.travelPlan.id,
      targetAmount: s.travelPlan.salesTarget,
      employeeId: s.travelPlan.employeeId,
      totalOrderAmount: sql<number>`COALESCE(SUM(${s.visit.orderAmount}::numeric), 0)::int`,
      totalAmountWithoutGST: sql<number>`COALESCE(SUM(${s.visit.amountWithoutGST}::numeric), 0)::int`,
      numReports: sql<number>`COALESCE(COUNT(DISTINCT ${s.dailyReport.id}), 0)::int`,
      numVisits: sql<number>`COALESCE(COUNT(DISTINCT ${s.visit.id}), 0)::int`
    })
    .from(s.travelPlan)
    .leftJoin(
      s.dailyReport,
      and(
        eq(s.dailyReport.employeeId, s.travelPlan.employeeId),
        sql`EXTRACT(MONTH FROM ${s.dailyReport.date}) = EXTRACT(MONTH FROM ${s.travelPlan.month})`,
        sql`EXTRACT(YEAR FROM ${s.dailyReport.date}) = EXTRACT(YEAR FROM ${s.travelPlan.month})`
      )
    )
    .leftJoin(s.visit, eq(s.visit.reportId, s.dailyReport.id))
    .where(
      planIds.length === 1 ? eq(s.travelPlan.id, planIds[0]) : inArray(s.travelPlan.id, planIds)
    )
    .groupBy(s.travelPlan.id, s.travelPlan.salesTarget, s.travelPlan.employeeId)

  const metricsMap = new Map<string, TravelPlanMetrics>()
  for (const m of rawMetrics) {
    metricsMap.set(m.tpId, {
      targetAmount: m.targetAmount,
      employeeId: m.employeeId,
      totalOrderAmount: m.totalOrderAmount,
      totalAmountWithoutGST: m.totalAmountWithoutGST,
      totalAmount: m.totalOrderAmount + m.totalAmountWithoutGST,
      numReports: m.numReports,
      numVisits: m.numVisits
    })
  }

  return metricsMap
}

export async function getPlanMetrics(
  id: string
): Promise<{ data: TravelPlanMetrics; error: null } | { data: null; error: string }> {
  const TAG = `DB: getPlanMetrics(${id})`
  console.time(TAG)

  try {
    const metricsMap = await getPlansMetricsMap([id])
    const result = metricsMap.get(id)

    if (!result) {
      return { data: null, error: "Travel plan not found" }
    }

    return {
      data: result,
      error: null
    }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
