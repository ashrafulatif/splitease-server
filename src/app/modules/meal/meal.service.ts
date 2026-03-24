import status from "http-status";
import { MealEnum, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IAddMealPayload, IUpdateMealPayload } from "./meal.interface";

const mealDetailsInclude = {
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

const addMeal = async (payload: IAddMealPayload, user: IRequestUser) => {
  const { houseId, monthId, date, mealType } = payload;

  const mealDate = new Date(date);
  if (Number.isNaN(mealDate.getTime())) {
    throw new AppError(status.BAD_REQUEST, "Invalid meal date");
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
      "You are not authorized to add meal in this house",
    );
  }

  if (month.isClosed) {
    throw new AppError(status.BAD_REQUEST, "Cannot add meal to a closed month");
  }

  return prisma.meal.create({
    data: {
      houseId,
      monthId,
      userId: user.userId,
      date: mealDate,
      mealType: mealType as MealEnum,
    },
    include: mealDetailsInclude,
  });
};

const getAllMeals = async (monthId: string, user: IRequestUser) => {
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
      "You are not authorized to view meals of this month",
    );
  }

  return prisma.meal.findMany({
    where: { monthId },
    orderBy: { date: "asc" },
    include: mealDetailsInclude,
  });
};

const getMealById = async (mealId: string, user: IRequestUser) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      ...mealDetailsInclude,
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

  if (!meal) {
    throw new AppError(status.NOT_FOUND, "Meal not found");
  }

  const hasAccess =
    meal.house.createdBy === user.userId || meal.house.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this meal",
    );
  }

  return meal;
};

const updateMeal = async (
  mealId: string,
  payload: IUpdateMealPayload,
  user: IRequestUser,
) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
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

  if (!meal) {
    throw new AppError(status.NOT_FOUND, "Meal not found");
  }

  const requesterRole = meal.house.members[0]?.role;
  const isManager =
    meal.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || meal.userId === user.userId;

  if (!canUpdate) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this meal",
    );
  }

  if (meal.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update meal of a closed month",
    );
  }

  const data: { date?: Date; mealType?: MealEnum } = {};

  if (payload.date !== undefined) {
    const parsedDate = new Date(payload.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError(status.BAD_REQUEST, "Invalid meal date");
    }
    data.date = parsedDate;
  }

  if (payload.mealType !== undefined) {
    data.mealType = payload.mealType;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No valid fields to update");
  }

  return prisma.meal.update({
    where: { id: mealId },
    data,
    include: mealDetailsInclude,
  });
};

const deleteMeal = async (mealId: string, user: IRequestUser) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
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

  if (!meal) {
    throw new AppError(status.NOT_FOUND, "Meal not found");
  }

  const requesterRole = meal.house.members[0]?.role;
  const isManager =
    meal.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canDelete = isManager || meal.userId === user.userId;

  if (!canDelete) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this meal",
    );
  }

  if (meal.month.isClosed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot delete meal of a closed month",
    );
  }

  return prisma.meal.delete({
    where: { id: mealId },
  });
};

export const MealService = {
  addMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
};
