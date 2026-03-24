import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";
import { ICreateMonthPayload } from "./month.interface";

const monthDetailsInclude = {
	house: {
		select: {
			id: true,
			name: true,
			createdBy: true,
		},
	},
	_count: {
		select: {
			meals: true,
			deposits: true,
			expenses: true,
		},
	},
} as const;

const createMonth = async (payload: ICreateMonthPayload, user: IRequestUser) => {
	const { houseId, name, startDate, endDate } = payload;

	const trimmedName = name?.trim();

	if (!trimmedName) {
		throw new AppError(status.BAD_REQUEST, "Month name is required");
	}

	const parsedStartDate = new Date(startDate);
	const parsedEndDate = new Date(endDate);

	if (
		Number.isNaN(parsedStartDate.getTime()) ||
		Number.isNaN(parsedEndDate.getTime())
	) {
		throw new AppError(status.BAD_REQUEST, "Invalid startDate or endDate");
	}

	if (parsedStartDate >= parsedEndDate) {
		throw new AppError(
			status.BAD_REQUEST,
			"End date must be greater than start date",
		);
	}

	const house = await prisma.house.findUnique({
		where: { id: houseId },
		include: {
			members: {
				where: { userId: user.userId },
				select: { role: true },
			},
		},
	});

	if (!house) {
		throw new AppError(status.NOT_FOUND, "House not found");
	}

	const requesterRole = house.members[0]?.role;
	const canCreateMonth =
		house.createdBy === user.userId || requesterRole === UserRole.MANAGER;

	if (!canCreateMonth) {
		throw new AppError(
			status.FORBIDDEN,
			"Only manager can create month for this house",
		);
	}

	const isDuplicateMonth = await prisma.month.findFirst({
		where: {
			houseId,
			name: {
				equals: trimmedName,
				mode: "insensitive",
			},
		},
	});

	if (isDuplicateMonth) {
		throw new AppError(
			status.CONFLICT,
			"A month with this name already exists in this house",
		);
	}

	return prisma.month.create({
		data: {
			houseId,
			name: trimmedName,
			startDate: parsedStartDate,
			endDate: parsedEndDate,
		},
		include: monthDetailsInclude,
	});
};

const getHouseMonths = async (houseId: string, user: IRequestUser) => {
	const house = await prisma.house.findUnique({
		where: { id: houseId },
		include: {
			members: {
				where: { userId: user.userId },
				select: { role: true },
			},
		},
	});

	if (!house) {
		throw new AppError(status.NOT_FOUND, "House not found");
	}

	const hasAccess =
		user.role === UserRole.ADMIN ||
		house.createdBy === user.userId ||
		house.members.length > 0;

	if (!hasAccess) {
		throw new AppError(
			status.FORBIDDEN,
			"You are not authorized to view months of this house",
		);
	}

	return prisma.month.findMany({
		where: { houseId },
		orderBy: { startDate: "asc" },
		include: monthDetailsInclude,
	});
};

const getMonthById = async (monthId: string, user: IRequestUser) => {
	const month = await prisma.month.findUnique({
		where: { id: monthId },
		include: {
			house: {
				select: {
					id: true,
					name: true,
					createdBy: true,
					members: {
						where: { userId: user.userId },
						select: { role: true },
					},
				},
			},
			expenses: {
				orderBy: { createdAt: "desc" },
				include: {
					creator: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
			deposits: {
				orderBy: { createdAt: "desc" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
			meals: {
				orderBy: { date: "asc" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
		},
	});

	if (!month) {
		throw new AppError(status.NOT_FOUND, "Month not found");
	}

	const hasAccess =
		user.role === UserRole.ADMIN ||
		month.house.createdBy === user.userId ||
		month.house.members.length > 0;

	if (!hasAccess) {
		throw new AppError(
			status.FORBIDDEN,
			"You are not authorized to view this month",
		);
	}

	const [expenseSummary, depositSummary] = await Promise.all([
		prisma.expense.aggregate({
			where: { monthId },
			_sum: { amount: true },
		}),
		prisma.deposit.aggregate({
			where: { monthId },
			_sum: { amount: true },
		}),
	]);

	return {
		...month,
		summary: {
			totalExpense: expenseSummary._sum.amount ?? 0,
			totalDeposit: depositSummary._sum.amount ?? 0,
			totalMeal: month.meals.length,
			balance: (depositSummary._sum.amount ?? 0) - (expenseSummary._sum.amount ?? 0),
		},
	};
};

const deleteMonth = async (monthId: string, user: IRequestUser) => {
	const month = await prisma.month.findUnique({
		where: { id: monthId },
		include: {
			house: {
				select: {
					createdBy: true,
					members: {
						where: { userId: user.userId },
						select: { role: true },
					},
				},
			},
		},
	});

	if (!month) {
		throw new AppError(status.NOT_FOUND, "Month not found");
	}

	const requesterRole = month.house.members[0]?.role;
	const canDelete =
		user.role === UserRole.ADMIN ||
		month.house.createdBy === user.userId ||
		requesterRole === UserRole.MANAGER;

	if (!canDelete) {
		throw new AppError(
			status.FORBIDDEN,
			"Only manager can delete month for this house",
		);
	}

	return prisma.month.delete({
		where: { id: monthId },
	});
};

export const MonthService = {
	createMonth,
	getHouseMonths,
	getMonthById,
	deleteMonth,
};

