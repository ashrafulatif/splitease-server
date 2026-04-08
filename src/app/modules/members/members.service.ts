import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserRole } from "../../../generated/prisma/enums";
import { IAddMemberToHousePayload } from "./members.interface";
import { auth } from "../../lib/auth";
import { sendEmail } from "../../utils/emall";
import paginationAndSortgHelper from "../../helpers/paginationAndSorting";

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

  const normalizedEmail = email;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser && !existingUser.isDeleted) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  if (existingUser?.isDeleted) {
    throw new AppError(
      status.CONFLICT,
      "A deleted user already exists with this email",
    );
  }

  const temporaryPassword = `Member@${Math.random().toString(36).slice(-2)}`;

  let createdUserId: string | null = null;

  try {
    const signUpData = await auth.api.signUpEmail({
      body: {
        name,
        email: normalizedEmail,
        password: temporaryPassword,
      },
    });

    if (!signUpData.user) {
      throw new AppError(status.BAD_REQUEST, "Failed to create member account");
    }

    createdUserId = signUpData.user.id;

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: createdUserId as string },
        data: {
          role: UserRole.MEMBER,
          emailVerified: true,
          needPasswordChange: true,
        },
      });

      const existingMembership = await tx.houseMember.findFirst({
        where: {
          houseId,
          userId: createdUserId as string,
        },
      });

      if (existingMembership) {
        throw new AppError(
          status.CONFLICT,
          "This user is already a member of this house",
        );
      }

      return tx.houseMember.create({
        data: {
          houseId,
          userId: createdUserId as string,
          role: role ?? UserRole.MEMBER,
        },
        include: memberDetailsInclude,
      });
    });

    await sendEmail({
      to: normalizedEmail,
      subject: "Your SplitEase member account credentials",
      templateName: "memberCredentials",
      templateData: {
        name,
        email: normalizedEmail,
        password: temporaryPassword,
      },
    });

    return result;
  } catch (error) {
    if (createdUserId) {
      await prisma.user.delete({
        where: { id: createdUserId },
      });
    }

    throw error;
  }
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

const getHouseMember = async (
  houseId: string,
  query: Record<string, unknown>,
  user: IRequestUser,
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationAndSortgHelper(query);

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

  const whereConditions = { houseId };

  const total = await prisma.houseMember.count({
    where: whereConditions,
  });

  const result = await prisma.houseMember.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: memberDetailsInclude,
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

  return prisma.$transaction(async (tx) => {
    const deletedMember = await tx.houseMember.delete({
      where: { id },
    });

    await tx.user.update({
      where: { id: deletedMember.userId },
      data: { isDeleted: true },
    });

    return deletedMember;
  });
};

export const MembersService = {
  addMemberToHouse,
  getAllMembers,
  getMemberById,
  getHouseMember,
  deleteMember,
};
