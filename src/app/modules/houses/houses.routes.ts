// src/app/modules/houses/houses.routes.ts
import { Router } from "express";
import { HouseController } from "./houses.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", CheckAuth(UserRole.ADMIN), HouseController.getAllHouses);

router.post(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.createHouse,
);

router.get(
  "/my",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  HouseController.getMyHouses,
);

router.get("/:id", CheckAuth(UserRole.ADMIN), HouseController.getHouseById);

router.patch(
  "/update/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.updateHouse,
);

router.delete(
  "/delete/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.deleteHouse,
);

export const HousesRoutes = router;
