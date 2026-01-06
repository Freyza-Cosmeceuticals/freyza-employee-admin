ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."UserRole";--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'EMPLOYEE');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."UserRole" USING "role"::"public"."UserRole";--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "dailyReport" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "location" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "travelPlan" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "travelPlanEntry" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "visit" ALTER COLUMN "updatedAt" SET DEFAULT now();