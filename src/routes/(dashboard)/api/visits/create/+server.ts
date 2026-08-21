import { error, json } from "@sveltejs/kit"

import { VisitType } from "$lib/constants"
import * as s from "$lib/db/schema"
import { handleApiError, requireApiAuth } from "$lib/server/api"
import { db } from "$lib/server/db/common"

import { and, eq, sql } from "drizzle-orm"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "$lib/server/api"

const createVisitSchema = v.object({
  reportId: v.pipe(v.string(), v.uuid("reportId must be a valid UUID")),
  visitType: v.enum(VisitType, "visitType must be a valid visit type"),

  latitude: v.number(),
  longitude: v.number(),

  poiId: v.optional(v.nullable(v.pipe(v.string(), v.uuid("poiId must be a valid UUID")))),
  newPoiName: v.optional(
    v.nullable(
      v.pipe(
        v.string(),
        v.trim(),
        v.minLength(3, "Point of Interest name must be at least 3 characters long")
      )
    )
  ),

  productDetails: v.optional(
    v.array(
      v.object({
        name: v.pipe(
          v.string(),
          v.trim(),
          v.minLength(3, "Product name must be at least 3 character long")
        ),
        rate: v.pipe(v.string(), v.decimal(), v.toNumber()),
        quantity: v.pipe(v.number(), v.minValue(1, "Quantity must be at least 1"))
      })
    ),
    []
  ),
  samplesGiven: v.optional(
    v.array(
      v.pipe(v.string(), v.trim(), v.minLength(3, "Sample name must be at least 3 characters long"))
    ),
    []
  ),
  orderTaken: v.optional(v.boolean(), false),

  billNo: v.optional(v.nullable(v.string())),

  paymentCollected: v.optional(v.boolean(), false),
  amountWithGST: v.optional(v.nullable(v.pipe(v.string(), v.decimal()))),
  amountWithoutGST: v.optional(v.nullable(v.pipe(v.string(), v.decimal()))),

  outstandingAmount: v.optional(v.nullable(v.pipe(v.string(), v.decimal()))),
  orderAmount: v.optional(v.nullable(v.pipe(v.string(), v.decimal()))),
  stockChecked: v.optional(v.boolean(), false),

  additionalNotes: v.optional(v.string())
})

/**
 * Creates a new visit with the provided data
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const TAG = "GET: /api/visits/create"
  console.time(TAG)

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)
    const employeeId = user.id

    const body = await request.json()
    const parsed = v.safeParse(createVisitSchema, body)
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

    const data = parsed.output

    if (!data.poiId && !data.newPoiName) {
      console.error("Neither poiId nor newPoiName was provided")
      throw error(400, "Must provide either poiId or newPoiName")
    }

    // TODO: Move these to db layer in order to have better error handling
    // insert new POI (if any) and visit inside a single transaction
    const insertedVisit = await db.transaction(async (tx) => {
      // check the report
      const [report] = await tx
        .select({
          employeeId: s.dailyReport.employeeId,
          routeId: s.dailyReport.routeId,
          locked: s.dailyReport.locked
        })
        .from(s.dailyReport)
        .where(eq(s.dailyReport.id, data.reportId))

      if (!report) {
        throw error(404, "Report not found")
      }
      if (report.employeeId !== employeeId) {
        throw error(403, "Forbidden: You do not own this report")
      }
      if (report.locked) {
        throw error(403, "Forbidden: Cannot add visits to a locked report")
      }

      let finalPoiId = data.poiId

      // we need to create a new POI
      if (!finalPoiId && data.newPoiName) {
        console.debug("Creating new POI", { newPoiName: data.newPoiName, reportId: data.reportId })

        const [report] = await tx
          .select({
            employeeId: s.dailyReport.employeeId,
            destLoc: {
              id: s.location.id
            }
          })
          .from(s.dailyReport)
          .innerJoin(s.route, eq(s.dailyReport.routeId, s.route.id))
          .leftJoin(s.location, eq(s.route.destLocId, s.location.id))
          .where(eq(s.dailyReport.id, data.reportId))

        if (!report) error(404, "Report not found")
        if (!report.destLoc) error(404, "Report has no route")

        let locationId = report.destLoc.id

        // check for existing POI
        const [existingPoi] = await tx
          .select()
          .from(s.poi)
          .where(
            and(
              eq(s.poi.locationId, locationId),
              eq(s.poi.type, data.visitType),
              sql`lower(${s.poi.name}) = lower(${data.newPoiName})`
            )
          )
          .limit(1)

        if (existingPoi) {
          console.debug("Found existing POI", {
            poiId: existingPoi.id,
            newPoiName: data.newPoiName
          })

          finalPoiId = existingPoi.id
        } else {
          // create one, use visits coords
          console.debug("Inserting new POI", {
            newPoiName: data.newPoiName,
            reportId: data.reportId
          })

          const [newPoi] = await tx
            .insert(s.poi)
            .values({
              name: data.newPoiName,
              type: data.visitType,
              locationId: locationId,
              latitude: data.latitude,
              longitude: data.longitude
            })
            .returning()

          finalPoiId = newPoi.id

          // create sub-POI entry accordingly
          console.debug("Inserting sub-POI", { poiId: finalPoiId, visitType: data.visitType })
          if (data.visitType === "DOCTOR") {
            await tx.insert(s.doctor).values({ id: finalPoiId })
          } else if (data.visitType === "CHEMIST") {
            await tx.insert(s.chemist).values({ id: finalPoiId })
          } else if (data.visitType === "STOCKIST") {
            await tx.insert(s.stockist).values({ id: finalPoiId })
          }
        }
      }

      if (!finalPoiId) {
        console.error("Failed to resolve POI ID")
        throw error(500, "Failed to resolve POI ID")
      }

      const distanceFromPOI = 0

      const [newVisit] = await tx
        .insert(s.visit)
        .values({
          reportId: data.reportId,
          employeeId: employeeId,
          visitType: data.visitType,
          poiId: finalPoiId,

          latitude: data.latitude,
          longitude: data.longitude,
          distanceMetersFromPOI: distanceFromPOI,

          productDetails: data.productDetails,
          samplesGiven: data.samplesGiven,
          orderTaken: data.orderTaken,

          billNo: data.billNo,

          paymentCollected: data.paymentCollected,
          amountWithGST: data.amountWithGST,
          amountWithoutGST: data.amountWithoutGST,

          outstandingAmount: data.outstandingAmount,
          orderAmount: data.orderAmount,
          stockChecked: data.stockChecked,

          additionalNotes: data.additionalNotes
        })
        .returning()

      console.debug("Inserted visit", { visitId: newVisit.id })
      return newVisit
    })

    console.log("Added visit", { visitId: insertedVisit.id })
    return json({ success: true, data: insertedVisit })
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
