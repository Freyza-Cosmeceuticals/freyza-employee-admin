/*
  Warnings:

  - The values [UNCONFIRMED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmployeeTier" AS ENUM ('FSO', 'TABM', 'ASM');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('WORK', 'HOLIDAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('DOCTOR', 'STOCKIST', 'CHEMIST');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('SAVED', 'LOCKED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'REVOKED');
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- DropTable
DROP TABLE "public"."Expense";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "tier" "EmployeeTier",
    "hqId" TEXT,
    "joiningDate" DATE NOT NULL,
    "resignDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(25) NOT NULL,
    "operational" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travelPlan" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travelPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travelPlanEntry" (
    "id" TEXT NOT NULL,
    "tpId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayType" "DayType" NOT NULL DEFAULT 'WORK',
    "routeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travelPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dailyReport" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayType" "DayType" NOT NULL DEFAULT 'WORK',
    "routeId" TEXT,
    "ta" DOUBLE PRECISION,
    "da" DOUBLE PRECISION,
    "totalExpense" DOUBLE PRECISION,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "visitType" "VisitType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceMetersFromPOI" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route" (
    "id" TEXT NOT NULL,
    "srcLocId" TEXT NOT NULL,
    "destLocId" TEXT NOT NULL,
    "distanceKm" INTEGER NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "location_name_key" ON "location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "travelPlan_employeeId_month_key" ON "travelPlan"("employeeId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "travelPlanEntry_tpId_date_key" ON "travelPlanEntry"("tpId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "dailyReport_employeeId_date_key" ON "dailyReport"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "route_srcLocId_destLocId_key" ON "route"("srcLocId", "destLocId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_hqId_fkey" FOREIGN KEY ("hqId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelPlan" ADD CONSTRAINT "travelPlan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelPlan" ADD CONSTRAINT "travelPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelPlanEntry" ADD CONSTRAINT "travelPlanEntry_tpId_fkey" FOREIGN KEY ("tpId") REFERENCES "travelPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelPlanEntry" ADD CONSTRAINT "travelPlanEntry_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dailyReport" ADD CONSTRAINT "dailyReport_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "dailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_srcLocId_fkey" FOREIGN KEY ("srcLocId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_destLocId_fkey" FOREIGN KEY ("destLocId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
