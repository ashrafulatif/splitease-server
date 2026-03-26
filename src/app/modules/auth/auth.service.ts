import status from "http-status";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  IChangePasswordPayload,
  IUpdateProfilePayload,
} from "./auth.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

interface IRegiserData {
  name: string;
  email: string;
  password: string;
}
interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerManager = async (payload: IRegiserData) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.CREATED, "Failed to register manager");
  }
  //create access token and refresh token
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  //check if suspended or not
  if (data.user.status === UserStatus.SUSPENDED) {
    throw new AppError(status.FORBIDDEN, "User is suspended");
  }
  //check if user is inactive or not
  if (data.user.isDeleted || data.user.status === UserStatus.INACTIVE) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  //create access token and refresh token
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  //check existance
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      subscriptions: true,
      expenses: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExist;
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `$Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  //check the session existance
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  //update the password
  const result = await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false },
    });
  }

  //create new access token
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  //send req
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  //change the pass
  await auth.api.resetPasswordEmailOTP({
    body: { email, otp, password: newPassword },
  });

  //update need password change
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  //delete prev session
  await prisma.session.deleteMany({ where: { userId: isUserExist.id } });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
  //create access + refresh token
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const updateProfile = async (
  user: IRequestUser,
  payload: IUpdateProfilePayload,
) => {
  //check user existence
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const updateData: Record<string, unknown> = {};

  // Update name if provided
  if (payload.name) {
    updateData.name = payload.name;
  }

  // Handle image upload if file is provided
  if (payload.image) {
    // Delete old image if it exists
    if (isUserExist.image) {
      try {
        await deleteFileFromCloudinary(isUserExist.image);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Upload new image to Cloudinary
    // multer-storage-cloudinary automatically uploads to Cloudinary
    // and provides the upload result in req.file
    // The file.path contains the Cloudinary secure URL
    updateData.image = payload.image.path || payload.image.filename;
  }

  // Update user in database
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: updateData,
    include: {
      subscriptions: true,
      expenses: true,
    },
  });

  return updatedUser;
};

export const AuthService = {
  registerManager,
  loginUser,
  logoutUser,
  googleLoginSuccess,
  verifyEmail,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
};
