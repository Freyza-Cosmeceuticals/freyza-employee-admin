import * as s from "$lib/db/schema"

import { desc, eq, isNull } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

// Strict check: Require DRY_RUN to be explicitly defined as "true" or "false"
const dryRunEnv = process.env.DRY_RUN?.toLowerCase().trim()
if (dryRunEnv !== "true" && dryRunEnv !== "false") {
  console.error(
    "❌ FATAL: Environment variable DRY_RUN must be explicitly set to 'true' or 'false'."
  )
  console.error("Usage example:")
  console.error("  DRY_RUN=true bun run src/lib/server/scripts/migrate-pois.ts")
  console.error("  DRY_RUN=false bun run src/lib/server/scripts/migrate-pois.ts")
  process.exit(1)
}

const DRY_RUN = dryRunEnv === "true"

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client, { schema: s })

// Helper to collapse whitespace and trim
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

// Key for our in-memory cache: "locationId:type:normalized_name_lowercase"
function makePoiKey(locationId: string, type: string, name: string): string {
  return `${locationId}:${type}:${normalizeName(name).toLowerCase()}`
}

async function migratePOIs() {
  console.log(`Starting POI Migration... [DRY_RUN = ${DRY_RUN}]`)

  try {
    await db.transaction(async (tx) => {
      // 1. Fetch ALL existing POIs to seed our in-memory lookup cache
      const existingPois = await tx.select().from(s.poi)
      const poiCache = new Map<string, string>() // Key -> poi.id

      for (const p of existingPois) {
        const key = makePoiKey(p.locationId, p.type, p.name)
        poiCache.set(key, p.id)
      }
      console.log(`Seeded cache with ${poiCache.size} existing POIs from DB.`)

      // 2. Fetch pending visits with associated route & destination location
      const pendingVisits = await tx
        .select({
          visit: s.visit,
          report: s.dailyReport,
          route: s.route
        })
        .from(s.visit)
        .innerJoin(s.dailyReport, eq(s.visit.reportId, s.dailyReport.id))
        .innerJoin(s.route, eq(s.dailyReport.routeId, s.route.id))
        .where(isNull(s.visit.poiId))
        .orderBy(desc(s.visit.createdAt))

      console.log(`Found ${pendingVisits.length} visits to migrate.`)

      if (pendingVisits.length === 0) {
        console.log("No visits to migrate. Exiting.")
        return
      }

      let createdPoiCount = 0
      let linkedVisitCount = 0

      // 3. Process each visit
      for (const row of pendingVisits) {
        const { visit, route } = row

        // Extract raw target name
        let rawName: string | null = ""
        // if (visit.visitType === "DOCTOR") rawName = visit.doctorName
        // else if (visit.visitType === "CHEMIST") rawName = visit.chemistName
        // else if (visit.visitType === "STOCKIST") rawName = visit.stockistName

        if (!rawName || !rawName.trim()) {
          console.warn(`⚠️ Visit ${visit.id} has empty name for type ${visit.visitType}. Skipping.`)
          continue
        }

        const cleanName = normalizeName(rawName)
        const locationId = route.destLocId

        if (!locationId) {
          console.error(`❌ Visit ${visit.id} has a route without destLocId! Aborting row.`)
          continue
        }

        const cacheKey = makePoiKey(locationId, visit.visitType, cleanName)
        let poiId = poiCache.get(cacheKey)

        // Create POI if not found in cache
        if (!poiId) {
          console.log(
            `✨ Creating POI: "${cleanName}" (${visit.visitType}) in location ${locationId}`
          )

          const [newPoi] = await tx
            .insert(s.poi)
            .values({
              name: cleanName,
              type: visit.visitType,
              locationId: locationId,
              latitude: visit.latitude,
              longitude: visit.longitude
            })
            .returning()

          poiId = newPoi.id

          // Insert specialized entity sub-record
          if (visit.visitType === "DOCTOR") {
            await tx.insert(s.doctor).values({ id: poiId })
          } else if (visit.visitType === "CHEMIST") {
            await tx.insert(s.chemist).values({ id: poiId })
          } else if (visit.visitType === "STOCKIST") {
            await tx.insert(s.stockist).values({ id: poiId })
          }

          // Cache immediately so subsequent loop iterations reuse this POI
          poiCache.set(cacheKey, poiId)
          createdPoiCount++
        } else {
          console.log(`🔗 Reusing POI: "${cleanName}" -> ID: ${poiId}`)
        }

        // Link the POI to the Visit
        await tx.update(s.visit).set({ poiId }).where(eq(s.visit.id, visit.id))
        linkedVisitCount++
      }

      console.log(`\n--- Summary ---`)
      console.log(`Created POIs: ${createdPoiCount}`)
      console.log(`Linked Visits: ${linkedVisitCount} / ${pendingVisits.length}`)

      // 4. Rollback if DRY_RUN is true
      if (DRY_RUN) {
        console.log(`\n🧪 DRY_RUN is TRUE. Rolling back transaction! No changes saved.`)
        tx.rollback()
      } else {
        console.log(`\n🚀 DRY_RUN is FALSE. Committing transaction to database!`)
      }
    })
  } catch (err: any) {
    if (DRY_RUN && err?.message?.includes("Rollback")) {
      console.log("✅ Test run completed successfully (Rollback verified).")
      process.exit(0)
    }
    console.error("❌ Migration Error:", err)
    process.exit(1)
  }

  process.exit(0)
}

migratePOIs().catch(console.error)
