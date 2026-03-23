import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { HousesRoutes } from "../modules/houses/houses.routes";

const router = Router();

router.use("/auth", AuthRouter);

router.use("/houses", HousesRoutes);

export const IndexRouter = router;
