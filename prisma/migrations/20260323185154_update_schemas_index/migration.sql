/*
  Warnings:

  - You are about to drop the `Deposit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `House` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HouseMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Month` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_monthId_fkey";

-- DropForeignKey
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_userId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_monthId_fkey";

-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "HouseMember" DROP CONSTRAINT "HouseMember_houseId_fkey";

-- DropForeignKey
ALTER TABLE "HouseMember" DROP CONSTRAINT "HouseMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_monthId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_userId_fkey";

-- DropForeignKey
ALTER TABLE "Month" DROP CONSTRAINT "Month_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropTable
DROP TABLE "Deposit";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "House";

-- DropTable
DROP TABLE "HouseMember";

-- DropTable
DROP TABLE "Meal";

-- DropTable
DROP TABLE "Month";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Plan";

-- DropTable
DROP TABLE "Subscription";

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "type" "ExpenseTypeEnum" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" "MealEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "months" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "months_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeEventId" TEXT,
    "invoiceUrl" TEXT,
    "paymentGatewayData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deposits_houseId_monthId_userId_idx" ON "deposits"("houseId", "monthId", "userId");

-- CreateIndex
CREATE INDEX "expenses_houseId_monthId_idx" ON "expenses"("houseId", "monthId");

-- CreateIndex
CREATE INDEX "houses_createdBy_idx" ON "houses"("createdBy");

-- CreateIndex
CREATE INDEX "house_members_userId_idx" ON "house_members"("userId");

-- CreateIndex
CREATE INDEX "house_members_houseId_idx" ON "house_members"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "house_members_userId_houseId_key" ON "house_members"("userId", "houseId");

-- CreateIndex
CREATE INDEX "meals_houseId_monthId_userId_idx" ON "meals"("houseId", "monthId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meals_userId_date_mealType_key" ON "meals"("userId", "date", "mealType");

-- CreateIndex
CREATE INDEX "months_houseId_idx" ON "months"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "months_houseId_name_key" ON "months"("houseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeEventId_key" ON "payments"("stripeEventId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "houses" ADD CONSTRAINT "houses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "months" ADD CONSTRAINT "months_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
