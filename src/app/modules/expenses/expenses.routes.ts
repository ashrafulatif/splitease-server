import { Router } from "express";
import { ExpenseController } from "./expenses.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.createExpense,
);

router.get(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.getExpensesByMonth,
);

router.get(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.getExpenseById,
);

router.patch(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.updateExpense,
);

router.delete(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.deleteExpense,
);

export const ExpensesRoutes = router;
