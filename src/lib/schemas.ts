import { DayType, EmployeeTier } from "@db/client"

import { DateTime } from "luxon"
import * as v from "valibot"

export const addEmployeeSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "Name must be at least 3 characters long."),
    v.maxLength(30, "Name is too long.")
  ),
  phone: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Phone number must be at least 10 characters long."),
    v.maxLength(15, "Phone number is too long.")
  ),
  tier: v.enum(EmployeeTier, "Invalid Tier"),
  hqId: v.pipe(v.string(), v.trim(), v.uuid("Please select a valid HQ.")),
  joiningDate: v.pipe(v.string(), v.toDate("Invalid Date")),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Please enter an email."),
    v.email("The email format is incorrect."),
    v.maxLength(30, "The email is too long.")
  )
})

const addTravelPlanEntrySchema = v.pipe(
  v.object({
    date: v.pipe(v.string(), v.toDate("Invalid Date")),
    dayType: v.enum(DayType, "Invalid Day Type"),
    routeId: v.optional(
      v.union([
        v.pipe(v.string(), v.trim(), v.empty()),
        v.pipe(v.string(), v.trim(), v.uuid("Invalid Route ID"))
      ])
    )
  }),
  v.transform((input) => ({ ...input, routeId: input.routeId || null })),
  v.forward(
    v.partialCheck(
      [["dayType"], ["routeId"]],
      (data) => {
        if (data.dayType === DayType.WORK && !data.routeId) {
          return false
        }

        return true
      },
      "Route ID is required for working days"
    ),
    ["routeId"]
  )
)

export const addTravelPlanSchema = v.pipe(
  v.object({
    employeeId: v.pipe(
      v.string("Employee ID is required"),
      v.trim(),
      v.uuid("Invalid Employee ID")
    ),
    month: v.pipe(v.string("A Month is required"), v.toDate("Invalid Month")),
    createdById: v.pipe(
      v.string("Planner's ID is required"),
      v.trim(),
      v.uuid("Invalid Created By ID")
    ),
    planEntries: v.array(addTravelPlanEntrySchema)
  }),
  v.check((data) => {
    if (DateTime.fromJSDate(data.month).daysInMonth !== data.planEntries.length) {
      return false
    }

    return true
  }, "Plan entries must match the number of days in the month")
)

export const getTravelPlanForMonthsSchema = v.pipe(v.string(), v.toDate("Invalid Date"))
