ALTER TABLE "visit" RENAME COLUMN "productsShown" TO "productDetails";--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "lockedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "outstandingAmount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "orderAmount" numeric(12, 2);