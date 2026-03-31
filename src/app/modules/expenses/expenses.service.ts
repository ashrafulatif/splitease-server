import status from "http-status";
import { ExpenseTypeEnum, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreateExpensePayload,
  IUpdateExpensePayload,
} from "./expenses.interface";

const expenseDetailsInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true,
    },
  },
  month: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isClosed: true,
    },
  },
} as const;

const createExpense = async (
  payload: ICreateExpensePayload,
  user: IRequestUser,
) => {
  const { houseId, monthId, type, amount, description, userId } = payload;

  if (!amount || amount <= 0) {
    throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
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

  if (!month || month.houseId !== houseId) {
    throw new AppError(status.NOT_FOUND, "Month not found for this house");
  }

  const hasAccess =
    month.house.createdBy === user.userId || month.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to add expense in this house",
    );
  }

  if (month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot add expense to a closed month",
    );
  }

  const requesterRole = month.house.members[0]?.role;
  const isManager =
    month.house.createdBy === user.userId ||
    requesterRole === UserRole.ADMIN ||
    requesterRole === UserRole.MANAGER;

  const targetUserId = userId ?? user.userId;

  if (!isManager && targetUserId !== user.userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to add expense for other members",
    );
  }

  if (isManager) {
    const isTargetUserInHouse = await prisma.house.findFirst({
      where: {
        id: houseId,
        OR: [
          {
            createdBy: targetUserId,
          },
          {
            members: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!isTargetUserInHouse) {
      throw new AppError(
        status.NOT_FOUND,
        "Target user is not a member of this house",
      );
    }
  }

  return prisma.expense.create({
    data: {
      houseId,
      monthId,
      type: type as ExpenseTypeEnum,
      amount,
      description: description?.trim() || null,
      createdBy: targetUserId,
    },
    include: expenseDetailsInclude,
  });
};

const getExpensesByMonth = async (monthId: string, user: IRequestUser) => {
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
    month.house.createdBy === user.userId || month.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view expenses of this month",
    );
  }

  return prisma.expense.findMany({
    where: { monthId },
    orderBy: { createdAt: "desc" },
    include: expenseDetailsInclude,
  });
};

const getExpenseById = async (expenseId: string, user: IRequestUser) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      ...expenseDetailsInclude,
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
    },
  });

  if (!expense) {
    throw new AppError(status.NOT_FOUND, "Expense not found");
  }

  const hasAccess =
    expense.house.createdBy === user.userId || expense.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this expense",
    );
  }

  return expense;
};

const updateExpense = async (
  expenseId: string,
  payload: IUpdateExpensePayload,
  user: IRequestUser,
) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
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
      month: {
        select: {
          isClosed: true,
        },
      },
    },
  });

  if (!expense) {
    throw new AppError(status.NOT_FOUND, "Expense not found");
  }

  const requesterRole = expense.house.members[0]?.role;
  const isManager =
    expense.house.createdBy === user.userId ||
    requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || expense.createdBy === user.userId;

  if (!canUpdate) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this expense",
    );
  }

  if (expense.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update expense of a closed month",
    );
  }

  const data: {
    type?: ExpenseTypeEnum;
    amount?: number;
    description?: string | null;
  } = {};

  if (payload.type !== undefined) {
    data.type = payload.type;
  }

  if (payload.amount !== undefined) {
    if (payload.amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
    }
    data.amount = payload.amount;
  }

  if (payload.description !== undefined) {
    data.description = payload.description?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No valid fields to update");
  }

  return prisma.expense.update({
    where: { id: expenseId },
    data,
    include: expenseDetailsInclude,
  });
};

const deleteExpense = async (expenseId: string, user: IRequestUser) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
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
      month: {
        select: {
          isClosed: true,
        },
      },
    },
  });

  if (!expense) {
    throw new AppError(status.NOT_FOUND, "Expense not found");
  }

  const requesterRole = expense.house.members[0]?.role;
  const isManager =
    expense.house.createdBy === user.userId ||
    requesterRole === UserRole.MANAGER;
  const canDelete = isManager || expense.createdBy === user.userId;

  if (!canDelete) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this expense",
    );
  }

  if (expense.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot delete expense of a closed month",
    );
  }

  return prisma.expense.delete({
    where: { id: expenseId },
  });
};

export const ExpenseService = {
  createExpense,
  getExpensesByMonth,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
