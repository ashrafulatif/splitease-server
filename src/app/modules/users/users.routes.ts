import { Router } from "express";
import { UsersController } from "./users.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", CheckAuth(UserRole.ADMIN), UsersController.getAllUsers);

router.get("/:id", CheckAuth(UserRole.ADMIN), UsersController.getUserById);

router.patch(
  "/update-status/:id",
  CheckAuth(UserRole.ADMIN),
  UsersController.updateUserStatus,
);

router.delete(
  "/delete/:id",
  CheckAuth(UserRole.ADMIN),
  UsersController.deleteUser,
);

export const UsersRoutes = router;
