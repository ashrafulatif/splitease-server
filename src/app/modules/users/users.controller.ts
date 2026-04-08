import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UsersService } from "./users.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.getUserById(req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.deleteUser(req.params.id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.updateUserStatus(
    req.params.id as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

export const UsersController = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
};
