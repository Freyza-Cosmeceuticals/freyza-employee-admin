CREATE TYPE "public"."DayType" AS ENUM('WORK', 'HOLIDAY', 'LEAVE');--> statement-breakpoint
CREATE TYPE "public"."EmployeeTier" AS ENUM('FSO', 'TABM', 'ASM');--> statement-breakpoint
CREATE TYPE "public"."ReportStatus" AS ENUM('SAVED', 'LOCKED');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('EMPLOYEE', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."VisitType" AS ENUM('DOCTOR', 'STOCKIST', 'CHEMIST');--> statement-breakpoint
CREATE TABLE "dailyReport" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" text NOT NULL,
	"date" date NOT NULL,
	"dayType" "DayType" DEFAULT 'WORK' NOT NULL,
	"routeId" text,
	"ta" double precision,
	"da" double precision,
	"totalExpense" double precision,
	"locked" boolean DEFAULT false NOT NULL,
	"lockedAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dailyReport" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(25) NOT NULL,
	"operational" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "location" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "route" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"srcLocId" text NOT NULL,
	"destLocId" text NOT NULL,
	"distanceKm" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "travelPlan" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" text NOT NULL,
	"month" date NOT NULL,
	"createdById" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travelPlan" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "travelPlanEntry" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tpId" text NOT NULL,
	"date" date NOT NULL,
	"dayType" "DayType" DEFAULT 'WORK' NOT NULL,
	"routeId" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"role" "UserRole" NOT NULL,
	"status" "UserStatus" NOT NULL,
	"tier" "EmployeeTier",
	"hqId" text,
	"joiningDate" date NOT NULL,
	"resignDate" date,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "visit" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reportId" text NOT NULL,
	"visitType" "VisitType" NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"distanceMetersFromPOI" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visit" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."route"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_destLocId_fkey" FOREIGN KEY ("destLocId") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_srcLocId_fkey" FOREIGN KEY ("srcLocId") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "travelPlan" ADD CONSTRAINT "travelPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "travelPlan" ADD CONSTRAINT "travelPlan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ADD CONSTRAINT "travelPlanEntry_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."route"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ADD CONSTRAINT "travelPlanEntry_tpId_fkey" FOREIGN KEY ("tpId") REFERENCES "public"."travelPlan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_hqId_fkey" FOREIGN KEY ("hqId") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."dailyReport"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_dailyreport_employeeid" ON "dailyReport" USING btree ("employeeId");--> statement-breakpoint
CREATE INDEX "idx_dailyreport_routeid" ON "dailyReport" USING btree ("routeId");--> statement-breakpoint
CREATE UNIQUE INDEX "location_name_key" ON "location" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_route_destlocid" ON "route" USING btree ("destLocId");--> statement-breakpoint
CREATE UNIQUE INDEX "route_srcLocId_destLocId_key" ON "route" USING btree ("srcLocId","destLocId");--> statement-breakpoint
CREATE INDEX "idx_travelplan_createdbyid" ON "travelPlan" USING btree ("createdById");--> statement-breakpoint
CREATE UNIQUE INDEX "travelPlan_employeeId_month_key" ON "travelPlan" USING btree ("employeeId","month");--> statement-breakpoint
CREATE INDEX "idx_travelplanentry_routeid" ON "travelPlanEntry" USING btree ("routeId");--> statement-breakpoint
CREATE UNIQUE INDEX "travelPlanEntry_tpId_date_key" ON "travelPlanEntry" USING btree ("tpId","date");--> statement-breakpoint
CREATE INDEX "idx_user_hqid" ON "user" USING btree ("hqId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_phone_key" ON "user" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_visit_reportid" ON "visit" USING btree ("reportId");--> statement-breakpoint
CREATE POLICY "Users can view their own daily reports" ON "dailyReport" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((select auth.uid())::text = "employeeId"));--> statement-breakpoint
CREATE POLICY "Admins can view any daily reports" ON "dailyReport" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Users can insert their own daily reports" ON "dailyReport" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((select auth.uid())::text = "employeeId"));--> statement-breakpoint
CREATE POLICY "Users can update their own daily reports if not locked" ON "dailyReport" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((select auth.uid())::text = "employeeId")) WITH CHECK (((select auth.uid())::text = "employeeId" AND "locked" = false));--> statement-breakpoint
CREATE POLICY "Admins can update all daily reports" ON "dailyReport" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN')) WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Authenticated users can view all locations" ON "location" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert locations" ON "location" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update locations" ON "location" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete locations" ON "location" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Authenticated users can view all routes" ON "route" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert routes" ON "route" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update routes" ON "route" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete routes" ON "route" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Users can view their own travel plans" ON "travelPlan" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((select auth.uid())::text = "employeeId"));--> statement-breakpoint
CREATE POLICY "Admins can view all travel plans" ON "travelPlan" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can create travel plans for employees" ON "travelPlan" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Users can update their own travel plans" ON "travelPlan" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((select auth.uid())::text = "employeeId")) WITH CHECK ((select auth.uid())::text = "employeeId");--> statement-breakpoint
CREATE POLICY "Admins can update all travel plans" ON "travelPlan" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Employees can select their own travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = (select auth.uid())::text
        ));--> statement-breakpoint
CREATE POLICY "Admins can select all travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can insert travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Employees can update their own travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = (select auth.uid())::text
        )) WITH CHECK (EXISTS (
          SELECT 1
          FROM public."travelPlan" tp
          WHERE tp.id = "travelPlanEntry"."tpId"
            AND tp."employeeId" = (select auth.uid())::text
        ));--> statement-breakpoint
CREATE POLICY "Admins can update all travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Employees can view their own user data" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid())::text = "user"."id");--> statement-breakpoint
CREATE POLICY "Admins can view all user data" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Admins can insert users" ON "user" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Employees can select their own visits" ON "visit" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS (
                    SELECT 1
                        FROM "dailyReport" dr
                        WHERE ((dr.id = visit."reportId") AND (dr."employeeId" = (select auth.uid())::text))
                    )
                  ));--> statement-breakpoint
CREATE POLICY "Admins can select all visits" ON "visit" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Employees can insert their own visits" ON "visit" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = (select auth.uid())::text
        ));--> statement-breakpoint
CREATE POLICY "Employees can update their own visits if report not locked" ON "visit" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = (select auth.uid())::text
            AND dr."locked" = false
        )) WITH CHECK (EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = (select auth.uid())::text
            AND dr."locked" = false
        ));--> statement-breakpoint
CREATE POLICY "Admins can update all visits" ON "visit" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');