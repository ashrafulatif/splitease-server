import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/my",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  SubscriptionController.getMySubscription,
);

router.post(
  "/initiate-payment/:planId",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  SubscriptionController.initiateSubscription,
);

export const SubscriptionRoutes = router;
