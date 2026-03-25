import { Router } from "express";
import { StatsController } from "./stats.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get(
	"/summary/:monthId",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	StatsController.getMonthlySummary,
);

export const StatsRoutes = router;
