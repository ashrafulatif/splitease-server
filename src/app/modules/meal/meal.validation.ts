import z from "zod";
import { MealEnum } from "../../../generated/prisma/enums";

const addMealSchema = z.object({
  houseId: z.string().uuid("House id is required"),
  monthId: z.string().uuid("Month id is required"),
  date: z.iso.datetime("Date must be a valid ISO datetime"),
  mealType: z.nativeEnum(MealEnum),
  userId: z.string().uuid("User id must be valid").optional(),
});

const updateMealSchema = z
  .object({
    date: z.iso.datetime("Date must be a valid ISO datetime").optional(),
    mealType: z.nativeEnum(MealEnum).optional(),
  })
  .refine(
    (payload) => payload.date !== undefined || payload.mealType !== undefined,
    {
      message: "At least one field is required to update",
    },
  );

export const MealValidation = {
  addMealSchema,
  updateMealSchema,
};
