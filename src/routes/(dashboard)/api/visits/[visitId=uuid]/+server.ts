import { error, json } from "@sveltejs/kit"

import * as s from "$lib/db/schema"
import { handleApiError, requireApiAuth } from "$lib/server/api"
import { db } from "$lib/server/db/common"

import { and, eq, sql } from "drizzle-orm"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "$lib/server/api"

const updateVisitSchema = v.object({
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
 * Updates an existing visit with the provided data
 */
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  const TAG = `PUT: /api/visits/${params.visitId}`
  console.time(TAG)

  try {
    const user = await requireApiAuth(request, locals.supabase)
    const employeeId = user.id

    const body = await request.json()

    const parsed = v.safeParse(updateVisitSchema, body)
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

    // TODO: Move these to db layer in order to have better error handling and re-usability and transactions
    // insert new POI (if any) and visit inside a single transaction
    const updatedVisit = await db.transaction(async (tx) => {
      const [visit] = await tx.select().from(s.visit).where(eq(s.visit.id, params.visitId))
      if (!visit) error(404, "Visit not found")

      // check report
      const [report] = await tx
        .select({
          employeeId: s.dailyReport.employeeId,
          routeId: s.dailyReport.routeId,
          locked: s.dailyReport.locked
        })
        .from(s.dailyReport)
        .where(eq(s.dailyReport.id, visit.reportId))

      if (!report) {
        throw error(404, "Report not found")
      }
      if (report.employeeId !== employeeId) {
        throw error(403, "Forbidden: You do not own this report")
      }
      if (report.locked) {
        throw error(403, "Forbidden: Cannot update visits of a locked report")
      }

      let finalPoiId = data.poiId

      // we need to create a new POI
      if (data.newPoiName) {
        console.debug("Creating new POI", { newPoiName: data.newPoiName, reportId: visit.reportId })

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
          .where(eq(s.dailyReport.id, visit.reportId))

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
              eq(s.poi.type, visit.visitType),
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
            reportId: visit.reportId
          })

          const [newPoi] = await tx
            .insert(s.poi)
            .values({
              name: data.newPoiName,
              type: visit.visitType,
              locationId: locationId,
              latitude: visit.latitude,
              longitude: visit.longitude
            })
            .returning()

          finalPoiId = newPoi.id

          // create sub-POI entry accordingly
          console.debug("Inserting sub-POI", { poiId: finalPoiId, visitType: visit.visitType })
          if (visit.visitType === "DOCTOR") {
            await tx.insert(s.doctor).values({ id: finalPoiId })
          } else if (visit.visitType === "CHEMIST") {
            await tx.insert(s.chemist).values({ id: finalPoiId })
          } else if (visit.visitType === "STOCKIST") {
            await tx.insert(s.stockist).values({ id: finalPoiId })
          }
        }
      }

      if (!finalPoiId) {
        console.error("Failed to resolve POI ID")
        error(500, "Failed to resolve POI ID")
      }

      const [newVisit] = await tx
        .update(s.visit)
        .set({
          poiId: finalPoiId,

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
        .where(eq(s.visit.id, params.visitId))
        .returning()

      console.debug("Updated visit", { visitId: newVisit.id })
      return newVisit
    })

    console.log("Updated visit", { visitId: updatedVisit.id })
    return json({ success: true, data: updatedVisit })
  } catch (err: any) {
    throw handleApiError(err)
  } finally {
    console.timeEnd(TAG)
  }
}
