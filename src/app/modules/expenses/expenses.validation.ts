import z from "zod";
import { ExpenseTypeEnum } from "../../../generated/prisma/enums";

const createExpenseSchema = z.object({
  houseId: z.string().uuid("House id is required"),
  monthId: z.string().uuid("Month id is required"),
  type: z.nativeEnum(ExpenseTypeEnum),
  amount: z
    .number("Amount must be a number")
    .positive("Amount must be greater than 0"),
  description: z
    .string({ error: "Description must be a string" })
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

const updateExpenseSchema = z
  .object({
    type: z.nativeEnum(ExpenseTypeEnum).optional(),
    amount: z
      .number("Amount must be a number")
      .positive("Amount must be greater than 0")
      .optional(),
    description: z
      .string({ error: "Description must be a string" })
      .max(500, "Description cannot exceed 500 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (payload) =>
      payload.type !== undefined ||
      payload.amount !== undefined ||
      payload.description !== undefined,
    {
      message: "At least one field is required to update",
    },
  );

export const ExpenseValidation = {
  createExpenseSchema,
  updateExpenseSchema,
};
