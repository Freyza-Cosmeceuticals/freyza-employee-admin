import { exit } from "node:process"

import * as schema from "$lib/db/index"

import { and, eq, or } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client, { schema })

console.log("Exiting... Read the seed script before execution")
exit()

const cityCoords: Record<string, [number, number]> = {
  Kishanganj: [26.0976, 87.942],
  Purnea: [25.7771, 87.4753],
  Sitamarhi: [26.5887, 85.5013],
  Saharsa: [25.8835, 86.6006],
  Madhepura: [25.9217, 86.7927],
  "Singhwara / Bhadwara": [26.15, 85.95],
  Jhanjharpur: [26.2647, 86.2738],
  Gaya: [24.7914, 84.9994],
  Motihari: [26.6559, 84.9186],
  Malda: [25.0108, 88.1411],
  Banka: [24.8856, 86.9198],
  Hajipur: [25.685, 85.209],
  "Jale / Pupri": [26.25, 85.7]
}

function randomPoint(lat: number, lng: number, radiusKm = 5) {
  const latOffset = (Math.random() - 0.5) * (radiusKm / 55.5)

  const lngOffset = (Math.random() - 0.5) * (radiusKm / (55.5 * Math.cos((lat * Math.PI) / 180)))

  return {
    latitude: lat + latOffset,
    longitude: lng + lngOffset
  }
}

type VisitSeed = {
  id: string
  destLocName: string
}

export async function randomizeVisitCoords(visits: VisitSeed[]) {
  await db.transaction(async (tx) => {
    for (const item of visits) {
      const center = cityCoords[item.destLocName]

      if (!center) {
        console.warn(`Missing city: ${item.destLocName}`)
        continue
      }

      const coords = randomPoint(...center)

      await tx
        .update(schema.visit)
        .set({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
        .where(
          and(
            eq(schema.visit.id, item.id),
            or(eq(schema.visit.latitude, 0), eq(schema.visit.longitude, 45))
          )
        )
    }
  })
}

async function main() {
  const visits = await db
    .select({
      id: schema.visit.id,
      destLocName: schema.location.name
    })
    .from(schema.visit)
    .innerJoin(schema.dailyReport, eq(schema.dailyReport.id, schema.visit.reportId))
    .innerJoin(schema.route, eq(schema.route.id, schema.dailyReport.routeId))
    .innerJoin(schema.location, eq(schema.location.id, schema.route.destLocId))
    .where(or(eq(schema.visit.latitude, 0), eq(schema.visit.longitude, 45)))

  console.log(`Found ${visits.length} visits`)

  // await randomizeVisitCoords(visits)

  console.log("Done randomizing visit coordinates")

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
