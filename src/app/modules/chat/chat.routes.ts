import { Router } from "express";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { ChatController } from "./chat.controller";

const router = Router();

router.post(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  ChatController.getChatResponse
);

export const ChatRoutes = router;
