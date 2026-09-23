CREATE INDEX "idx_travelplanentry_tpid" ON "travelPlanEntry" USING btree ("tpId");--> statement-breakpoint
CREATE INDEX "idx_travelplanentry_date" ON "travelPlanEntry" USING btree ("date");