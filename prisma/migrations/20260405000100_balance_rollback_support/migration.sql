-- AlterTable
ALTER TABLE "MonthlyFinalization"
ADD COLUMN     "rolledBackAt" TIMESTAMP(3),
ADD COLUMN     "rolledBackById" TEXT;

-- CreateTable
CREATE TABLE "MonthlyMemberSettlement" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "finalizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "depositTotal" DECIMAL(10,2) NOT NULL,
    "weightedMealCount" DECIMAL(12,2) NOT NULL,
    "mealCost" DECIMAL(10,2) NOT NULL,
    "appliedBalanceDelta" DECIMAL(10,2) NOT NULL,
    "closingBalance" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyMemberSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyMemberSettlement_finalizationId_userId_key" ON "MonthlyMemberSettlement"("finalizationId", "userId");

-- CreateIndex
CREATE INDEX "MonthlyMemberSettlement_month_userId_idx" ON "MonthlyMemberSettlement"("month", "userId");

-- AddForeignKey
ALTER TABLE "MonthlyFinalization" ADD CONSTRAINT "MonthlyFinalization_rolledBackById_fkey" FOREIGN KEY ("rolledBackById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyMemberSettlement" ADD CONSTRAINT "MonthlyMemberSettlement_finalizationId_fkey" FOREIGN KEY ("finalizationId") REFERENCES "MonthlyFinalization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyMemberSettlement" ADD CONSTRAINT "MonthlyMemberSettlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
