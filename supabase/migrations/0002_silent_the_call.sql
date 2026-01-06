ALTER TABLE "user" ADD COLUMN "email" varchar(254) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");