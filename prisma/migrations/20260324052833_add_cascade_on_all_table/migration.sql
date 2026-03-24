-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_houseId_fkey";

-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_monthId_fkey";

-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_userId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_houseId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_monthId_fkey";

-- DropForeignKey
ALTER TABLE "house_members" DROP CONSTRAINT "house_members_houseId_fkey";

-- DropForeignKey
ALTER TABLE "house_members" DROP CONSTRAINT "house_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "houses" DROP CONSTRAINT "houses_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_houseId_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_monthId_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_userId_fkey";

-- DropForeignKey
ALTER TABLE "months" DROP CONSTRAINT "months_houseId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "houses" ADD CONSTRAINT "houses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "months" ADD CONSTRAINT "months_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
