import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { HousesRoutes } from "../modules/houses/houses.routes";
import { MembersRoutes } from "../modules/members/members.routes";
import { MonthRoutes } from "../modules/month/month.routes";
import { MealRoutes } from "../modules/meal/meal.routes";
import { DepositRoutes } from "../modules/deposit/deposit.routes";
import { ExpensesRoutes } from "../modules/expenses/expenses.routes";
import { StatsRoutes } from "../modules/stats/stats.routes";
import { PlansRoutes } from "../modules/plans/plans.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { PaymentRoutes } from "../modules/payments/payments.routes";
import { UsersRoutes } from "../modules/users/users.routes";

const router = Router();

router.use("/auth", AuthRouter);

router.use("/houses", HousesRoutes);

router.use("/house-members", MembersRoutes);

router.use("/months", MonthRoutes);

router.use("/meals", MealRoutes);

router.use("/deposits", DepositRoutes);

router.use("/expenses", ExpensesRoutes);

router.use("/stats", StatsRoutes);

router.use("/plans", PlansRoutes);

router.use("/subscription", SubscriptionRoutes);

router.use("/payments", PaymentRoutes);

router.use("/users", UsersRoutes);

export const IndexRouter = router;
