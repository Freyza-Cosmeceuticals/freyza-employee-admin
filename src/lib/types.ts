import {
  Prisma,
  type Location,
  type Route,
  type TravelPlan,
  type TravelPlanEntry,
  type User
} from "@db/browser"

export type LocationCreate = Omit<Location, "id" | "createdAt" | "updatedAt">
export type RouteCreate = Omit<Route, "id" | "createdAt" | "updatedAt">

export type Employee = User
export type EmployeeCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }

export type TravelPlanEntryCreate = Omit<
  TravelPlanEntry,
  "id" | "tpId" | "createdAt" | "updatedAt"
> & {
  id?: string
  tpId?: string
}

export type TravelPlanCreate = Omit<TravelPlan, "id" | "createdAt" | "updatedAt"> & {
  id?: string
  planEntries: TravelPlanEntryCreate[]
}

const employeeWithHq = {
  include: { hq: true }
} satisfies Prisma.UserDefaultArgs

export type EmployeeWithHQ = Prisma.UserGetPayload<typeof employeeWithHq>
export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }

const routeWithName = {
  include: {
    srcLoc: { select: { name: true, id: true } },
    destLoc: { select: { name: true, id: true } }
  }
} satisfies Prisma.RouteDefaultArgs

export type RouteWithName = Prisma.RouteGetPayload<typeof routeWithName>

const travelPlanWithEmployee = {
  include: {
    employee: {
      select: {
        id: true,
        name: true,
        tier: true
      }
    }
  }
} satisfies Prisma.TravelPlanDefaultArgs

type TravelPlanStats = {
  workDays: number
  leaveDays: number
  holidayDays: number
}

export type TravelPlanWithEmployee = Prisma.TravelPlanGetPayload<typeof travelPlanWithEmployee> & {
  stats: TravelPlanStats
}
