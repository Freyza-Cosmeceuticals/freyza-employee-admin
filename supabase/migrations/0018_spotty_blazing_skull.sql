ALTER TABLE "app_release" DROP CONSTRAINT "app_release_buildNumber_unique";--> statement-breakpoint
DROP INDEX "idx_dailyreport_employeeid";--> statement-breakpoint
DROP INDEX "idx_employeeId";--> statement-breakpoint
DROP INDEX "idx_visit_reportId_employeeId";--> statement-breakpoint
DROP INDEX "idx_app_release_buildNumber";--> statement-breakpoint
ALTER TABLE "app_release" ALTER COLUMN "versionName" SET DATA TYPE varchar(51);--> statement-breakpoint
ALTER TABLE "app_release" ADD COLUMN "fileSizeBytes" integer;--> statement-breakpoint
CREATE INDEX "idx_dailyreport_date" ON "dailyReport" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_poi_name" ON "poi" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_travelplan_month" ON "travelPlan" USING btree ("month");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_app_release_buildNumber" ON "app_release" USING btree ("buildNumber");
