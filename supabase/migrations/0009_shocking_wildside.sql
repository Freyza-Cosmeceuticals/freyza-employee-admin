ALTER TABLE "dailyReport" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "updatedAt" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_visit_employeeId" ON "visit" USING btree ("employeeId");--> statement-breakpoint
CREATE POLICY "Employees can delete their own visits if report not locked" ON "visit" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = (select auth.uid())::text
            AND dr."locked" = false
        ));--> statement-breakpoint
ALTER POLICY "Admins can view any daily reports" ON "dailyReport" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Users can update their own daily reports if not locked" ON "dailyReport" TO authenticated USING (((select auth.uid())::text = "employeeId") AND (locked = false)) WITH CHECK (((select auth.uid())::text = "employeeId") AND (locked = false));--> statement-breakpoint
ALTER POLICY "Admins can update all daily reports" ON "dailyReport" TO authenticated USING (((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN')) WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert locations" ON "location" TO authenticated WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update locations" ON "location" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete locations" ON "location" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert routes" ON "route" TO authenticated WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update routes" ON "route" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete routes" ON "route" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can view all travel plans" ON "travelPlan" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can create travel plans for employees" ON "travelPlan" TO authenticated WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can update all travel plans" ON "travelPlan" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can select all travel plan entries" ON "travelPlanEntry" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert travel plan entries" ON "travelPlanEntry" TO authenticated WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can update all travel plan entries" ON "travelPlanEntry" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can view all user data" ON "user" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can insert users" ON "user" TO authenticated WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can select all visits" ON "visit" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Admins can update all visits" ON "visit" TO authenticated USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');