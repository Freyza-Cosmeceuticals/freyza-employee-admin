import { relations } from "drizzle-orm/relations"

import { dailyReport, location, route, travelPlan, travelPlanEntry, user, visit } from "./schema"

export const routeRelations = relations(route, ({ one, many }) => ({
  location_destLocId: one(location, {
    fields: [route.destLocId],
    references: [location.id],
    relationName: "route_destLocId_location_id"
  }),
  location_srcLocId: one(location, {
    fields: [route.srcLocId],
    references: [location.id],
    relationName: "route_srcLocId_location_id"
  }),
  travelPlanEntries: many(travelPlanEntry),
  dailyReports: many(dailyReport)
}))

export const locationRelations = relations(location, ({ many }) => ({
  routes_destLocId: many(route, {
    relationName: "route_destLocId_location_id"
  }),
  routes_srcLocId: many(route, {
    relationName: "route_srcLocId_location_id"
  }),
  users: many(user)
}))

export const visitRelations = relations(visit, ({ one }) => ({
  dailyReport: one(dailyReport, {
    fields: [visit.reportId],
    references: [dailyReport.id]
  })
}))

export const dailyReportRelations = relations(dailyReport, ({ one, many }) => ({
  visits: many(visit),
  user: one(user, {
    fields: [dailyReport.employeeId],
    references: [user.id]
  }),
  route: one(route, {
    fields: [dailyReport.routeId],
    references: [route.id]
  })
}))

export const userRelations = relations(user, ({ one, many }) => ({
  location: one(location, {
    fields: [user.hqId],
    references: [location.id]
  }),
  travelPlans_createdById: many(travelPlan, {
    relationName: "travelPlan_createdById_user_id"
  }),
  travelPlans_employeeId: many(travelPlan, {
    relationName: "travelPlan_employeeId_user_id"
  }),
  dailyReports: many(dailyReport)
}))

export const travelPlanRelations = relations(travelPlan, ({ one, many }) => ({
  user_createdById: one(user, {
    fields: [travelPlan.createdById],
    references: [user.id],
    relationName: "travelPlan_createdById_user_id"
  }),
  user_employeeId: one(user, {
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
