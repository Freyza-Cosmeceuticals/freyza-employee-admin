CREATE TABLE "app_release" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"versionName" varchar(50) NOT NULL,
	"buildNumber" integer NOT NULL,
	"releaseNotes" text NOT NULL,
	"isMandatory" boolean DEFAULT false NOT NULL,
	"apkStoragePath" text NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone,
	CONSTRAINT "app_release_buildNumber_unique" UNIQUE("buildNumber")
);
--> statement-breakpoint
ALTER TABLE "app_release" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_app_release_buildNumber" ON "app_release" USING btree ("buildNumber");--> statement-breakpoint
CREATE POLICY "Authenticated users can view all app releases" ON "app_release" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Only admins can insert app releases" ON "app_release" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can update app releases" ON "app_release" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');--> statement-breakpoint
CREATE POLICY "Only admins can delete app releases" ON "app_release" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text = 'ADMIN');