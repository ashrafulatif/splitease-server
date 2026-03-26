import { IRequestUser } from "../../interfaces/requestUser.interface";
import status from "http-status";
import {
  PaymentStatus,
  SubscriptionStatus,
  UserRole,
} from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

interface IChartItem {
  label: string;
  value: number;
}

const buildMonthlyCountBarChart = (dates: Date[]): IChartItem[] => {
  const monthCountMap = new Map<string, number>();

  for (const date of dates) {
    const monthLabel = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    monthCountMap.set(monthLabel, (monthCountMap.get(monthLabel) ?? 0) + 1);
  }

  return Array.from(monthCountMap.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([label, value]) => ({ label, value }));
};

const getDashboardStatsData = async (user: IRequestUser) => {
  switch (user.role) {
    case UserRole.ADMIN:
      return getAdminStatsData();
    case UserRole.MANAGER:
      return getManagerStatsData(user);
    case UserRole.MEMBER:
      return getMemberStatsData(user);
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
};

const getAdminStatsData = async () => {
  const [
    userCount,
    houseCount,
    houseMemberCount,
    monthCount,
    mealCount,
    expenseCount,
    depositCount,
    subscriptionCount,
    paymentCount,
    totalExpenseAggregate,
    totalDepositAggregate,
    totalRevenueAggregate,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.house.count(),
    prisma.houseMember.count(),
    prisma.month.count(),
    prisma.meal.count(),
    prisma.expense.count(),
    prisma.deposit.count(),
    prisma.subscription.count(),
    prisma.payment.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
  ]);

  const totalExpense = totalExpenseAggregate._sum.amount ?? 0;
  const totalDeposit = totalDepositAggregate._sum.amount ?? 0;

  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      _count: {
        _all: true,
      },
    }),
    prisma.month.findMany({
      select: { startDate: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const pieChartData: IChartItem[] = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all,
  }));

  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate),
  );

  return {
    userCount,
    houseCount,
    houseMemberCount,
    monthCount,
    mealCount,
    expenseCount,
    depositCount,
    subscriptionCount,
    paymentCount,
    totalExpense,
    totalDeposit,
    currentBalance: Number((totalDeposit - totalExpense).toFixed(2)),
    totalRevenue: totalRevenueAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData,
  };
};

const getManagerStatsData = async (user: IRequestUser) => {
  const houses = await prisma.house.findMany({
    where: {
      OR: [
        { createdBy: user.userId },
        {
          members: {
            some: {
              userId: user.userId,
              role: UserRole.MANAGER,
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  const houseIds = Array.from(new Set(houses.map((house) => house.id)));

  if (houseIds.length === 0) {
    const myPaymentAggregate = await prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS,
      },
      _sum: { amount: true },
    });

    return {
      houseCount: 0,
      memberCount: 0,
      monthCount: 0,
      mealCount: 0,
      expenseCount: 0,
      totalExpense: 0,
      totalDeposit: 0,
      currentBalance: 0,
      activeSubscriptionCount: 0,
      totalSubscriptionPaid: myPaymentAggregate._sum.amount ?? 0,
      pieChartData: [],
      barChartData: [],
    };
  }

  const [
    memberCount,
    monthCount,
    mealCount,
    expenseCount,
    totalExpenseAggregate,
    totalDepositAggregate,
    activeSubscriptionCount,
    myPaymentAggregate,
  ] = await Promise.all([
    prisma.houseMember.count({ where: { houseId: { in: houseIds } } }),
    prisma.month.count({ where: { houseId: { in: houseIds } } }),
    prisma.meal.count({ where: { houseId: { in: houseIds } } }),
    prisma.expense.count({ where: { houseId: { in: houseIds } } }),
    prisma.expense.aggregate({
      where: { houseId: { in: houseIds } },
      _sum: { amount: true },
    }),
    prisma.deposit.aggregate({
      where: { houseId: { in: houseIds } },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
    prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS,
      },
      _sum: { amount: true },
    }),
  ]);

  const totalExpense = totalExpenseAggregate._sum.amount ?? 0;
  const totalDeposit = totalDepositAggregate._sum.amount ?? 0;

  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      where: { houseId: { in: houseIds } },
      _count: {
        _all: true,
      },
    }),
    prisma.month.findMany({
      where: { houseId: { in: houseIds } },
      select: { startDate: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const pieChartData: IChartItem[] = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all,
  }));

  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate),
  );

  return {
    houseCount: houseIds.length,
    memberCount,
    monthCount,
    mealCount,
    expenseCount,
    totalExpense,
    totalDeposit,
    currentBalance: Number((totalDeposit - totalExpense).toFixed(2)),
    activeSubscriptionCount,
    totalSubscriptionPaid: myPaymentAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData,
  };
};

const getMemberStatsData = async (user: IRequestUser) => {
  const [
    joinedHouseCount,
    mealCount,
    depositCount,
    myDepositAggregate,
    myExpenseCount,
    myExpenseAggregate,
    activeSubscriptionCount,
    myPaymentAggregate,
  ] = await Promise.all([
    prisma.houseMember.count({ where: { userId: user.userId } }),
    prisma.meal.count({ where: { userId: user.userId } }),
    prisma.deposit.count({ where: { userId: user.userId } }),
    prisma.deposit.aggregate({
      where: { userId: user.userId },
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: { createdBy: user.userId } }),
    prisma.expense.aggregate({
      where: { createdBy: user.userId },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
    prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS,
      },
      _sum: { amount: true },
    }),
  ]);

  const totalDeposit = myDepositAggregate._sum.amount ?? 0;
  const myExpense = myExpenseAggregate._sum.amount ?? 0;

  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      where: { createdBy: user.userId },
      _count: {
        _all: true,
      },
    }),
    prisma.month.findMany({
      where: {
        house: {
          members: {
            some: {
              userId: user.userId,
            },
          },
        },
      },
      select: { startDate: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const pieChartData: IChartItem[] = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all,
  }));

  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate),
  );

  return {
    joinedHouseCount,
    mealCount,
    depositCount,
    myExpenseCount,
    totalDeposit,
    myExpense,
    netContribution: Number((totalDeposit - myExpense).toFixed(2)),
    activeSubscriptionCount,
    totalSubscriptionPaid: myPaymentAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData,
  };
};

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

  const [expenseAggregate, meals, deposits, houseMembers] = await Promise.all([
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
  getDashboardStatsData,
  getMonthlySummary,
};
