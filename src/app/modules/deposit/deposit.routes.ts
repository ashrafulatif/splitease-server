import { Router } from "express";
import { DepositController } from "./deposit.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.createDeposit,
);

router.get(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.getDepositsByMonth,
);

router.get(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.getDepositById,
);

router.patch(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.updateDeposit,
);

router.delete(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.deleteDeposit,
);

export const DepositRoutes = router;
