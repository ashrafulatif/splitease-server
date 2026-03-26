import { IRequestUser } from "../../interfaces/requestUser.interface";
import status from "http-status";
import { UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getMonthlySummary = async (monthId: string, user: IRequestUser) => {
  if (!monthId) {
    throw new AppError(status.BAD_REQUEST, "monthId is required");
  }

  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
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

  const hasAccess =
    user.role === UserRole.ADMIN ||
    month.house.createdBy === user.userId ||
    month.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this month summary",
    );
  }

  const [expenseAggregate, meals, deposits, houseMembers] =
    await prisma.$transaction([
      prisma.expense.aggregate({
        where: { monthId },
        _sum: { amount: true },
      }),
      prisma.meal.findMany({
        where: { monthId },
        select: { userId: true },
      }),
      prisma.deposit.findMany({
        where: { monthId },
        select: { userId: true, amount: true },
      }),
      prisma.houseMember.findMany({
        where: { houseId: month.houseId },
        select: {
          userId: true,
        },
      }),
    ]);

  const totalExpense = expenseAggregate._sum.amount ?? 0;
  const totalMeals = meals.length;
  const totalDeposit = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0,
  );
  const currentBalance = Number((totalDeposit - totalExpense).toFixed(2));

  const mealRate =
    totalMeals > 0 ? Number((totalExpense / totalMeals).toFixed(2)) : 0;

  const mealsMap = new Map<string, number>();
  for (const meal of meals) {
    mealsMap.set(meal.userId, (mealsMap.get(meal.userId) ?? 0) + 1);
  }

  const depositsMap = new Map<string, number>();
  for (const deposit of deposits) {
    depositsMap.set(
      deposit.userId,
      (depositsMap.get(deposit.userId) ?? 0) + deposit.amount,
    );
  }

  const userIds = Array.from(
    new Set([
      ...houseMembers.map((member) => member.userId),
      ...mealsMap.keys(),
      ...depositsMap.keys(),
    ]),
  );

  const users = userIds.map((userId) => {
    const userTotalMeals = mealsMap.get(userId) ?? 0;
    const userDeposit = depositsMap.get(userId) ?? 0;
    const userCost = Number((userTotalMeals * mealRate).toFixed(2));
    const userBalance = Number((userDeposit - userCost).toFixed(2));

    return {
      userId,
      totalMeals: userTotalMeals,
      deposit: userDeposit,
      cost: userCost,
      balance: userBalance,
    };
  });

  return {
    mealRate,
    totalExpense,
    totalMeals,
    currentBalance,
    users,
  };
};

export const StatsService = {
  getMonthlySummary,
};
