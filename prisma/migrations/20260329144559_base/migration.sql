/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[firebaseUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firebaseUid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('GAS', 'TRANSPORT', 'BAZAR', 'OTHER');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firebaseUid" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "WeeklyMealTemplate" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "meals" "MealType"[],
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMealTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealSchedule" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMeal" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "menu" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealRegistration" (
    "id" TEXT NOT NULL,
    "scheduledMealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "personName" TEXT NOT NULL,
    "description" TEXT,
    "loggedById" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealDeadline" (
    "id" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "time" TEXT NOT NULL,
    "offsetDays" INTEGER NOT NULL DEFAULT 0,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFinalization" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalExpenses" DECIMAL(12,2) NOT NULL,
    "totalWeightedMealCount" DECIMAL(12,2) NOT NULL,
    "mealRate" DECIMAL(10,4) NOT NULL,
    "finalizedById" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MonthlyFinalization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMealTemplate_dayOfWeek_key" ON "WeeklyMealTemplate"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "MealSchedule_date_key" ON "MealSchedule"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMeal_scheduleId_type_key" ON "ScheduledMeal"("scheduleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MealRegistration_scheduledMealId_userId_key" ON "MealRegistration"("scheduledMealId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MealDeadline_type_key" ON "MealDeadline"("type");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFinalization_month_key" ON "MonthlyFinalization"("month");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- AddForeignKey
ALTER TABLE "WeeklyMealTemplate" ADD CONSTRAINT "WeeklyMealTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSchedule" ADD CONSTRAINT "MealSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMeal" ADD CONSTRAINT "ScheduledMeal_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "MealSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRegistration" ADD CONSTRAINT "MealRegistration_scheduledMealId_fkey" FOREIGN KEY ("scheduledMealId") REFERENCES "ScheduledMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRegistration" ADD CONSTRAINT "MealRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRegistration" ADD CONSTRAINT "MealRegistration_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDeadline" ADD CONSTRAINT "MealDeadline_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFinalization" ADD CONSTRAINT "MonthlyFinalization_finalizedById_fkey" FOREIGN KEY ("finalizedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
