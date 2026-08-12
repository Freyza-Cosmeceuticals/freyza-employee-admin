ALTER TABLE "visit" ALTER COLUMN "poiId" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_dailyReport_travellingWithId" ON "dailyReport" USING btree ("travellingWithId");--> statement-breakpoint
CREATE INDEX "idx_visit_poiId" ON "visit" USING btree ("poiId");--> statement-breakpoint
ALTER TABLE "visit" DROP COLUMN "doctorName";--> statement-breakpoint
ALTER TABLE "visit" DROP COLUMN "chemistName";--> statement-breakpoint
ALTER TABLE "visit" DROP COLUMN "stockistName";