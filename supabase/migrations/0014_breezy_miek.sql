ALTER POLICY "Only admins can insert chemists" ON "chemist" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update chemists" ON "chemist" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete chemists" ON "chemist" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Users can view their own daily reports OR Admins can view any daily reports" ON "dailyReport" TO authenticated USING (((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') OR ((select auth.uid())::text = "employeeId"));--> statement-breakpoint
ALTER POLICY "Users can update their own daily reports if not locked OR Admins can update all daily reports" ON "dailyReport" TO authenticated USING (
          (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
          OR
          ((select auth.uid())::text = "employeeId") AND (locked = false)
          ) WITH CHECK (
          (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
          OR
          (select auth.uid())::text = "employeeId"
          );--> statement-breakpoint
ALTER POLICY "Only admins can insert doctors" ON "doctor" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update doctors" ON "doctor" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete doctors" ON "doctor" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert locations" ON "location" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update locations" ON "location" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete locations" ON "location" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert pois" ON "poi" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update pois" ON "poi" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete pois" ON "poi" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert routes" ON "route" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update routes" ON "route" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete routes" ON "route" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can insert stockists" ON "stockist" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can update stockists" ON "stockist" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN') WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Only admins can delete stockists" ON "stockist" TO authenticated USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Users can view their own travel plans OR Admins can view all travel plans" ON "travelPlan" TO authenticated USING (
        (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
ALTER POLICY "Only admins can create travel plans for employees" ON "travelPlan" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Users can update their own travel plans OR Admins can update all travel plans" ON "travelPlan" TO authenticated USING (
        (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        ) WITH CHECK (
        (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
ALTER POLICY "Employees can select their own travel plan entries OR Admins can select all travel plan entries" ON "travelPlanEntry" TO authenticated USING (
            (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            ));--> statement-breakpoint
ALTER POLICY "Only admins can insert travel plan entries" ON "travelPlanEntry" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Employees can update their own travel plan entries OR Admins can update all travel plan entries" ON "travelPlanEntry" TO authenticated USING (
            (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            )) WITH CHECK (
            (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."travelPlan" tp
                WHERE tp.id = "travelPlanEntry"."tpId"
                    AND tp."employeeId" = (select auth.uid())::text
            ));--> statement-breakpoint
ALTER POLICY "Admins can insert users" ON "user" TO authenticated WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
ALTER POLICY "Employees can select their own visits OR Admins can select all visits" ON "visit" TO authenticated USING (
        (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
        OR
        (select auth.uid())::text = "employeeId"
        );--> statement-breakpoint
ALTER POLICY "Employees can update their own visits if report not locked OR Admins can update all visits" ON "visit" TO authenticated USING (
            (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."dailyReport" dr
                WHERE dr.id = visit."reportId"
                    AND dr."employeeId" = (select auth.uid())::text
                    AND dr."locked" = false
            )) WITH CHECK (
            (select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN'
            OR
            EXISTS (
                SELECT 1
                FROM public."dailyReport" dr
                WHERE dr.id = visit."reportId"
                    AND dr."employeeId" = (select auth.uid())::text
                    AND dr."locked" = false
            ));