import * as s from "$lib/db/schema"

import { eq, inArray, sql } from "drizzle-orm"

import { db } from "./common"
import type { POIWithDetails, POIWithLocation } from "$lib/types"

export type GetPOIOptions = {
  withDetails?: boolean
}

/**
 * Get all POIs from the db.
 * Optionally includes doctor/stockist subtype details and aggregated visit metrics when `withDetails: true`.
 * Does not require ADMIN
 */
export async function getAllPois(
  locals: App.Locals,
  options: { withDetails: true }
): Promise<POIWithDetails[]>
export async function getAllPois(
  locals: App.Locals,
  options?: { withDetails?: false }
): Promise<POIWithLocation[]>
export async function getAllPois(
  locals: App.Locals,
  options?: GetPOIOptions
): Promise<POIWithDetails[] | POIWithLocation[]> {
  const TAG = `DB: getAllPois(${JSON.stringify(options)})`
  console.time(TAG)

  try {
    const rawPois = await db.query.poi.findMany({
      orderBy: (poi, { asc }) => [asc(poi.name)],
      with: {
        location: {
          columns: {
            id: true,
            name: true
          }
        },
        doctors: options?.withDetails ? true : undefined,
        chemists: options?.withDetails ? true : undefined,
        stockists: options?.withDetails ? true : undefined
      }
    })

    if (rawPois.length === 0) {
      return []
    }

    if (options?.withDetails) {
      const poiIds = rawPois.map((p) => p.id)

      const visitStats = await db
        .select({
          poiId: s.visit.poiId,
          numVisits: sql<number>`COALESCE(COUNT(${s.visit.id}), 0)::int`,
          totalSales: sql<number>`COALESCE(SUM(${s.visit.orderAmount}::numeric), 0)::int`,
          totalCollections: sql<number>`COALESCE(SUM(${s.visit.amountWithoutGST}::numeric), 0)::int`,
          outstandingAmount: sql<number>`COALESCE(SUM(${s.visit.outstandingAmount}::numeric), 0)::int`,
          lastVisitedDate: sql<Date | null>`MAX(${s.dailyReport.date})`
        })
        .from(s.visit)
        .leftJoin(s.dailyReport, eq(s.visit.reportId, s.dailyReport.id))
        .where(inArray(s.visit.poiId, poiIds))
        .groupBy(s.visit.poiId)

      const statsMap = new Map<string, (typeof visitStats)[number]>()
      for (const stat of visitStats) {
        statsMap.set(stat.poiId, stat)
      }

      const pois: POIWithDetails[] = rawPois.map((p) => {
        const stats = statsMap.get(p.id)
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          locationId: p.locationId,
          latitude: p.latitude,
          longitude: p.longitude,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          location: p.location,
          doctor: p.doctors
            ? {
                id: p.doctors.id,
                specialty: p.doctors.specialty,
                clinicName: p.doctors.clinicName
              }
            : null,
          stockist: p.stockists
            ? {
                id: p.stockists.id,
                gstNumber: p.stockists.gstNumber
              }
            : null,
          chemist: p.chemists
            ? {
                id: p.chemists.id
              }
            : null,
          numVisits: stats?.numVisits ?? 0,
          totalSales: stats?.totalSales ?? 0,
          totalCollections: stats?.totalCollections ?? 0,
          outstandingAmount: stats?.outstandingAmount ?? 0,
          lastVisitedDate: stats?.lastVisitedDate ? new Date(stats.lastVisitedDate) : null
        }
      })

      return pois
    }

    const pois: POIWithLocation[] = rawPois.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      locationId: p.locationId,
      latitude: p.latitude,
      longitude: p.longitude,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      location: p.location
    }))

    return pois
  } catch (e) {
    console.error(e)
    return []
  } finally {
    console.timeEnd(TAG)
  }
}
