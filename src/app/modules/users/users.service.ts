import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import paginationAndSortgHelper from "../../helpers/paginationAndSorting";

const userListSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  emailVerified: true,
  needPasswordChange: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getAllUsers = async (query: Record<string, unknown>) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationAndSortgHelper(query);

  const whereConditions = {
    role: {
      not: UserRole.ADMIN,
    },
  };

  const total = await prisma.user.count({
    where: whereConditions,
  });

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: userListSelect,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userListSelect,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (existingUser.role === UserRole.ADMIN) {
    throw new AppError(status.BAD_REQUEST, "Admin user cannot be deleted");
  }

  if (existingUser.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "User is already deleted");
  }

  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
    },
    select: userListSelect,
  });
};

const updateUserStatus = async (id: string, userStatus: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const normalizedStatus = userStatus?.toUpperCase().trim();

  if (!Object.values(UserStatus).includes(normalizedStatus as UserStatus)) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid status. Allowed values: ACTIVE, INACTIVE, SUSPENDED",
    );
  }

  return prisma.user.update({
    where: { id },
    data: {
      status: normalizedStatus,
    },
    select: userListSelect,
  });
};

export const UsersService = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
};
