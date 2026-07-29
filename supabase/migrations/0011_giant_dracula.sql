ALTER TABLE "dailyReport" ADD COLUMN "travellingWithId" text;--> statement-breakpoint
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_travellingWithId_fkey" FOREIGN KEY ("travellingWithId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_travellingWithId_not_self" CHECK (
        "dailyReport"."travellingWithId" IS NULL
        OR
        "dailyReport"."travellingWithId" <> "dailyReport"."employeeId"
      );--> statement-breakpoint
DROP POLICY "Users can view their own daily reports" ON "dailyReport" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can view any daily reports" ON "dailyReport" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own daily reports if not locked" ON "dailyReport" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can update all daily reports" ON "dailyReport" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view their own travel plans" ON "travelPlan" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can view all travel plans" ON "travelPlan" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own travel plans" ON "travelPlan" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can update all travel plans" ON "travelPlan" CASCADE;--> statement-breakpoint
DROP POLICY "Employees can select their own travel plan entries" ON "travelPlanEntry" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can select all travel plan entries" ON "travelPlanEntry" CASCADE;--> statement-breakpoint
DROP POLICY "Employees can update their own travel plan entries" ON "travelPlanEntry" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can update all travel plan entries" ON "travelPlanEntry" CASCADE;--> statement-breakpoint
DROP POLICY "Employees can view their own user data" ON "user" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can view all user data" ON "user" CASCADE;--> statement-breakpoint
DROP POLICY "Employees can select their own visits" ON "visit" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can select all visits" ON "visit" CASCADE;--> statement-breakpoint
DROP POLICY "Employees can update their own visits if report not locked" ON "visit" CASCADE;--> statement-breakpoint
DROP POLICY "Admins can update all visits" ON "visit" CASCADE;--> statement-breakpoint
CREATE POLICY "Users can view their own daily reports OR Admins can view any daily reports" ON "dailyReport" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') OR ((select auth.uid())::text = "employeeId"));--> statement-breakpoint
CREATE POLICY "Users can update their own daily reports if not locked OR Admins can update all daily reports" ON "dailyReport" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
          (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
          OR
          ((select auth.uid())::text = "employeeId") AND (locked = false)
          ) WITH CHECK (
          (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
          OR
          (select auth.uid())::text = "employeeId"
          );--> statement-breakpoint
CREATE POLICY "Users can view their own travel plans OR Admins can view all travel plans" ON "travelPlan" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
CREATE POLICY "Users can update their own travel plans OR Admins can update all travel plans" ON "travelPlan" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        ) WITH CHECK (
        (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
CREATE POLICY "Employees can select their own travel plan entries OR Admins can select all travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
            (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            ));--> statement-breakpoint
CREATE POLICY "Employees can update their own travel plan entries OR Admins can update all travel plan entries" ON "travelPlanEntry" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
            (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            )) WITH CHECK (
            (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            ));--> statement-breakpoint
CREATE POLICY "Employees can view their own user data OR Admins can view all user data" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
        OR
        (select auth.uid())::text = "user"."id"
        );--> statement-breakpoint
CREATE POLICY "Employees can select their own visits OR Admins can select all visits" ON "visit" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
CREATE POLICY "Employees can update their own visits if report not locked OR Admins can update all visits" ON "visit" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
            (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."dailyReport" dr
                WHERE dr.id = visit."reportId"
                    AND dr."employeeId" = (select auth.uid())::text
                    AND dr."locked" = false
            )) WITH CHECK (
            (select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."dailyReport" dr
                WHERE dr.id = visit."reportId"
                    AND dr."employeeId" = (select auth.uid())::text
                    AND dr."locked" = false
            ));
