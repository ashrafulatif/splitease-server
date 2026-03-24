import { Router } from "express";
import { MembersController } from "./members.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/",
	CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
	MembersController.addMemberToHouse,
);

router.get(
	"/",
	CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
	MembersController.getAllMembers,
);

router.get(
  "/house-members/:houseId",
  CheckAuth(UserRole.MANAGER),
  MembersController.getHouseMember,
);

router.get(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.getMemberById,
);

router.delete(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.deleteMember,
);

export const MembersRoutes = router;
