import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";
import {
  ICreateDepositPayload,
  IUpdateDepositPayload,
} from "./deposit.interface";

const depositDetailsInclude = {
  user: {
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

const createDeposit = async (
  payload: ICreateDepositPayload,
  user: IRequestUser,
) => {
  const { houseId, monthId, amount, note, userId } = payload;

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
      "You are not authorized to add deposit in this house",
    );
  }

  if (month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot add deposit to a closed month",
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
      "You are not authorized to add deposit for other members",
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

  return prisma.deposit.create({
    data: {
      houseId,
      monthId,
      userId: targetUserId,
      amount,
      note: note?.trim() || null,
    },
    include: depositDetailsInclude,
  });
};

const getDepositsByMonth = async (monthId: string, user: IRequestUser) => {
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
      "You are not authorized to view deposits of this month",
    );
  }

  return prisma.deposit.findMany({
    where: { monthId },
    orderBy: { createdAt: "desc" },
    include: depositDetailsInclude,
  });
};

const getDepositById = async (depositId: string, user: IRequestUser) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    include: {
      ...depositDetailsInclude,
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

  if (!deposit) {
    throw new AppError(status.NOT_FOUND, "Deposit not found");
  }

  const hasAccess =
    deposit.house.createdBy === user.userId || deposit.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this deposit",
    );
  }

  return deposit;
};

const updateDeposit = async (
  depositId: string,
  payload: IUpdateDepositPayload,
  user: IRequestUser,
) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
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

  if (!deposit) {
    throw new AppError(status.NOT_FOUND, "Deposit not found");
  }

  const requesterRole = deposit.house.members[0]?.role;
  const isManager =
    deposit.house.createdBy === user.userId ||
    requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || deposit.userId === user.userId;

  if (!canUpdate) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this deposit",
    );
  }

  if (deposit.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update deposit of a closed month",
    );
  }

  const data: { amount?: number; note?: string | null } = {};

  if (payload.amount !== undefined) {
    if (payload.amount <= 0) {
      throw new AppError(status.BAD_REQUEST, "Amount must be greater than 0");
    }
    data.amount = payload.amount;
  }

  if (payload.note !== undefined) {
    data.note = payload.note?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No valid fields to update");
  }

  return prisma.deposit.update({
    where: { id: depositId },
    data,
    include: depositDetailsInclude,
  });
};

const deleteDeposit = async (depositId: string, user: IRequestUser) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
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

  if (!deposit) {
    throw new AppError(status.NOT_FOUND, "Deposit not found");
  }

  const requesterRole = deposit.house.members[0]?.role;
  const isManager =
    deposit.house.createdBy === user.userId ||
    requesterRole === UserRole.MANAGER;
  const canDelete = isManager || deposit.userId === user.userId;

  if (!canDelete) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this deposit",
    );
  }

  if (deposit.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot delete deposit of a closed month",
    );
  }

  return prisma.deposit.delete({
    where: { id: depositId },
  });
};

export const DepositService = {
  createDeposit,
  getDepositsByMonth,
  getDepositById,
  updateDeposit,
  deleteDeposit,
};
