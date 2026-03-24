import status from "http-status";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserRole } from "../../../generated/prisma/enums";
import { IAddMemberToHousePayload } from "./members.interface";

const memberDetailsInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
    },
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true,
    },
  },
} as const;

const addMemberToHouse = async (
  payload: IAddMemberToHousePayload,
  user: IRequestUser,
) => {
  const { houseId, name, email, role } = payload;

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
  const canManage =
    user.role === UserRole.ADMIN ||
    house.createdBy === user.userId ||
    requesterRole === UserRole.ADMIN ||
    requesterRole === UserRole.MANAGER;

  if (!canManage) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to add member in this house",
    );
  }

  return prisma.$transaction(async (tx) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && !existingUser.isDeleted) {
      throw new AppError(
        status.CONFLICT,
        "User with this email already exists",
      );
    }

    const createdUser = await tx.user.create({
      data: {
        id: randomUUID(),
        name,
        email: normalizedEmail,
        role: UserRole.MEMBER,
      },
    });

    return tx.houseMember.create({
      data: {
        houseId,
        userId: createdUser.id,
        role: role ?? UserRole.MEMBER,
      },
      include: memberDetailsInclude,
    });
  });
};

const getAllMembers = async (user: IRequestUser) => {
  if (user.role === UserRole.ADMIN) {
    return prisma.houseMember.findMany({
      orderBy: { createdAt: "desc" },
      include: memberDetailsInclude,
    });
  }

  return prisma.houseMember.findMany({
    where: {
      house: {
        OR: [
          { createdBy: user.userId },
          {
            members: {
              some: {
                userId: user.userId,
              },
            },
          },
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    include: memberDetailsInclude,
  });
};

const getMemberById = async (id: string, user: IRequestUser) => {
  const member = await prisma.houseMember.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isDeleted: true,
        },
      },
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

  if (!member) {
    throw new AppError(status.NOT_FOUND, "Member not found");
  }

  const requesterRole = member.house.members[0]?.role;
  const canRead =
    user.role === UserRole.ADMIN ||
    member.userId === user.userId ||
    member.house.createdBy === user.userId ||
    requesterRole === UserRole.ADMIN ||
    requesterRole === UserRole.MANAGER;

  if (!canRead) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this member",
    );
  }

  return member;
};

const getHouseMember = async (houseId: string, user: IRequestUser) => {
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
      "You are not authorized to view house members",
    );
  }

  return prisma.houseMember.findMany({
    where: { houseId },
    orderBy: { createdAt: "desc" },
    include: memberDetailsInclude,
  });
};

const deleteMember = async (id: string, user: IRequestUser) => {
  const member = await prisma.houseMember.findUnique({
    where: { id },
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
    },
  });

  if (!member) {
    throw new AppError(status.NOT_FOUND, "Member not found");
  }

  const requesterRole = member.house.members[0]?.role;
  const canDelete =
    user.role === UserRole.ADMIN ||
    member.house.createdBy === user.userId ||
    requesterRole === UserRole.ADMIN ||
    requesterRole === UserRole.MANAGER;

  if (!canDelete) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this member",
    );
  }

  if (member.userId === member.house.createdBy) {
    throw new AppError(
      status.BAD_REQUEST,
      "House creator cannot be removed from members",
    );
  }

  return prisma.houseMember.delete({
    where: { id },
  });
};

export const MembersService = {
  addMemberToHouse,
  getAllMembers,
  getMemberById,
  getHouseMember,
  deleteMember,
};
