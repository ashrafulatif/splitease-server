import { Router } from "express";
import { MealController } from "./meal.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	MealController.addMeal,
);

router.get(
	"/month/:monthId",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	MealController.getAllMeals,
);

router.get(
	"/:id",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	MealController.getMealById,
);

router.patch(
	"/:id",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	MealController.updateMeal,
);

router.delete(
	"/:id",
	CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
	MealController.deleteMeal,
);

export const MealRoutes = router;
