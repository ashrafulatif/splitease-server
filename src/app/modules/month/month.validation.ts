import z from "zod";

const createMonthSchema = z
	.object({
		houseId: z.string().uuid("House id is required"),
		name: z
			.string({ error: "Month name is required" })
			.min(1, "Month name is required")
			.max(60, "Month name must be at most 60 characters"),
		startDate: z.iso.datetime("Start date must be a valid ISO datetime"),
		endDate: z.iso.datetime("End date must be a valid ISO datetime"),
	})
	.refine(
		(data) => new Date(data.startDate).getTime() < new Date(data.endDate).getTime(),
		{
			path: ["endDate"],
			message: "End date must be greater than start date",
		},
	);

export const MonthValidation = {
	createMonthSchema,
};

