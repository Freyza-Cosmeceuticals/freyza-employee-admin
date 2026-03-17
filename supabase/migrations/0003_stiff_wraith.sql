ALTER TABLE "visit" ADD COLUMN "employeeId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "doctorName" text;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "chemistName" text;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "stockistName" text;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "productsShown" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "samplesGiven" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "orderTaken" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "billNo" text;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "paymentCollected" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "amountWithGST" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "amountWithoutGST" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "stockChecked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "additionalNotes" text;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_dailyReport_employeeId_date" ON "dailyReport" USING btree ("employeeId","date");--> statement-breakpoint
CREATE INDEX "idx_visit_visitType" ON "visit" USING btree ("visitType");--> statement-breakpoint
ALTER POLICY "Employees can select their own visits" ON "visit" TO authenticated USING (((select auth.uid())::text = "employeeId"));--> statement-breakpoint
ALTER POLICY "Employees can insert their own visits" ON "visit" TO authenticated WITH CHECK (EXISTS (
          SELECT 1
          FROM public."dailyReport" dr
          WHERE dr.id = visit."reportId"
            AND dr."employeeId" = (select auth.uid())::text
            AND dr."locked" = false
        ));