import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/initiate-payment/:planId",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  SubscriptionController.initiateSubscription,
);

router.get(
  "/my",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  SubscriptionController.getMySubscription,
);

router.get(
  "/",
  CheckAuth(UserRole.ADMIN),
  SubscriptionController.getSubscriptionList,
);

export const SubscriptionRoutes = router;
