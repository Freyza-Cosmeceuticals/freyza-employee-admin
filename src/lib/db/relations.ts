import { relations } from "drizzle-orm/relations"

import {
  chemist,
  dailyReport,
  doctor,
  location,
  poi,
  route,
  stockist,
  travelPlan,
  travelPlanEntry,
  user,
  visit
} from "./schema"

export const userRelations = relations(user, ({ one, many }) => ({
  hq: one(location, {
    fields: [user.hqId],
    references: [location.id]
  }),
  createdTravelPlans: many(travelPlan, {
    relationName: "travelPlan_createdById_user_id"
  }),
  assignedTravelPlans: many(travelPlan, {
    relationName: "travelPlan_employeeId_user_id"
  }),
  dailyReports: many(dailyReport)
}))

export const locationRelations = relations(location, ({ many }) => ({
  routesAsSrc: many(route, {
    relationName: "route_srcLocId_location_id"
  }),
  routesAsDest: many(route, {
    relationName: "route_destLocId_location_id"
  }),
  hqEmployees: many(user),
  poi: many(poi)
}))

export const routeRelations = relations(route, ({ one, many }) => ({
  srcLoc: one(location, {
    fields: [route.srcLocId],
    references: [location.id],
    relationName: "route_srcLocId_location_id"
  }),
  destLoc: one(location, {
    fields: [route.destLocId],
    references: [location.id],
    relationName: "route_destLocId_location_id"
  }),
  travelPlanEntries: many(travelPlanEntry),
  dailyReports: many(dailyReport)
}))

export const dailyReportRelations = relations(dailyReport, ({ one, many }) => ({
  visits: many(visit),
  employee: one(user, {
    fields: [dailyReport.employeeId],
    references: [user.id]
  }),
  route: one(route, {
    fields: [dailyReport.routeId],
    references: [route.id]
  }),
  travellingWith: one(user, {
    fields: [dailyReport.travellingWithId],
    references: [user.id]
  })
}))

export const travelPlanRelations = relations(travelPlan, ({ one, many }) => ({
  createdByAdmin: one(user, {
    fields: [travelPlan.createdById],
    references: [user.id],
    relationName: "travelPlan_createdById_user_id"
  }),
  assignedEmployee: one(user, {
    fields: [travelPlan.employeeId],
    references: [user.id],
    relationName: "travelPlan_employeeId_user_id"
  }),
  travelPlanEntries: many(travelPlanEntry)
}))

export const travelPlanEntryRelations = relations(travelPlanEntry, ({ one }) => ({
  route: one(route, {
    fields: [travelPlanEntry.routeId],
    references: [route.id]
  }),
  travelPlan: one(travelPlan, {
    fields: [travelPlanEntry.tpId],
    references: [travelPlan.id]
  })
}))

export const visitRelations = relations(visit, ({ one }) => ({
  dailyReport: one(dailyReport, {
    fields: [visit.reportId],
    references: [dailyReport.id]
  }),
  poi: one(poi, {
    fields: [visit.poiId],
    references: [poi.id]
  })
}))

export const poiRelations = relations(poi, ({ one, many }) => ({
  location: one(location, {
    fields: [poi.locationId],
    references: [location.id]
  }),
  doctors: one(doctor, {
    fields: [poi.id],
    references: [doctor.id]
  }),
  chemists: one(chemist, {
    fields: [poi.id],
    references: [chemist.id]
  }),
  stockists: one(stockist, {
    fields: [poi.id],
    references: [stockist.id]
  }),
  visits: many(visit)
}))

export const doctorRelations = relations(doctor, ({ one }) => ({
  poi: one(poi, {
    fields: [doctor.id],
    references: [poi.id]
  })
}))

export const chemistRelations = relations(chemist, ({ one }) => ({
  poi: one(poi, {
    fields: [chemist.id],
    references: [poi.id]
  })
}))

export const stockistRelations = relations(stockist, ({ one }) => ({
  poi: one(poi, {
    fields: [stockist.id],
    references: [poi.id]
  })
}))
