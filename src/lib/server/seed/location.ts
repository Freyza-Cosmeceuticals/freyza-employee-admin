import { exit } from "process"

import * as schema from "$lib/db/index"
import {
  type LocationCreate as LocationCreateOptionalID,
  type RouteCreate as RouteCreateOptionalID
} from "$lib/types"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client, { schema })

type LocationCreate = LocationCreateOptionalID & { id: string }
type RouteCreate = RouteCreateOptionalID & { id: string }

const PURNEA: LocationCreate = {
  id: "a5703cd0-2bc3-45ee-b640-6345481f1613",
  name: "Purnea",
  operational: true
}

const KATIHAR: LocationCreate = {
  id: "e1408ee4-a947-474d-b1fc-3f4c60cb42fc",
  name: "Katihar",
  operational: true
}

const KISHANGANJ: LocationCreate = {
  id: "68f3376d-4f37-4f6d-b9fe-02eb499a96ab",
  name: "Kishanganj",
  operational: true
}

const ARARIA: LocationCreate = {
  id: "4ece93c6-4816-4ec8-adeb-67b2f2c93d12",
  name: "Araria",
  operational: true
}

const MADHEPURA: LocationCreate = {
  id: "89e2baf1-a223-4585-9d09-124516fcfe18",
  name: "Madhepura",
  operational: true
}

const SAHARSA: LocationCreate = {
  id: "72729f70-2ca9-4723-9e33-c8593cce617e",
  name: "Saharsa",
  operational: true
}

const MALDA: LocationCreate = {
  id: "cbd45637-6d74-47eb-87a5-21f5e6aaf7f3",
  name: "Malda",
  operational: true
}

const DARBHANGA: LocationCreate = {
  id: "6b20d406-94d3-4e36-89a4-1b12dd1e561e",
  name: "Darbhanga",
  operational: true
}

const PATNA: LocationCreate = {
  id: "cb28fe84-bb93-4a5f-b340-9ed507c93a39",
  name: "Patna",
  operational: true
}

const MADHUBANI: LocationCreate = {
  id: "7af9efe5-4c42-41de-bba1-933faca00232",
  name: "Madhubani",
  operational: true
}

const SUPAUL: LocationCreate = {
  id: "b8f6ef90-32a4-41ba-80fd-2cd9f71298a2",
  name: "Supaul",
  operational: true
}

const BEGUSARAI: LocationCreate = {
  id: "b4683951-d823-4db2-b633-cf033d5847d4",
  name: "Begusarai",
  operational: true
}

const SAMASTIPUR: LocationCreate = {
  id: "0297a506-75ce-4c4c-96b1-5ee7047ab75e",
  name: "Samastipur",
  operational: true
}

const SAKRI: LocationCreate = {
  id: "f9577dfb-f8c2-44b0-90df-859f0d822b21",
  name: "Sakri",
  operational: true
}

const JHANJHARPUR: LocationCreate = {
  id: "f2e3f85e-eeee-45f3-85d6-3a6104144951",
  name: "Jhanjharpur",
  operational: true
}

const BAHERI_BIRAUL: LocationCreate = {
  id: "fe1bf51a-94fc-4039-adf5-9bb63605a773",
  name: "Baheri / Biraul",
  operational: true
}

const SINGHWARA_BHADWARA: LocationCreate = {
  id: "50b66a5d-f160-447d-94a9-a96baa960a39",
  name: "Singhwara / Bhadwara",
  operational: true
}

const JALE_PUPRI: LocationCreate = {
  id: "b3440bdc-6f29-43dc-8c61-1badd64c8dff",
  name: "Jale / Pupri",
  operational: true
}

const SITAMARHI: LocationCreate = {
  id: "4697af47-a6b7-4b3e-a4a6-34e0cabe6e85",
  name: "Sitamarhi",
  operational: true
}

const MUZAFFARPUR: LocationCreate = {
  id: "abe31e62-5167-43f1-8f5b-f9ae7f8a8178",
  name: "Muzaffarpur",
  operational: true
}

const CHHAPRA: LocationCreate = {
  id: "7696bbfb-5036-48b6-8981-7a00426009d8",
  name: "Chhapra",
  operational: true
}

const SIWAN: LocationCreate = {
  id: "3a956497-6454-4eef-b0ff-03f8708069ad",
  name: "Siwan",
  operational: true
}

const MOTIHARI: LocationCreate = {
  id: "ab05e420-1d3e-4c08-9097-a990f657162b",
  name: "Motihari",
  operational: true
}

const BETTIAH: LocationCreate = {
  id: "d87423bd-ac8b-44db-b334-03405cb78f75",
  name: "Bettiah",
  operational: true
}

const BHAGALPUR: LocationCreate = {
  id: "ec137d5b-7d7c-479c-b131-58142c60759c",
  name: "Bhagalpur",
  operational: true
}

const MUNGER: LocationCreate = {
  id: "49887cdb-b159-436b-95e2-98ed16f6ebde",
  name: "Munger",
  operational: true
}

const DEOGHAR: LocationCreate = {
  id: "6247f97e-6aeb-4b5e-b6ef-414cd7938179",
  name: "Deoghar",
  operational: true
}

const GODDA: LocationCreate = {
  id: "d72c5701-66dc-463c-b199-aa18afd215ec",
  name: "Godda",
  operational: true
}

const BANKA: LocationCreate = {
  id: "3ea247a0-ffc0-4845-8ced-b37082009733",
  name: "Banka",
  operational: true
}

const HAJIPUR: LocationCreate = {
  id: "dee9a968-6614-4876-8c51-febea4ee05c1",
  name: "Hajipur",
  operational: true
}

const ARA: LocationCreate = {
  id: "2c9c8692-359d-4bda-ba54-30b4ecd04f33",
  name: "Ara",
  operational: true
}

const GAYA: LocationCreate = {
  id: "4cc4c1b6-daf6-42a2-8f49-30a0422f355f",
  name: "Gaya",
  operational: true
}

const BIHAR_SHARIF: LocationCreate = {
  id: "3798b46a-3119-405e-8b4e-a5eb79af00c9",
  name: "Bihar Sharif",
  operational: true
}

const DEHRI_ON_SONE: LocationCreate = {
  id: "ce52d574-bd6f-46f1-b077-79b279f73fdf",
  name: "Dehri on Sone",
  operational: true
}

const locations: LocationCreate[] = [
  PURNEA,
  KATIHAR,
  KISHANGANJ,
  ARARIA,
  MADHEPURA,
  SAHARSA,
  MALDA,
  DARBHANGA,
  PATNA,
  MADHUBANI,
  SUPAUL,
  BEGUSARAI,
  SAMASTIPUR,
  SAKRI,
  JHANJHARPUR,
  BAHERI_BIRAUL,
  SINGHWARA_BHADWARA,
  JALE_PUPRI,
  SITAMARHI,
  MUZAFFARPUR,
  CHHAPRA,
  SIWAN,
  MOTIHARI,
  BETTIAH,
  BHAGALPUR,
  MUNGER,
  DEOGHAR,
  GODDA,
  BANKA,
  HAJIPUR,
  ARA,
  GAYA,
  BIHAR_SHARIF,
  DEHRI_ON_SONE
] as const

try {
  console.log("Seeding locations...")
  await db
    .insert(schema.location)
    .values(locations)
    .onConflictDoUpdate({
      target: schema.location.id,
      set: {
        name: sql`excluded.name`,
        operational: sql`excluded.operational`
      }
    })

  console.log("Locations seeded successfully")
} catch (e) {
  console.error(e)
}

const routes: RouteCreate[] = [
  {
    id: "8f8a4362-ec61-4efe-89a7-e4b0f5b69916",
    srcLocId: PURNEA.id,
    destLocId: KATIHAR.id,
    distanceKm: 80
  },
  {
    id: "5f6e645d-6748-47ed-a8b2-76776f9f0709",
    srcLocId: PURNEA.id,
    destLocId: KISHANGANJ.id,
    distanceKm: 150
  },
  {
    id: "ead897b7-0682-40ce-bc44-cbd4cd7dd68a",
    srcLocId: PURNEA.id,
    destLocId: ARARIA.id,
    distanceKm: 110
  },
  {
    id: "8e55cc31-4fec-4288-8c14-532d2b944aa9",
    srcLocId: PURNEA.id,
    destLocId: MADHEPURA.id,
    distanceKm: 170
  },
  {
    id: "aba5faa1-ad19-4343-a851-c82bc37b0fd0",
    srcLocId: PURNEA.id,
    destLocId: SAHARSA.id,
    distanceKm: 220
  },
  {
    id: "8ac64a0f-c098-417a-a36c-4e01736357ca",
    srcLocId: PURNEA.id,
    destLocId: MALDA.id,
    distanceKm: 280
  },
  {
    id: "45fc7e49-717c-48a7-a612-7226a301d235",
    srcLocId: DARBHANGA.id,
    destLocId: PATNA.id,
    distanceKm: 294
  },
  {
    id: "904b45cd-b3b7-407c-9bf9-67521a9f1d86",
    srcLocId: DARBHANGA.id,
    destLocId: MADHUBANI.id,
    distanceKm: 94
  },
  {
    id: "9b9a88f6-361d-4c19-8b15-76bb5a0bf8e2",
    srcLocId: DARBHANGA.id,
    destLocId: SUPAUL.id,
    distanceKm: 256
  },
  {
    id: "cebff1cb-757a-461e-8e6b-2402563d150d",
    srcLocId: DARBHANGA.id,
    destLocId: BEGUSARAI.id,
    distanceKm: 212
  },
  {
    id: "e9becc39-1acc-441d-b726-adf559f56a9a",
    srcLocId: DARBHANGA.id,
    destLocId: SAHARSA.id,
    distanceKm: 190
  },
  {
    id: "8164acc3-4fe5-4120-9b95-272e6443b4f3",
    srcLocId: DARBHANGA.id,
    destLocId: SAMASTIPUR.id,
    distanceKm: 98
  },
  {
    id: "f05dda83-7ab7-442d-b1eb-2be00234baa4",
    srcLocId: DARBHANGA.id,
    destLocId: SAKRI.id,
    distanceKm: 55
  },
  {
    id: "c78bdc64-9c4e-4752-a44a-426311cf5fdd",
    srcLocId: DARBHANGA.id,
    destLocId: JHANJHARPUR.id,
    distanceKm: 110
  },
  {
    id: "7f67f156-475e-4ebe-a36e-2589fada7e03",
    srcLocId: DARBHANGA.id,
    destLocId: BAHERI_BIRAUL.id,
    distanceKm: 80
  },
  {
    id: "a1ef47d9-b26c-4b28-b6ea-d05ec09c6379",
    srcLocId: DARBHANGA.id,
    destLocId: SINGHWARA_BHADWARA.id,
    distanceKm: 66
  },
  {
    id: "c9bcec3f-5d9b-42ee-bf2e-89a3341250ea",
    srcLocId: DARBHANGA.id,
    destLocId: JALE_PUPRI.id,
    distanceKm: 110
  },
  {
    id: "60f73b32-04e5-4909-8b00-8beaf71d4314",
    srcLocId: DARBHANGA.id,
    destLocId: SITAMARHI.id,
    distanceKm: 185
  },
  {
    id: "9bd270df-8115-481e-9c26-5f763d5d753e",
    srcLocId: MUZAFFARPUR.id,
    destLocId: CHHAPRA.id,
    distanceKm: 175
  },
  {
    id: "5a987a51-c065-432f-847b-3ecf57e1956d",
    srcLocId: MUZAFFARPUR.id,
    destLocId: SIWAN.id,
    distanceKm: 275
  },
  {
    id: "f6dd7656-6cde-4ad1-ba9d-f4d427d72c31",
    srcLocId: MUZAFFARPUR.id,
    destLocId: MOTIHARI.id,
    distanceKm: 180
  },
  {
    id: "5c0628a8-ee55-4efe-ae90-950f8a9b9e5a",
    srcLocId: MUZAFFARPUR.id,
    destLocId: BETTIAH.id,
    distanceKm: 280
  },
  {
    id: "2a646898-982f-44c7-a04d-e6b9206b8338",
    srcLocId: MUZAFFARPUR.id,
    destLocId: PURNEA.id,
    distanceKm: 0
  },
  {
    id: "639c78d0-bf60-4603-8072-f2fbcbe4fe35",
    srcLocId: MUZAFFARPUR.id,
    destLocId: KATIHAR.id,
    distanceKm: 0
  },
  {
    id: "81efc961-9e44-47ad-a9e5-b83f74933e3b",
    srcLocId: MUZAFFARPUR.id,
    destLocId: ARARIA.id,
    distanceKm: 0
  },
  {
    id: "e50c509c-6c1d-4a9a-ad05-e76f7be4f51c",
    srcLocId: MUZAFFARPUR.id,
    destLocId: KISHANGANJ.id,
    distanceKm: 0
  },
  {
    id: "e61a4853-3b3b-4bef-90bf-d5274f10b6d0",
    srcLocId: MUZAFFARPUR.id,
    destLocId: BHAGALPUR.id,
    distanceKm: 0
  },
  {
    id: "5b7d392a-18b9-421a-a6a5-0c27caf4c5fe",
    srcLocId: BHAGALPUR.id,
    destLocId: MUNGER.id,
    distanceKm: 130
  },
  {
    id: "fd893786-5585-46b4-b0d2-fbf730401b5c",
    srcLocId: BHAGALPUR.id,
    destLocId: DEOGHAR.id,
    distanceKm: 240
  },
  {
    id: "b8d6d2b8-6612-4772-be45-7870ea8ebeee",
    srcLocId: BHAGALPUR.id,
    destLocId: GODDA.id,
    distanceKm: 150
  },
  {
    id: "e3a0b944-c2ab-40a0-a670-69dd26df62b5",
    srcLocId: BHAGALPUR.id,
    destLocId: BANKA.id,
    distanceKm: 110
  },
  {
    id: "f8e44107-8694-4e2d-b46a-066acf31582a",
    srcLocId: BHAGALPUR.id,
    destLocId: MALDA.id,
    distanceKm: 390
  },
  {
    id: "8b32419b-79a0-4c3d-a523-56088ade4aaf",
    srcLocId: BHAGALPUR.id,
    destLocId: MADHEPURA.id,
    distanceKm: 205
  },
  {
    id: "94842243-4bdc-43e7-b2bb-8a68860c1ebb",
    srcLocId: PATNA.id,
    destLocId: HAJIPUR.id,
    distanceKm: 60
  },
  {
    id: "f492250d-4548-4859-ac47-5a16fc701bfc",
    srcLocId: PATNA.id,
    destLocId: ARA.id,
    distanceKm: 150
  },
  {
    id: "47a9a5ca-f4cf-4eb5-9c3c-466a3b2f8944",
    srcLocId: PATNA.id,
    destLocId: GAYA.id,
    distanceKm: 215
  },
  {
    id: "7bb0aed4-a934-4e9b-83c4-f9ae44f1e930",
    srcLocId: PATNA.id,
    destLocId: BIHAR_SHARIF.id,
    distanceKm: 170
  },
  {
    id: "e807ad8b-4d7b-47dc-846b-9a9a0a1292ec",
    srcLocId: PATNA.id,
    destLocId: DEHRI_ON_SONE.id,
    distanceKm: 320
  }
] as const

try {
  console.log("Seeding routes...")
  await db
    .insert(schema.route)
    .values(routes)
    .onConflictDoUpdate({
      target: schema.route.id,
      set: {
        srcLocId: sql`excluded."srcLocId"`,
        destLocId: sql`excluded."destLocId"`,
        distanceKm: sql`excluded."distanceKm"`
      }
    })

  console.log("Routes seeded successfully")
} catch (e) {
  console.error(e)
}

exit(0)
