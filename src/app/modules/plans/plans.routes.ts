import { Router } from "express";
import { PlansController } from "./plans.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  PlansController.getPlans,
);

router.post("/", CheckAuth(UserRole.ADMIN), PlansController.createPlan);

router.patch("/:id", CheckAuth(UserRole.ADMIN), PlansController.updatePlan);

router.delete("/:id", CheckAuth(UserRole.ADMIN), PlansController.deletePlan);

export const PlansRoutes = router;
