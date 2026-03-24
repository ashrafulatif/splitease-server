import z from "zod";

const createHouseSchema = z.object({
	name: z
		.string({ error: "House name is required" })
		.trim()
		.min(1, "House name is required")
		.max(50, "House name cannot exceed 50 characters"),
	description: z
		.string({ error: "Description must be a string" })
		.trim()
		.max(500, "Description cannot exceed 500 characters")
		.optional(),
});

const updateHouseSchema = z.object({
	name: z
		.string({ error: "House name must be a string" })
		.trim()
		.min(1, "House name cannot be empty")
		.max(50, "House name cannot exceed 50 characters")
		.optional(),
	description: z
		.string({ error: "Description must be a string" })
		.trim()
		.max(500, "Description cannot exceed 500 characters")
		.nullable()
		.optional(),
}).refine((payload) => payload.name !== undefined || payload.description !== undefined, {
	message: "At least one field is required to update",
});

export const HouseValidation = {
	createHouseSchema,
	updateHouseSchema,
};
