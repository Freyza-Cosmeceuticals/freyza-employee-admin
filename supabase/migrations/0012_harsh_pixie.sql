CREATE TABLE "chemist" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chemist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "doctor" (
	"id" text PRIMARY KEY NOT NULL,
	"specialty" varchar(100),
	"clinicName" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "doctor" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "poi" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "VisitType" NOT NULL,
	"locationId" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone
);
--> statement-breakpoint
ALTER TABLE "poi" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stockist" (
	"id" text PRIMARY KEY NOT NULL,
	"gstNumber" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "stockist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "poiId" text;--> statement-breakpoint
ALTER TABLE "chemist" ADD CONSTRAINT "chemist_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."poi"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."poi"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "poi" ADD CONSTRAINT "poi_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stockist" ADD CONSTRAINT "stockist_poiId_fkey" FOREIGN KEY ("id") REFERENCES "public"."poi"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_poi_locationId" ON "poi" USING btree ("locationId");--> statement-breakpoint
CREATE INDEX "idx_poi_type" ON "poi" USING btree ("type");--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "public"."poi"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE POLICY "Authenticated users can view all chemists" ON "chemist" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert chemists" ON "chemist" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update chemists" ON "chemist" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete chemists" ON "chemist" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Authenticated users can view all doctors" ON "doctor" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert doctors" ON "doctor" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update doctors" ON "doctor" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete doctors" ON "doctor" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Authenticated users can view all pois" ON "poi" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert pois" ON "poi" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update pois" ON "poi" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete pois" ON "poi" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Authenticated users can view all stockists" ON "stockist" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert stockists" ON "stockist" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update stockists" ON "stockist" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN') WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete stockists" ON "stockist" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.jwt() -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN');