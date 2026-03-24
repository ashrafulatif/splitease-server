import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserRole } from "../../../generated/prisma/enums";
import { ICreateHousePayload, IUpdateHousePayload } from "./houses.interface";

const houseDetailsInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  members: {
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
  _count: {
    select: {
      members: true,
      months: true,
      deposits: true,
      expenses: true,
      meals: true,
    },
  },
} as const;

const getAllHouses = async () => {
  return prisma.house.findMany({
    orderBy: { createdAt: "desc" },
    include: houseDetailsInclude,
  });
};

///TODO : add limit for create house for free users
const createHouse = async (
  payload: ICreateHousePayload,
  user: IRequestUser,
) => {
  const name = payload?.name?.trim();

  if (!name) {
    throw new AppError(status.BAD_REQUEST, "House name is required");
  }

  const isDuplicateHouse = await prisma.house.findFirst({
    where: {
      createdBy: user.userId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (isDuplicateHouse) {
    throw new AppError(
      status.CONFLICT,
      "You already have a house with this name",
    );
  }

  const house = await prisma.$transaction(async (tx) => {
    const createdHouse = await tx.house.create({
      data: {
        name,
        description: payload.description?.trim() || null,
        createdBy: user.userId,
      },
    });

    //update in house member
    await tx.houseMember.create({
      data: {
        houseId: createdHouse.id,
        userId: user.userId,
        role: UserRole.MANAGER,
      },
    });

    return tx.house.findUnique({
      where: { id: createdHouse.id },
      include: houseDetailsInclude,
    });
  });

  return house;
};

const updateHouse = async (
  id: string,
  payload: IUpdateHousePayload,
  user: IRequestUser,
) => {
  const house = await prisma.house.findUnique({
    where: { id },
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

  const memberRole = house.members[0]?.role;
  const canManage =
    house.createdBy === user.userId ||
    memberRole === UserRole.ADMIN ||
    memberRole === UserRole.MANAGER;

  if (!canManage) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this house",
    );
  }

  const data: { name?: string; description?: string | null } = {};

  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new AppError(status.BAD_REQUEST, "House name cannot be empty");
    }
    data.name = trimmedName;
  }

  if (payload.description !== undefined) {
    data.description = payload.description?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No valid data provided to update");
  }

  return prisma.house.update({
    where: { id },
    data,
    include: houseDetailsInclude,
  });
};

const getHouseById = async (id: string, user: IRequestUser) => {
  const access = await prisma.house.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId: user.userId },
        select: { id: true },
      },
    },
  });

  if (!access) {
    throw new AppError(status.NOT_FOUND, "House not found");
  }

  const hasAccess =
    access.createdBy === user.userId || access.members.length > 0;

  if (!hasAccess) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this house",
    );
  }

  return prisma.house.findUnique({
    where: { id },
    include: houseDetailsInclude,
  });
};

const deleteHouse = async (id: string, user: IRequestUser) => {
  const house = await prisma.house.findUnique({
    where: { id },
  });

  if (!house) {
    throw new AppError(status.NOT_FOUND, "House not found");
  }

  if (house.createdBy !== user.userId) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the creator can delete this house",
    );
  }

  return prisma.house.delete({
    where: { id },
  });
};

const getMyHouses = async (user: IRequestUser) => {
  return prisma.house.findMany({
    where: {
      OR: [
        { createdBy: user.userId },
        { members: { some: { userId: user.userId } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: houseDetailsInclude,
  });
};

export const HouseService = {
  getAllHouses,
  createHouse,
  updateHouse,
  getHouseById,
  deleteHouse,
  getMyHouses,
};
