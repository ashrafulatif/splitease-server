import { MealEnum } from "../../../generated/prisma/enums";

export interface IAddMealPayload {
  houseId: string;
  monthId: string;
  date: string;
  mealType: MealEnum;
  userId?: string;
}

export interface IUpdateMealPayload {
  date?: string;
  mealType?: MealEnum;
}
