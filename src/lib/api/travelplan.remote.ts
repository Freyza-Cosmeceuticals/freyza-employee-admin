import { form } from "$app/server"
import { DayType } from "@db/client"
import z from "zod"

const addTravelPlanEntrySchema = z.object({
  date: z.coerce.date<string>(),
  dayType: z.enum(DayType),
  routeId: z.string(),
})

const addTravelPlanSchema = z.object({
  employeeId: z.string(),
  month: z.coerce.date<string>(),
  createdById: z.string(),
  planEntries: z.array(addTravelPlanEntrySchema),
})

export const addTravelPlan = form(addTravelPlanSchema, async travelPlan => {
  // TODO: actually create it now
  console.log(travelPlan)
})
