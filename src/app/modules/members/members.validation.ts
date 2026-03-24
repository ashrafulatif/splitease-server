import z from "zod";
import { UserRole } from "../../../generated/prisma/enums";

const addMemberToHouseSchema = z.object({
  houseId: z.string().uuid("House id is required"),
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters"),
  email: z
    .email("Email must be valid")
    .transform((email) => email.toLowerCase().trim()),
  role: z.nativeEnum(UserRole).optional(),
});

export const MembersValidation = {
  addMemberToHouseSchema,
};
