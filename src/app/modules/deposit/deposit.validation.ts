import z from "zod";

const createDepositSchema = z.object({
  houseId: z.string().uuid("House id is required"),
  monthId: z.string().uuid("Month id is required"),
  amount: z
    .number("Amount must be a number")
    .positive("Amount must be greater than 0"),
  note: z
    .string({ error: "Note must be a string" })
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});

const updateDepositSchema = z
  .object({
    amount: z
      .number("Amount must be a number")
      .positive("Amount must be greater than 0")
      .optional(),
    note: z
      .string({ error: "Note must be a string" })
      .max(500, "Note cannot exceed 500 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (payload) => payload.amount !== undefined || payload.note !== undefined,
    {
      message: "At least one field is required to update",
    },
  );

export const DepositValidation = {
  createDepositSchema,
  updateDepositSchema,
};
