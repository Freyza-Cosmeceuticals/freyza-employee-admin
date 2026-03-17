import { sql } from "drizzle-orm"
import {
  boolean,
  date,
  decimal,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"

import { DayType, EmployeeTier, ReportStatus, UserRole, UserStatus, VisitType } from "../constants"

export function enumToPgEnum<T extends Record<string, string>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum) as [T[keyof T], ...T[keyof T][]]
}

// enums
export const userRole = pgEnum("UserRole", enumToPgEnum(UserRole))
export const userStatus = pgEnum("UserStatus", enumToPgEnum(UserStatus))
export const employeeTier = pgEnum("EmployeeTier", enumToPgEnum(EmployeeTier))
export const dayType = pgEnum("DayType", enumToPgEnum(DayType))
export const reportStatus = pgEnum("ReportStatus", enumToPgEnum(ReportStatus))
export const visitType = pgEnum("VisitType", enumToPgEnum(VisitType))

const authJwtAppRole = sql`(SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text)`

const timestamps = {
  createdAt: timestamp({ precision: 3, mode: "string", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ precision: 3, mode: "string", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull()
}

export const user = pgTable(
  "user",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    name: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 254 }).notNull(),
    phone: varchar({ length: 15 }).notNull(),

    // can be ADMIN (null, null, [], [], plansCreated) or EMPLOYEE (tier, hq, travelPlans, dailyReports, [])
    role: userRole().notNull(),
    status: userStatus().notNull(),

    tier: employeeTier(),
    hqId: text(),

    joiningDate: date({ mode: "date" }).notNull(),
    resignDate: date({ mode: "date" }),

    ...timestamps
  },
  (table) => [
    index("idx_user_hqid").on(table.hqId),
    uniqueIndex("user_email_key").on(table.email),
    uniqueIndex("user_phone_key").on(table.phone),
    foreignKey({
      columns: [table.hqId],
      foreignColumns: [location.id],
      name: "user_hqId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),

    pgPolicy("Employees can view their own user data", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid}::text = ${table.id}`
    }),
    pgPolicy("Admins can view all user data", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Admins can insert users", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const location = pgTable(
  "location",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar({ length: 25 }).notNull(),
    operational: boolean().default(true).notNull(),

    ...timestamps
  },
  (table) => [
    uniqueIndex("location_name_key").on(table.name),

    pgPolicy("Authenticated users can view all locations", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`true`
    }),
    pgPolicy("Only admins can insert locations", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can update locations", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can delete locations", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const route = pgTable(
  "route",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    srcLocId: text().notNull(),
    destLocId: text().notNull(),

    // fixed distance
    distanceKm: integer().notNull(),

    ...timestamps
  },
  (table) => [
    index("idx_route_destlocid").on(table.destLocId),
    uniqueIndex("route_srcLocId_destLocId_key").on(table.srcLocId, table.destLocId),
    foreignKey({
      columns: [table.destLocId],
      foreignColumns: [location.id],
      name: "route_destLocId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.srcLocId],
      foreignColumns: [location.id],
      name: "route_srcLocId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),

    pgPolicy("Authenticated users can view all routes", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`true`
    }),
    pgPolicy("Only admins can insert routes", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can update routes", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can delete routes", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const visit = pgTable(
  "visit",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // report this visit is a part of
    reportId: text().notNull(),
    // visit done by
    employeeId: text().notNull(),
    visitType: visitType().notNull(),

    // GPS coordinates at which visit was marked
    latitude: doublePrecision().notNull(),
    longitude: doublePrecision().notNull(),
    // distance from the point of interest in meters
    distanceMetersFromPOI: integer().notNull(),

    // target IDs, only one is to be filled according to visitType, others must be NULL
    // currently name, will upgrade later
    doctorName: text(),
    chemistName: text(),
    stockistName: text(),

    // doctor/chemist specific fields
    productsShown: jsonb()
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    samplesGiven: jsonb()
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    orderTaken: boolean().default(false).notNull(),

    // stockist specific fields
    billNo: text(),
    paymentCollected: boolean().default(false).notNull(),
    amountWithGST: decimal({ precision: 12, scale: 2 }),
    amountWithoutGST: decimal({ precision: 12, scale: 2 }),
    stockChecked: boolean().default(false).notNull(),

    // common
    additionalNotes: text(),

    ...timestamps
  },
  (table) => [
    index("idx_visit_reportid").on(table.reportId),
    index("idx_visit_visitType").on(table.visitType),
    index("idx_visit_reportId_employeeId").on(table.reportId, table.employeeId),
    foreignKey({
      columns: [table.reportId],
      foreignColumns: [dailyReport.id],
      name: "visit_reportId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("cascade"),

    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [user.id],
      name: "visit_employeeId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),

    pgPolicy("Employees can select their own visits", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`(${authUid}::text = "employeeId")`
    }),
    pgPolicy("Admins can select all visits", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Employees can insert their own visits", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = ${authUid}::text
            AND dr."locked" = false
        )`
    }),
    pgPolicy("Employees can update their own visits if report not locked", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = ${authUid}::text
            AND dr."locked" = false
        )`,
      withCheck: sql`EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = ${authUid}::text
            AND dr."locked" = false
        )`
    }),
    pgPolicy("Admins can update all visits", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const travelPlan = pgTable(
  "travelPlan",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // employee is particular TP is for
    employeeId: text().notNull(),

    // DateTime as 1st of that month/year
    month: date({ mode: "date" }).notNull(),

    // which ADMIN created this TP
    createdById: text().notNull(),

    ...timestamps
  },
  (table) => [
    index("idx_travelplan_createdbyid").on(table.createdById),
    index("idx_employeeId").on(table.employeeId),
    uniqueIndex("travelPlan_employeeId_month_key").on(table.employeeId, table.month),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [user.id],
      name: "travelPlan_createdById_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [user.id],
      name: "travelPlan_employeeId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),

    pgPolicy("Users can view their own travel plans", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`(${authUid}::text = "employeeId")`
    }),
    pgPolicy("Admins can view all travel plans", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can create travel plans for employees", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Users can update their own travel plans", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`(${authUid}::text = "employeeId")`,
      withCheck: sql`${authUid}::text = "employeeId"`
    }),
    pgPolicy("Admins can update all travel plans", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const travelPlanEntry = pgTable(
  "travelPlanEntry",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // TP this entry is for
    tpId: text().notNull(),

    // date of this Day Plan, sequentially from 1st to last day on month
    date: date({ mode: "date" }).notNull(),

    // WORK (route), HOLIDAY (null), LEAVE (null)
    dayType: dayType().default(DayType.WORK).notNull(),
    // route taken for this day
    routeId: text(),

    ...timestamps
  },
  (table) => [
    index("idx_travelplanentry_routeid").on(table.routeId),
    uniqueIndex("travelPlanEntry_tpId_date_key").on(table.tpId, table.date),
    foreignKey({
      columns: [table.routeId],
      foreignColumns: [route.id],
      name: "travelPlanEntry_routeId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.tpId],
      foreignColumns: [travelPlan.id],
      name: "travelPlanEntry_tpId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("cascade"),

    pgPolicy("Employees can select their own travel plan entries", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = ${authUid}::text
        )`
    }),
    pgPolicy("Admins can select all travel plan entries", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Only admins can insert travel plan entries", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Employees can update their own travel plan entries", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = ${authUid}::text
        )`,
      withCheck: sql`EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = ${authUid}::text
        )`
    }),
    pgPolicy("Admins can update all travel plan entries", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)

export const dailyReport = pgTable(
  "dailyReport",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // report by this employee
    employeeId: text().notNull(),
    date: date({ mode: "date" }).notNull(),

    // WORK (route, ta, da, totalExpense, locked), HOLIDAY (null, null, null, null, true, now()), LEAVE (null, null, null, null, true, now())
    dayType: dayType().default(DayType.WORK).notNull(),
    routeId: text(),

    ta: doublePrecision(),
    da: doublePrecision(),
    totalExpense: doublePrecision(),

    locked: boolean().default(false).notNull(),
    lockedAt: timestamp({ precision: 3, mode: "string", withTimezone: true }),

    ...timestamps
  },
  (table) => [
    index("idx_dailyreport_employeeid").on(table.employeeId),
    index("idx_dailyreport_routeid").on(table.routeId),
    uniqueIndex("idx_dailyReport_employeeId_date").on(table.employeeId, table.date),
    index("idx_dailyReport_employeeId_locked").on(table.employeeId, table.locked),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [user.id],
      name: "dailyReport_employeeId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.routeId],
      foreignColumns: [route.id],
      name: "dailyReport_routeId_fkey"
    })
      .onUpdate("cascade")
      .onDelete("restrict"),

    pgPolicy("Users can view their own daily reports", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`(${authUid}::text = "employeeId")`
    }),
    pgPolicy("Admins can view any daily reports", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${authJwtAppRole} = 'ADMIN'`
    }),
    pgPolicy("Users can insert their own daily reports", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(${authUid}::text = "employeeId")`
    }),
    pgPolicy("Users can update their own daily reports if not locked", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`(${authUid}::text = "employeeId")`,
      withCheck: sql`(${authUid}::text = "employeeId")`
    }),
    pgPolicy("Admins can update all daily reports", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`(${authJwtAppRole} = 'ADMIN')`,
      withCheck: sql`${authJwtAppRole} = 'ADMIN'`
    })
  ]
)
