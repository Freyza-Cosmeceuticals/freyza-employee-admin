ALTER TABLE "visit" ADD CONSTRAINT "visit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_dailyReport_employeeId_locked" ON "dailyReport" USING btree ("employeeId","locked");--> statement-breakpoint
CREATE INDEX "idx_employeeId" ON "travelPlan" USING btree ("employeeId");--> statement-breakpoint
CREATE INDEX "idx_visit_reportId_employeeId" ON "visit" USING btree ("reportId","employeeId");--> statement-breakpoint
ALTER POLICY "Users can update their own daily reports if not locked" ON "dailyReport" TO authenticated USING (((select auth.uid())::text = "employeeId")) WITH CHECK (((select auth.uid())::text = "employeeId"));