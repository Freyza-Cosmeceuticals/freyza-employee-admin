import type {
  dailyReport,
  location,
  route,
  travelPlan,
  travelPlanEntry,
  user,
  visit
} from "@/lib/db/schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

export {
  DayType,
  EmployeeTier,
  ReportStatus,
  UserRole,
  UserStatus,
  VisitType
} from "$lib/constants"

// base classes
export type Location = InferSelectModel<typeof location>
export type Route = InferSelectModel<typeof route>

export type User = InferSelectModel<typeof user>
export type Employee = User

export type TravelPlan = InferSelectModel<typeof travelPlan>
export type TravelPlanEntry = InferSelectModel<typeof travelPlanEntry>

export type DailyReport = InferSelectModel<typeof dailyReport>
export type Visit = InferSelectModel<typeof visit>

export type LocationCreate = InferInsertModel<typeof location>
export type RouteCreate = InferInsertModel<typeof route>

export type EmployeeCreate = InferInsertModel<typeof user>
export type UserCreate = InferInsertModel<typeof user>

export type EmployeeWithHQ = Employee & {
  hq: Pick<Location, "id" | "name" | "operational"> | null
}

export type LocationWithName = Pick<Location, "id" | "name">

export type RouteWithName = Pick<Route, "id" | "distanceKm"> & {
  srcLoc: Pick<Location, "id" | "name">
  destLoc: Pick<Location, "id" | "name">
}

// tp, create
export type TravelPlanCreate = InferInsertModel<typeof travelPlan> & {
  planEntries: TravelPlanEntryCreate[]
}

export type TravelPlanEntryCreate = Omit<InferInsertModel<typeof travelPlanEntry>, "tpId"> & {
  tpId?: string | undefined
}

export type TravelPlanWithEmployee = TravelPlan & {
  employee: EmployeeWithHQ
  stats?: TravelPlanStats
}

export type TravelPlanStats = {
  workDays: number
  leaveDays: number
  holidayDays: number
}

export type TravelPlanEntryWithRoute = TravelPlanEntry & {
  route:
    | (Route & {
        srcLoc: Pick<Location, "id" | "name" | "operational">
        destLoc: Pick<Location, "id" | "name" | "operational">
      })
    | null
}

export type TravelPlanWithEmployeeWithEntries = TravelPlan & {
  employee: EmployeeWithHQ
  planEntries: TravelPlanEntryWithRoute[]
}

// dr, non-create
export type DailyReportWithEmployee = DailyReport & {
  employee: EmployeeWithHQ
}

export type DailyReportWithRoute = DailyReport & {
  route:
    | (Route & {
        srcLoc: Pick<Location, "id" | "name" | "operational">
        destLoc: Pick<Location, "id" | "name" | "operational">
      })
    | null
}

export type DailyReportWithEmployeeWithRoute = DailyReportWithEmployee & DailyReportWithRoute

export type DailyReportWithEmployeeWithVisits = DailyReportWithEmployee & {
  visits: Visit[]
}
