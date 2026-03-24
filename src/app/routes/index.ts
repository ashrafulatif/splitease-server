import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { HousesRoutes } from "../modules/houses/houses.routes";
import { MembersRoutes } from "../modules/members/members.routes";
import { MonthRoutes } from "../modules/month/month.routes";

const router = Router();

router.use("/auth", AuthRouter);

router.use("/houses", HousesRoutes);

router.use("/house-members", MembersRoutes);

router.use("/months", MonthRoutes);

export const IndexRouter = router;
