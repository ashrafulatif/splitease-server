import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { CheckAuth } from "../../middleware/checkAuth";
import { MonthController } from "./month.controller";

const router = Router();

router.post("/", CheckAuth(UserRole.MANAGER), MonthController.createMonth);

router.get(
  "/house/:houseId",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  MonthController.getHouseMonths,
);

router.get(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  MonthController.getMonthById,
);

router.delete(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MonthController.deleteMonth,
);

export const MonthRoutes = router;
