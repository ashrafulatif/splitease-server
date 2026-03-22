import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";

const router = Router();

router.use("/auth", AuthRouter);

export const IndexRouter = router;
