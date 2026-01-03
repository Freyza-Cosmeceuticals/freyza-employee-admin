import { Prisma } from "@db/browser"

import type { Location, Route, TravelPlan, TravelPlanEntry, User } from "@db/browser"

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
  include: { hq: { select: { name: true, id: true, operational: true } } }
} satisfies Prisma.UserDefaultArgs

export type EmployeeWithHQ = Prisma.UserGetPayload<typeof employeeWithHq>
export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }

const locationWithName = {
  select: { name: true, id: true }
} satisfies Prisma.LocationDefaultArgs

export type LocationWithName = Prisma.LocationGetPayload<typeof locationWithName>

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
      include: {
        hq: { select: { name: true, id: true, operational: true } }
      }
    }
  }
} satisfies Prisma.TravelPlanDefaultArgs

const travelPlanWithEmployeeWithEntries = {
  include: {
    employee: {
      include: {
        hq: { select: { name: true, id: true, operational: true } }
      }
    },
    planEntries: {
      include: {
        route: {
          include: {
            srcLoc: { select: { name: true, id: true, operational: true } },
            destLoc: { select: { name: true, id: true, operational: true } }
          }
        }
      }
    }
  }
} satisfies Prisma.TravelPlanDefaultArgs

const travelPlanEntryWithRoute = {
  include: {
    route: {
      include: {
        srcLoc: { select: { name: true, id: true, operational: true } },
        destLoc: { select: { name: true, id: true, operational: true } }
      }
    }
  }
} satisfies Prisma.TravelPlanEntryDefaultArgs

export type TravelPlanStats = {
  workDays: number
  leaveDays: number
  holidayDays: number
}

export type TravelPlanWithEmployee = Prisma.TravelPlanGetPayload<typeof travelPlanWithEmployee> & {
  stats?: TravelPlanStats
}

export type TravelPlanWithEmployeeWithEntries = Prisma.TravelPlanGetPayload<
  typeof travelPlanWithEmployeeWithEntries
>

export type TravelPlanEntryWithRoute = Prisma.TravelPlanEntryGetPayload<
  typeof travelPlanEntryWithRoute
>
